import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Target, BarChart3, Brain, Compass, 
  Calendar, ArrowRight, Download, Phone 
} from "lucide-react";
import ReactMarkdown from "react-markdown";

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

        // Get session
        const { data: session, error: sessionError } = await supabase
          .from("assessment_sessions")
          .select("id, status")
          .eq("session_token", sessionToken)
          .maybeSingle();

        if (sessionError || !session) {
          setError("Session not found");
          return;
        }

        // Try to get existing score and report
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
          // Generate report via edge function
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
    PM: "bg-blue-500",
    Senior: "bg-green-500",
    Principal: "bg-yellow-500",
    GPM: "bg-orange-500",
    Director: "bg-purple-500",
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Your Career Intelligence Report
            </h1>
            <p className="text-lg text-muted-foreground">
              Personalized insights based on your assessment
            </p>
          </div>

          {/* Snapshot Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Inferred Level */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Current Level</span>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${levelColors[score.current_level_inferred] || "bg-gray-500"}`}>
                {score.current_level_inferred}
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Overall Score</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {Math.round(score.overall_score)}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>

            {/* Blocker Archetype */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Blocker Pattern</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {score.blocker_archetype || "None detected"}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="report" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="report">Full Report</TabsTrigger>
              <TabsTrigger value="skills">Skill Map</TabsTrigger>
              <TabsTrigger value="plan">90-Day Plan</TabsTrigger>
              <TabsTrigger value="next">Next Steps</TabsTrigger>
            </TabsList>

            {/* Full Report Tab */}
            <TabsContent value="report" className="bg-card rounded-xl border border-border p-6 md:p-8">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{report.report_markdown}</ReactMarkdown>
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              {/* Dimension Scores */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">Dimension Scores</h3>
                <div className="space-y-4">
                  {Object.entries(score.dimension_scores).map(([dimension, value]) => (
                    <div key={dimension}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-foreground">{dimension.replace("_", " ")}</span>
                        <span className="text-muted-foreground">{Math.round(value)}/100</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Gaps */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-green-500">✓</span> Top Strengths
                  </h3>
                  <ul className="space-y-2">
                    {score.skill_heatmap.strengths?.map((strength, i) => (
                      <li key={i} className="text-muted-foreground">{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-orange-500">⚡</span> High-ROI Gaps
                  </h3>
                  <ul className="space-y-2">
                    {score.skill_heatmap.gaps?.map((gap, i) => (
                      <li key={i} className="text-muted-foreground">{gap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* 90-Day Plan Tab */}
            <TabsContent value="plan" className="bg-card rounded-xl border border-border p-6 md:p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Your 90-Day Leadership Lift
              </h3>
              <div className="space-y-6">
                {report.growth_plan_json.map((week) => (
                  <div key={week.week} className="border-l-2 border-primary/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      Week {week.week}: {week.focus}
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {week.exercises?.length > 0 && (
                        <p><strong>Exercises:</strong> {week.exercises.join(", ")}</p>
                      )}
                      {week.visibility_actions?.length > 0 && (
                        <p><strong>Visibility:</strong> {week.visibility_actions.join(", ")}</p>
                      )}
                      {week.deliverables?.length > 0 && (
                        <p><strong>Deliverables:</strong> {week.deliverables.join(", ")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Next Steps Tab */}
            <TabsContent value="next" className="space-y-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-8 text-center">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
                  Ready to Accelerate Your Career?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Get personalized coaching and a proven system to reach your next level with the 200K Method.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => navigate("/book-call")}>
                    <Phone className="w-4 h-4 mr-2" />
                    Book Strategy Call
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/200k-method")}>
                    Learn About 200K Method
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Experience Gaps */}
              {score.experience_gaps.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary" />
                    Missing Experiences to Fill
                  </h3>
                  <ul className="space-y-2">
                    {score.experience_gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">→</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CareerReport;
