import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Target, BarChart3, Brain, Compass, 
  Calendar, ArrowRight, Phone, TrendingUp, Zap,
  CheckCircle2, AlertTriangle, Sparkles
} from "lucide-react";

interface Score {
  overall_score: number;
  current_level_inferred: string;
  level_gap: number;
  dimension_scores: Record<string, number>;
  skill_heatmap: { strengths: string[]; gaps: string[] };
  experience_gaps: string[];
  blocker_archetype: string;
  market_fit: { role_types: string[]; company_types: string[] };
}

interface Report {
  report_markdown: string;
  growth_plan_json: Array<{
    week: number;
    focus: string;
    exercises: string[];
    visibility_actions: string[];
    deliverables: string[];
  }>;
  key_insights?: {
    executive_summary: string;
    level_analysis: string;
    blocker_insight: string;
    hard_truth: string;
    immediate_action: string;
  };
  recommended_skills?: Array<{
    skill: string;
    why: string;
    program: "200K Method" | "Weekly Edge";
  }>;
}

const CareerReport = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState<Score | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const sessionToken = localStorage.getItem("assessment_session_token");
        if (!sessionToken) {
          navigate("/career-coach");
          return;
        }

        const { data: session, error: sessionError } = await supabase
          .from("assessment_sessions")
          .select("id, status")
          .eq("session_token", sessionToken)
          .maybeSingle();

        if (sessionError || !session) {
          setError("Session not found");
          return;
        }

        const { data: scoreData } = await supabase
          .from("assessment_scores")
          .select("*")
          .eq("session_id", session.id)
          .maybeSingle();

        const { data: reportData } = await supabase
          .from("assessment_reports")
          .select("*")
          .eq("session_id", session.id)
          .maybeSingle();

        if (scoreData && reportData) {
          setScore({
            overall_score: Number(scoreData.overall_score),
            current_level_inferred: scoreData.current_level_inferred || "",
            level_gap: Number(scoreData.level_gap),
            dimension_scores: (scoreData.dimension_scores as Record<string, number>) || {},
            skill_heatmap: (scoreData.skill_heatmap as { strengths: string[]; gaps: string[] }) || { strengths: [], gaps: [] },
            experience_gaps: (scoreData.experience_gaps as string[]) || [],
            blocker_archetype: scoreData.blocker_archetype || "",
            market_fit: (scoreData.market_fit as { role_types: string[]; company_types: string[] }) || { role_types: [], company_types: [] },
          });
          setReport({
            report_markdown: reportData.report_markdown || "",
            growth_plan_json: (reportData.growth_plan_json as Report["growth_plan_json"]) || [],
          });
        } else {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-career-report`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ sessionId: session.id }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to generate report");
          }

          const data = await response.json();
          setScore(data.score);
          setReport(data.report);
        }
      } catch (err) {
        console.error("Error loading report:", err);
        setError("Failed to load your report. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !score || !report) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Report Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              {error || "We couldn't find your report. Please complete the assessment first."}
            </p>
            <Button onClick={() => navigate("/career-coach")}>
              Take Assessment
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const levelColors: Record<string, string> = {
    PM: "from-blue-500 to-blue-600",
    Senior: "from-emerald-500 to-emerald-600",
    Principal: "from-amber-500 to-amber-600",
    GPM: "from-orange-500 to-orange-600",
    Director: "from-purple-500 to-purple-600",
  };

  const dimensionLabels: Record<string, string> = {
    strategy: "Strategic Thinking",
    execution: "Execution Excellence",
    influence: "Influence & Persuasion",
    narrative: "Storytelling & Narrative",
    data: "Data-Driven Decision Making",
    leadership: "Leadership Presence",
    ambiguity: "Navigating Ambiguity",
    business_ownership: "Business Ownership",
    visibility: "Visibility & Brand",
    general: "Overall Readiness",
  };

  // Map gaps to Leader's Row programs
  const getSkillRecommendations = () => {
    const gaps = score.skill_heatmap.gaps || [];
    const recommendations: Array<{ skill: string; why: string; program: "200K Method" | "Weekly Edge"; module?: string }> = [];

    gaps.forEach(gap => {
      const gapLower = gap.toLowerCase();
      if (gapLower.includes("narrative") || gapLower.includes("story")) {
        recommendations.push({
          skill: "Executive Storytelling",
          why: "Transform how you communicate impact and influence decisions",
          program: "200K Method",
          module: "Narrative Control"
        });
      }
      if (gapLower.includes("visibility") || gapLower.includes("brand")) {
        recommendations.push({
          skill: "Personal Brand Engineering",
          why: "Build visibility that attracts opportunities to you",
          program: "200K Method",
          module: "High-Value Profile & Network"
        });
      }
      if (gapLower.includes("influence") || gapLower.includes("leadership")) {
        recommendations.push({
          skill: "Executive Presence",
          why: "Command rooms and drive alignment at senior levels",
          program: "200K Method",
          module: "Executive Presence"
        });
      }
      if (gapLower.includes("strategy")) {
        recommendations.push({
          skill: "Product Judgment",
          why: "Make high-stakes decisions with confidence",
          program: "200K Method",
          module: "Product Judgment"
        });
      }
    });

    // Add Weekly Edge for ongoing development
    if (recommendations.length < 3) {
      recommendations.push({
        skill: "Weekly Skill Building",
        why: "Compound your growth with weekly leadership practice",
        program: "Weekly Edge"
      });
    }

    return recommendations.slice(0, 3);
  };

  const recommendations = getSkillRecommendations();

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Your Results Are Ready
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
              Career Intelligence Report
            </h1>
            <p className="text-muted-foreground">
              Based on your Strategic Benchmark Assessment
            </p>
          </div>

          {/* Hero Snapshot */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
            <div className={`bg-gradient-to-r ${levelColors[score.current_level_inferred] || "from-gray-500 to-gray-600"} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-white/80 text-sm">Your Inferred Level</p>
                  <p className="text-2xl font-bold">{score.current_level_inferred} Product Manager</p>
                </div>
                <div className="text-right text-white">
                  <p className="text-white/80 text-sm">Readiness Score</p>
                  <p className="text-3xl font-bold">{Math.round(score.overall_score)}<span className="text-lg text-white/80">/100</span></p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="p-5 text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Top Strength</p>
                <p className="font-semibold text-foreground capitalize text-sm">
                  {dimensionLabels[score.skill_heatmap.strengths?.[0]] || score.skill_heatmap.strengths?.[0] || "—"}
                </p>
              </div>
              <div className="p-5 text-center">
                <div className="flex justify-center mb-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Priority Gap</p>
                <p className="font-semibold text-foreground capitalize text-sm">
                  {dimensionLabels[score.skill_heatmap.gaps?.[0]] || score.skill_heatmap.gaps?.[0] || "—"}
                </p>
              </div>
              <div className="p-5 text-center">
                <div className="flex justify-center mb-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Blocker Pattern</p>
                <p className="font-semibold text-foreground text-sm">
                  {score.blocker_archetype || "None detected"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="insights" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1">
              <TabsTrigger value="insights" className="py-3">Key Insights</TabsTrigger>
              <TabsTrigger value="skills" className="py-3">Skill Analysis</TabsTrigger>
              <TabsTrigger value="plan" className="py-3">90-Day Plan</TabsTrigger>
              <TabsTrigger value="accelerate" className="py-3">Accelerate</TabsTrigger>
            </TabsList>

            {/* Key Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Strengths & Gaps Visual */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold text-foreground">Your Strengths</h3>
                  </div>
                  <div className="space-y-3">
                    {score.skill_heatmap.strengths?.slice(0, 3).map((strength, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                          {i + 1}
                        </div>
                        <span className="text-foreground capitalize">{dimensionLabels[strength] || strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-foreground">High-ROI Gaps</h3>
                  </div>
                  <div className="space-y-3">
                    {score.skill_heatmap.gaps?.slice(0, 3).map((gap, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 font-semibold text-sm">
                          {i + 1}
                        </div>
                        <span className="text-foreground capitalize">{dimensionLabels[gap] || gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blocker Pattern */}
              {score.blocker_archetype && (
                <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-xl border border-purple-500/20 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Your Blocker Pattern: {score.blocker_archetype}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {score.blocker_archetype === "Invisible Expert" && 
                          "You deliver exceptional work but struggle with visibility. Your impact goes unnoticed because you don't proactively share wins or build your narrative."
                        }
                        {score.blocker_archetype === "Execution Hero" && 
                          "You're the go-to person for getting things done, but this keeps you stuck in tactical work. You need to shift from executing to orchestrating."
                        }
                        {score.blocker_archetype === "Strategic Thinker Without Voice" && 
                          "You have strong strategic instincts but struggle to influence decisions. Building executive presence and persuasion skills is your unlock."
                        }
                        {score.blocker_archetype === "Over-Deliverer" && 
                          "You hold yourself to perfectionist standards, which slows you down. Learning to ship 'good enough' work faster will accelerate your growth."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Gaps */}
              {score.experience_gaps.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Compass className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Experiences to Seek</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {score.experience_gaps.map((gap, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-foreground text-sm">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-6">Dimension Scores</h3>
                <div className="space-y-5">
                  {Object.entries(score.dimension_scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([dimension, value]) => (
                    <div key={dimension}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-foreground">{dimensionLabels[dimension] || dimension}</span>
                        <span className={value >= 70 ? "text-emerald-600 font-semibold" : value < 50 ? "text-amber-600 font-semibold" : "text-muted-foreground"}>
                          {Math.round(value)}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            value >= 70 ? "bg-emerald-500" : value < 50 ? "bg-amber-500" : "bg-primary"
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Fit */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Best-Fit Role Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {score.market_fit.role_types?.map((role, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Best-Fit Company Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {score.market_fit.company_types?.map((company, i) => (
                      <span key={i} className="px-3 py-1.5 bg-muted text-foreground rounded-full text-sm">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 90-Day Plan Tab */}
            <TabsContent value="plan" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Your 90-Day Leadership Lift</h3>
                    <p className="text-sm text-muted-foreground">A personalized roadmap to close your gaps</p>
                  </div>
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-8">
                    {report.growth_plan_json.map((week, index) => (
                      <div key={week.week} className="relative pl-12">
                        {/* Timeline dot */}
                        <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                          index === 0 ? "bg-primary border-primary" : "bg-background border-border"
                        }`} />
                        
                        <div className="bg-muted/30 rounded-lg p-5 border border-border/50">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                              Week {week.week}
                            </span>
                            <h4 className="font-semibold text-foreground">{week.focus}</h4>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            {week.exercises?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Exercises</p>
                                <ul className="space-y-1">
                                  {week.exercises.map((ex, i) => (
                                    <li key={i} className="text-foreground flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      {ex}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {week.visibility_actions?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Visibility</p>
                                <ul className="space-y-1">
                                  {week.visibility_actions.map((action, i) => (
                                    <li key={i} className="text-foreground flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {week.deliverables?.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Deliverables</p>
                                <ul className="space-y-1">
                                  {week.deliverables.map((del, i) => (
                                    <li key={i} className="text-foreground flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>
                                      {del}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Accelerate Tab - Lead Magnet for Courses */}
            <TabsContent value="accelerate" className="space-y-6">
              {/* Skills to Build with TLR */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                    Skills The Leader's Row Can Help You Build
                  </h3>
                  <p className="text-muted-foreground">
                    Based on your assessment, here's how we can accelerate your growth
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/10">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-foreground">{rec.skill}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            rec.program === "200K Method" 
                              ? "bg-accent/20 text-accent-foreground" 
                              : "bg-secondary text-secondary-foreground"
                          }`}>
                            {rec.program}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.why}</p>
                        {rec.module && (
                          <p className="text-xs text-primary mt-1">Covered in: {rec.module}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* 200K Method */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">200K Method</h4>
                      <p className="text-sm text-muted-foreground">8-Week Accelerator</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Transform into a highly visible, well-positioned, top-paid Product Leader in 8 weeks.
                  </p>
                  <Button className="w-full" onClick={() => navigate("/200k-method")}>
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Weekly Edge */}
                <div className="bg-gradient-to-br from-secondary/50 via-secondary/30 to-transparent rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Weekly Edge</h4>
                      <p className="text-sm text-muted-foreground">Ongoing Membership</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Build one high-leverage skill every week with live sessions and community support.
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/level-up-weekly")}>
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Book a Call CTA */}
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <h3 className="text-xl font-serif font-bold text-foreground mb-3">
                  Not Sure Which Path Is Right for You?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Book a free 30-minute strategy call to discuss your goals and get personalized recommendations.
                </p>
                <Button size="lg" variant="default" onClick={() => navigate("/book-call")}>
                  <Phone className="w-4 h-4 mr-2" />
                  Book Free Strategy Call
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CareerReport;