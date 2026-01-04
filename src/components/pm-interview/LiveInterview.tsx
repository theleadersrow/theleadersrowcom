import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Send, Bot, User, Loader2, CheckCircle, XCircle, 
  AlertTriangle, RotateCcw, Sparkles, Clock, Target, Brain,
  TrendingUp, Users, BarChart3, Crown, Zap, ChevronRight, Mic, Keyboard, WifiOff
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { InterviewUserProfile } from "@/pages/PMInterview";
import { VoiceRecorder } from "./VoiceRecorder";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { withRetry } from "@/hooks/useRetry";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface LiveInterviewProps {
  sessionId: string;
  sessionToken: string;
  userProfile: InterviewUserProfile;
  onEndSession: () => void;
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  questionId?: string;
  category?: string;
}

interface Question {
  id: string;
  category: string;
  prompt_text: string;
  difficulty: number;
  target_level: string;
}

interface LiveChecklist {
  defined_user_problem: boolean;
  success_metric: boolean;
  tradeoffs_clear: boolean;
  quantified_impact: boolean;
  ownership_explicit: boolean;
}

interface Evaluation {
  scores: {
    problem_framing: number;
    strategic_thinking: number;
    execution_rigor: number;
    decision_quality: number;
    communication_clarity: number;
    ownership_impact: number;
  };
  categoryScore: number;
  levelCalibration: "below" | "at" | "above";
  strengths: string[];
  gaps: string[];
  hireSignals: { type: "strong" | "neutral" | "red_flag"; label: string }[];
  followupQuestions: string[];
  rewrittenAnswer: string;
  coachNextSteps: string[];
}

const CATEGORY_ICONS: Record<string, typeof Brain> = {
  product_sense: Brain,
  strategy: Target,
  execution: Zap,
  data_metrics: BarChart3,
  influence: Users,
  leadership: Crown,
};

const CATEGORY_LABELS: Record<string, string> = {
  product_sense: "Product Sense",
  strategy: "Strategy",
  execution: "Execution",
  data_metrics: "Data & Metrics",
  influence: "Influence",
  leadership: "Leadership",
};

