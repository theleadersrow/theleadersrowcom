import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Linkedin, ArrowLeft, ArrowRight, Sparkles, CheckCircle, 
  Target, Eye, MessageSquare, TrendingUp, AlertCircle, Copy, Loader2, FileText, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkedInSignalScoreProps {
  onBack: () => void;
}

interface ScoreAnalysis {
  overallScore: number;
  dimensions: {
    headlineClarity: { score: number; analysis: string };
    rolePositioning: { score: number; analysis: string };
    impactLanguage: { score: number; analysis: string };
    leadershipSignal: { score: number; analysis: string };
    industryAlignment: { score: number; analysis: string };
    visibilityScore: { score: number; analysis: string };
  };
  strengths: string[];
  criticalGaps: string[];
  recruiterPerspective: string;
}

interface ImprovementSuggestions {
  suggestedHeadline: string;
  suggestedAbout: string;
  keywordAdditions: string[];
  experienceRewrites: Array<{
    original: string;
    improved: string;
    whyBetter: string;
  }>;
  skillsToAdd: string[];
  projectedScoreIncrease: {
    headlineClarity: number;
    rolePositioning: number;
    impactLanguage: number;
    leadershipSignal: number;
    industryAlignment: number;
    visibilityScore: number;
    projectedOverallScore: number;
  };
  priorityActions: Array<{
    action: string;
    impact: string;
    timeToComplete: string;
  }>;
}

type Step = "input" | "analyzing" | "score" | "improving" | "suggestions" | "rescore-input" | "rescoring";

