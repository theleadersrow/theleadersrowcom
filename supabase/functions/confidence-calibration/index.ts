import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HEDGING_PHRASES = [
  "i think", "maybe", "probably", "might", "could be", "not sure",
  "i guess", "sort of", "kind of", "perhaps", "possibly", "somewhat",
  "i believe", "in my opinion", "it seems", "apparently", "likely"
];

const CONFIDENCE_PHRASES = [
  "i know", "definitely", "certainly", "absolutely", "clearly",
  "without doubt", "i'm confident", "i'm certain", "obviously",
  "undoubtedly", "for sure", "no question"
];

function analyzeLanguagePatterns(text: string): { hedging: number; confident: number; ratio: number } {
  const lowerText = text.toLowerCase();
  let hedgingCount = 0;
  let confidentCount = 0;
  
  for (const phrase of HEDGING_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    hedgingCount += (lowerText.match(regex) || []).length;
  }
  
  for (const phrase of CONFIDENCE_PHRASES) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    confidentCount += (lowerText.match(regex) || []).length;
  }
  
  const ratio = confidentCount > 0 ? hedgingCount / confidentCount : hedgingCount;
  
  return { hedging: hedgingCount, confident: confidentCount, ratio };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, evaluations, targetLevel } = await req.json();
    
    console.log(`Analyzing confidence calibration for ${answers.length} answers`);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Analyze each answer
    const answerAnalyses = answers.map((answer: any) => {
      const eval_ = evaluations.find((e: any) => e.answer_id === answer.id);
      const patterns = analyzeLanguagePatterns(answer.answer_text || "");
      const wordCount = (answer.answer_text || "").split(/\s+/).length;
      const avgScore = eval_ ? (
        (eval_.problem_framing_1_5 || 0) + 
        (eval_.strategic_thinking_1_5 || 0) + 
        (eval_.execution_rigor_1_5 || 0) + 
        (eval_.communication_clarity_1_5 || 0)
      ) / 4 : 0;
      
      return {
        answer_id: answer.id,
        category: answer.question?.category,
        word_count: wordCount,
        hedging_count: patterns.hedging,
        confident_count: patterns.confident,
        hedging_ratio: patterns.ratio,
        avg_score: avgScore,
        level_calibration: eval_?.level_calibration
      };
    });

    // Calculate overall metrics
    const totalHedging = answerAnalyses.reduce((sum: number, a: any) => sum + a.hedging_count, 0);
    const totalConfident = answerAnalyses.reduce((sum: number, a: any) => sum + a.confident_count, 0);
    const avgScore = answerAnalyses.reduce((sum: number, a: any) => sum + a.avg_score, 0) / answerAnalyses.length;
    const belowCount = answerAnalyses.filter((a: any) => a.level_calibration === 'below').length;
    const aboveCount = answerAnalyses.filter((a: any) => a.level_calibration === 'above').length;

    // Build analysis prompt
    const analysisPrompt = `Analyze this PM interview candidate's confidence calibration for a ${targetLevel} role.

LANGUAGE METRICS:
- Total hedging phrases used: ${totalHedging}
- Total confident phrases used: ${totalConfident}
- Average answer score: ${avgScore.toFixed(1)}/5
- Answers rated "below level": ${belowCount}
- Answers rated "above level": ${aboveCount}

SAMPLE ANSWER EXCERPTS:
${answers.slice(0, 3).map((a: any) => `"${a.answer_text?.substring(0, 300)}..."`).join('\n\n')}

Analyze confidence calibration as JSON:
{
  "confidence_score": 0-100,
  "calibration": "underconfident" | "calibrated" | "overconfident",
  "evidence": {
    "hedging_patterns": ["specific examples of hedging found"],
    "overclaiming_patterns": ["specific examples of overclaiming"],
    "substance_gaps": ["claims without evidence"]
  },
  "impact_on_interview": "How this affects their interview performance",
  "coaching": {
    "say_more": ["things they should emphasize more"],
    "say_less": ["things they should reduce"],
    "reframe": ["specific phrases to reframe"]
  },
  "level_specific_advice": "Advice specific to ${targetLevel} role expectations"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an executive coach specializing in interview performance and presence. Return only valid JSON." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    let calibrationAnalysis = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        calibrationAnalysis = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse calibration analysis:", e);
      }
    }

    return new Response(JSON.stringify({
      metrics: {
        total_hedging: totalHedging,
        total_confident: totalConfident,
        avg_score: avgScore,
        below_level_count: belowCount,
        above_level_count: aboveCount
      },
      answer_breakdown: answerAnalyses,
      analysis: calibrationAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Confidence calibration error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
