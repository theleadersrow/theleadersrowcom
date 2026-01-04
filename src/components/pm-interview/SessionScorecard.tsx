import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Download, Eye, RotateCcw, BookOpen, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Brain, Target, Zap, BarChart3, Users, Crown, FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SessionScorecardProps {
  sessionId: string;
  onViewNarrative: () => void;
  onViewSTARBank: () => void;
  onBack: () => void;
  onDrillCategory: (category: string) => void;
}

interface SessionData {
  overall_score_0_100: number | null;
  readiness_verdict: string | null;
  committee_recommendation: string | null;
  committee_notes: string | null;
  strong_hire_signals_count: number;
  red_flags_count: number;
  target_level: string;
  target_company: string;
}

interface CategoryScore {
  category: string;
  score_0_100: number;
  strongest_dimension: string;
  weakest_dimension: string;
  below_count: number;
  at_count: number;
  above_count: number;
}

interface AnswerReplay {
  id: string;
  category: string;
  question_text: string;
  answer_text: string;
  score: number;
  level_calibration: string;
  hire_signals: { type: string; label: string }[];
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

const DIMENSION_LABELS: Record<string, string> = {
  problem_framing: "Problem Framing",
  strategic_thinking: "Strategic Thinking",
  execution_rigor: "Execution Rigor",
  decision_quality: "Decision Quality",
  communication_clarity: "Communication",
  ownership_impact: "Ownership & Impact"
};

export function SessionScorecard({ sessionId, onViewNarrative, onViewSTARBank, onBack, onDrillCategory }: SessionScorecardProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [categoryScores, setCategoryScores] = useState<CategoryScore[]>([]);
  const [dimensionAverages, setDimensionAverages] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<AnswerReplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hireSignals, setHireSignals] = useState<{ strong: string[]; neutral: string[]; redFlags: string[] }>({
    strong: [],
    neutral: [],
    redFlags: []
  });

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      // Load session
      const { data: sessionData } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionData) {
        setSession(sessionData);
      }

      // Load category scores
      const { data: categoryData } = await supabase
        .from("session_category_scores")
        .select("*")
        .eq("session_id", sessionId);

      if (categoryData) {
        setCategoryScores(categoryData);
      }

      // Load evaluations for dimension averages and answers
      const { data: evalData } = await supabase
        .from("interview_evaluations")
        .select(`
          *,
          interview_questions (prompt_text, category),
          interview_answers (answer_text)
        `)
        .eq("session_id", sessionId);

      if (evalData && evalData.length > 0) {
        // Calculate dimension averages
        const dimensions = ["problem_framing", "strategic_thinking", "execution_rigor", "decision_quality", "communication_clarity", "ownership_impact"];
        const avgs: Record<string, number> = {};
        
        dimensions.forEach(dim => {
          const key = `${dim}_1_5` as keyof typeof evalData[0];
          const sum = evalData.reduce((acc, e) => acc + ((e[key] as number) || 0), 0);
          avgs[dim] = Math.round((sum / evalData.length) * 20); // Convert 1-5 to 0-100
        });
        setDimensionAverages(avgs);

        // Build answers replay
        const answersData: AnswerReplay[] = evalData.map(e => ({
          id: e.id,
          category: e.interview_questions?.category || "",
          question_text: e.interview_questions?.prompt_text || "",
          answer_text: e.interview_answers?.answer_text || "",
          score: e.category_score_0_100 || 0,
          level_calibration: e.level_calibration || "at",
          hire_signals: (e.hire_signals as any[]) || []
        }));
        setAnswers(answersData);

        // Aggregate hire signals
        const signals = { strong: [] as string[], neutral: [] as string[], redFlags: [] as string[] };
        evalData.forEach(e => {
          const hs = (e.hire_signals as any[]) || [];
          hs.forEach(s => {
            if (s.type === "strong") signals.strong.push(s.label);
            else if (s.type === "neutral") signals.neutral.push(s.label);
            else if (s.type === "red_flag") signals.redFlags.push(s.label);
          });
        });
        setHireSignals(signals);
      }
    } catch (e) {
      console.error("Error loading session data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictColor = (verdict: string | null) => {
    if (verdict === "ready") return "text-green-600 bg-green-500/10";
    if (verdict === "almost_ready") return "text-amber-600 bg-amber-500/10";
    return "text-red-600 bg-red-500/10";
  };

  const getRecommendationLabel = (rec: string | null) => {
    if (rec === "strong_hire") return { label: "Strong Hire", color: "bg-green-500" };
    if (rec === "hire") return { label: "Hire", color: "bg-emerald-500" };
    if (rec === "lean_hire") return { label: "Lean Hire", color: "bg-amber-500" };
    return { label: "No Hire", color: "bg-red-500" };
  };

  const handleExportPDF = async () => {
    // Placeholder for PDF export
    alert("PDF export coming soon!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const recommendation = getRecommendationLabel(session?.committee_recommendation);
  const lowestDimensions = Object.entries(dimensionAverages)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Session Scorecard</h1>
            <p className="text-muted-foreground">
              {session?.target_level} PM • {session?.target_company}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onViewNarrative}>
            <FileText className="h-4 w-4 mr-2" /> Narrative Analysis
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Top Row Tiles */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {session?.overall_score_0_100 || 0}
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
          </CardContent>
        </Card>

        <Card className={getVerdictColor(session?.readiness_verdict)}>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold capitalize mb-2">
                {session?.readiness_verdict?.replace("_", " ") || "Pending"}
              </div>
              <p className="text-sm opacity-80">Readiness Verdict</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-2">
                <div>
                  <span className="text-2xl font-bold text-red-500">
                    {categoryScores.reduce((a, c) => a + c.below_count, 0)}
                  </span>
                  <p className="text-xs text-muted-foreground">Below</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-amber-500">
                    {categoryScores.reduce((a, c) => a + c.at_count, 0)}
                  </span>
                  <p className="text-xs text-muted-foreground">At</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-green-500">
                    {categoryScores.reduce((a, c) => a + c.above_count, 0)}
                  </span>
                  <p className="text-xs text-muted-foreground">Above</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Level Calibration</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex justify-center gap-4 mb-2">
                <div>
                  <span className="text-2xl font-bold text-green-500">
                    {session?.strong_hire_signals_count || hireSignals.strong.length}
                  </span>
                  <p className="text-xs text-muted-foreground">Strong</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-red-500">
                    {session?.red_flags_count || hireSignals.redFlags.length}
                  </span>
                  <p className="text-xs text-muted-foreground">Red Flags</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Hire Signals</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Category Performance</TabsTrigger>
          <TabsTrigger value="dimensions">Competency Breakdown</TabsTrigger>
          <TabsTrigger value="committee">Committee Simulation</TabsTrigger>
          <TabsTrigger value="replay">Answer Replay</TabsTrigger>
        </TabsList>

        {/* Category Performance */}
        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryScores.map(cat => {
              const Icon = CATEGORY_ICONS[cat.category] || Brain;
              return (
                <Card key={cat.category}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{CATEGORY_LABELS[cat.category]}</CardTitle>
                      </div>
                      <span className="text-2xl font-bold">{cat.score_0_100}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={cat.score_0_100} className="mb-4" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Strongest:</span>
                        <span className="text-green-600">{DIMENSION_LABELS[cat.strongest_dimension] || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weakest:</span>
                        <span className="text-amber-600">{DIMENSION_LABELS[cat.weakest_dimension] || "N/A"}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => onDrillCategory(cat.category)}
                    >
                      Drill This Category
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Competency Breakdown */}
        <TabsContent value="dimensions">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dimension Scores</CardTitle>
                <CardDescription>Average across all questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dimensionAverages).map(([dim, score]) => (
                    <div key={dim}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{DIMENSION_LABELS[dim]}</span>
                        <span className="font-medium">{score}/100</span>
                      </div>
                      <Progress value={score} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Moves the Needle</CardTitle>
                <CardDescription>Focus areas for improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowestDimensions.map(([dim, score]) => (
                    <div key={dim} className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-700">{DIMENSION_LABELS[dim]}: {score}/100</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {dim === "problem_framing" && "Practice articulating the user problem before jumping to solutions. Use frameworks like 'Who is the user, what's their pain point, why now?'"}
                        {dim === "strategic_thinking" && "Strengthen your long-term vision articulation. Connect tactical decisions to strategic objectives."}
                        {dim === "execution_rigor" && "Add more specificity to your execution plans. Include timelines, dependencies, and risk mitigation."}
                        {dim === "decision_quality" && "Explicitly state the tradeoffs you're making and why. Show your decision-making process."}
                        {dim === "communication_clarity" && "Structure your answers more clearly. Lead with the conclusion, then provide supporting evidence."}
                        {dim === "ownership_impact" && "Quantify your impact and be explicit about what you personally owned vs. delegated."}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Committee Simulation */}
        <TabsContent value="committee">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Committee Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {session?.committee_notes || "Based on the interview performance, this candidate demonstrates competency in core PM skills with room for growth in strategic depth and quantified impact storytelling."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Final Recommendation</CardTitle>
                  <Badge className={recommendation.color}>{recommendation.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {session?.committee_recommendation === "strong_hire" && "Exceptional performance across all dimensions. Clear evidence of level-appropriate scope, ownership, and impact."}
                  {session?.committee_recommendation === "hire" && "Solid performance meeting bar. Good fundamentals with clear growth trajectory."}
                  {session?.committee_recommendation === "lean_hire" && "Meets bar in most areas but has notable gaps. Recommended with development plan."}
                  {(!session?.committee_recommendation || session?.committee_recommendation === "no_hire") && "Does not currently meet bar for target level. Specific gaps identified for focused improvement."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" /> Strong Hire Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hireSignals.strong.length > 0 ? (
                    hireSignals.strong.slice(0, 5).map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {s}
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground text-sm">No strong signals yet</li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" /> Concerns / Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hireSignals.redFlags.length > 0 ? (
                    hireSignals.redFlags.slice(0, 5).map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-500" />
                        {s}
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground text-sm">No red flags identified</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Answer Replay */}
        <TabsContent value="replay">
          <Card>
            <CardHeader>
              <CardTitle>Answer Replay</CardTitle>
              <CardDescription>Review all your answers from this session</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Signals</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answers.map(answer => (
                    <TableRow key={answer.id}>
                      <TableCell>
                        <Badge variant="outline">{CATEGORY_LABELS[answer.category]}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {answer.question_text}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${
                          answer.score >= 80 ? "text-green-600" :
                          answer.score >= 60 ? "text-amber-600" : "text-red-600"
                        }`}>
                          {answer.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          answer.level_calibration === "above" ? "default" :
                          answer.level_calibration === "at" ? "secondary" : "destructive"
                        }>
                          {answer.level_calibration}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {answer.hire_signals.slice(0, 2).map((s, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className={
                                s.type === "strong" ? "border-green-500 text-green-600" :
                                s.type === "red_flag" ? "border-red-500 text-red-600" : ""
                              }
                            >
                              {s.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={onViewSTARBank}>
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
