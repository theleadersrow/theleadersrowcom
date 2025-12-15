import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, ArrowRight, Upload, Loader2, Sparkles, FileText, 
  CheckCircle, Download, RefreshCw, Target, Zap, TrendingUp,
  AlertCircle, ChevronRight, Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface ResumeIntelligenceSuiteProps {
  onBack: () => void;
  onComplete: () => void;
}

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

interface EnhancedResume {
  enhancedContent: string;
  contentImprovements: Array<{
    section: string;
    original: string;
    improved: string;
    reason: string;
  }>;
  addedKeywords: string[];
  quantifiedAchievements: string[];
  actionVerbUpgrades: Array<{ original: string; improved: string }>;
  summaryRewrite: string;
  bulletPointImprovements: string[];
}

type Step = "input" | "initial_score" | "enhancing" | "improvements" | "final_score";

export function ResumeIntelligenceSuite({ onBack, onComplete }: ResumeIntelligenceSuiteProps) {
  const [step, setStep] = useState<Step>("input");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selfProjection, setSelfProjection] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [initialScore, setInitialScore] = useState<ATSResult | null>(null);
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [finalScore, setFinalScore] = useState<ATSResult | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingResume(true);
    setResumeFileName(file.name);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        toast({ title: "Resume loaded", description: "Your resume text has been extracted." });
        setIsUploadingResume(false);
        return;
      }

      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        const { data, error } = await supabase.functions.invoke('parse-resume', {
          body: { fileBase64: base64, fileName: file.name, fileType: file.type },
        });

        if (error) throw error;
        if (data?.resumeText) {
          setResumeText(data.resumeText);
          toast({ title: "Resume parsed", description: "Your resume has been extracted." });
        } else {
          throw new Error("No text extracted");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please paste your resume text manually.",
        variant: "destructive",
      });
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleInitialAnalysis = async () => {
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

      if (!response.ok) throw new Error("Failed to analyze resume");

      const data = await response.json();
      setInitialScore(data);
      setStep("initial_score");
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEnhanceResume = async () => {
    setStep("enhancing");
    setIsEnhancing(true);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-resume", {
        body: { 
          resumeText, 
          jobDescription,
          selfProjection,
          missingKeywords: initialScore?.missing_keywords || [],
          improvements: initialScore?.improvements || [],
          experienceGaps: initialScore?.experience_gaps || [],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setEnhancedResume(data);
      setStep("improvements");
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: "Please try again.",
        variant: "destructive",
      });
      setStep("initial_score");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFinalAnalysis = async () => {
    if (!enhancedResume?.enhancedContent) return;

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
          body: JSON.stringify({ resumeText: enhancedResume.enhancedContent, jobDescription }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze");

      const data = await response.json();
      setFinalScore(data);
      setStep("final_score");
    } catch (error) {
      console.error("Final analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyEnhanced = async () => {
    if (enhancedResume?.enhancedContent) {
      await navigator.clipboard.writeText(enhancedResume.enhancedContent);
      toast({ title: "Copied!", description: "Enhanced resume copied to clipboard" });
    }
  };

  const handleReset = () => {
    setStep("input");
    setResumeText("");
    setJobDescription("");
    setSelfProjection("");
    setInitialScore(null);
    setEnhancedResume(null);
    setFinalScore(null);
    setResumeFileName(null);
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

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { key: "input", label: "Input" },
        { key: "initial_score", label: "Score" },
        { key: "improvements", label: "Improve" },
        { key: "final_score", label: "Result" },
      ].map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === s.key || 
            (step === "enhancing" && s.key === "improvements") ||
            ["initial_score", "improvements", "final_score"].indexOf(step) >= ["initial_score", "improvements", "final_score"].indexOf(s.key as any)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}>
            {i + 1}
          </div>
          {i < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
        </div>
      ))}
    </div>
  );

  // Step 1: Input
  if (step === "input") {
    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Resume Intelligence Suite</h1>
              <p className="text-muted-foreground">Score, optimize, and transform your resume for your target role</p>
            </div>
          </div>

          {stepIndicator}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Your Resume
              </h3>
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingResume}
                >
                  {isUploadingResume ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload PDF</>
                  )}
                </Button>
                {resumeFileName && (
                  <span className="ml-2 text-sm text-muted-foreground">{resumeFileName}</span>
                )}
              </div>
              <Textarea
                placeholder="Or paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[250px] text-sm"
              />
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Target Job Description
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste the job you're applying to. We'll optimize your resume specifically for this role.
              </p>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] text-sm"
              />
            </Card>
          </div>

          {/* Self-Projection Field */}
          <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> How Do You Want to Be Perceived?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us about your professional identity, strengths, and how you want hiring managers to see you. 
              This helps our AI craft content that authentically represents YOU while maximizing ATS scores.
            </p>
            <Textarea
              placeholder="Example: I'm a strategic product manager who thrives at turning ambiguous problems into clear roadmaps. I'm known for building strong cross-functional relationships and driving measurable outcomes. I want to be seen as a leader who combines data-driven decision making with strong customer empathy..."
              value={selfProjection}
              onChange={(e) => setSelfProjection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2 italic">
              The more specific you are, the more personalized and authentic your enhanced resume will feel.
            </p>
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleInitialAnalysis}
              disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Get My ATS Score</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Initial Score
  if (step === "initial_score" && initialScore) {
    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("input")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Current ATS Score</h1>
              <p className="text-muted-foreground">Here's how your resume performs against this job</p>
            </div>
          </div>

          {stepIndicator}

          <div className="text-center mb-8">
            <div className={`text-7xl font-bold ${getScoreColor(initialScore.ats_score)}`}>
              {initialScore.ats_score}<span className="text-3xl text-muted-foreground">/100</span>
            </div>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{initialScore.summary}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Keywords", score: initialScore.keyword_match_score },
              { label: "Experience", score: initialScore.experience_match_score },
              { label: "Skills", score: initialScore.skills_match_score },
              { label: "Format", score: initialScore.format_score },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </Card>
            ))}
          </div>

          {initialScore.missing_keywords.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Keywords ({initialScore.missing_keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {initialScore.missing_keywords.slice(0, 12).map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                    {kw}
                  </span>
                ))}
                {initialScore.missing_keywords.length > 12 && (
                  <span className="text-xs text-muted-foreground">+{initialScore.missing_keywords.length - 12} more</span>
                )}
              </div>
            </Card>
          )}

          {initialScore.improvements.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Top Improvements Needed
              </h3>
              <div className="space-y-3">
                {initialScore.improvements.slice(0, 3).map((imp, i) => (
                  <div key={i} className="border-l-2 border-primary/50 pl-3">
                    <div className="font-medium text-foreground text-sm">{imp.issue}</div>
                    <div className="text-sm text-muted-foreground">{imp.fix}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="bg-primary/10 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-lg text-foreground mb-2">Ready to Improve Your Score?</h3>
            <p className="text-muted-foreground mb-4">
              Our AI will rewrite your resume with the right keywords, stronger achievements, and optimized content for this specific role.
            </p>
            <Button size="lg" onClick={handleEnhanceResume}>
              <Sparkles className="w-4 h-4 mr-2" /> Transform My Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Enhancing (loading state)
  if (step === "enhancing") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Transforming Your Resume</h2>
          <p className="text-muted-foreground mb-6">
            Our AI is rewriting your resume with targeted keywords, quantified achievements, and role-specific language...
          </p>
          <div className="space-y-2 text-left bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Adding missing keywords...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Quantifying achievements...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Strengthening action verbs...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Optimizing for ATS...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Improvements
  if (step === "improvements" && enhancedResume) {
    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("initial_score")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Optimized Resume</h1>
              <p className="text-muted-foreground">AI-powered improvements for your target role</p>
            </div>
          </div>

          {stepIndicator}

          {/* Key Improvements Summary */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{enhancedResume.addedKeywords.length}</div>
              <div className="text-sm text-muted-foreground">Keywords Added</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{enhancedResume.quantifiedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements Quantified</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{enhancedResume.actionVerbUpgrades.length}</div>
              <div className="text-sm text-muted-foreground">Action Verbs Upgraded</div>
            </Card>
          </div>

          {/* Added Keywords */}
          {enhancedResume.addedKeywords.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Keywords Added to Your Resume
              </h3>
              <div className="flex flex-wrap gap-2">
                {enhancedResume.addedKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                    + {kw}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Content Improvements */}
          {enhancedResume.contentImprovements.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Content Improvements
              </h3>
              <div className="space-y-4">
                {enhancedResume.contentImprovements.slice(0, 3).map((imp, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs font-medium text-primary mb-2">{imp.section}</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Before:</div>
                        <div className="text-sm text-muted-foreground line-through">{imp.original}</div>
                      </div>
                      <div>
                        <div className="text-xs text-green-600 mb-1">After:</div>
                        <div className="text-sm text-foreground">{imp.improved}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 italic">{imp.reason}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Enhanced Resume Content */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Your Enhanced Resume
              </h3>
              <Button variant="outline" size="sm" onClick={handleCopyEnhanced}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
              <ReactMarkdown>{enhancedResume.enhancedContent}</ReactMarkdown>
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleCopyEnhanced}>
              <Download className="w-4 h-4 mr-2" /> Copy Enhanced Resume
            </Button>
            <Button size="lg" onClick={handleFinalAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scoring...</>
              ) : (
                <>See My New Score <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Final Score
  if (step === "final_score" && finalScore && initialScore) {
    const improvement = finalScore.ats_score - initialScore.ats_score;

    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("improvements")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Transformation Complete!</h1>
              <p className="text-muted-foreground">See how much your resume improved</p>
            </div>
          </div>

          {stepIndicator}

          {/* Score Comparison */}
          <div className="bg-gradient-to-r from-primary/10 to-green-500/10 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 items-center text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Before</div>
                <div className={`text-4xl font-bold ${getScoreColor(initialScore.ats_score)}`}>
                  {initialScore.ats_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Improvement</div>
                <div className={`text-4xl font-bold ${improvement > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  +{improvement}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">After</div>
                <div className={`text-5xl font-bold ${getScoreColor(finalScore.ats_score)}`}>
                  {finalScore.ats_score}
                </div>
              </div>
            </div>
          </div>

          {/* Category Improvements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Keywords", before: initialScore.keyword_match_score, after: finalScore.keyword_match_score },
              { label: "Experience", before: initialScore.experience_match_score, after: finalScore.experience_match_score },
              { label: "Skills", before: initialScore.skills_match_score, after: finalScore.skills_match_score },
              { label: "Format", before: initialScore.format_score, after: finalScore.format_score },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.before}%</span>
                  <ArrowRight className="w-3 h-3 text-green-500" />
                  <span className={`text-lg font-bold ${getScoreColor(item.after)}`}>{item.after}%</span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 mb-6 bg-green-500/10 border-green-500/20">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> What Changed
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {enhancedResume && (
                <>
                  <li>• Added {enhancedResume.addedKeywords.length} missing keywords from the job description</li>
                  <li>• Quantified {enhancedResume.quantifiedAchievements.length} achievements with metrics</li>
                  <li>• Upgraded {enhancedResume.actionVerbUpgrades.length} action verbs for stronger impact</li>
                  <li>• Restructured content to match role requirements</li>
                </>
              )}
            </ul>
          </Card>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" onClick={handleCopyEnhanced}>
              <Copy className="w-4 h-4 mr-2" /> Copy Enhanced Resume
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Another Resume
            </Button>
            <Button onClick={onComplete}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
