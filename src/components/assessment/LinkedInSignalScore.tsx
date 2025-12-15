import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Linkedin, ArrowLeft, ArrowRight, Sparkles, CheckCircle, 
  Target, Eye, MessageSquare, TrendingUp, AlertCircle, Copy, Loader2, FileText, RefreshCw, Upload, Link, Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface LinkedInSignalScoreProps {
  onBack: () => void;
}

interface ScoreAnalysis {
  overallScore: number;
  potentialImprovement?: number;
  projectedScoreAfterChanges?: number;
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
    companyRole: string;
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
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ScoreAnalysis | null>(null);
  const [previousAnalysis, setPreviousAnalysis] = useState<ScoreAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<ImprovementSuggestions | null>(null);
  const [updatedProfileText, setUpdatedProfileText] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchLinkedInProfile = async () => {
    if (!linkedinUrl.trim() || !linkedinUrl.includes("linkedin.com")) {
      toast.error("Please enter a valid LinkedIn URL");
      return;
    }

    setIsFetchingProfile(true);

    try {
      const { data, error } = await supabase.functions.invoke("scrape-linkedin", {
        body: { linkedinUrl },
      });

      if (error) throw error;

      if (data.profileContent) {
        setProfileText(data.profileContent);
        toast.success("Profile content generated! Please review and edit to match your actual profile.");
      }
    } catch (error) {
      console.error("Error fetching LinkedIn profile:", error);
      toast.error("Could not fetch profile. Please paste your content manually.");
      // Open LinkedIn profile in new tab so user can copy
      window.open(linkedinUrl, "_blank");
    } finally {
      setIsFetchingProfile(false);
    }
  };

  const handleResumeFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploadingResume(true);

    try {
      // For text files, read directly
      if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
        toast.success("Resume loaded successfully!");
        setIsUploadingResume(false);
        return;
      }

      // For PDF/DOC files, use parse-resume edge function
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke("parse-resume", {
        body: formData,
      });

      if (error) throw error;

