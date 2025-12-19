import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  FileText, Copy, Download, RefreshCw, CheckCircle, 
  FileSignature, BarChart3, Loader2, ArrowLeft,
  AlertCircle, Target, Zap, TrendingUp, Users, Briefcase, Search, Eye, X,
  MessageSquare, Lock, Sparkles, ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  role_fit_assessment?: string;
  quick_wins?: string[];
  job_title_match?: {
    target_title: string;
    resume_title: string;
    match_level: string;
    recommendation: string;
  };
  hard_skills_matched?: string[];
  hard_skills_missing?: string[];
  soft_skills_matched?: string[];
  soft_skills_missing?: string[];
  recruiter_tips?: string[];
  deal_breakers?: string[];
  experience_gaps?: string[];
  recommended_additions?: string[];
  [key: string]: any;
}

interface PaidOutputProps {
  resumeContent: string;
  score: ATSResult | null;
  onBack: () => void;
  onViewPDF: () => void;
  onDownloadDocx: () => void;
  onGenerateCoverLetter: (details: CoverLetterInput) => Promise<string>;
  accessExpiresAt?: string;
  onGoToInterviewPrep?: () => void;
  targetRole?: string;
}

interface CoverLetterInput {
  jobTitle: string;
  company: string;
  jobDescription: string;
  candidateName?: string;
  candidateEmail?: string;
  coverLetterLength?: "short" | "medium" | "detailed";
}

