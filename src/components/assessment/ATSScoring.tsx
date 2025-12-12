import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, FileText, Loader2, CheckCircle, AlertCircle, 
  TrendingUp, Target, Zap, ArrowRight 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
}

export function ATSScoring({ onComplete, onSkip }: ATSScoringProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const { toast } = useToast();

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
      return;
    }

    // For PDFs, we'll need to parse via edge function
    if (file.type === "application/pdf") {
      toast({
        title: "PDF uploaded",
        description: "Paste your resume text below or we'll analyze the file directly.",
      });
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ resumeText, jobDescription }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      const data = await response.json();
      setResult(data);
      onComplete?.(data);
    } catch (error) {
      console.error("ATS analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again in a moment.",
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
          <p className="text-muted-foreground mt-2">{result.summary}</p>
        </div>

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

        {/* Keywords */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Matched Keywords ({result.matched_keywords.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matched_keywords.slice(0, 10).map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Missing Keywords ({result.missing_keywords.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords.slice(0, 10).map((kw, i) => (
                <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* High Priority Improvements */}
        {result.improvements.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Priority Improvements
            </h3>
            <div className="space-y-3">
              {result.improvements.slice(0, 3).map((imp, i) => (
                <div key={i} className="border-l-2 border-primary/50 pl-3">
                  <div className="font-medium text-foreground">{imp.issue}</div>
                  <div className="text-sm text-muted-foreground">{imp.fix}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Role Fit */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Role Fit Assessment
          </h3>
          <p className="text-muted-foreground">{result.role_fit_assessment}</p>
        </Card>

        {/* Continue Button */}
        <div className="flex justify-center pt-4">
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Your Resume
            </h3>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="text-sm text-primary hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                Upload
              </span>
            </label>
          </div>
          {resumeFile && (
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {resumeFile.name}
            </div>
          )}
          <Textarea
            placeholder="Paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[200px] text-sm"
          />
        </Card>

        {/* Job Description Input */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Target Job Description
          </h3>
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
        <Button size="lg" variant="outline" onClick={onSkip}>
          Skip for now
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your resume is analyzed securely and not stored permanently.
      </p>
    </div>
  );
}