      if (data.text) {
        setResumeText(data.text);
        toast.success("Resume parsed successfully!");
      } else {
        toast.error("Could not extract text from resume. Please paste manually.");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast.error("Failed to process resume. Please paste the content manually.");
    } finally {
      setIsUploadingResume(false);
      // Reset file input
      if (resumeFileInputRef.current) {
        resumeFileInputRef.current.value = "";
      }
    }
  };

  const handleAnalyze = async () => {
    // Require either profile text OR linkedin URL
    const hasProfileContent = profileText.trim().length > 0;
    const hasLinkedInUrl = linkedinUrl.trim().includes("linkedin.com");
    
    if (!hasProfileContent && !hasLinkedInUrl) {
      toast.error("Please provide your LinkedIn URL or paste your profile content");
      return;
    }
    
    if (!targetIndustry.trim() || !targetRole.trim()) {
      toast.error("Please fill in target industry and role");
      return;
    }

    // If we have URL but no profile content, try to fetch it first
    if (!hasProfileContent && hasLinkedInUrl) {
      setIsFetchingProfile(true);
      try {
        const { data, error } = await supabase.functions.invoke("scrape-linkedin", {
          body: { linkedinUrl },
        });

        if (error) throw error;

        if (data.profileContent) {
          setProfileText(data.profileContent);
          toast.info("Profile content generated from URL. Proceeding with analysis...");
        }
      } catch (error) {
        console.error("Error fetching LinkedIn profile:", error);
        toast.error("Could not fetch profile content. Please paste your profile manually.");
        setIsFetchingProfile(false);
        return;
      }
      setIsFetchingProfile(false);
    }

    setStep("analyzing");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
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
          targetJobDescription,
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
              Enter your LinkedIn URL to auto-fetch your profile, or paste your content manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">LinkedIn URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleFetchLinkedInProfile} 
                  variant="outline"
                  disabled={isFetchingProfile || !linkedinUrl.includes("linkedin.com")}
                >
                  {isFetchingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      Fetch Profile
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click to auto-generate profile content from your LinkedIn URL
              </p>
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
              <label className="text-sm font-medium mb-2 block">
                Target Job Description <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <Textarea
                placeholder="Paste a job description you're targeting to get more tailored suggestions..."
                value={targetJobDescription}
                onChange={(e) => setTargetJobDescription(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Adding a job description helps AI tailor suggestions to specific role requirements
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Profile Content {!linkedinUrl.includes("linkedin.com") && <span className="text-destructive">*</span>}
                {linkedinUrl.includes("linkedin.com") && <span className="text-muted-foreground text-xs ml-1">(optional if URL provided)</span>}
              </label>
              <Textarea
                placeholder="Click 'Fetch Profile' above to auto-fill, or paste your LinkedIn headline, about section, and experience here..."
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                className="min-h-[180px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {profileText ? "Review and edit if needed" : "Will be auto-generated from URL if not provided"}
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Your Resume (optional but recommended)
              </label>
              
              {/* File Upload Option */}
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  ref={resumeFileInputRef}
                  onChange={handleResumeFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => resumeFileInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="flex-1"
                >
                  {isUploadingResume ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume (PDF, DOC, DOCX, TXT)
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or paste text</span>
                </div>
              </div>

              <Textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[120px] mt-2"
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
          <div className={`text-7xl font-bold bg-gradient-to-r ${getScoreGradient(Math.min(analysis.overallScore, 100))} bg-clip-text text-transparent`}>
            {Math.min(analysis.overallScore, 100)}
          </div>
          <p className="text-muted-foreground mt-2">out of 100</p>
          
          {/* Potential Improvement Badge */}
          {analysis.potentialImprovement && analysis.potentialImprovement > 0 && !previousAnalysis && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">
                +{analysis.potentialImprovement}% improvement possible
                {analysis.projectedScoreAfterChanges && (
                  <span className="text-blue-500 ml-1">
                    → {Math.min(analysis.projectedScoreAfterChanges, 100)}/100
                  </span>
                )}
              </span>
            </div>
          )}
          
          {/* Score improvement after re-scoring */}
          {scoreImprovement !== null && scoreImprovement > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">+{scoreImprovement} points improvement!</span>
            </div>
          )}
          {previousAnalysis && (
            <p className="text-sm text-muted-foreground mt-2">
              Previous score: {Math.min(previousAnalysis.overallScore, 100)}
            </p>
          )}
        </div>

        {/* Visual Comparison Chart */}
        {suggestions?.projectedScoreIncrease && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Current vs Projected Scores
              </CardTitle>
              <CardDescription>
                See how your profile could improve with AI suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(analysis.dimensions).map(([key, value]) => ({
                      name: key.replace(/([A-Z])/g, ' $1').trim().replace('Score', ''),
                      current: value.score,
                      projected: Math.min(suggestions.projectedScoreIncrease[key as keyof typeof suggestions.projectedScoreIncrease] || value.score, 100),
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }} 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const current = payload[0]?.value as number;
                          const projected = payload[1]?.value as number;
                          const improvement = projected - current;
                          return (
                            <div className="bg-background border rounded-lg p-3 shadow-lg">
                              <p className="font-medium text-sm mb-2">{label}</p>
                              <p className="text-sm text-muted-foreground">Current: <span className="font-bold text-foreground">{current}</span></p>
                              <p className="text-sm text-muted-foreground">Projected: <span className="font-bold text-green-600">{projected}</span></p>
                              {improvement > 0 && (
                                <p className="text-xs text-green-600 mt-1">+{improvement} improvement</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="current" name="Current Score" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="projected" name="Projected Score" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Potential overall improvement: <span className="font-bold text-green-600">+{Math.round(suggestions.projectedScoreIncrease.projectedOverallScore - analysis.overallScore)} points</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dimension Scores */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Profile Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analysis.dimensions).map(([key, value]) => {
              const projectedScore = suggestions?.projectedScoreIncrease?.[key as keyof typeof suggestions.projectedScoreIncrease];
              const improvement = projectedScore ? Math.min(projectedScore, 100) - value.score : 0;
              
              return (
                <div key={key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${getScoreColor(value.score)}`}>
                        {value.score}
                      </span>
                      {improvement > 0 && (
                        <span className="text-xs text-green-600 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          +{improvement}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={value.score} className="h-2 mb-1" />
                    {improvement > 0 && (
                      <div 
                        className="absolute top-0 h-2 bg-green-500/30 rounded-full"
                        style={{ 
                          left: `${value.score}%`, 
                          width: `${improvement}%` 
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{value.analysis}</p>
                </div>
              );
            })}
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
              {targetJobDescription && " — tailored to your target job"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.experienceRewrites.map((rewrite, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                {/* Experience identifier */}
                <div className="px-3 py-2 bg-blue-500/10 border-b border-border">
                  <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {rewrite.companyRole || `Experience ${i + 1}`}
                  </p>
                </div>
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
