import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Target, Building2, Compass, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CareerLeveragePanelProps {
  sessionId: string;
  overallScore: number;
  categoryScores: any[];
  narrativeScore: number;
  evaluations: any[];
  targetLevel: string;
  committeeReviews?: any[];
}

interface LeverageAnalysis {
  recommended_level: string;
  current_level_assessment: string;
  level_gap_analysis: string;
  best_fit_roles: string[];
  best_fit_company_types: string[];
  leveling_strategy: string;
  undervaluation_signals: string[];
  overvaluation_signals?: string[];
  market_positioning: string;
  immediate_actions: string[];
  three_month_plan: string;
}

export function CareerLeveragePanel({ 
  sessionId, 
  overallScore, 
  categoryScores, 
  narrativeScore, 
  evaluations, 
  targetLevel,
  committeeReviews 
}: CareerLeveragePanelProps) {
  const [analysis, setAnalysis] = useState<LeverageAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-leverage-analysis", {
        body: {
          sessionId,
          overallScore,
          categoryScores,
          narrativeScore,
          evaluations,
          targetLevel,
          committeeReviews
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);

      // Save to database
      await supabase.from("career_leverage_analysis").upsert({
        session_id: sessionId,
        recommended_level: data.analysis.recommended_level,
        current_level_assessment: data.analysis.current_level_assessment,
        level_gap_analysis: data.analysis.level_gap_analysis,
        best_fit_roles: data.analysis.best_fit_roles,
        best_fit_company_types: data.analysis.best_fit_company_types,
        leveling_strategy: data.analysis.leveling_strategy,
        undervaluation_signals: data.analysis.undervaluation_signals,
        market_positioning: data.analysis.market_positioning
      }, { onConflict: "session_id" });

    } catch (e) {
      console.error("Career leverage error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Career Leverage Index
          </CardTitle>
          <CardDescription>
            Translate your interview performance into career strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runAnalysis} className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Career Strategy
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
            <p className="text-muted-foreground">Analyzing career leverage...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Level Assessment */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommended Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className="text-lg px-4 py-2">{analysis.recommended_level}</Badge>
              {analysis.recommended_level !== targetLevel && (
                <span className="text-sm text-muted-foreground">
                  (Target: {targetLevel})
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">{analysis.current_level_assessment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Level Gap Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.level_gap_analysis}</p>
          </CardContent>
        </Card>
      </div>

      {/* Best Fits */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-green-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Best Fit Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.best_fit_roles?.map((role, i) => (
                <Badge key={i} variant="secondary">{role}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Best Fit Company Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.best_fit_company_types?.map((type, i) => (
                <Badge key={i} variant="outline">{type}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals */}
      <div className="grid md:grid-cols-2 gap-4">
        {analysis.undervaluation_signals?.length > 0 && (
          <Card className="bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-700">You May Be Undervaluing Yourself</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.undervaluation_signals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{signal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {analysis.overvaluation_signals?.length > 0 && (
          <Card className="bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-700">Watch Out For</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {analysis.overvaluation_signals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{signal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leveling Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{analysis.leveling_strategy}</p>
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Market Positioning</h4>
            <p className="text-sm text-muted-foreground">{analysis.market_positioning}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.immediate_actions?.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">3-Month Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.three_month_plan}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
