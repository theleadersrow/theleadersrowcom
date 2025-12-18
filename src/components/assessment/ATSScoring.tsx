import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, FileText, Loader2, CheckCircle, AlertCircle, 
  TrendingUp, Target, Zap, ArrowRight, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ATSResult {
  ats_score: number;
  keyword_match_score: number;
  experience_match_score: number;
  skills_match_score: number;
  format_score: number;
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: Array<{ priority: string; issue: string; fix: string }>;
  experience_gaps: string[];
  recommended_additions: string[];
  role_fit_assessment: string;
}

interface ATSScoringProps {
  onComplete?: (result: ATSResult) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function ATSScoring({ onComplete, onSkip, onBack }: ATSScoringProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const { toast } = useToast();

  const handleReset = () => {
    setResult(null);
    setResumeText("");
    setJobDescription("");
    setResumeFile(null);
  };

  const getStoredEmail = (): string | undefined => {
    try {
      const storedAccess = localStorage.getItem("resume_suite_access");
      if (storedAccess) {
        const parsed = JSON.parse(storedAccess);
        if (parsed.email) return parsed.email;
      }
    } catch {
      // ignore
    }
    return undefined;
  };

  const getAccessToken = (): string | undefined => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access");
      if (accessToken) return accessToken;

      const storedAccess = localStorage.getItem("resume_suite_access");
      if (storedAccess) {
        const parsed = JSON.parse(storedAccess);
        return parsed.accessToken;
      }
    } catch {
      // ignore
    }
    return undefined;
  };

  const clearResume = () => {
    setResumeText("");
    setResumeFile(null);
  };

  const clearJobDescription = () => {
    setJobDescription("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);

    // For text files, read directly
    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      toast({
        title: "Resume loaded",
        description: "Your resume text has been extracted.",
      });
      return;
    }

    // For PDFs, parse via edge function
    if (file.type === "application/pdf") {
      setIsParsingResume(true);
      toast({
        title: "Processing PDF",
        description: "Extracting text from your resume...",
      });

      try {
        // Read file as base64
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        // Call the Supabase function to parse resume
        const { data, error } = await supabase.functions.invoke('parse-resume', {
          body: {
            fileBase64: base64,
            fileName: file.name,
            fileType: file.type,
          },
        });

        if (error) {
          throw error;
        }

        if (data?.resumeText) {
          setResumeText(data.resumeText);
          toast({
            title: "Resume parsed successfully",
            description: "Your resume text has been extracted and is ready for analysis.",
          });
        } else {
          throw new Error("No text extracted from resume");
        }
      } catch (error) {
        console.error("PDF parsing error:", error);
        toast({
          title: "Could not parse PDF",
          description: "Please paste your resume text manually below.",
          variant: "destructive",
        });
      } finally {
        setIsParsingResume(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both your resume and the job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const email = getStoredEmail();
      const accessToken = getAccessToken();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ resumeText, jobDescription, email, accessToken }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get("Retry-After") || errorData.retry_after_seconds || 0);
          throw new Error(
            retryAfter
              ? `Service is busy. Please wait ${retryAfter}s and try again.`
              : "Service is busy. Please wait a moment and try again."
          );
        }
        throw new Error(errorData.error || errorData.message || "Failed to analyze resume");
      }

      const data = await response.json();
      console.log("ATS Result:", data);
      setResult(data);
      // Don't auto-advance - let user see results first
    } catch (error: any) {
      console.error("ATS analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error?.message || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (result) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Score Header */}
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Your ATS Compatibility Score
          </h2>
          <div className={`text-6xl font-bold ${getScoreColor(result.ats_score)}`}>
            {result.ats_score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{result.summary}</p>
        </div>

        {/* Low Match Warning */}
        {result.ats_score < 40 && (
          <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  This role may not be the best match for your profile
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Based on our analysis, there's a significant gap between your current experience and what this role requires. 
                  This doesn't mean you can't apply, but consider whether this is the right opportunity or if there are roles 
                  that better align with your background. Optimizing your resume can only go so far — the right role match matters more.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Keywords", score: result.keyword_match_score },
            { label: "Experience", score: result.experience_match_score },
            { label: "Skills", score: result.skills_match_score },
            { label: "Format", score: result.format_score },
          ].map((item) => (
            <Card key={item.label} className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                {item.score}%
              </div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </Card>
          ))}
        </div>

        {/* Strengths */}
        {result.strengths && result.strengths.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {result.strengths.slice(0, 4).map((strength, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Keywords */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Matched Keywords ({result.matched_keywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {result.matched_keywords?.slice(0, 15).map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                  {kw}
                </span>
              ))}
              {(result.matched_keywords?.length || 0) > 15 && (
                <span className="px-2 py-1 text-muted-foreground text-xs">
                  +{result.matched_keywords.length - 15} more
                </span>
              )}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Missing Keywords ({result.missing_keywords?.length || 0})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {result.missing_keywords?.slice(0, 15).map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                  {kw}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* High Priority Improvements */}
        {result.improvements && result.improvements.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Priority Improvements
            </h3>
            <div className="space-y-4">
              {result.improvements.slice(0, 3).map((imp, i) => (
                <div key={i} className="border-l-2 border-primary/50 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      imp.priority === 'high' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                        : imp.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {imp.priority}
                    </span>
                  </div>
                  <div className="font-medium text-foreground text-sm">{imp.issue}</div>
                  <div className="text-sm text-muted-foreground mt-1">{imp.fix}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Experience Gaps */}
        {result.experience_gaps && result.experience_gaps.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Experience Gaps to Address
            </h3>
            <ul className="space-y-2">
              {result.experience_gaps.map((gap, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">⚠</span>
                  {gap}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Role Fit */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Role Fit Assessment
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{result.role_fit_assessment}</p>
        </Card>

        {/* Recommended Additions */}
        {result.recommended_additions && result.recommended_additions.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-secondary" />
              Recommended Additions
            </h3>
            <ul className="space-y-2">
              {result.recommended_additions.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-secondary mt-0.5">+</span>
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button size="lg" variant="ghost" onClick={handleReset}>
            Try Another Resume
          </Button>
          {onBack && (
            <Button size="lg" variant="outline" onClick={onBack}>
              Back to Rimo
            </Button>
          )}
          <Button size="lg" onClick={onSkip}>
            Continue to Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          ATS Resume Check
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Get your resume scored against the job you're targeting. 
          We'll analyze keyword matches, experience alignment, and give specific improvements.
        </p>
      </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resume Input */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Your Resume
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearResume}
                disabled={!resumeText.trim() && !resumeFile}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
            <Textarea
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[200px] text-sm"
            />
          </Card>

          {/* Job Description Input */}
          <Card className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Target Job Description
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearJobDescription}
                disabled={!jobDescription.trim()}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>
            <Textarea
              placeholder="Paste the job description you're applying to..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] text-sm"
            />
          </Card>
        </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onBack && (
          <Button size="lg" variant="outline" onClick={onBack}>
            Back to Rimo
          </Button>
        )}
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Analyze My Resume
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your resume is analyzed securely and not stored permanently.
      </p>
    </div>
  );
}