export function PaidOutput({
  resumeContent,
  score,
  onBack,
  onViewPDF,
  onDownloadDocx,
  onGenerateCoverLetter,
  accessExpiresAt,
  onGoToInterviewPrep,
  targetRole
}: PaidOutputProps) {
  const [activeTab, setActiveTab] = useState("resume");
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [showATSReportModal, setShowATSReportModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [coverLetterInput, setCoverLetterInput] = useState<CoverLetterInput>({
    jobTitle: "",
    company: "",
    jobDescription: "",
    candidateName: "",
    candidateEmail: "",
    coverLetterLength: "medium"
  });
  const { toast } = useToast();

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(resumeContent);
    setIsCopied(true);
    toast({ title: "Copied!", description: "Resume text copied to clipboard" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterInput.candidateName || !coverLetterInput.candidateEmail) {
      toast({ 
        title: "Missing info", 
        description: "Please enter your name and email",
        variant: "destructive"
      });
      return;
    }
    if (!coverLetterInput.jobTitle || !coverLetterInput.company) {
      toast({ 
        title: "Missing info", 
        description: "Please enter job title and company name",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingCover(true);
    try {
      const letter = await onGenerateCoverLetter(coverLetterInput);
      setCoverLetter(letter);
      setShowCoverLetterModal(true);
      toast({ title: "Cover letter generated!" });
    } catch (error) {
      toast({ 
        title: "Generation failed", 
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleRegenerateCoverLetter = async () => {
    if (coverLetter) {
      setShowCoverLetterModal(false);
      await handleGenerateCoverLetter();
    }
  };

  const handleCopyCoverLetter = async () => {
    if (coverLetter) {
      await navigator.clipboard.writeText(coverLetter);
      toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
    }
  };

  const daysRemaining = accessExpiresAt 
    ? Math.max(0, Math.ceil((new Date(accessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  const getScoreLabel = (scoreValue: number) => {
    if (scoreValue >= 80) return { label: "Excellent", color: "text-green-600" };
    if (scoreValue >= 60) return { label: "Strong", color: "text-yellow-600" };
    return { label: "Needs Optimization", color: "text-red-600" };
  };

  const scoreInfo = score ? getScoreLabel(score.ats_score) : null;

  // Format date for cover letter
  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          <div>
              <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                AI-Optimized Resume — Ready to Submit
              </h1>
              <p className="text-muted-foreground text-sm">
                {daysRemaining} days remaining
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Optimized</span> Resume
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              ATS Report
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center gap-2">
              <FileSignature className="w-4 h-4" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Interview Prep
            </TabsTrigger>
          </TabsList>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <Button variant="outline" onClick={onViewPDF}>
                <Eye className="w-4 h-4 mr-2" />
                View PDF
              </Button>
              <Button onClick={onDownloadDocx}>
                <Download className="w-4 h-4 mr-2" />
                Download Word
              </Button>
              <Button variant="outline" onClick={handleCopyText}>
                {isCopied ? (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy Text</>
                )}
              </Button>
            </div>

            <Card className="p-6 bg-white dark:bg-gray-900">
              <div 
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-serif"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {resumeContent}
              </div>
            </Card>
          </TabsContent>

          {/* ATS Report Tab */}
          <TabsContent value="ats" className="space-y-4">
            {score && (
              <>
                {/* View PDF Button */}
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowATSReportModal(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Report
                  </Button>
                </div>

                {/* Quick Summary Cards */}
                <Card className="p-6 text-center bg-gradient-to-br from-card to-muted/50">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Final ATS Score
                    </span>
                  </div>
                  <div className={`text-6xl font-bold ${scoreInfo?.color}`}>
                    {score.ats_score}
                    <span className="text-2xl text-muted-foreground">/100</span>
                  </div>
                  <div className={`text-lg font-medium mt-2 ${scoreInfo?.color}`}>
                    {scoreInfo?.label}
                  </div>
                </Card>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Keywords", value: score.keyword_match_score },
                    { label: "Experience", value: score.experience_match_score },
                    { label: "Skills", value: score.skills_match_score },
                    { label: "Format", value: score.format_score },
                  ].map((item) => (
                    <Card key={item.label} className="p-3 text-center">
                      <div className={`text-xl font-bold ${
                        item.value >= 75 ? "text-green-600" : item.value >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {item.value}%
                      </div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </Card>
                  ))}
                </div>

                {/* Quick highlights */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Key Strengths
                    </h3>
                    <ul className="space-y-1">
                      {score.strengths?.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-sm text-muted-foreground">✓ {s}</li>
                      ))}
                    </ul>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      Top Improvements
                    </h3>
                    <ul className="space-y-1">
                      {score.improvements?.slice(0, 3).map((imp, i) => (
                        <li key={i} className="text-sm text-muted-foreground">→ {imp.issue}</li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Generate a Cover Letter</h3>
              <div className="space-y-4">
                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Name *</label>
                    <Input
                      placeholder="e.g., John Smith"
                      value={coverLetterInput.candidateName}
                      onChange={(e) => setCoverLetterInput(prev => ({ ...prev, candidateName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Your Email *</label>
                    <Input
                      type="email"
                      placeholder="e.g., john@example.com"
                      value={coverLetterInput.candidateEmail}
                      onChange={(e) => setCoverLetterInput(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Job Title and Company Row */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Job Title *</label>
                    <Input
                      placeholder="e.g., Senior Product Manager"
                      value={coverLetterInput.jobTitle}
                      onChange={(e) => setCoverLetterInput(prev => ({ ...prev, jobTitle: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Company *</label>
                    <Input
                      placeholder="e.g., Stripe"
                      value={coverLetterInput.company}
                      onChange={(e) => setCoverLetterInput(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="text-sm font-medium mb-1 block">Job Description (Optional)</label>
                  <Textarea
                    placeholder="Paste the job description for a more tailored cover letter..."
                    value={coverLetterInput.jobDescription}
                    onChange={(e) => setCoverLetterInput(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Cover Letter Length Options */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Cover Letter Length</label>
                  <RadioGroup 
                    value={coverLetterInput.coverLetterLength} 
                    onValueChange={(value: "short" | "medium" | "detailed") => 
                      setCoverLetterInput(prev => ({ ...prev, coverLetterLength: value }))
                    }
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="short" id="short" />
                      <Label htmlFor="short" className="cursor-pointer">
                        <span className="font-medium">Short</span>
                        <span className="text-xs text-muted-foreground block">~200-250 words</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="cursor-pointer">
                        <span className="font-medium">Medium</span>
                        <span className="text-xs text-muted-foreground block">~300-400 words</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" />
                      <Label htmlFor="detailed" className="cursor-pointer">
                        <span className="font-medium">Detailed</span>
                        <span className="text-xs text-muted-foreground block">~500-600 words</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleGenerateCoverLetter}
                    disabled={isGeneratingCover}
                  >
                    {isGeneratingCover ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      "Generate Cover Letter"
                    )}
                  </Button>
                  {coverLetter && (
                    <Button variant="outline" onClick={() => setShowCoverLetterModal(true)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Cover Letter
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Interview Prep Tab */}
          <TabsContent value="interview" className="space-y-4">
            <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ace Your Interviews
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your optimized resume and target role{targetRole ? ` as ${targetRole}` : ''}, 
                    get personalized interview questions and preparation strategies.
                  </p>
                  {onGoToInterviewPrep ? (
                    <Button onClick={onGoToInterviewPrep}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      View Interview Questions
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Interview prep is included in the full suite
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Preview of what they'll get */}
            <Card className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                What's Included in Interview Prep
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Behavioral Questions</p>
                      <p className="text-xs text-muted-foreground">STAR format examples from your experience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Role-Specific Questions</p>
                      <p className="text-xs text-muted-foreground">Product sense, execution, strategy, analytics</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Sample Answers</p>
                      <p className="text-xs text-muted-foreground">Tailored responses using your background</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Questions by Category</p>
                      <p className="text-xs text-muted-foreground">Organized by topic: behavioral, technical, strategic</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Difficulty Levels</p>
                      <p className="text-xs text-muted-foreground">Easy, medium, hard questions to practice</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Full Interview Prep Suite</p>
                      <p className="text-xs text-muted-foreground">Practice mode and answer frameworks</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ATS Report PDF-Like Modal */}
      <Dialog open={showATSReportModal} onOpenChange={setShowATSReportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              ATS Compatibility Report
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowATSReportModal(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {score && (
            <div className="p-8 bg-white dark:bg-gray-950">
              {/* PDF-style report content */}
              <div className="max-w-3xl mx-auto space-y-8" style={{ fontFamily: 'Georgia, serif' }}>
                {/* Header */}
                <div className="text-center border-b-2 border-primary pb-6">
                  <h1 className="text-2xl font-bold text-foreground mb-2">ATS COMPATIBILITY REPORT</h1>
                  <p className="text-sm text-muted-foreground">Generated on {formatDate()}</p>
                </div>

                {/* Overall Score */}
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Overall ATS Score</p>
                  <div className={`text-7xl font-bold ${scoreInfo?.color}`}>
                    {score.ats_score}
                    <span className="text-3xl text-muted-foreground">/100</span>
                  </div>
                  <p className={`text-xl font-medium mt-2 ${scoreInfo?.color}`}>{scoreInfo?.label}</p>
                  <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">{score.summary}</p>
                </div>

                {/* Score Breakdown */}
                <div>
                  <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4">SCORE BREAKDOWN</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Keywords", value: score.keyword_match_score },
                      { label: "Experience", value: score.experience_match_score },
                      { label: "Skills", value: score.skills_match_score },
                      { label: "Format", value: score.format_score },
                    ].map((item) => (
                      <div key={item.label} className="text-center p-4 border rounded">
                        <div className={`text-2xl font-bold ${
                          item.value >= 75 ? "text-green-600" : item.value >= 50 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {item.value}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Title Match */}
                {score.job_title_match && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4">JOB TITLE ALIGNMENT</h2>
                    <div className="grid grid-cols-2 gap-6 p-4 bg-muted/20 rounded">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Target Role</p>
                        <p className="font-semibold">{score.job_title_match.target_title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Your Current Title</p>
                        <p className="font-semibold">{score.job_title_match.resume_title}</p>
                      </div>
                    </div>
                    {score.job_title_match.recommendation && (
                      <p className="text-sm text-muted-foreground mt-3 italic">
                        💡 {score.job_title_match.recommendation}
                      </p>
                    )}
                  </div>
                )}

                {/* Strengths */}
                {score.strengths && score.strengths.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      STRENGTHS
                    </h2>
                    <ul className="space-y-2">
                      {score.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Keywords Analysis */}
                <div>
                  <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4">KEYWORD ANALYSIS</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 mb-3">Matched Keywords ({score.matched_keywords?.length || 0})</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {score.matched_keywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900/30 dark:text-green-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-orange-600 mb-3">Missing Keywords ({score.missing_keywords?.length || 0})</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {score.missing_keywords?.map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded dark:bg-orange-900/30 dark:text-orange-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Analysis */}
                {((score.hard_skills_matched?.length || 0) > 0 || (score.soft_skills_matched?.length || 0) > 0) && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4">SKILLS ANALYSIS</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {score.hard_skills_matched && score.hard_skills_matched.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            Technical Skills
                          </h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-green-600 mb-1">Matched:</p>
                              <div className="flex flex-wrap gap-1">
                                {score.hard_skills_matched.map((s, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900/30 dark:text-green-300">{s}</span>
                                ))}
                              </div>
                            </div>
                            {score.hard_skills_missing && score.hard_skills_missing.length > 0 && (
                              <div>
                                <p className="text-xs text-red-600 mb-1">Missing:</p>
                                <div className="flex flex-wrap gap-1">
                                  {score.hard_skills_missing.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded dark:bg-red-900/30 dark:text-red-300">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {score.soft_skills_matched && score.soft_skills_matched.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-500" />
                            Soft Skills
                          </h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-green-600 mb-1">Matched:</p>
                              <div className="flex flex-wrap gap-1">
                                {score.soft_skills_matched.map((s, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded dark:bg-green-900/30 dark:text-green-300">{s}</span>
                                ))}
                              </div>
                            </div>
                            {score.soft_skills_missing && score.soft_skills_missing.length > 0 && (
                              <div>
                                <p className="text-xs text-orange-600 mb-1">Missing:</p>
                                <div className="flex flex-wrap gap-1">
                                  {score.soft_skills_missing.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded dark:bg-orange-900/30 dark:text-orange-300">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority Improvements */}
                {score.improvements && score.improvements.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      PRIORITY IMPROVEMENTS
                    </h2>
                    <div className="space-y-3">
                      {score.improvements.map((imp, i) => (
                        <div key={i} className="p-3 bg-muted/20 rounded">
                          <div className="flex items-start gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              imp.priority === 'high' ? 'bg-red-100 text-red-700' : 
                              imp.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {imp.priority}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{imp.issue}</p>
                              {imp.fix && <p className="text-sm text-muted-foreground mt-1">→ {imp.fix}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruiter Tips */}
                {score.recruiter_tips && score.recruiter_tips.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      RECRUITER INSIGHTS
                    </h2>
                    <ul className="space-y-2">
                      {score.recruiter_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Role Fit Assessment */}
                {score.role_fit_assessment && (
                  <div>
                    <h2 className="text-lg font-bold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      ROLE FIT ASSESSMENT
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{score.role_fit_assessment}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center pt-8 border-t text-xs text-muted-foreground">
                  <p>This report was generated by AI-powered ATS analysis.</p>
                  <p>© {new Date().getFullYear()} Resume Intelligence Suite</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cover Letter PDF-Like Modal */}
      <Dialog open={showCoverLetterModal} onOpenChange={setShowCoverLetterModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              Cover Letter
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopyCoverLetter}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRegenerateCoverLetter} disabled={isGeneratingCover}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isGeneratingCover ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCoverLetterModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {coverLetter && (
            <div className="p-8 bg-white dark:bg-gray-950">
              {/* PDF-style cover letter - clean professional format */}
              <div 
                className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg border rounded-lg"
                style={{ fontFamily: 'Georgia, serif', minHeight: '800px' }}
              >
                {/* Letter content with proper padding */}
                <div className="p-12">
                  {/* Letterhead - only show if we have name */}
                  {coverLetterInput.candidateName && (
                    <div className="mb-10 pb-6 border-b-2 border-gray-200">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {coverLetterInput.candidateName}
                      </h1>
                      {coverLetterInput.candidateEmail && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {coverLetterInput.candidateEmail}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">{formatDate()}</p>

                  {/* Recipient */}
                  <div className="mb-8">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {coverLetterInput.company}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Re: {coverLetterInput.jobTitle} Position
                    </p>
                  </div>

                  {/* Body - formatted paragraphs */}
                  <div 
                    className="text-gray-800 dark:text-gray-200"
                    style={{ lineHeight: '1.8', fontSize: '14px' }}
                  >
                    {coverLetter.split('\n\n').map((paragraph, index) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;
                      
                      // Skip if it's just a greeting we're duplicating
                      if (trimmed.toLowerCase().startsWith('dear ') && index === 0) {
                        return (
                          <p key={index} className="mb-6">
                            {trimmed}
                          </p>
                        );
                      }
                      
                      // Skip signature lines if present (we'll add our own)
                      if (trimmed.toLowerCase() === 'sincerely,' || 
                          trimmed.toLowerCase() === 'best regards,' ||
                          trimmed.toLowerCase() === 'regards,' ||
                          trimmed === coverLetterInput.candidateName) {
                        return null;
                      }
                      
                      return (
                        <p key={index} className="mb-6">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>

                  {/* Signature */}
                  <div className="mt-10 pt-4">
                    <p className="text-gray-800 dark:text-gray-200 mb-6">Sincerely,</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {coverLetterInput.candidateName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
