import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, Copy, Download, RefreshCw, CheckCircle, 
  FileSignature, BarChart3, Loader2, ArrowLeft
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
    jobDescription: ""
  });
  const { toast } = useToast();

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(resumeContent);
    setIsCopied(true);
    toast({ title: "Copied!", description: "Resume text copied to clipboard" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateCoverLetter = async () => {
    if (!coverLetterInput.jobTitle || !coverLetterInput.company) {
      toast({ 
        title: "Missing info", 
        description: "Please enter at least job title and company name",
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

  const daysRemaining = accessExpiresAt 
    ? Math.max(0, Math.ceil((new Date(accessExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

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

          {/* ATS Report Tab */}
          <TabsContent value="ats" className="space-y-4">
            {score && (
              <>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${
                    score.ats_score >= 75 ? "text-green-600" : 
                    score.ats_score >= 50 ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {score.ats_score}/100
                  </div>
                  <p className="text-muted-foreground mt-2">Final ATS Score</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {score.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-foreground">✓ {s}</li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Keywords Matched</h3>
                    <div className="flex flex-wrap gap-1">
                      {score.matched_keywords.slice(0, 15).map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>

                <Button 
                  variant="outline" 
                  onClick={handleCopyText}
                  className="mt-4"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Report for Records
                </Button>
              </>
            )}
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Generate a Cover Letter</h3>
              <div className="space-y-4">
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
                <div>
                  <label className="text-sm font-medium mb-1 block">Job Description (Optional)</label>
                  <Textarea
                    placeholder="Paste the job description for a more tailored cover letter..."
                    value={coverLetterInput.jobDescription}
                    onChange={(e) => setCoverLetterInput(prev => ({ ...prev, jobDescription: e.target.value }))}
                    className="min-h-[100px]"
                  />
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
                      onClick={() => navigator.clipboard.writeText(coverLetter)}
                    >
                      <Copy className="w-4 h-4 mr-1" /> Copy
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
