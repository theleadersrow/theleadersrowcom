import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
  originalATSScore?: number; // Original score before optimization
  onBack: () => void;
  onResetToLanding: () => void;
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
  originalATSScore,
  onBack,
  onResetToLanding,
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
  const [showResumePDFModal, setShowResumePDFModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [showDoneConfirmation, setShowDoneConfirmation] = useState(false);
  const [coverLetterInput, setCoverLetterInput] = useState<CoverLetterInput>({
    jobTitle: "",
    company: "",
    jobDescription: "",
    candidateName: "",
    candidateEmail: "",
    coverLetterLength: "medium"
  });
  const { toast } = useToast();

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />
                <span className="truncate">AI-Optimized Resume</span>
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {daysRemaining} days remaining
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
            <TabsTrigger value="resume" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:hidden">Resume</span>
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">ATS</span>
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <FileSignature className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">Cover</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">Interview</span>
            </TabsTrigger>
          </TabsList>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <Button variant="outline" onClick={() => setShowResumePDFModal(true)}>
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

                {/* Score Improvement Indicator */}
                {originalATSScore !== undefined && score && (
                  <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Before Score */}
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Before</div>
                          <div className="text-2xl font-bold text-muted-foreground">{originalATSScore}</div>
                        </div>
                        
                        {/* Arrow */}
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-0.5 bg-gradient-to-r from-muted-foreground to-green-500"></div>
                          <ArrowRight className="w-5 h-5 text-green-500" />
                        </div>
                        
                        {/* After Score */}
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">After</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score.ats_score}</div>
                        </div>
                      </div>
                      
                      {/* Improvement Badge */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-2xl font-bold">+{score.ats_score - originalATSScore}</span>
                        </div>
                        <span className="text-sm text-green-600/80 dark:text-green-400/80">points improved</span>
                      </div>
                    </div>
                  </Card>
                )}

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
                    PM Interview Prep
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Master the 6 core PM interview areas. Click on any section below to see the types of questions interviewers ask.
                  </p>
                </div>
              </div>
            </Card>

            {/* Core Interview Sections */}
            <div className="space-y-3">
              {[
                {
                  title: "Product Sense & Problem Framing",
                  subtitle: "How you think, not what you know",
                  goal: "Customer empathy, structured thinking, tradeoffs, clarity under ambiguity",
                  color: "border-blue-500",
                  questions: [
                    "How would you identify the biggest problem to solve for [product/company] right now?",
                    "Tell me about a time you worked on a problem that was poorly defined. How did you bring clarity?",
                    "How do you decide what not to build?",
                    "If usage is flat but revenue is growing, what questions would you ask first?"
                  ]
                },
                {
                  title: "Product Strategy & Vision",
                  subtitle: "Your ability to think long-term and at the right altitude",
                  goal: "Strategic judgment, prioritization, business alignment, executive thinking",
                  color: "border-purple-500",
                  questions: [
                    "How do you define product strategy, and how is it different from a roadmap?",
                    "Walk me through how you would set a 12–18 month vision for this product.",
                    "Tell me about a strategic bet you made that didn't pay off. What did you learn?",
                    "How do you align product strategy with company goals when there's conflict?"
                  ]
                },
                {
                  title: "Execution & Decision-Making",
                  subtitle: "Can you ship and deliver impact consistently?",
                  goal: "Ownership, prioritization under constraints, bias to action, judgment calls",
                  color: "border-green-500",
                  questions: [
                    "Describe a complex product you shipped end-to-end. What were the hardest decisions?",
                    "How do you prioritize when everything feels urgent?",
                    "Tell me about a time you had to make a decision with incomplete data.",
                    "How do you balance speed vs quality?"
                  ]
                },
                {
                  title: "Data, Metrics & Business Impact",
                  subtitle: "Do you understand what actually moves the business?",
                  goal: "Metric thinking, outcome focus, analytical rigor, business acumen",
                  color: "border-orange-500",
                  questions: [
                    "What metrics do you use to measure success for your product?",
                    "How do you choose a North Star metric?",
                    "Tell me about a time data changed your original product direction.",
                    "If a key metric drops suddenly, how do you investigate?"
                  ]
                },
                {
                  title: "Stakeholder Management & Influence",
                  subtitle: "How you lead without authority",
                  goal: "Communication, alignment, conflict resolution, leadership maturity",
                  color: "border-pink-500",
                  questions: [
                    "Tell me about a time you disagreed with engineering or leadership. How did you handle it?",
                    "How do you influence decisions when you don't have direct authority?",
                    "Describe a difficult stakeholder and how you built alignment.",
                    "How do you communicate tradeoffs to executives?"
                  ]
                },
                {
                  title: "Leadership, Growth & Product Judgment",
                  subtitle: "What makes you trusted at the next level (Senior+ roles)",
                  goal: "People leadership, judgment, mentorship, scope ownership",
                  color: "border-indigo-500",
                  questions: [
                    "How do you develop and coach other PMs?",
                    "What distinguishes a Senior PM from a Principal or Director?",
                    "Tell me about a time you raised the quality bar for your team.",
                    "How do you scale yourself as product scope increases?"
                  ]
                }
              ].map((section, index) => (
                <Card key={index} className={`border-l-4 ${section.color} overflow-hidden`}>
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-foreground">{index + 1}. {section.title}</h5>
                        <p className="text-sm text-muted-foreground italic">{section.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">What interviewers test:</span> {section.goal}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="flex-shrink-0">
                        {expandedSections.has(index) ? (
                          <>Hide Questions</>
                        ) : (
                          <>View Questions</>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {expandedSections.has(index) && (
                    <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Sample Questions</p>
                      <div className="space-y-2">
                        {section.questions.map((question, qIndex) => (
                          <p key={qIndex} className="text-sm text-foreground pl-4 border-l-2 border-muted-foreground/30">
                            {question}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Optional Advanced Sections */}
            <Card className="p-6 bg-muted/30">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                Optional Advanced Sections
              </h4>
              <p className="text-xs text-muted-foreground mb-4">Layer these when relevant to your target role:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-3 border">
                  <p className="font-medium text-sm">Technical Depth & Platform</p>
                  <p className="text-xs text-muted-foreground">APIs, systems, data products</p>
                </div>
                <div className="bg-background rounded-lg p-3 border">
                  <p className="font-medium text-sm">Growth & Experimentation</p>
                  <p className="text-xs text-muted-foreground">Funnels, A/B testing, monetization</p>
                </div>
                <div className="bg-background rounded-lg p-3 border">
                  <p className="font-medium text-sm">Domain Specialization</p>
                  <p className="text-xs text-muted-foreground">Payments, Fintech, Ads, AI</p>
                </div>
              </div>
            </Card>

            {/* Interview Prep CTA */}
            <Card className="p-6 border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-foreground mb-1">Ready to practice?</h4>
                  <p className="text-sm text-muted-foreground">Explore our full Interview Prep tool for personalized practice sessions.</p>
                </div>
                <Button onClick={onBack} className="gap-2 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                  Go to Interview Prep
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* I'm Done Button */}
        <div className="mt-8 pt-6 border-t flex justify-center">
          <AlertDialog open={showDoneConfirmation} onOpenChange={setShowDoneConfirmation}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="lg" className="gap-2">
                <CheckCircle className="w-5 h-5" />
                I'm Done
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to close this session?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>Clicking done will close this session and your resume will <strong>not be saved</strong>.</p>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">
                    Please save a copy of your resume (PDF or Word) if you need it before closing.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onBack}>
                  Yes, I'm Done
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
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
                  {/* Date only - no name, email, or company header */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">{formatDate()}</p>

                  {/* Body - formatted paragraphs */}
                  <div 
                    className="text-gray-800 dark:text-gray-200"
                    style={{ lineHeight: '1.8', fontSize: '14px' }}
                  >
                    {coverLetter.split('\n\n').map((paragraph, index) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;
                      
                      const lowerTrimmed = trimmed.toLowerCase();
                      const candidateName = coverLetterInput.candidateName?.toLowerCase() || '';
                      const candidateEmail = coverLetterInput.candidateEmail?.toLowerCase() || '';
                      const company = coverLetterInput.company?.toLowerCase() || '';
                      
                      // Skip any placeholders
                      if (/\[(date|your name|name|address|city|state|zip|phone|email|company address)\]/i.test(trimmed)) return null;
                      
                      // Skip letterhead lines (name, email, phone, address patterns)
                      if (candidateName && lowerTrimmed === candidateName) return null;
                      if (candidateEmail && lowerTrimmed === candidateEmail) return null;
                      if (candidateName && candidateEmail && lowerTrimmed.includes(candidateName) && lowerTrimmed.includes(candidateEmail) && trimmed.length < 100) return null;
                      
                      // Skip company/address lines
                      if (company && lowerTrimmed === company) return null;
                      
                      // Skip date lines
                      if (/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}$/i.test(trimmed)) return null;
                      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed)) return null;
                      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
                      
                      // Skip signature/closing lines (we add our own)
                      if (/^(sincerely|best regards|warm regards|regards|best|respectfully|yours truly),?$/i.test(lowerTrimmed)) return null;
                      
                      // Skip if it's just the candidate name after closing
                      if (candidateName && lowerTrimmed === candidateName) return null;
                      
                      // Skip combined signature blocks
                      if (/^(sincerely|best regards|warm regards),?\s*\n/i.test(trimmed)) {
                        // Extract just the closing if there's content after
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
                    {coverLetterInput.candidateEmail && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {coverLetterInput.candidateEmail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume PDF-Like Modal */}
      <Dialog open={showResumePDFModal} onOpenChange={setShowResumePDFModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between z-10">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Optimized Resume
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopyText}>
                {isCopied ? (
                  <><CheckCircle className="w-4 h-4 mr-1" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1" /> Copy</>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDownloadDocx}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowResumePDFModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-8 bg-white dark:bg-gray-950">
            {/* PDF-style resume - clean professional format */}
            <div 
              className="max-w-2xl mx-auto bg-white dark:bg-gray-900 shadow-lg border rounded-lg"
              style={{ fontFamily: 'Georgia, serif', minHeight: '800px' }}
            >
              <div className="p-12">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200"
                  style={{ lineHeight: '1.7', fontSize: '13px' }}
                >
                  {resumeContent}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
