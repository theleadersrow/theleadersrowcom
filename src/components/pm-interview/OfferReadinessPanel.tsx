import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, DollarSign, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OfferReadinessPanelProps {
  sessionId: string;
  overallScore: number;
  categoryScores: any[];
  narrativeScore: number;
  targetLevel: string;
  targetCompany?: string;
  committeeReviews?: any[];
  signalCoverage?: any;
  confidenceAnalysis?: any;
}

interface ReadinessAnalysis {
  predicted_level: string;
  level_match: {
    matches_target: boolean;
    likely_outcome: string;
    downlevel_probability: number;
    explanation: string;
  };
  negotiation_readiness: string;
  compensation_leverage: {
    signals: string[];
    risks: string[];
    positioning: string;
  };
  leveling_risks: string[];
  leveling_mitigation: string[];
  negotiation_recommendations: string[];
  offer_timeline_advice: string;
  company_specific_advice: string;
  readiness_score: number;
  ready_for_offer: boolean;
  next_steps: string[];
}

export function OfferReadinessPanel({ 
  sessionId, 
  overallScore, 
  categoryScores, 
  narrativeScore, 
  targetLevel,
  targetCompany,
  committeeReviews,
  signalCoverage,
  confidenceAnalysis
}: OfferReadinessPanelProps) {
  const [analysis, setAnalysis] = useState<ReadinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("offer-readiness", {
        body: {
          sessionId,
          overallScore,
          categoryScores,
          narrativeScore,
          targetLevel,
          targetCompany,
          committeeReviews,
          signalCoverage,
          confidenceAnalysis
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);

      // Save to database
      await supabase.from("offer_readiness").upsert({
        session_id: sessionId,
        predicted_level: data.analysis.predicted_level,
        downlevel_probability: data.analysis.level_match?.downlevel_probability,
        negotiation_readiness: data.analysis.negotiation_readiness,
        compensation_leverage_signals: data.analysis.compensation_leverage?.signals,
        leveling_risks: data.analysis.leveling_risks,
        negotiation_recommendations: data.analysis.negotiation_recommendations
      }, { onConflict: "session_id" });

    } catch (e) {
      console.error("Offer readiness error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Offer Readiness Analysis
          </CardTitle>
          <CardDescription>
            From interview performance to offer outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAnalysis} className="w-full">
            <Target className="h-4 w-4 mr-2" />
            Analyze Offer Readiness
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing offer readiness...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const downlevelPct = Math.round((analysis.level_match?.downlevel_probability || 0) * 100);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className={analysis.ready_for_offer ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"}>
          <CardContent className="pt-6 text-center">
            <div className={`text-2xl font-bold mb-2 ${analysis.ready_for_offer ? "text-green-600" : "text-amber-600"}`}>
              {analysis.ready_for_offer ? "Ready" : "Not Yet"}
            </div>
            <p className="text-sm text-muted-foreground">Offer Ready?</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {analysis.readiness_score}
            </div>
            <p className="text-sm text-muted-foreground">Readiness Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Badge className="text-lg px-3 py-1 mb-2">{analysis.predicted_level}</Badge>
            <p className="text-sm text-muted-foreground">Predicted Level</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className={`text-2xl font-bold mb-2 ${
              analysis.negotiation_readiness === "strong" ? "text-green-600" :
              analysis.negotiation_readiness === "moderate" ? "text-amber-600" : "text-red-600"
            }`}>
              {analysis.negotiation_readiness}
            </div>
            <p className="text-sm text-muted-foreground">Negotiation Ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Match */}
      <Card className={analysis.level_match?.matches_target ? "border-green-500/20" : "border-amber-500/20"}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Level Outcome Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={analysis.level_match?.likely_outcome === "at_level" ? "default" : "secondary"}>
              {analysis.level_match?.likely_outcome === "at_level" ? "At Target Level" :
               analysis.level_match?.likely_outcome === "downleveled" ? "Risk of Downlevel" : "Potential Uplevel"}
            </Badge>
            {downlevelPct > 0 && (
              <span className="text-sm text-muted-foreground">
                {downlevelPct}% downlevel probability
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{analysis.level_match?.explanation}</p>
        </CardContent>
      </Card>

      {/* Compensation Leverage */}
      {analysis.compensation_leverage && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Compensation Leverage Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.compensation_leverage.signals?.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{signal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Compensation Risks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.compensation_leverage.risks?.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Positioning */}
      {analysis.compensation_leverage?.positioning && (
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Compensation Positioning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysis.compensation_leverage.positioning}</p>
          </CardContent>
        </Card>
      )}

      {/* Leveling Risks & Mitigation */}
      {(analysis.leveling_risks?.length > 0 || analysis.leveling_mitigation?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-700">Leveling Risks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.leveling_risks?.map((risk, i) => (
                  <li key={i} className="text-muted-foreground">• {risk}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-700">How to Mitigate</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.leveling_mitigation?.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Negotiation Recommendations */}
      {analysis.negotiation_recommendations?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Negotiation Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.negotiation_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Timeline & Next Steps */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Offer Timeline Advice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.offer_timeline_advice}</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.next_steps?.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
