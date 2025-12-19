import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

// Import new UX components
import { ResumeLanding } from "./resume/ResumeLanding";
import { ResumeWelcome } from "./resume/ResumeWelcome";
import { ResumeProcessing } from "./resume/ResumeProcessing";
import { FreeResults } from "./resume/FreeResults";
import { ClarificationQuestions } from "./resume/ClarificationQuestions";
import { PaidOutput } from "./resume/PaidOutput";

interface ResumeIntelligenceFlowProps {
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
  role_fit_assessment: string;
  quick_wins?: string[];
  job_title_match?: {
    target_title: string;
    resume_title: string;
    match_level: string;
    recommendation: string;
  };
  [key: string]: any;
}

interface ClarificationAnswers {
  targetRole: string;
  managerOrIC: string;
  topAchievements: string;
  metrics: string;
  targetCompanies: string;
}

type Step = "landing" | "welcome" | "processing" | "free_results" | "clarification" | "paid_output";

export function ResumeIntelligenceFlow({ onBack, onComplete }: ResumeIntelligenceFlowProps) {
  const [step, setStep] = useState<Step>("landing");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [freeScore, setFreeScore] = useState<ATSResult | null>(null);
  const [paidScore, setPaidScore] = useState<ATSResult | null>(null);
  const [enhancedResumeContent, setEnhancedResumeContent] = useState("");
  const [clarificationAnswers, setClarificationAnswers] = useState<ClarificationAnswers | null>(null);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [regenerationsRemaining, setRegenerationsRemaining] = useState(5);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | undefined>();
  
  // Activation dialog state
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationEmail, setActivationEmail] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  
  const { toast } = useToast();

  // Check for purchase success on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const purchaseParam = urlParams.get("purchase");
    
    if (purchaseParam === "resume_success") {
      // Show activation dialog
      setShowActivationDialog(true);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // Helper to get email from localStorage
  const getStoredEmail = (): string | undefined => {
    try {
      const storedAccess = localStorage.getItem("resume_suite_access");
      if (storedAccess) {
        const parsed = JSON.parse(storedAccess);
        if (parsed.email) return parsed.email;
      }
    } catch (e) {
      console.error("Error reading stored access:", e);
    }
    return undefined;
  };

  // Helper to get access token from URL or storage
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
    } catch (e) {
      console.error("Error reading access token:", e);
    }
    return undefined;
  };

  // Check if user has paid access
  const checkPaidAccess = async (): Promise<boolean> => {
    const email = getStoredEmail();
    const accessToken = getAccessToken();
    
    if (!email && !accessToken) return false;
    
    try {
      // If we have an access token, verify it
      if (accessToken) {
        const { data, error } = await supabase.functions.invoke("verify-tool-access", {
          body: { action: "verify", accessToken, toolType: "resume_suite" },
        });
        
        if (!error && data?.valid) {
          setHasPaidAccess(true);
          setAccessExpiresAt(data.expiresAt);
          setRegenerationsRemaining(data.regenerationsRemaining || 5);
          return true;
        }
      }
      
      // Otherwise check by email
      if (email) {
        const { data, error } = await supabase.functions.invoke("verify-tool-access", {
          body: { action: "check", email, toolType: "resume_suite" },
        });
        
        if (!error && data?.hasAccess) {
          setHasPaidAccess(true);
          setAccessExpiresAt(data.expiresAt);
          setRegenerationsRemaining(data.regenerationsRemaining || 5);
          return true;
        }
      }
    } catch (e) {
      console.error("Error checking access:", e);
    }
    return false;
  };

  // Handle activation with email
  const handleActivateAccess = async () => {
    if (!activationEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter the email you used for purchase.",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    
    try {
      // Verify access with the provided email
      const { data, error } = await supabase.functions.invoke("verify-tool-access", {
        body: { 
          action: "check",
          email: activationEmail.toLowerCase().trim(), 
          toolType: "resume_suite" 
        },
      });
      
      if (error) throw error;
      
      if (data?.hasAccess) {
        // Store access in localStorage
        localStorage.setItem("resume_suite_access", JSON.stringify({
          email: activationEmail.toLowerCase(),
          accessToken: data.accessToken,
          expiresAt: data.expiresAt,
        }));
        
        setHasPaidAccess(true);
        setAccessExpiresAt(data.expiresAt);
        setRegenerationsRemaining(data.regenerationsRemaining || 5);
        setActivationSuccess(true);
        
        toast({
          title: "Access activated!",
          description: "You now have full access to Resume Intelligence.",
        });
        
        // Close dialog after a moment and proceed to welcome
        setTimeout(() => {
          setShowActivationDialog(false);
          setActivationSuccess(false);
          setStep("welcome");
        }, 2000);
      } else {
        toast({
          title: "Access not found",
          description: "No active purchase found for this email. Please check your email or contact support.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Activation error:", error);
      toast({
        title: "Activation failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };
  const handleStartScan = async (
    resume: string, 
    jd: string, 
    role?: string, 
    industry?: string
  ) => {
    setResumeText(resume);
    setJobDescription(jd);
    if (role) setTargetRole(role);
    if (industry) setTargetIndustry(industry);
    
    setStep("processing");
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
          body: JSON.stringify({ 
            resumeText: resume, 
            jobDescription: jd,
            targetRole: role,
            targetIndustry: industry,
            isFreeAnalysis: true 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data = await response.json();
      setFreeScore(data);
      
      // Check if user already has paid access
      const isPaid = await checkPaidAccess();
      if (isPaid) {
        // Skip to clarification if they have access
        setStep("clarification");
      } else {
        setStep("free_results");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setStep("welcome");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle processing complete (from animation)
  const handleProcessingComplete = useCallback(() => {
    // Processing animation complete - results will be shown when API completes
    // This is just for the animation sync
  }, []);

  // Handle upgrade/payment
  const handleUpgrade = async () => {
    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("create-resume-suite-checkout", {
        body: { 
          customerEmail: email,
          successParam: "resume_success"
        },
      });
      
      if (error) throw error;
      if (data?.url) {
        // Redirect to Stripe checkout in same tab
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle save report (email capture)
  const handleSaveReport = async (email: string) => {
    try {
      await supabase.functions.invoke("send-quiz-results", {
        body: { 
          email,
          results: {
            type: "resume_scan",
            score: freeScore?.ats_score,
            strengths: freeScore?.strengths,
            improvements: freeScore?.improvements,
          }
        },
      });
      
      toast({
        title: "Report sent!",
        description: "Check your email for your scan results.",
      });
    } catch (error) {
      toast({
        title: "Failed to send",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle clarification answers and generate optimized resume
  const handleClarificationSubmit = async (answers: ClarificationAnswers) => {
    setClarificationAnswers(answers);
    setIsGenerating(true);
    
    const userEmail = getStoredEmail();
    const accessToken = getAccessToken();
    
    try {
      // Generate enhanced resume
      const { data, error } = await supabase.functions.invoke("enhance-resume", {
        body: { 
          resumeText, 
          jobDescription,
          targetRole: answers.targetRole,
          managerOrIC: answers.managerOrIC,
          topAchievements: answers.topAchievements,
          metrics: answers.metrics,
          targetCompanies: answers.targetCompanies,
          missingKeywords: freeScore?.missing_keywords || [],
          improvements: freeScore?.improvements || [],
          email: userEmail,
          accessToken,
        },
      });

      if (error) throw error;
      
      setEnhancedResumeContent(data.enhancedContent || "");
      
      // Get updated score for the enhanced resume
      const scoreResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            resumeText: data.enhancedContent, 
            jobDescription,
            isPostTransformation: true,
            email: userEmail,
            accessToken
          }),
        }
      );
      
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setPaidScore(scoreData);
      }
      
      setStep("paid_output");
    } catch (error: any) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle regenerate resume
  const handleRegenerate = async () => {
    if (regenerationsRemaining <= 0) {
      toast({
        title: "No regenerations left",
        description: "You've used all your regeneration credits.",
        variant: "destructive",
      });
      return;
    }
    
    if (clarificationAnswers) {
      setRegenerationsRemaining(prev => prev - 1);
      await handleClarificationSubmit(clarificationAnswers);
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!enhancedResumeContent) return;
    
    // Dynamic import of html2pdf
    const html2pdf = (await import("html2pdf.js")).default;
    
    const element = document.createElement("div");
    element.innerHTML = `
      <div style="font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <pre style="white-space: pre-wrap; font-family: Georgia, serif; font-size: 11pt; line-height: 1.5;">
          ${enhancedResumeContent}
        </pre>
      </div>
    `;
    
    await html2pdf()
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: "optimized-resume.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(element)
      .save();
    
    toast({ title: "Downloaded!", description: "Resume saved as PDF" });
  };

  // Handle Word download
  const handleDownloadDocx = async () => {
    if (!enhancedResumeContent) return;
    
    const { Document, Packer, Paragraph, TextRun } = await import("docx");
    const { saveAs } = await import("file-saver");
    
    const lines = enhancedResumeContent.split("\n");
    const paragraphs = lines.map(line => 
      new Paragraph({
        children: [new TextRun({ text: line, font: "Calibri", size: 22 })],
      })
    );
    
    const doc = new Document({
      sections: [{ children: paragraphs }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "optimized-resume.docx");
    
    toast({ title: "Downloaded!", description: "Resume saved as Word document" });
  };

  // Handle cover letter generation
  const handleGenerateCoverLetter = async (details: { jobTitle: string; company: string; jobDescription: string }): Promise<string> => {
    const userEmail = getStoredEmail();
    const accessToken = getAccessToken();
    
    const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
      body: {
        resumeText: enhancedResumeContent || resumeText,
        jobDescription: details.jobDescription || jobDescription,
        companyName: details.company,
        jobTitle: details.jobTitle,
        email: userEmail,
        accessToken,
      },
    });
    
    if (error) throw error;
    return data.coverLetter || "";
  };

  // Activation dialog component
  const ActivationDialog = () => (
    <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {activationSuccess ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-500" />
                Access Activated!
              </>
            ) : (
              <>
                <Mail className="w-6 h-6 text-primary" />
                Activate Your Access
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {activationSuccess 
              ? "You now have full access to Resume Intelligence. Redirecting..."
              : "Enter the email address you used for your purchase to activate your access."
            }
          </DialogDescription>
        </DialogHeader>
        
        {!activationSuccess && (
          <div className="space-y-4 py-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={activationEmail}
              onChange={(e) => setActivationEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleActivateAccess()}
            />
            <Button 
              onClick={handleActivateAccess} 
              disabled={isActivating || !activationEmail.trim()}
              className="w-full"
            >
              {isActivating ? "Verifying..." : "Activate Access"}
            </Button>
          </div>
        )}
        
        {activationSuccess && (
          <div className="py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-muted-foreground">Preparing your Resume Intelligence suite...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Render current step with activation dialog
  const renderStep = () => {
    switch (step) {
      case "landing":
        return (
          <ResumeLanding
            onBack={onBack}
            onProceed={() => setStep("welcome")}
          />
        );
        
      case "welcome":
        return (
          <ResumeWelcome
            onBack={() => setStep("landing")}
            onStartScan={handleStartScan}
            isAnalyzing={isAnalyzing}
          />
        );
        
      case "processing":
        return (
          <ResumeProcessing onComplete={handleProcessingComplete} />
        );
        
      case "free_results":
        return freeScore ? (
          <FreeResults
            score={freeScore}
            onBack={() => setStep("welcome")}
            onUpgrade={handleUpgrade}
            onSaveReport={handleSaveReport}
            onActivate={() => setShowActivationDialog(true)}
          />
        ) : null;
        
      case "clarification":
        return (
          <ClarificationQuestions
            onBack={() => setStep("free_results")}
            onSubmit={handleClarificationSubmit}
            isGenerating={isGenerating}
          />
        );
        
      case "paid_output":
        return (
          <PaidOutput
            resumeContent={enhancedResumeContent}
            score={paidScore}
            onBack={() => setStep("clarification")}
            onRegenerate={handleRegenerate}
            onDownloadPDF={handleDownloadPDF}
            onDownloadDocx={handleDownloadDocx}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            regenerationsRemaining={regenerationsRemaining}
            accessExpiresAt={accessExpiresAt}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <ActivationDialog />
      {renderStep()}
    </>
  );
}
