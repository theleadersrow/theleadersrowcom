import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[EVALUATE-PM-ANSWER] ${step}`, details ? JSON.stringify(details) : "");
};

// Retry with exponential backoff for resilience
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Don't retry on client errors (except rate limit)
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429)) {
        return response;
      }
      
      // Retry on server errors or rate limits with backoff
      if (response.status === 429 || response.status >= 500) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 1000;
        logStep(`Retry attempt ${attempt + 1}`, { status: response.status, delayMs: delay });
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000) + Math.random() * 1000;
      logStep(`Network error, retry ${attempt + 1}`, { error: lastError.message, delayMs: delay });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error("Max retries exceeded");
}

interface EvaluationRequest {
  questionId: string;
  questionText: string;
  category: string;
  answerText: string;
  targetLevel: string;
  targetCompany: string;
}

// Cache for repeated evaluations (simple in-memory, resets on cold start)
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionId, questionText, category, answerText, targetLevel, targetCompany }: EvaluationRequest = await req.json();
    
    // Input validation
    if (!answerText || answerText.length < 10) {
      return new Response(JSON.stringify({ error: "Answer too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Truncate very long answers to prevent token overflow
    const truncatedAnswer = answerText.slice(0, 8000);
    
    logStep("Evaluating answer", { category, targetLevel, answerLength: truncatedAnswer.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check cache for identical evaluations
    const cacheKey = `${questionId}-${truncatedAnswer.slice(0, 100)}-${targetLevel}`;
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logStep("Cache hit", { cacheKey: cacheKey.slice(0, 50) });
      return new Response(JSON.stringify(cached.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a senior PM interviewer and hiring committee member at ${targetCompany}. 
You are evaluating a candidate targeting a ${targetLevel} PM role.

Your job is to score this answer rigorously and provide actionable feedback.

SCORING DIMENSIONS (rate each 1-5):
1. Problem Framing: Did they clearly define the user and problem before solutioning?
2. Strategic Thinking: Did they show long-term thinking and market awareness?
3. Execution Rigor: Did they demonstrate ability to ship and handle ambiguity?
4. Decision Quality: Did they articulate tradeoffs and justify decisions?
5. Communication Clarity: Was the answer well-structured and concise?
6. Ownership & Impact: Did they quantify impact and show personal ownership?

LEVEL CALIBRATION:
- "below": Answer does not meet ${targetLevel} bar
- "at": Answer meets expectations for ${targetLevel}
- "above": Answer exceeds ${targetLevel} expectations

HIRE SIGNALS:
- "strong": Clear positive signals (quantified impact, clear ownership, strong frameworks)
- "neutral": Adequate but not exceptional
- "red_flag": Concerning patterns (vague, no metrics, unclear ownership, poor structure)

Return a JSON object ONLY with this exact structure:
{
  "scores": {
    "problem_framing": <1-5>,
    "strategic_thinking": <1-5>,
    "execution_rigor": <1-5>,
    "decision_quality": <1-5>,
    "communication_clarity": <1-5>,
    "ownership_impact": <1-5>
  },
  "categoryScore": <0-100>,
  "levelCalibration": "<below|at|above>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "gaps": ["<specific gap 1>", "<specific gap 2>", "<specific gap 3>"],
  "hireSignals": [{"type": "<strong|neutral|red_flag>", "label": "<short description>"}],
  "followupQuestions": ["<probing question 1>", "<probing question 2>"],
  "rewrittenAnswer": "<A stronger version of their answer that would score higher>",
  "coachNextSteps": ["<specific improvement action 1>", "<specific improvement action 2>"]
}`;

    const userPrompt = `Question (${category}): ${questionText}

Candidate's Answer:
${truncatedAnswer}

Evaluate this answer for a ${targetLevel} PM candidate at ${targetCompany}. Be rigorous and specific. Return ONLY valid JSON.`;

    const response = await fetchWithRetry("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "30" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    logStep("AI response received", { contentLength: content.length });

    // Parse JSON from response
    let evaluation;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                       content.match(/```\n?([\s\S]*?)\n?```/) ||
                       [null, content];
      const jsonStr = jsonMatch[1] || content;
      evaluation = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      logStep("JSON parse error, using fallback", { error: String(parseError) });
      // Return fallback evaluation
      evaluation = {
        scores: {
          problem_framing: 3,
          strategic_thinking: 3,
          execution_rigor: 3,
          decision_quality: 3,
          communication_clarity: 3,
          ownership_impact: 3,
        },
        categoryScore: 60,
        levelCalibration: "at",
        strengths: ["Attempted to answer the question", "Some structure present"],
        gaps: ["Could use more specifics", "Quantify impact", "Clarify ownership"],
        hireSignals: [{ type: "neutral", label: "Needs more depth" }],
        followupQuestions: ["Can you quantify the impact?", "What did you personally own?"],
        rewrittenAnswer: "A stronger answer would start with the problem, include metrics, and clarify personal ownership.",
        coachNextSteps: ["Practice quantifying impact", "Use the STAR framework"]
      };
    }

    // Cache successful evaluation
    responseCache.set(cacheKey, { data: evaluation, timestamp: Date.now() });
    
    // Clean old cache entries periodically (1% chance per request)
    if (Math.random() < 0.01) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_TTL_MS) {
          responseCache.delete(key);
        }
      }
    }

    logStep("Evaluation complete", { categoryScore: evaluation.categoryScore, level: evaluation.levelCalibration });

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    logStep("Error", { error: error instanceof Error ? error.message : "Unknown error" });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
