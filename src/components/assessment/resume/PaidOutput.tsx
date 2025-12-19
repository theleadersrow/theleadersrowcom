import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  FileText, Copy, Download, RefreshCw, CheckCircle, 
  FileSignature, BarChart3, Loader2, ArrowLeft,
  AlertCircle, Target, Zap, TrendingUp, Users, Briefcase, Search
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
  onRegenerate: () => void;
  onDownloadPDF: () => void;
  onDownloadDocx: () => void;
  onGenerateCoverLetter: (details: CoverLetterInput) => Promise<string>;
  regenerationsRemaining: number;
  accessExpiresAt?: string;
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
  onRegenerate,
  onDownloadPDF,
  onDownloadDocx,
  onGenerateCoverLetter,
  regenerationsRemaining,
  accessExpiresAt
}: PaidOutputProps) {
  const [activeTab, setActiveTab] = useState("resume");
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [coverLetterInput, setCoverLetterInput] = useState<CoverLetterInput>({
    jobTitle: "",
    company: "",
    jobDescription: "",
    candidateName: "",
    candidateEmail: "",
    coverLetterLength: "medium"
  });
  const atsReportRef = useRef<HTMLDivElement>(null);
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
      await handleGenerateCoverLetter();
    }
  };

  const handleDownloadATSReport = async () => {
    if (!atsReportRef.current) return;
    
    const html2pdf = (await import("html2pdf.js")).default;
    
    await html2pdf()
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: "ats-report.pdf",
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(atsReportRef.current)
      .save();
    
    toast({ title: "Downloaded!", description: "ATS Report saved as PDF" });
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
                {daysRemaining} days remaining • {regenerationsRemaining} regenerations left
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Optimized Resume
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              ATS Report
            </TabsTrigger>
            <TabsTrigger value="cover" className="flex items-center gap-2">
              <FileSignature className="w-4 h-4" />
              Cover Letters
            </TabsTrigger>
          </TabsList>

          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-4">
            <div className="flex flex-wrap gap-3 mb-4">
              <Button onClick={onDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={onDownloadDocx}>
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
              <Button 
                variant="outline" 
                onClick={onRegenerate}
                disabled={regenerationsRemaining <= 0}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate ({regenerationsRemaining})
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

          {/* ATS Report Tab - Full Data like Free Version */}
          <TabsContent value="ats" className="space-y-4">
            {score && (
              <div ref={atsReportRef} className="space-y-4">
                {/* Download PDF Button */}
                <div className="flex justify-end mb-4">
                  <Button variant="outline" onClick={handleDownloadATSReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Report as PDF
                  </Button>
                </div>

                {/* ATS Score - Big Display */}
                <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/50">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Final ATS Score
                    </span>
                  </div>
                  <div className={`text-7xl font-bold ${scoreInfo?.color}`}>
                    {score.ats_score}
                    <span className="text-3xl text-muted-foreground">/100</span>
                  </div>
                  <div className={`text-xl font-medium mt-2 ${scoreInfo?.color}`}>
                    {scoreInfo?.label}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{score.summary}</p>
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

                {/* Role-Level Signal */}
                {score.job_title_match && (
                  <Card className="p-4 border-primary/30 bg-primary/5">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Job Title Match</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-muted-foreground">Target: </span>
                            <span className="font-medium">{score.job_title_match.target_title}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Your title: </span>
                            <span className="font-medium">{score.job_title_match.resume_title}</span>
                          </div>
                        </div>
                        {score.job_title_match.recommendation && (
                          <p className="text-sm text-muted-foreground">
                            → {score.job_title_match.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Hard Skills vs Soft Skills */}
                {((score.hard_skills_matched && score.hard_skills_matched.length > 0) || 
                  (score.hard_skills_missing && score.hard_skills_missing.length > 0) ||
                  (score.soft_skills_matched && score.soft_skills_matched.length > 0) ||
                  (score.soft_skills_missing && score.soft_skills_missing.length > 0)) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Hard Skills */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" /> 
                        Hard Skills (Technical)
                      </h3>
                      {score.hard_skills_matched && score.hard_skills_matched.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                            ✓ Matched ({score.hard_skills_matched.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {score.hard_skills_matched.slice(0, 8).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                                {skill}
                              </span>
                            ))}
                            {score.hard_skills_matched.length > 8 && (
                              <span className="text-xs text-muted-foreground">+{score.hard_skills_matched.length - 8} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      {score.hard_skills_missing && score.hard_skills_missing.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                            ✗ Missing ({score.hard_skills_missing.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {score.hard_skills_missing.slice(0, 6).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900/30 dark:text-red-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Soft Skills */}
                    <Card className="p-4">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-500" /> 
                        Soft Skills (Interpersonal)
                      </h3>
                      {score.soft_skills_matched && score.soft_skills_matched.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                            ✓ Matched ({score.soft_skills_matched.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {score.soft_skills_matched.slice(0, 6).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {score.soft_skills_missing && score.soft_skills_missing.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">
                            ✗ Missing ({score.soft_skills_missing.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {score.soft_skills_missing.slice(0, 5).map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {/* Keywords - Matched & Missing */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Matched Keywords ({score.matched_keywords?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                      {score.matched_keywords?.slice(0, 15).map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                          {kw}
                        </span>
                      ))}
                      {(score.matched_keywords?.length || 0) > 15 && (
                        <span className="px-2 py-1 text-muted-foreground text-xs">
                          +{score.matched_keywords!.length - 15} more
                        </span>
                      )}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      Missing Keywords ({score.missing_keywords?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                      {score.missing_keywords?.slice(0, 12).map((kw, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* What's Working */}
                {score.strengths && score.strengths.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      What's Working
                    </h3>
                    <ul className="space-y-2">
                      {score.strengths.slice(0, 5).map((strength, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Critical Gaps / Deal Breakers */}
                {score.deal_breakers && score.deal_breakers.length > 0 && (
                  <Card className="p-4 border-red-500/50 bg-red-500/10">
                    <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> Critical Gaps
                    </h3>
                    <ul className="space-y-2">
                      {score.deal_breakers.map((db, i) => (
                        <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">✗</span> {db}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Priority Improvements */}
                {score.improvements && score.improvements.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      Priority Improvements
                    </h3>
                    <ul className="space-y-3">
                      {score.improvements.slice(0, 5).map((imp, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex items-start gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                              imp.priority === 'high' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                : imp.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            }`}>
                              {imp.priority}
                            </span>
                            <div>
                              <span className="font-medium text-foreground">{imp.issue}</span>
                              {imp.fix && <p className="text-muted-foreground mt-0.5">→ {imp.fix}</p>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Recruiter Insights */}
                {score.recruiter_tips && score.recruiter_tips.length > 0 && (
                  <Card className="p-4 border-primary/30 bg-primary/5">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" /> 
                      How Recruiters See Your Resume
                    </h3>
                    <ul className="space-y-2">
                      {score.recruiter_tips.map((tip, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Role Fit Assessment */}
                {score.role_fit_assessment && (
                  <Card className="p-4 bg-muted/50">
                    <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Role Fit Assessment
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{score.role_fit_assessment}</p>
                  </Card>
                )}

                {/* Recommended Additions */}
                {score.recommended_additions && score.recommended_additions.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-secondary" />
                      Recommended Additions
                    </h3>
                    <ul className="space-y-2">
                      {score.recommended_additions.slice(0, 5).map((rec, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-secondary mt-0.5">+</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Cover Letter Tab - Enhanced with name, email, length options */}
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
              </div>
            </Card>

            {coverLetter && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Your Cover Letter</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCopyCoverLetter}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleRegenerateCoverLetter}
                      disabled={isGeneratingCover}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${isGeneratingCover ? 'animate-spin' : ''}`} /> Regenerate
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {coverLetter}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
