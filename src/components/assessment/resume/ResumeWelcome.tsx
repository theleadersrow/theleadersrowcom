import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ArrowLeft, Upload, Loader2, FileText, Target, 
  Zap, CheckCircle, Lock, Download, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResumeWelcomeProps {
  onBack: () => void;
  onStartScan: (resumeText: string, jobDescription: string, targetRole?: string, targetIndustry?: string) => void;
  isAnalyzing: boolean;
}

export function ResumeWelcome({ onBack, onStartScan, isAnalyzing }: ResumeWelcomeProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetIndustry, setTargetIndustry] = useState<string>("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
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

      if (file.type === "application/pdf" || file.type.includes("word")) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        const { data, error } = await supabase.functions.invoke('parse-resume', {
          body: { fileBase64: base64, fileName: file.name, fileType: file.type },
        });
        
        if (error) throw error;
        if (!data?.resumeText) throw new Error("No text extracted");

        setResumeText(data.resumeText);
        toast({ title: "Resume parsed", description: "Your resume has been extracted." });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please paste your resume text manually or try again.",
        variant: "destructive",
      });
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleStartScan = () => {
    if (!resumeText.trim()) {
      toast({
        title: "Resume required",
        description: "Please upload or paste your resume.",
        variant: "destructive",
      });
      return;
    }
    onStartScan(resumeText, jobDescription, targetRole, targetIndustry);
  };

  const paidDeliverables = [
    "AI-optimized, fully rewritten resume",
    "ATS-friendly formatting & structure",
    "Keyword optimization for target role",
    "PDF & Word download",
    "Unlimited cover letter generation",
    "Detailed improvement breakdown",
    "Interview prep questions"
  ];

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-foreground">Resume Intelligence</h1>
            <p className="text-muted-foreground">Step 1 of 4</p>
          </div>
        </div>

        {/* Value Proposition */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Start with a free scan
          </h2>
          <p className="text-muted-foreground mb-4">
            You'll see your strengths, gaps, and how your resume is being evaluated by ATS systems.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
        </Card>

        {/* Resume Upload */}
        <Card className="p-6 mb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> Upload Your Resume *
            </h3>
          </div>
          
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingResume}
              className="mb-3"
            >
              {isUploadingResume ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Upload PDF / DOCX</>
              )}
            </Button>
            {resumeFileName && (
              <span className="ml-3 text-sm text-muted-foreground">{resumeFileName}</span>
            )}
          </div>
          
          <Textarea
            placeholder="Or paste your resume text here..."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="min-h-[180px] text-sm"
          />
        </Card>

        {/* Job Description (Optional) */}
        <Card className="p-6 mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" /> Target Job Description
            <span className="text-xs text-muted-foreground font-normal">(Optional but recommended)</span>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Paste a job you're applying to for more targeted analysis.
          </p>
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[140px] text-sm"
          />
        </Card>

        {/* Optional Dropdowns */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Target Role Level (Optional)
            </label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pm">Product Manager</SelectItem>
                <SelectItem value="senior_pm">Senior PM</SelectItem>
                <SelectItem value="principal">Principal PM</SelectItem>
                <SelectItem value="gpm">Group PM</SelectItem>
                <SelectItem value="director">Director+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Target Industry (Optional)
            </label>
            <Select value={targetIndustry} onValueChange={setTargetIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="enterprise">Enterprise SaaS</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={handleStartScan}
            disabled={isAnalyzing || !resumeText.trim()}
            className="min-w-[200px]"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Run Free Resume Scan</>
            )}
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowPreviewDialog(true)}
            className="text-muted-foreground"
          >
            <Eye className="w-4 h-4 mr-2" /> See what you'll unlock
          </Button>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                What You'll Unlock
              </DialogTitle>
              <DialogDescription>
                After the free scan, unlock your full AI-optimized resume
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {paidDeliverables.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">$99</p>
                <p className="text-sm text-muted-foreground">for 3 months access (~$33/month)</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
