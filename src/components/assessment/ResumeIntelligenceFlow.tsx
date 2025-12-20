import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import new UX components
import { ResumeLanding } from "./resume/ResumeLanding";
import { ResumeWelcome } from "./resume/ResumeWelcome";
import { ResumeProcessing } from "./resume/ResumeProcessing";
import { FreeResults } from "./resume/FreeResults";
import { ClarificationQuestions } from "./resume/ClarificationQuestions";
import { ResumeReview } from "./resume/ResumeReview";
import { InterviewQuestionsPreview } from "./resume/InterviewQuestionsPreview";
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

import { ClarificationAnswers } from "./resume/ClarificationQuestions";

interface ContentImprovement {
  section: string;
  original: string;
  improved: string;
  reason: string;
}

type Step = "landing" | "welcome" | "processing" | "free_results" | "clarification" | "resume_review" | "interview_preview" | "paid_output";

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
  const [rawEnhancedContent, setRawEnhancedContent] = useState(""); // Original AI output before user edits
  const [contentImprovements, setContentImprovements] = useState<ContentImprovement[]>([]);
  const [clarificationAnswers, setClarificationAnswers] = useState<ClarificationAnswers | null>(null);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [regenerationsRemaining, setRegenerationsRemaining] = useState(5);
  const [accessExpiresAt, setAccessExpiresAt] = useState<string | undefined>();
  const [acceptedSections, setAcceptedSections] = useState<string[]>([]);
  
  // Activation dialog state
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationEmail, setActivationEmail] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);
  
  const { toast } = useToast();

  // Helper to store session data for paid users returning
  const storeSessionData = (data?: { 
    resume?: string; 
    jd?: string; 
    role?: string; 
    industry?: string; 
    score?: ATSResult;
  }) => {
    const dataToStore = {
      resumeText: data?.resume ?? resumeText,
      jobDescription: data?.jd ?? jobDescription,
      targetRole: data?.role ?? targetRole,
      targetIndustry: data?.industry ?? targetIndustry,
      freeScore: data?.score ?? freeScore,
    };
    if (dataToStore.resumeText && dataToStore.jobDescription) {
      localStorage.setItem("resume_suite_session", JSON.stringify(dataToStore));
      console.log("[Session] Stored session data");
    }
  };

  // Helper to restore session data
  const restoreSessionData = (): boolean => {
    try {
      const stored = localStorage.getItem("resume_suite_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.resumeText && parsed.jobDescription) {
          setResumeText(parsed.resumeText);
          setJobDescription(parsed.jobDescription);
          if (parsed.targetRole) setTargetRole(parsed.targetRole);
          if (parsed.targetIndustry) setTargetIndustry(parsed.targetIndustry);
          if (parsed.freeScore) setFreeScore(parsed.freeScore);
          return true;
        }
      }
    } catch (e) {
      console.error("Error restoring session:", e);
    }
    return false;
  };

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
    const emailToCheck = activationEmail.toLowerCase().trim();
    
    if (!emailToCheck) {
      toast({
        title: "Email required",
        description: "Please enter the email you used for purchase.",
        variant: "destructive",
      });
      return;
    }

    setIsActivating(true);
    console.log("[Activation] Checking access for:", emailToCheck);
    
    try {
      // Verify access with the provided email
      const { data, error } = await supabase.functions.invoke("verify-tool-access", {
        body: { 
          action: "check",
          email: emailToCheck, 
          toolType: "resume_suite" 
        },
      });
      
      console.log("[Activation] Response:", { data, error });
      
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
        
        // Close dialog after a moment and proceed
        setTimeout(() => {
          setShowActivationDialog(false);
          setActivationSuccess(false);
          // If we have session data (resume/JD already uploaded), skip to clarification
          const hasSessionData = restoreSessionData();
          if (hasSessionData) {
            setStep("clarification");
          } else {
            setStep("welcome");
          }
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
      
      // Store session data so we can restore it after payment (pass values directly since state is async)
      storeSessionData({
        resume,
        jd,
        role,
        industry,
        score: data,
      });
      
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

  // Handle upgrade/payment - redirect to Stripe payment link
  const handleUpgrade = () => {
    // Direct Stripe payment link for Resume Intelligence Suite ($99, 3-month access)
    // Open in new tab for better reliability
    window.open("https://buy.stripe.com/00waEW6i58aCfVdbR19sk0f", "_blank");
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
      // Generate enhanced resume with comprehensive targeting data
      const { data, error } = await supabase.functions.invoke("enhance-resume", {
        body: { 
          resumeText, 
          jobDescription,
          // Section 1: Targeting & Intent
          targetRoles: answers.targetRoles,
          targetIndustries: answers.targetIndustries,
          companyTypes: answers.companyTypes,
          primaryOutcomes: answers.primaryOutcomes,
          // Section 2: Role Scope & Seniority
          roleScopes: answers.roleScopes,
          strategyOrExecution: answers.strategyOrExecution,
          stakeholders: answers.stakeholders,
          crossFunctionalLead: answers.crossFunctionalLead,
          seniorityDescription: answers.seniorityDescription,
          // Section 3: Impact & Metrics
          strongestImpact: answers.strongestImpact,
          measurableOutcomes: answers.measurableOutcomes,
          metricsMissingReason: answers.metricsMissingReason,
          bestImpactProject: answers.bestImpactProject,
          underrepresentedAchievement: answers.underrepresentedAchievement,
          // Section 4: Professional Brand (now integrated)
          recruiterPerception: answers.recruiterPerception,
          professionalSkills: answers.professionalSkills,
          stretchingLevel: answers.stretchingLevel,
          overstatingCaution: answers.overstatingCaution,
          // ATS analysis data
          missingKeywords: freeScore?.missing_keywords || [],
          improvements: freeScore?.improvements || [],
          email: userEmail,
          accessToken,
        },
      });

      if (error) throw error;
      
      // Store raw AI output for review
      setRawEnhancedContent(data.enhancedContent || "");
      setEnhancedResumeContent(data.enhancedContent || "");
      setContentImprovements(data.contentImprovements || []);
      
      // Go to review step instead of directly to output
      setStep("resume_review");
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

  // Handle resume review finalization
  const handleReviewFinalize = async (finalResume: string, acceptedSectionsList: string[], calculatedATSScore: number) => {
    setEnhancedResumeContent(finalResume);
    setAcceptedSections(acceptedSectionsList);
    
    // Get updated score for the finalized resume from backend
    const userEmail = getStoredEmail();
    const accessToken = getAccessToken();
    
    try {
      const scoreResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            resumeText: finalResume, 
            jobDescription,
            isPostTransformation: true,
            email: userEmail,
            accessToken
          }),
        }
      );
      
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        // Use the calculated ATS score from the review screen for consistency
        // but keep all other data from backend (keywords, improvements, etc.)
        setPaidScore({
          ...scoreData,
          ats_score: calculatedATSScore
        });
      } else {
        // If backend fails, create a minimal score object with the calculated score
        setPaidScore({
          ats_score: calculatedATSScore,
          keyword_match_score: 0,
          experience_match_score: 0,
          skills_match_score: 0,
          format_score: 0,
          summary: "Resume optimized successfully",
          matched_keywords: [],
          missing_keywords: [],
          strengths: [],
          improvements: [],
          role_fit_assessment: ""
        });
      }
    } catch (error) {
      console.error("Score calculation error:", error);
      // Fallback to calculated score
      setPaidScore({
        ats_score: calculatedATSScore,
        keyword_match_score: 0,
        experience_match_score: 0,
        skills_match_score: 0,
        format_score: 0,
        summary: "Resume optimized successfully",
        matched_keywords: [],
        missing_keywords: [],
        strengths: [],
        improvements: [],
        role_fit_assessment: ""
      });
    }
    
    // Go directly to paid output (interview questions will be shown after)
    setStep("paid_output");
  };

  // Handle moving to interview preview from paid output
  const handleGoToInterviewPreview = () => {
    setStep("interview_preview");
  };

  // Handle interview preview continue (back to paid output)
  const handleInterviewPreviewContinue = () => {
    setStep("paid_output");
  };

  // Handle unlock interview prep (redirect to purchase)
  const handleUnlockInterviewPrep = () => {
    // TODO: Add interview prep purchase link when available
    toast({
      title: "Coming Soon",
      description: "Full interview prep with practice questions will be available soon!",
    });
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

  // Handle PDF view (opens in new tab)
  const handleViewPDF = async () => {
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
    
    const pdfBlob = await html2pdf()
      .set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: "optimized-resume.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(element)
      .outputPdf('blob');
    
    // Open PDF in new tab for viewing
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  // Handle Word download with professional classic format
  const handleDownloadDocx = async () => {
    if (!enhancedResumeContent) return;
    
    const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, convertInchesToTwip } = await import("docx");
    const { saveAs } = await import("file-saver");
    
    const lines = enhancedResumeContent.split("\n");
    const paragraphs: any[] = [];
    
    // Helper to strip markdown formatting (bold **, italic *, etc.)
    const stripMarkdown = (text: string): string => {
      return text
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold**
        .replace(/\*([^*]+)\*/g, '$1')     // Remove *italic*
        .replace(/__([^_]+)__/g, '$1')     // Remove __bold__
        .replace(/_([^_]+)_/g, '$1')       // Remove _italic_
        .trim();
    };
    
    // Track if we just added a section header for spacing
    let lastWasSectionHeader = false;
    
    lines.forEach((line, index) => {
      const rawTrimmed = line.trim();
      const trimmedLine = stripMarkdown(rawTrimmed);
      
      // Detect section headers
      const isSectionHeader = /^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|ACHIEVEMENTS|CERTIFICATIONS|PROJECTS|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|TECHNICAL SKILLS|CORE COMPETENCIES|PUBLICATIONS|AWARDS|LANGUAGES|VOLUNTEER|INTERESTS)$/i.test(trimmedLine);
      
      // Detect achievement title lines (should be bulleted)
      // These are short, impactful titles often with metrics or keywords
      const isAchievementTitle = (
        // Starts with $ amount or percentage
        /^\$?\d+[MKB]?\s/i.test(trimmedLine) ||
        /^\d+%/.test(trimmedLine) ||
        // Contains common achievement/business keywords and is short
        (/revenue|growth|improvement|reduction|increase|savings|acquisition|automation|expansion|profitability|retention|optimization|transformation|innovation|integration|platform|enterprise|saas|ai-powered|global|strategic/i.test(trimmedLine) && trimmedLine.length < 70 && !trimmedLine.includes('|'))
      );
      
      // Detect role header lines (job title, company name, location/date)
      // These should NOT be bulleted even if the raw line ends with *
      // But exclude achievement titles which should be bulleted
      const isRoleHeaderLine = !isAchievementTitle && (
        // Location + date pattern: "City, State | MM/YYYY – MM/YYYY" or similar
        /^[A-Za-z\s,]+\s*\|\s*\d{1,2}\/\d{4}/i.test(trimmedLine) ||
        // Date range pattern at end: "... | 10/2020 – 05/2025"
        /\|\s*\d{1,2}\/\d{4}\s*[–\-]\s*(\d{1,2}\/\d{4}|present|current)/i.test(trimmedLine) ||
        // Company name line (short, no bullet chars at start, often ends with trailing *, but NOT achievement lines)
        (rawTrimmed.endsWith('*') && !rawTrimmed.startsWith('*') && !rawTrimmed.startsWith('-') && !rawTrimmed.startsWith('•') && trimmedLine.length < 80 && !/\$|\d+%|revenue|growth/i.test(trimmedLine)) ||
        // Job title patterns (contains common title words)
        /^(head of|director|manager|lead|senior|principal|vp|vice president|chief|cto|ceo|cfo|coo)/i.test(trimmedLine)
      );
      
      // Detect bullet points - must START with bullet character (*, -, •)
      // OR be an achievement title (these should be bulleted)
      const isBulletLine = (/^[\*\-•]\s/.test(rawTrimmed) || isAchievementTitle) && !isRoleHeaderLine;
      
      if (isSectionHeader) {
        // Add extra spacing before section (acts as visual separator)
        if (paragraphs.length > 0) {
          paragraphs.push(new Paragraph({ 
            children: [],
            spacing: { before: 120, after: 0 }
          }));
        }
        
        // Section headers with clear underline separator
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: trimmedLine.toUpperCase(), 
                font: "Times New Roman", 
                size: 24, 
                bold: true 
              })
            ],
            spacing: { before: 200, after: 120 },
            border: {
              bottom: { color: "000000", space: 4, style: BorderStyle.SINGLE, size: 12 }
            }
          })
        );
        lastWasSectionHeader = true;
      } else if (index === 0) {
        // Name - larger, centered
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: trimmedLine, 
                font: "Times New Roman", 
                size: 32, 
                bold: true 
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 }
          })
        );
        lastWasSectionHeader = false;
      } else if (index === 1 || index === 2) {
        // Contact info - centered, smaller
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: trimmedLine, 
                font: "Times New Roman", 
                size: 20 
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 }
          })
        );
        lastWasSectionHeader = false;
      } else if (isRoleHeaderLine) {
        // Role header lines (job title, company, location/date) - bold, no bullets
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: trimmedLine, 
                font: "Times New Roman", 
                size: 22,
                bold: true
              })
            ],
            spacing: { after: 40, before: lastWasSectionHeader ? 0 : 100 }
          })
        );
        lastWasSectionHeader = false;
      } else if (isBulletLine) {
        // Convert *, -, or • to proper bullet formatting
        // Remove the leading bullet character, strip markdown, and trim
        const bulletText = stripMarkdown(rawTrimmed.replace(/^[\*\-•]\s*/, ""));
        
        // Use Word's native bullet formatting
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: bulletText, 
                font: "Times New Roman", 
                size: 22 
              })
            ],
            spacing: { after: 60, before: lastWasSectionHeader ? 0 : 20 },
            bullet: {
              level: 0
            }
          })
        );
        lastWasSectionHeader = false;
      } else if (trimmedLine) {
        // Regular text (job titles, company names, dates, etc.)
        // Check if it looks like a job title line (often has | or dates)
        const isJobTitleLine = /\d{4}|present|current|\|/i.test(trimmedLine);
        
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ 
                text: trimmedLine, 
                font: "Times New Roman", 
                size: 22,
                bold: isJobTitleLine
              })
            ],
            spacing: { after: 40, before: lastWasSectionHeader ? 0 : 20 }
          })
        );
        lastWasSectionHeader = false;
      } else {
        // Empty line - small spacing
        paragraphs.push(new Paragraph({ 
          children: [],
          spacing: { before: 60, after: 60 }
        }));
        lastWasSectionHeader = false;
      }
    });
    
    const doc = new Document({
      numbering: {
        config: [{
          reference: "bullet-numbering",
          levels: [{
            level: 0,
            format: "bullet",
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) }
              }
            }
          }]
        }]
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720
            }
          }
        },
        children: paragraphs
      }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "optimized-resume.docx");
    
    toast({ title: "Downloaded!", description: "Resume saved as Word document" });
  };

  // Handle cover letter generation
  const handleGenerateCoverLetter = async (details: { 
    jobTitle: string; 
    company: string; 
    jobDescription: string;
    candidateName?: string;
    candidateEmail?: string;
    coverLetterLength?: "short" | "medium" | "detailed";
  }): Promise<string> => {
    const userEmail = getStoredEmail();
    const accessToken = getAccessToken();
    
    const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
      body: {
        resumeText: enhancedResumeContent || resumeText,
        jobDescription: details.jobDescription || jobDescription,
        companyName: details.company,
        jobTitle: details.jobTitle,
        candidateName: details.candidateName,
        candidateEmail: details.candidateEmail,
        coverLetterLength: details.coverLetterLength || "medium",
        email: userEmail,
        accessToken,
      },
    });
    
    if (error) throw error;
    return data.coverLetter || "";
  };

  // Activation dialog (inline in return to avoid remounting on each keystroke)


  // Render current step with activation dialog
  const renderStep = () => {
    switch (step) {
      case "landing":
        return (
          <ResumeLanding
            onBack={onBack}
            onProceed={() => setStep("welcome")}
            onActivate={() => setShowActivationDialog(true)}
          />
        );
        
      case "welcome":
        return (
          <ResumeWelcome
            onBack={() => setStep("landing")}
            onStartScan={handleStartScan}
            isAnalyzing={isAnalyzing}
            hasPaidAccess={hasPaidAccess}
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
        
      case "resume_review":
        return (
          <ResumeReview
            originalResume={resumeText}
            enhancedContent={rawEnhancedContent}
            contentImprovements={contentImprovements}
            onBack={() => setStep("clarification")}
            onFinalize={handleReviewFinalize}
            isGenerating={isGenerating}
            originalATSScore={freeScore?.ats_score}
          />
        );
        
      case "interview_preview":
        return (
          <div className="min-h-[80vh] animate-fade-up px-4">
            <div className="max-w-4xl mx-auto">
              <InterviewQuestionsPreview
                resumeContent={enhancedResumeContent}
                targetRole={clarificationAnswers?.targetRoles?.join(", ") || ""}
                jobDescription={jobDescription}
                onContinue={handleInterviewPreviewContinue}
                onUnlockInterviewPrep={handleUnlockInterviewPrep}
              />
            </div>
          </div>
        );
        
      case "paid_output":
        return (
          <PaidOutput
            resumeContent={enhancedResumeContent}
            score={paidScore}
            originalATSScore={freeScore?.ats_score}
            onBack={() => setStep("resume_review")}
            onViewPDF={handleViewPDF}
            onDownloadDocx={handleDownloadDocx}
            onGenerateCoverLetter={handleGenerateCoverLetter}
            accessExpiresAt={accessExpiresAt}
            onGoToInterviewPrep={handleGoToInterviewPreview}
            targetRole={clarificationAnswers?.targetRoles?.join(", ") || ""}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="relative">

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
                : "Enter the email address you used for your purchase to activate your access."}
            </DialogDescription>
          </DialogHeader>

          {!activationSuccess && (
            <div className="space-y-4 py-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={activationEmail}
                onChange={(e) => setActivationEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleActivateAccess();
                  }
                }}
                autoFocus
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

      {renderStep()}
    </div>
  );
}
