import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PDFReport } from "@/components/report/PDFReport";
import { 
  Loader2, Target, BarChart3, Brain, Compass, 
  Calendar, ArrowRight, Phone, TrendingUp, Zap,
  CheckCircle2, AlertTriangle, Sparkles, Mail, Send,
  Download, FileText, Award
} from "lucide-react";

interface Score {
  overall_score: number;
  current_level_inferred: string;
  level_gap: number;
  dimension_scores: Record<string, number>;
  skill_heatmap: { strengths: string[]; gaps: string[] };
  experience_gaps: string[];
  blocker_archetype: string;
  blocker_description?: string;
  market_readiness_score?: string;
  thirty_day_actions?: string[];
  market_fit: { role_types: string[]; company_types: string[] };
}

interface Report {
  report_markdown: string;
  growth_plan_json: Array<{
    month: number;
    theme: string;
    actions: string[];
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

// Email Report Card Component - Inline version
function EmailReportCard({ score, dimensionLabels }: { score: Score; dimensionLabels: Record<string, string> }) {
  const [email, setEmail] = useState("");
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSending(true);
    try {
      if (subscribeNewsletter) {
        await supabase.from("email_leads").upsert(
          { email: email.trim(), lead_magnet: "career-report-email" },
          { onConflict: "email" }
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-career-report-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            currentLevel: score.current_level_inferred,
            overallScore: score.overall_score,
            blockerArchetype: score.blocker_archetype || undefined,
            blockerDescription: score.blocker_description || undefined,
            marketReadinessScore: score.market_readiness_score || undefined,
            thirtyDayActions: score.thirty_day_actions || [],
            topStrength: score.skill_heatmap.strengths?.[0],
            topGap: score.skill_heatmap.gaps?.[0],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send email");
      setSent(true);
      toast.success("Report sent! Check your inbox.");
    } catch (err) {
      console.error("Failed to send report:", err);
      toast.error("Failed to send report. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <p className="text-sm text-foreground">Report sent to your inbox!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center gap-3 flex-shrink-0">
        <Mail className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Email me a copy:</span>
      </div>
      <form onSubmit={handleSendReport} className="flex flex-1 gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 flex-1"
        />
        <Button type="submit" disabled={isSending} size="sm" className="h-9">
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
      <div className="flex items-center gap-2">
        <Checkbox
          id="newsletter-inline"
          checked={subscribeNewsletter}
          onCheckedChange={(checked) => setSubscribeNewsletter(checked === true)}
        />
        <label htmlFor="newsletter-inline" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
          Subscribe to newsletter
        </label>
      </div>
    </div>
  );
}

const CareerReport = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [score, setScore] = useState<Score | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!pdfRef.current || !score) return;
    
    setIsDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      
      const opt = {
        margin: 0,
        filename: `Career-Intelligence-Report-${score.current_level_inferred}-PM.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(pdfRef.current).save();
      toast.success("Report downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const loadReport = async () => {
      try {
        const sessionToken = localStorage.getItem("assessment_session_token");
        if (!sessionToken) {
          navigate("/career-coach");
          return;
        }

        // Use secure RPC function to get session
        const { data: sessionData, error: sessionError } = await supabase
          .rpc("get_session_by_token", { p_session_token: sessionToken });

        const session = sessionData?.[0];
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
    customer_empathy: "Customer Empathy",
    prioritization: "Prioritization",
    technical_fluency: "Technical Fluency",
    stakeholder_mgmt: "Stakeholder Management",
    product_sense: "Product Sense",
    collaboration: "Cross-functional Collaboration",
  };

  // Fallback blocker descriptions if not provided by API
  const getBlockerDescription = (archetype: string) => {
    const descriptions: Record<string, string> = {
      "Invisible Expert": "You consistently deliver exceptional work, yet your contributions remain unseen by decision-makers. You've mastered the craft of product management but haven't learned to amplify your impact through strategic visibility.",
      "Execution Hero": "You're the person everyone counts on to get things done—reliable, thorough, and tireless. But this very strength has become your ceiling. The path forward isn't working harder; it's stepping back to lead strategy.",
      "Strategic Thinker Without Voice": "You see what others miss—the patterns, the opportunities, the right path forward. But your insights die in your head or get lost in meetings where louder voices dominate.",
      "Over-Deliverer": "You hold yourself to impossibly high standards, polishing every deliverable until it shines. This perfectionism feels like quality—but it's actually fear dressed up as excellence.",
      "Certainty Seeker": "You thrive when the path is clear, but freeze or over-analyze when facing ambiguity. Building comfort with incomplete information is your gateway to leadership.",
    };
    return descriptions[archetype] || "A pattern has been identified that may be limiting your career growth.";
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
          {/* Premium Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary/20 to-amber-500/20 text-primary rounded-full text-sm font-medium mb-4 border border-primary/20">
              <Award className="w-4 h-4" />
              Your Results Are Ready
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-3">
              Career Intelligence Report
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Powered by The Leader's Row Strategic Benchmark
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="gap-2"
                size="lg"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? "Generating PDF..." : "Download Full Report"}
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/book-call")} className="gap-2">
                <Phone className="w-4 h-4" />
                Book Strategy Call
              </Button>
            </div>
          </div>

          {/* Email Report CTA - Streamlined */}
          <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border p-4 mb-8">
            <EmailReportCard score={score} dimensionLabels={dimensionLabels} />
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
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 gap-1">
              <TabsTrigger value="insights" className="py-2.5 text-xs md:text-sm">Key Insights</TabsTrigger>
              <TabsTrigger value="skills" className="py-2.5 text-xs md:text-sm">Skills</TabsTrigger>
              <TabsTrigger value="plan" className="py-2.5 text-xs md:text-sm">90-Day Plan</TabsTrigger>
              <TabsTrigger value="accelerate" className="py-2.5 text-xs md:text-sm">Accelerate</TabsTrigger>
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

              {/* Blocker Pattern - Enhanced */}
              {score.blocker_archetype && (
                <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-xl border border-purple-500/20 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">Your Blocker Pattern: {score.blocker_archetype}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {score.blocker_description || getBlockerDescription(score.blocker_archetype)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Market Readiness Score */}
              {score.market_readiness_score && (
                <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-xl border border-emerald-500/20 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Market Readiness</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {score.market_readiness_score}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 30-Day Action List */}
              {score.thirty_day_actions && score.thirty_day_actions.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Your 30-Day Action Plan</h3>
                  </div>
                  <div className="space-y-3">
                    {score.thirty_day_actions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-foreground text-sm leading-relaxed">{action}</span>
                      </div>
                    ))}
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
                    <p className="text-sm text-muted-foreground">Simple, actionable steps to close your gaps</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {report.growth_plan_json.map((month, index) => (
                    <div key={month.month} className="bg-muted/30 rounded-xl p-5 border border-border/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? "bg-primary" : index === 1 ? "bg-amber-500" : "bg-emerald-500"
                        }`}>
                          {month.month}
                        </div>
                        <h4 className="font-semibold text-foreground">{month.theme}</h4>
                      </div>
                      
                      <ul className="space-y-3">
                        {month.actions?.map((action, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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

      {/* Hidden PDF Report for Download */}
      <div className="fixed left-[-9999px] top-0">
        <PDFReport
          ref={pdfRef}
          score={score}
          report={report}
          dimensionLabels={dimensionLabels}
        />
      </div>
    </Layout>
  );
};

export default CareerReport;