export function LinkedInSignalScore({ onBack }: LinkedInSignalScoreProps) {
  const [step, setStep] = useState<Step>("input");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analysis, setAnalysis] = useState<ScoreAnalysis | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<ScoreAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestions | null>(null);
  const [updatedProfileText, setUpdatedProfileText] = useState("");

  const handleAnalyze = async () => {
    if (!profileText.trim() || !targetIndustry.trim() || !targetRole.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setStep("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          profileText,
          resumeText,
          requestType: "score",
        },
      });

      if (error) throw error;
      setAnalysis(data.analysis);
      setStep("score");
    } catch (error) {
      console.error("Error analyzing LinkedIn:", error);
      toast.error("Failed to analyze profile. Please try again.");
      setStep("input");
    }
  };

  const handleGetSuggestions = async () => {
    setStep("improving");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          profileText,
          resumeText,
          requestType: "improve",
        },
      });

      if (error) throw error;
      setSuggestions(data.suggestions);
      setStep("suggestions");
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast.error("Failed to generate suggestions. Please try again.");
      setStep("score");
    }
  };

  const handleStartRescore = () => {
    setUpdatedProfileText(profileText);
    setPreviousAnalysis(analysis);
    setStep("rescore-input");
  };

  const handleRescore = async () => {
    if (!updatedProfileText.trim()) {
      toast.error("Please paste your updated LinkedIn profile");
      return;
    }

    setStep("rescoring");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          profileText: updatedProfileText,
          resumeText,
          requestType: "score",
        },
      });

      if (error) throw error;
      setProfileText(updatedProfileText);
      setAnalysis(data.analysis);
      setStep("score");
      toast.success("Profile re-scored successfully!");
    } catch (error) {
      console.error("Error re-analyzing LinkedIn:", error);
      toast.error("Failed to re-analyze profile. Please try again.");
      setStep("suggestions");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  if (step === "input") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rimo
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Linkedin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            LinkedIn Profile Signal Score
          </h1>
          <p className="text-muted-foreground">
            Get your profile scored the way recruiters see it, then get AI-powered suggestions to boost your visibility.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your LinkedIn Profile</CardTitle>
            <CardDescription>
              Paste your LinkedIn profile content and optionally your resume for better experience bullet suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">LinkedIn URL (optional)</label>
              <Input
                placeholder="https://linkedin.com/in/yourprofile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Target Industry *</label>
                <Input
                  placeholder="e.g., Technology, Finance, Healthcare"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Target Role *</label>
                <Input
                  placeholder="e.g., Senior Product Manager"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Profile Content *</label>
              <Textarea
                placeholder="Paste your LinkedIn headline, about section, and experience bullets here..."
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                className="min-h-[180px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Copy text from your LinkedIn profile page and paste it here
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Your Resume (optional but recommended)
              </label>
              <Textarea
                placeholder="Paste your resume text here. This helps AI pick the best work experience bullets for LinkedIn suggestions..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Including your resume enables AI to suggest specific experience bullets from your actual work history
              </p>
            </div>

            <Button onClick={handleAnalyze} className="w-full" size="lg">
              Analyze My Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "analyzing" || step === "improving" || step === "rescoring") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          {step === "analyzing" ? "Analyzing Your Profile" : step === "improving" ? "Generating AI Suggestions" : "Re-Scoring Your Profile"}
        </h2>
        <p className="text-muted-foreground">
          {step === "analyzing" 
            ? "Our AI is reviewing your profile through the lens of a recruiter..."
            : step === "improving"
            ? "Creating personalized recommendations to boost your visibility..."
            : "Comparing your updated profile against the previous version..."}
        </p>
      </div>
    );
  }

  if (step === "rescore-input") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("suggestions")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suggestions
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Re-Score Your Updated Profile
          </h1>
          <p className="text-muted-foreground">
            Paste your updated LinkedIn profile to see your new score and improvement.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Updated Profile Content</CardTitle>
            <CardDescription>
              After updating your LinkedIn with the suggestions, paste your new profile content here to see your improved score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Updated Profile Content *</label>
              <Textarea
                placeholder="Paste your updated LinkedIn headline, about section, and experience bullets here..."
                value={updatedProfileText}
                onChange={(e) => setUpdatedProfileText(e.target.value)}
                className="min-h-[250px]"
              />
            </div>

            <Button onClick={handleRescore} className="w-full" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-Score My Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "score" && analysis) {
    const scoreImprovement = previousAnalysis ? analysis.overallScore - previousAnalysis.overallScore : null;
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rimo
        </button>

        {/* Overall Score */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Your LinkedIn Signal Score</h1>
          <div className={`text-7xl font-bold bg-gradient-to-r ${getScoreGradient(analysis.overallScore)} bg-clip-text text-transparent`}>
            {analysis.overallScore}
          </div>
          <p className="text-muted-foreground mt-2">out of 100</p>
          {scoreImprovement !== null && scoreImprovement > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">+{scoreImprovement} points improvement!</span>
            </div>
          )}
          {previousAnalysis && (
            <p className="text-sm text-muted-foreground mt-2">
              Previous score: {previousAnalysis.overallScore}
            </p>
          )}
        </div>

        {/* Dimension Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Profile Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analysis.dimensions).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`text-sm font-bold ${getScoreColor(value.score)}`}>
                    {value.score}
                  </span>
                </div>
                <Progress value={value.score} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">{value.analysis}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths & Gaps */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Critical Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.criticalGaps.map((gap, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recruiter Perspective */}
        <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Recruiter Perspective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">"{analysis.recruiterPerspective}"</p>
          </CardContent>
        </Card>

        {/* Get AI Help CTA */}
        <Card className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardContent className="py-6 text-center">
            <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Want to Improve Your Score?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered suggestions including a new headline, about section rewrites, 
              and keyword optimizations tailored to your target role.
              {resumeText && " Your resume will be used to suggest specific experience bullets."}
            </p>
            <Button onClick={handleGetSuggestions} size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Improvement Suggestions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "suggestions" && suggestions && analysis) {
    const projectedIncrease = suggestions.projectedScoreIncrease.projectedOverallScore - analysis.overallScore;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("score")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Score
        </button>

        {/* Projected Score Improvement */}
        <div className="text-center mb-8 p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
          <h1 className="text-xl font-serif font-bold text-foreground mb-4">Projected Score After Changes</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">{analysis.overallScore}</div>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="text-center">
              <div className="text-5xl font-bold text-green-500">
                {suggestions.projectedScoreIncrease.projectedOverallScore}
              </div>
              <p className="text-xs text-muted-foreground">Projected</p>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-2 font-medium">
            +{projectedIncrease} points with these improvements
          </p>
        </div>

        {/* Priority Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.priorityActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    action.impact === 'high' ? 'bg-red-500/20 text-red-600' : 'bg-yellow-500/20 text-yellow-600'
                  }`}>
                    {action.impact}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.action}</p>
                    <p className="text-xs text-muted-foreground">{action.timeToComplete}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Headline */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Suggested Headline
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(suggestions.suggestedHeadline, "Headline")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-muted/50 p-3 rounded-lg font-medium">{suggestions.suggestedHeadline}</p>
          </CardContent>
        </Card>

        {/* Suggested About Section */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Suggested About Section
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => copyToClipboard(suggestions.suggestedAbout, "About section")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-line">{suggestions.suggestedAbout}</p>
          </CardContent>
        </Card>

        {/* Keywords to Add */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Keywords to Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.keywordAdditions.map((keyword, i) => (
                <span key={i} className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience Rewrites */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Experience Rewrites</CardTitle>
            <CardDescription>
              {resumeText ? "Based on your resume and LinkedIn profile" : "Based on your LinkedIn profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.experienceRewrites.map((rewrite, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <div className="p-3 bg-red-500/5 border-b border-border">
                  <p className="text-xs text-muted-foreground mb-1">Before:</p>
                  <p className="text-sm line-through opacity-70">{rewrite.original}</p>
                </div>
                <div className="p-3 bg-green-500/5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-muted-foreground">After:</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(rewrite.improved, "Experience bullet")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-green-700">{rewrite.improved}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">{rewrite.whyBetter}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills to Add */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Skills to Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.skillsToAdd.map((skill, i) => (
                <span key={i} className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Re-Score CTA */}
        <Card className="mb-6 border-2 border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
          <CardContent className="py-6 text-center">
            <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Updated Your LinkedIn?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              After making changes to your LinkedIn profile, come back and re-score to see your improvement!
            </p>
            <Button onClick={handleStartRescore} size="lg" variant="outline" className="border-green-500/50 hover:bg-green-500/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-Score My Updated Profile
            </Button>
          </CardContent>
        </Card>

        {/* Analyze Another */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => {
              setAnalysis(null);
              setSuggestions(null);
              setPreviousAnalysis(null);
              setStep("input");
            }}
          >
            Analyze Another Profile
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
