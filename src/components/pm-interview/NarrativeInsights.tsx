import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, FileText, AlertTriangle, CheckCircle, 
  TrendingUp, BookOpen, Target, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NarrativeInsightsProps {
  sessionId: string;
  onViewSTARBank: () => void;
  onBack: () => void;
}

interface NarrativeData {
  narrative_score_0_100: number | null;
  coverage_score: number | null;
  proof_metrics_score: number | null;
  ownership_clarity_score: number | null;
  decision_tradeoffs_score: number | null;
  concision_clarity_score: number | null;
  repeated_themes: string[];
  missing_themes: string[];
  proof_gaps: { claim: string; missing_evidence: string; recommended_fix: string }[];
  metric_gaps: string[];
  ownership_gaps: string[];
  clarity_gaps: string[];
  story_recommendations: string[];
  next_drill_plan: { category: string; focus: string; priority: number }[];
}

export function NarrativeInsights({ sessionId, onViewSTARBank, onBack }: NarrativeInsightsProps) {
  const [data, setData] = useState<NarrativeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadNarrativeData();
  }, [sessionId]);

  const loadNarrativeData = async () => {
    try {
      const { data: narrativeData } = await supabase
        .from("narrative_insights")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (narrativeData) {
        setData({
          ...narrativeData,
          proof_gaps: (narrativeData.proof_gaps as any[]) || [],
          next_drill_plan: (narrativeData.next_drill_plan as any[]) || []
        });
      } else {
        // Generate narrative insights if not exists
        await generateNarrativeInsights();
      }
    } catch (e) {
      console.error("Error loading narrative data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNarrativeInsights = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-narrative", {
        body: { sessionId }
      });

      if (error) throw error;
      if (data) {
        setData(data);
      }
    } catch (e) {
      console.error("Error generating narrative insights:", e);
      // Set mock data on error
      setData({
        narrative_score_0_100: 65,
        coverage_score: 70,
        proof_metrics_score: 55,
        ownership_clarity_score: 60,
        decision_tradeoffs_score: 75,
        concision_clarity_score: 70,
        repeated_themes: ["Execution focus", "Cross-functional collaboration"],
        missing_themes: ["Strategic vision", "Influence without authority", "Quantified business impact"],
        proof_gaps: [
          { claim: "Led product launch", missing_evidence: "No mention of metrics or team size", recommended_fix: "Add revenue impact and team scope" },
          { claim: "Improved user experience", missing_evidence: "No before/after metrics", recommended_fix: "Include specific NPS or engagement lift" }
        ],
        metric_gaps: ["Need scale numbers (users, revenue, %)", "Missing comparison to goals/benchmarks"],
        ownership_gaps: ["Unclear personal vs team contributions", "Who made the final decisions?"],
        clarity_gaps: ["Some answers were too long", "Could lead with conclusion more"],
        story_recommendations: [],
        next_drill_plan: [
          { category: "strategy", focus: "Long-term vision articulation", priority: 1 },
          { category: "data_metrics", focus: "Quantifying business impact", priority: 2 }
        ]
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Narrative & Story Coherence</h1>
            <p className="text-muted-foreground">
              How well your stories prove your capabilities
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={generateNarrativeInsights} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Analysis
        </Button>
      </div>

      {/* Narrative Score */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(data?.narrative_score_0_100)}`}>
                  {data?.narrative_score_0_100 || 0}
                </div>
                <p className="text-sm text-muted-foreground">Narrative Score</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div className="grid grid-cols-5 gap-6">
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(data?.coverage_score)}`}>
                    {data?.coverage_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Coverage</p>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(data?.proof_metrics_score)}`}>
                    {data?.proof_metrics_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Proof/Metrics</p>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(data?.ownership_clarity_score)}`}>
                    {data?.ownership_clarity_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Ownership</p>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(data?.decision_tradeoffs_score)}`}>
                    {data?.decision_tradeoffs_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Tradeoffs</p>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${getScoreColor(data?.concision_clarity_score)}`}>
                    {data?.concision_clarity_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Clarity</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Repeated Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Repeated Themes
            </CardTitle>
            <CardDescription>Patterns appearing across your answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data?.repeated_themes.length ? (
                data.repeated_themes.map((theme, i) => (
                  <Badge key={i} variant="secondary">{theme}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No repeated themes detected yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missing Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Missing Proof Areas
            </CardTitle>
            <CardDescription>Competencies not yet demonstrated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data?.missing_themes.length ? (
                data.missing_themes.map((theme, i) => (
                  <Badge key={i} variant="outline" className="border-amber-500 text-amber-600">{theme}</Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Good coverage across all areas!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proof Gaps */}
      {data?.proof_gaps && data.proof_gaps.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Proof Gaps</CardTitle>
            <CardDescription>Claims that need stronger evidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.proof_gaps.map((gap, i) => (
                <div key={i} className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-400">"{gap.claim}"</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Missing:</strong> {gap.missing_evidence}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        <strong>Fix:</strong> {gap.recommended_fix}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Metric Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📊 Metric Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data?.metric_gaps.length ? (
                data.metric_gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {gap}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Good metric usage!</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Ownership Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">👤 Ownership Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data?.ownership_gaps.length ? (
                data.ownership_gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {gap}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Clear ownership demonstrated!</li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Clarity Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💬 Clarity Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {data?.clarity_gaps.length ? (
                data.clarity_gaps.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    {gap}
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Clear and concise communication!</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Next Drill Plan */}
      {data?.next_drill_plan && data.next_drill_plan.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Suggested Drill Plan
            </CardTitle>
            <CardDescription>Practice these areas next to close your gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.next_drill_plan.map((drill, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{drill.priority}</Badge>
                    <div>
                      <p className="font-medium capitalize">{drill.category.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">{drill.focus}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Start Drill
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Bank CTA */}
      <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold">Build Your Story Set</h3>
                <p className="text-sm text-muted-foreground">
                  Create a balanced portfolio of 6 STAR stories covering all PM dimensions
                </p>
              </div>
            </div>
            <Button onClick={onViewSTARBank} className="bg-emerald-600 hover:bg-emerald-700">
              Open STAR Bank
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
