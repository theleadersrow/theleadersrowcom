import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Scale, TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConfidenceCalibrationProps {
  answers: any[];
  evaluations: any[];
  targetLevel: string;
}

interface CalibrationAnalysis {
  confidence_score: number;
  calibration: "underconfident" | "calibrated" | "overconfident";
  evidence: {
    hedging_patterns: string[];
    overclaiming_patterns: string[];
    substance_gaps: string[];
  };
  impact_on_interview: string;
  coaching: {
    say_more: string[];
    say_less: string[];
    reframe: string[];
  };
  level_specific_advice: string;
}

export function ConfidenceCalibration({ answers, evaluations, targetLevel }: ConfidenceCalibrationProps) {
  const [analysis, setAnalysis] = useState<CalibrationAnalysis | null>(null);
  const [metrics, setMetrics] = useState<{
    total_hedging: number;
    total_confident: number;
    avg_score: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("confidence-calibration", {
        body: { answers, evaluations, targetLevel }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      setMetrics(data.metrics);
      setHasAnalyzed(true);
    } catch (e) {
      console.error("Confidence analysis error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAnalyzed && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Confidence Calibration
          </CardTitle>
          <CardDescription>
            Analyze your confidence patterns and executive presence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAnalysis} className="w-full">
            <Scale className="h-4 w-4 mr-2" />
            Analyze Confidence Patterns
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
            <p className="text-muted-foreground">Analyzing confidence patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  const calibrationIcon = analysis.calibration === "underconfident" ? TrendingDown :
    analysis.calibration === "overconfident" ? TrendingUp : Minus;
  const CalibrationIcon = calibrationIcon;

  const calibrationColor = analysis.calibration === "underconfident" ? "text-blue-600 bg-blue-500/10" :
    analysis.calibration === "overconfident" ? "text-red-600 bg-red-500/10" : "text-green-600 bg-green-500/10";

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className={calibrationColor}>
          <CardContent className="pt-6 text-center">
            <CalibrationIcon className="h-8 w-8 mx-auto mb-2" />
            <div className="text-2xl font-bold capitalize mb-1">
              {analysis.calibration}
            </div>
            <p className="text-sm opacity-80">Confidence Calibration</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {analysis.confidence_score}
            </div>
            <p className="text-sm text-muted-foreground">Confidence Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center gap-6">
              <div>
                <span className="text-2xl font-bold text-amber-600">{metrics?.total_hedging || 0}</span>
                <p className="text-xs text-muted-foreground">Hedging</p>
              </div>
              <div>
                <span className="text-2xl font-bold text-green-600">{metrics?.total_confident || 0}</span>
                <p className="text-xs text-muted-foreground">Confident</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Language Patterns</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impact on Your Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.impact_on_interview}</p>
          <p className="mt-4 text-sm bg-primary/5 p-4 rounded-lg">
            <span className="font-medium">Level-specific advice for {targetLevel}:</span><br />
            {analysis.level_specific_advice}
          </p>
        </CardContent>
      </Card>

      {/* Evidence */}
      {analysis.evidence && (
        <div className="grid md:grid-cols-2 gap-4">
          {analysis.evidence.hedging_patterns?.length > 0 && (
            <Card className="bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-amber-700">Hedging Patterns Found</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {analysis.evidence.hedging_patterns.slice(0, 4).map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.evidence.overclaiming_patterns?.length > 0 && (
            <Card className="bg-red-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-700">Overclaiming Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {analysis.evidence.overclaiming_patterns.slice(0, 4).map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Coaching */}
      {analysis.coaching && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-green-700">Say More</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.coaching.say_more?.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700">Say Less</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.coaching.say_less?.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Reframe</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.coaching.reframe?.map((item, i) => (
                  <li key={i} className="text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