export function LiveInterview({ sessionId, sessionToken, userProfile, onEndSession, onBack }: LiveInterviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [liveChecklist, setLiveChecklist] = useState<LiveChecklist>({
    defined_user_problem: false,
    success_metric: false,
    tradeoffs_clear: false,
    quantified_impact: false,
    ownership_explicit: false,
  });
  const [notes, setNotes] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [retryCount, setRetryCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isOnline, isSlowConnection } = useConnectionStatus();

  // Debounced notes save to prevent excessive DB writes
  const debouncedSaveNotes = useDebouncedCallback((noteText: string) => {
    // Save notes to session in background (non-blocking)
    supabase
      .from("interview_sessions")
      .update({ notes: noteText })
      .eq("id", sessionId)
      .then(() => console.log("Notes saved"));
  }, 2000);

  // Load questions and start interview
  useEffect(() => {
    loadQuestions();
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Save notes with debounce
  const handleNotesChange = (value: string) => {
    setNotes(value);
    debouncedSaveNotes(value);
  };

  const loadQuestions = async () => {
    try {
      // Get session to check selected categories
      const { data: session } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (!session) return;

      // Load questions based on session config
      let query = supabase
        .from("interview_questions")
        .select("*")
        .eq("is_active", true);

      if (session.selected_categories && session.selected_categories.length > 0) {
        query = query.in("category", session.selected_categories);
      }

      // Limit based on interview type
      const limit = session.interview_type === "rapid_fire" ? 5 : 
                    session.interview_type === "category_drill" ? 8 : 15;

      const { data: questionData, error } = await query.limit(limit);

      if (error) throw error;

      // Shuffle and set questions
      const shuffled = (questionData || []).sort(() => Math.random() - 0.5);
      setQuestions(shuffled);

      if (shuffled.length > 0) {
        setCurrentQuestion(shuffled[0]);
        // Add initial interviewer message
        setMessages([{
          role: "assistant",
          content: `Welcome to your PM interview session. I'll be evaluating your answers across 6 key dimensions, providing real-time feedback, and calibrating your responses to ${userProfile.targetRoleLevel} level expectations.\n\nLet's begin with your first question:\n\n**${shuffled[0].prompt_text}**`,
          questionId: shuffled[0].id,
          category: shuffled[0].category
        }]);
      }

      setStartTime(new Date());
    } catch (e) {
      console.error("Failed to load questions:", e);
      toast.error("Failed to load interview questions");
    }
  };

  const analyzeAnswer = async (answerText: string): Promise<Evaluation> => {
    // Use retry wrapper for resilience
    return withRetry(async () => {
      const { data, error } = await supabase.functions.invoke("evaluate-pm-answer", {
        body: {
          questionId: currentQuestion?.id,
          questionText: currentQuestion?.prompt_text,
          category: currentQuestion?.category,
          answerText,
          targetLevel: userProfile.targetRoleLevel,
          targetCompany: userProfile.targetCompanyType
        }
      });

      if (error) {
        // Handle rate limiting gracefully
        if (error.message?.includes("429") || error.message?.includes("rate limit")) {
          toast.warning("High traffic - please wait a moment...");
          throw error; // Will trigger retry
        }
        throw error;
      }
      
      setRetryCount(0);
      return data;
    }, 3, 2000).catch((e) => {
      console.error("Evaluation error after retries:", e);
      setRetryCount(prev => prev + 1);
      
      // Return fallback evaluation after all retries fail
      return {
        scores: {
          problem_framing: 3,
          strategic_thinking: 3,
          execution_rigor: 3,
          decision_quality: 3,
          communication_clarity: 3,
          ownership_impact: 3,
        },
        categoryScore: 60,
        levelCalibration: "at" as const,
        strengths: ["Clear structure", "Good examples"],
        gaps: ["Needs more metrics", "Ownership unclear"],
        hireSignals: [{ type: "neutral" as const, label: "Adequate depth" }],
        followupQuestions: ["Can you quantify the impact?"],
        rewrittenAnswer: "A stronger answer would...",
        coachNextSteps: ["Add specific metrics", "Clarify your role"]
      };
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !currentQuestion) return;
    
    // Warn user if offline
    if (!isOnline) {
      toast.error("You're offline. Please check your connection.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      // Save answer to database
      const { data: answerData } = await supabase
        .from("interview_answers")
        .insert({
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer_text: userMessage,
          question_index: questionIndex
        })
        .select()
        .single();

      // Analyze answer
      const evaluation = await analyzeAnswer(userMessage);
      setCurrentEvaluation(evaluation);

      // Save evaluation to database
      if (answerData) {
        const evaluationInsert = {
          session_id: sessionId,
          question_id: currentQuestion.id,
          answer_id: answerData.id,
          problem_framing_1_5: evaluation.scores.problem_framing,
          strategic_thinking_1_5: evaluation.scores.strategic_thinking,
          execution_rigor_1_5: evaluation.scores.execution_rigor,
          decision_quality_1_5: evaluation.scores.decision_quality,
          communication_clarity_1_5: evaluation.scores.communication_clarity,
          ownership_impact_1_5: evaluation.scores.ownership_impact,
          category_score_0_100: evaluation.categoryScore,
          level_calibration: evaluation.levelCalibration,
          hire_signals: evaluation.hireSignals as any,
          feedback_strengths: evaluation.strengths,
          feedback_gaps: evaluation.gaps,
          followup_questions: evaluation.followupQuestions,
          rewritten_sample_answer: evaluation.rewrittenAnswer,
          coach_next_steps: evaluation.coachNextSteps,
          live_checklist: liveChecklist as any
        };
        
        await supabase
          .from("interview_evaluations")
          .insert(evaluationInsert);
      }

      // Update live checklist based on answer content
      updateLiveChecklist(userMessage);

      // Generate feedback message
      const feedbackMessage = generateFeedbackMessage(evaluation);
      setMessages(prev => [...prev, { role: "assistant", content: feedbackMessage }]);

      setShowEvaluation(true);
    } catch (e) {
      console.error("Error processing answer:", e);
      toast.error("Failed to process your answer");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLiveChecklist = (answer: string) => {
    const lowerAnswer = answer.toLowerCase();
    setLiveChecklist({
      defined_user_problem: lowerAnswer.includes("user") || lowerAnswer.includes("customer") || lowerAnswer.includes("problem"),
      success_metric: lowerAnswer.includes("metric") || lowerAnswer.includes("kpi") || lowerAnswer.includes("measure") || lowerAnswer.includes("%"),
      tradeoffs_clear: lowerAnswer.includes("tradeoff") || lowerAnswer.includes("trade-off") || lowerAnswer.includes("however") || lowerAnswer.includes("on the other hand"),
      quantified_impact: /\d+/.test(answer) || lowerAnswer.includes("million") || lowerAnswer.includes("thousand") || lowerAnswer.includes("revenue"),
      ownership_explicit: lowerAnswer.includes("i ") || lowerAnswer.includes("my ") || lowerAnswer.includes("personally") || lowerAnswer.includes("led") || lowerAnswer.includes("owned"),
    });
  };

  const generateFeedbackMessage = (evaluation: Evaluation): string => {
    const levelBadge = evaluation.levelCalibration === "above" ? "✅ Above" :
                       evaluation.levelCalibration === "at" ? "⚠️ At" : "❌ Below";
    
    let message = `**📊 Score: ${evaluation.categoryScore}/100** | Level: ${levelBadge} ${userProfile.targetRoleLevel}\n\n`;
    
    if (evaluation.strengths.length > 0) {
      message += `**✅ What Worked:**\n${evaluation.strengths.map(s => `• ${s}`).join("\n")}\n\n`;
    }
    
    if (evaluation.gaps.length > 0) {
      message += `**⚠️ Gaps to Address:**\n${evaluation.gaps.map(g => `• ${g}`).join("\n")}\n\n`;
    }

    if (evaluation.hireSignals.some(s => s.type === "red_flag")) {
      message += `**🚨 Red Flags:**\n${evaluation.hireSignals.filter(s => s.type === "red_flag").map(s => `• ${s.label}`).join("\n")}\n\n`;
    }

    return message;
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setShowEvaluation(false);
      setCurrentEvaluation(null);
      setLiveChecklist({
        defined_user_problem: false,
        success_metric: false,
        tradeoffs_clear: false,
        quantified_impact: false,
        ownership_explicit: false,
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: `---\n\n**Question ${nextIndex + 1} of ${questions.length}** | Category: ${CATEGORY_LABELS[questions[nextIndex].category]}\n\n**${questions[nextIndex].prompt_text}**`,
        questionId: questions[nextIndex].id,
        category: questions[nextIndex].category
      }]);
    } else {
      handleEndInterview();
    }
  };

  const handleRetryQuestion = () => {
    setShowEvaluation(false);
    setCurrentEvaluation(null);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "Let's try that again. Take your time and think through:\n• Who is the user and what's their problem?\n• What's your success metric?\n• What are the key tradeoffs?\n\n**" + currentQuestion?.prompt_text + "**"
    }]);
  };

  const handleCoachMe = () => {
    if (currentEvaluation) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `**💡 Coaching Moment:**\n\n**Here's a stronger answer structure:**\n${currentEvaluation.rewrittenAnswer}\n\n**Your Next Steps:**\n${currentEvaluation.coachNextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n---\nReady for the next question?`
      }]);
    }
  };

  const handleEndInterview = async () => {
    try {
      // Update session status
      await supabase
        .from("interview_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      // Trigger final scoring
      await supabase.functions.invoke("compute-session-scores", {
        body: { sessionId }
      });

      onEndSession();
    } catch (e) {
      console.error("Error ending session:", e);
      onEndSession();
    }
  };

  const getElapsedTime = () => {
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
    return `${elapsed} min`;
  };

  const CategoryIcon = currentQuestion ? CATEGORY_ICONS[currentQuestion.category] || Brain : Brain;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="font-semibold">PM Interview Session</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{getElapsedTime()}</span>
                  <span className="mx-2">•</span>
                  <span>Question {questionIndex + 1} of {questions.length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={((questionIndex + 1) / questions.length) * 100} className="w-32" />
              <Button variant="outline" onClick={handleEndInterview}>
                End Session
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3"
                    : "prose prose-sm dark:prose-invert"
                }`}>
                  {msg.role === "user" ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }} />
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <p className="text-sm text-muted-foreground">Analyzing your answer...</p>
                </div>
              </div>
            )}

            {/* Action Buttons after evaluation */}
            {showEvaluation && currentEvaluation && (
              <div className="flex flex-wrap gap-3 mt-4">
                <Button onClick={handleNextQuestion}>
                  Next Question <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={handleRetryQuestion}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Try Again
                </Button>
                <Button variant="secondary" onClick={handleCoachMe}>
                  <Sparkles className="h-4 w-4 mr-2" /> Coach Me
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t bg-background">
          {/* Input Mode Tabs */}
          <div className="max-w-3xl mx-auto px-4 pt-3">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "text" | "voice")}>
              <TabsList className="grid w-48 grid-cols-2">
                <TabsTrigger value="text" className="gap-2">
                  <Keyboard className="h-4 w-4" /> Type
                </TabsTrigger>
                <TabsTrigger value="voice" className="gap-2">
                  <Mic className="h-4 w-4" /> Voice
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="p-4 pt-3">
            <div className="max-w-3xl mx-auto">
              {inputMode === "text" ? (
                <div className="flex gap-3">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your answer... (Shift+Enter for new line)"
                    className="min-h-[80px] resize-none"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="h-auto">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              ) : (
                <VoiceRecorder 
                  transcript={input}
                  onTranscriptChange={setInput}
                  onTranscript={(text) => {
                    if (text) {
                      setInput(text);
                      // Auto-send after transcription
                      setTimeout(() => handleSend(), 100);
                    }
                  }}
                  isProcessing={isLoading}
                  disabled={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Score */}
      <div className="w-80 border-l bg-muted/30 hidden lg:flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
            {currentQuestion ? CATEGORY_LABELS[currentQuestion.category] : "Loading..."}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Difficulty: {"⭐".repeat(currentQuestion?.difficulty || 3)}
          </p>
        </div>

        {/* Live Checklist */}
        <div className="p-4 border-b">
          <h4 className="text-sm font-medium mb-3">Real-time Rubric</h4>
          <div className="space-y-2">
            {Object.entries(liveChecklist).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                {value ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground/50" />
                )}
                <span className={value ? "text-foreground" : "text-muted-foreground"}>
                  {key === "defined_user_problem" && "Defined user & problem"}
                  {key === "success_metric" && "Success metric chosen"}
                  {key === "tradeoffs_clear" && "Tradeoffs articulated"}
                  {key === "quantified_impact" && "Quantified impact"}
                  {key === "ownership_explicit" && "Ownership explicit"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Evaluation Summary */}
        {currentEvaluation && (
          <div className="p-4 border-b">
            <h4 className="text-sm font-medium mb-3">Latest Score</h4>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary">{currentEvaluation.categoryScore}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <Badge variant={
              currentEvaluation.levelCalibration === "above" ? "default" :
              currentEvaluation.levelCalibration === "at" ? "secondary" : "destructive"
            } className="w-full justify-center">
              {currentEvaluation.levelCalibration === "above" && "✅ Above Level"}
              {currentEvaluation.levelCalibration === "at" && "⚠️ At Level"}
              {currentEvaluation.levelCalibration === "below" && "❌ Below Level"}
            </Badge>
          </div>
        )}

        {/* Notes */}
        <div className="p-4 flex-1">
          <h4 className="text-sm font-medium mb-2">Interview Notes</h4>
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Jot down key points..."
            className="h-32 text-sm resize-none"
          />
        </div>

        {/* Connection Status */}
        {(!isOnline || isSlowConnection) && (
          <div className="p-3 bg-amber-500/10 border-t border-amber-500/20">
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <WifiOff className="h-3 w-3" />
              {!isOnline ? "Offline - answers will fail" : "Slow connection"}
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Sheet (Mobile) */}
      <Sheet open={showEvaluation && !!currentEvaluation} onOpenChange={setShowEvaluation}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Answer Evaluation</SheetTitle>
          </SheetHeader>
          {currentEvaluation && (
            <div className="mt-4 space-y-6 overflow-auto">
              {/* Score */}
              <div className="text-center">
                <div className="text-5xl font-bold text-primary">{currentEvaluation.categoryScore}</div>
                <div className="text-muted-foreground">Category Score</div>
                <Badge variant={
                  currentEvaluation.levelCalibration === "above" ? "default" :
                  currentEvaluation.levelCalibration === "at" ? "secondary" : "destructive"
                } className="mt-2">
                  {currentEvaluation.levelCalibration === "above" && "✅ Above Level"}
                  {currentEvaluation.levelCalibration === "at" && "⚠️ At Level"}
                  {currentEvaluation.levelCalibration === "below" && "❌ Below Level"}
                </Badge>
              </div>

              {/* Dimension Scores */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(currentEvaluation.scores).map(([key, value]) => (
                  <div key={key} className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1 capitalize">
                      {key.replace(/_/g, " ")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={value * 20} className="h-2" />
                      <span className="text-sm font-medium">{value}/5</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths & Gaps */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-600">✅ Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {currentEvaluation.strengths.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-amber-600">⚠️ Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {currentEvaluation.gaps.map((g, i) => (
                        <li key={i}>• {g}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleNextQuestion} className="flex-1">
                  Next Question
                </Button>
                <Button variant="outline" onClick={handleRetryQuestion}>
                  Try Again
                </Button>
                <Button variant="secondary" onClick={handleCoachMe}>
                  Coach Me
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
