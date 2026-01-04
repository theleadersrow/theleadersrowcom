import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserCheck, UserX, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HiringCommitteePanelProps {
  sessionId: string;
  answers: any[];
  evaluations: any[];
  targetLevel: string;
  targetCompany?: string;
}

interface CommitteeReview {
  persona_name: string;
  persona_role: string;
  verdict: string;
  top_positives: string[];
  top_concerns: string[];
  detailed_feedback: string;
  confidence_score: number;
}

interface CommitteeSummary {
  final_verdict: string;
  verdict_explanation: string;
  tipping_factors: string[];
  what_would_change: string[];
  consensus_level: string;
}

const VERDICT_COLORS: Record<string, string> = {
  strong_hire: "bg-green-500",
  hire: "bg-emerald-500",
  lean_hire: "bg-amber-500",
  lean_no_hire: "bg-orange-500",
  no_hire: "bg-red-500"
};

const VERDICT_LABELS: Record<string, string> = {
  strong_hire: "Strong Hire",
  hire: "Hire",
  lean_hire: "Lean Hire",
  lean_no_hire: "Lean No Hire",
  no_hire: "No Hire"
};

export function HiringCommitteePanel({ sessionId, answers, evaluations, targetLevel, targetCompany }: HiringCommitteePanelProps) {
  const [reviews, setReviews] = useState<CommitteeReview[]>([]);
  const [summary, setSummary] = useState<CommitteeSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("hiring-committee-simulation", {
        body: { 
          sessionId, 
          answers: answers.map(a => ({
            ...a,
            question: a.interview_questions || a.question
          })),
          evaluations, 
          targetLevel, 
          targetCompany 
        }
      });

      if (error) throw error;

      if (data?.reviews) {
        setReviews(data.reviews);
        
        // Save to database
        for (const review of data.reviews) {
          await supabase.from("hiring_committee_reviews").insert({
            session_id: sessionId,
            persona_name: review.persona_name,
            persona_role: review.persona_role,
            verdict: review.verdict,
            top_positives: review.top_positives,
            top_concerns: review.top_concerns,
            detailed_feedback: review.detailed_feedback,
            confidence_score: review.confidence_score
          });
        }
      }

      if (data?.summary) {
        setSummary(data.summary);
        
        // Save summary
        await supabase.from("committee_summaries").upsert({
          session_id: sessionId,
          final_verdict: data.summary.final_verdict,
          verdict_explanation: data.summary.verdict_explanation,
          tipping_factors: data.summary.tipping_factors,
          what_would_change: data.summary.what_would_change,
          consensus_level: data.summary.consensus_level
        }, { onConflict: "session_id" });
      }

      setHasLoaded(true);
    } catch (e) {
      console.error("Committee simulation error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing reviews
  useEffect(() => {
    const loadExisting = async () => {
      const { data: existingReviews } = await supabase
        .from("hiring_committee_reviews")
        .select("*")
        .eq("session_id", sessionId);

      if (existingReviews && existingReviews.length > 0) {
        setReviews(existingReviews);
        setHasLoaded(true);
      }

      const { data: existingSummary } = await supabase
        .from("committee_summaries")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (existingSummary) {
        setSummary(existingSummary);
      }
    };
    loadExisting();
  }, [sessionId]);

  if (!hasLoaded && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Hiring Committee Simulator
          </CardTitle>
          <CardDescription>
            See how 5 different interviewers would evaluate your performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runSimulation} className="w-full">
            <Users className="h-4 w-4 mr-2" />
            Run Committee Simulation
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
            <p className="text-muted-foreground">Simulating hiring committee feedback...</p>
            <p className="text-sm text-muted-foreground">5 interviewers are reviewing your performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {summary && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Committee Decision</CardTitle>
              <Badge className={VERDICT_COLORS[summary.final_verdict?.toLowerCase().replace(" ", "_")] || "bg-gray-500"}>
                {summary.final_verdict}
              </Badge>
            </div>
            <Badge variant="outline" className="w-fit">
              Consensus: {summary.consensus_level}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{summary.verdict_explanation}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h4 className="font-medium text-green-700 mb-2">What Tipped the Decision</h4>
                <ul className="text-sm space-y-1">
                  {summary.tipping_factors?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-amber-500/10 rounded-lg">
                <h4 className="font-medium text-amber-700 mb-2">What Would Change It</h4>
                <ul className="text-sm space-y-1">
                  {summary.what_would_change?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{review.persona_name}</CardTitle>
                  <CardDescription>{review.persona_role}</CardDescription>
                </div>
                <Badge className={VERDICT_COLORS[review.verdict] || "bg-gray-500"}>
                  {VERDICT_LABELS[review.verdict] || review.verdict}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-green-600 mb-1">Positives</p>
                <ul className="text-sm space-y-1">
                  {review.top_positives?.slice(0, 2).map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <UserCheck className="h-3 w-3 mt-1 text-green-500" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-xs font-medium text-red-600 mb-1">Concerns</p>
                <ul className="text-sm space-y-1">
                  {review.top_concerns?.slice(0, 2).map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <UserX className="h-3 w-3 mt-1 text-red-500" />
                      <span className="text-muted-foreground">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="text-xs text-muted-foreground italic border-t pt-2">
                "{review.detailed_feedback}"
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
