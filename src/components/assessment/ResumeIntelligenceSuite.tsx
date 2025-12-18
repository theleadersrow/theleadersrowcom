import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, ArrowRight, Upload, Loader2, Sparkles, FileText, 
  CheckCircle, Download, RefreshCw, Target, Zap, TrendingUp,
  AlertCircle, ChevronRight, Copy, FileSignature, ScrollText,
  FileDown, Layout, Briefcase, Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign, ShadingType } from "docx";
import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";

interface ResumeIntelligenceSuiteProps {
  onBack: () => void;
  onComplete: () => void;
}

interface SkillGap {
  skill: string;
  importance: string;
  context: string;
}

interface YearsExperienceAnalysis {
  job_requires: string;
  resume_shows: string;
  gap: string;
}

interface LeadershipAnalysis {
  job_requires: string;
  resume_shows: string;
  gap: string;
}

interface FormattingIssue {
  issue: string;
  severity: string;
  fix: string;
}

interface KeywordFormatSuggestion {
  term: string;
  current: string;
  suggested: string;
}

interface ATSResult {
  ats_score: number;
  keyword_match_score: number;
  experience_match_score: number;
  skills_match_score: number;
  format_score: number;
  // Jobscan-inspired scores
  hard_skills_score?: number;
  soft_skills_score?: number;
  searchability_score?: number;
  measurable_results_score?: number;
  // Skills breakdown
  hard_skills_matched?: string[];
  hard_skills_missing?: string[];
  soft_skills_matched?: string[];
  soft_skills_missing?: string[];
  // Formatting analysis
  formatting_issues?: FormattingIssue[];
  keyword_format_suggestions?: KeywordFormatSuggestion[];
  match_rate_target?: string;
  // Job title match analysis
  job_title_match?: {
    target_title: string;
    resume_title: string;
    match_level: string;
    recommendation: string;
  };
  // Word count analysis
  word_count_analysis?: {
    estimated_words: number;
    ideal_range: string;
    assessment: string;
    recommendation: string;
  };
  // Measurable results
  measurable_results?: {
    count: number;
    examples_found: string[];
    missing_opportunities: string[];
    ideal_count: string;
  };
  // Contact info check
  contact_info_check?: {
    has_email: boolean;
    has_phone: boolean;
    has_linkedin: boolean;
    has_location: boolean;
    issues: string[];
  };
  // Section analysis
  section_analysis?: {
    sections_found: string[];
    sections_missing: string[];
    section_order_optimal: boolean;
    recommendations: string[];
  };
  // Bullet point analysis
  bullet_point_analysis?: {
    total_bullets: number;
    bullets_with_metrics: number;
    average_bullets_per_role: number;
    weak_bullets: string[];
    strong_bullets: string[];
  };
  // Recruiter tips
  recruiter_tips?: string[];
  // Quick wins
  quick_wins?: string[];
  // Industry alignment
  industry_alignment?: {
    job_industry: string;
    resume_industries: string[];
    alignment: string;
    recommendation: string;
  };
  // Education match
  education_match?: {
    job_requires: string;
    resume_shows: string;
    meets_requirement: boolean;
    notes: string;
  };
  // Certification analysis
  certification_analysis?: {
    required_certs: string[];
    resume_certs: string[];
    missing_certs: string[];
    bonus_certs: string[];
  };
  // Existing fields
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: Array<{ priority: string; issue: string; fix: string }>;
  experience_gaps: string[];
  skills_gaps?: SkillGap[];
  years_experience_analysis?: YearsExperienceAnalysis;
  leadership_analysis?: LeadershipAnalysis;
  tech_stack_gaps?: string[];
  recommended_additions: string[];
  role_fit_assessment: string;
  deal_breakers?: string[];
}

interface ContentImprovement {
  section: string;
  original: string;
  improved: string;
  reason: string;
}

interface ActionVerbUpgrade {
  original: string;
  improved: string;
}

interface EnhancedResume {
  enhancedContent: string;
  contentImprovements: ContentImprovement[];
  addedKeywords: string[];
  quantifiedAchievements: string[];
  actionVerbUpgrades: ActionVerbUpgrade[];
  summaryRewrite: string;
  bulletPointImprovements: string[];
  transformationNotes?: string;
}

interface CoverLetterDetails {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  companyName: string;
  hiringManagerName: string;
}

type Step = "input" | "initial_score" | "enhancing" | "improvements" | "format_selection" | "final_score";
type CoverLetterLength = "short" | "medium" | "detailed";
type ResumeFormat = "classic";

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
  
  // Cover letter state
  const [showCoverLetterPrompt, setShowCoverLetterPrompt] = useState(false);
  const [showCoverLetterDetailsDialog, setShowCoverLetterDetailsDialog] = useState(false);
  const [coverLetterDetails, setCoverLetterDetails] = useState<CoverLetterDetails>({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    companyName: "",
    hiringManagerName: "",
  });
  const [coverLetterLength, setCoverLetterLength] = useState<CoverLetterLength>("medium");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [showCoverLetterResult, setShowCoverLetterResult] = useState(false);
  
  // Change acceptance state
  const [acceptedContentChanges, setAcceptedContentChanges] = useState<Set<number>>(new Set());
  const [acceptedKeywords, setAcceptedKeywords] = useState<Set<number>>(new Set());
  const [acceptedVerbUpgrades, setAcceptedVerbUpgrades] = useState<Set<number>>(new Set());
  const [acceptedAchievements, setAcceptedAchievements] = useState<Set<number>>(new Set());
  const [finalResumeContent, setFinalResumeContent] = useState<string>("");
  
  // Improvements view state
  const [viewMode, setViewMode] = useState<"comparison" | "details">("comparison");
  const [useFullTransformation, setUseFullTransformation] = useState(true);
  
  // Format selection state - classic only now
  const [selectedFormat, setSelectedFormat] = useState<ResumeFormat>("classic");
  const [isGeneratingFormatted, setIsGeneratingFormatted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Start fresh - clear all state (can be called manually if needed)
  const startFresh = () => {
    setStep("input");
    setResumeText("");
    setJobDescription("");
    setSelfProjection("");
    setInitialScore(null);
    setEnhancedResume(null);
    setFinalScore(null);
    setResumeFileName(null);
    setAcceptedContentChanges(new Set());
    setAcceptedKeywords(new Set());
    setAcceptedVerbUpgrades(new Set());
    setAcceptedAchievements(new Set());
    setFinalResumeContent("");
    setGeneratedCoverLetter(null);
    toast({
      title: "Starting fresh",
      description: "Ready for new resume analysis.",
    });
  };

  // Helper to get email from localStorage
  const getStoredEmail = (): string | undefined => {
    try {
      const storedAccess = localStorage.getItem("resume_suite_access");
      if (storedAccess) {
        const parsed = JSON.parse(storedAccess);
        if (parsed.email) {
          return parsed.email;
        }
      }
      // Fallback: check URL for access token and try to get email from there
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get("access");
      if (accessToken) {
        // Store it for future calls
        console.log("Found access token in URL, will use for verification");
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

  const clearResume = () => {
    setResumeText("");
    setResumeFileName(null);
    try {
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      // ignore
    }
  };

  const clearJobDescription = () => {
    setJobDescription("");
  };

  // Retry helper for API calls
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 2000,
    retryName: string = "Request"
  ): Promise<T> => {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        // Don't retry on auth/access errors
        if (error.message?.includes('403') || error.message?.includes('Access') || error.message?.includes('expired')) {
          throw error;
        }
        if (attempt < maxRetries - 1) {
          const waitTime = delayMs * (attempt + 1);
          console.log(`${retryName} attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    throw lastError || new Error(`${retryName} failed after ${maxRetries} attempts`);
  };

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
        // Use FileReader for more reliable base64 encoding
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Extract base64 part from data URL
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        const userEmail = getStoredEmail();

        // Use retry wrapper for resilience
        const data = await withRetry(async () => {
          const { data, error } = await supabase.functions.invoke('parse-resume', {
            body: { fileBase64: base64, fileName: file.name, fileType: file.type, email: userEmail },
          });
          if (error) throw error;
          if (!data?.resumeText) throw new Error("No text extracted");
          return data;
        }, 3, 2000, "Resume parsing");

        setResumeText(data.resumeText);
        toast({ title: "Resume parsed", description: "Your resume has been extracted." });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const isAccessError = error.message?.includes('403') || error.message?.includes('Access');
      toast({
        title: isAccessError ? "Access denied" : "Upload failed",
        description: isAccessError ? error.message : "Please paste your resume text manually or try again.",
        variant: "destructive",
      });
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };
  const performAnalysis = async (retryCount: number): Promise<void> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      const userEmail = getStoredEmail();
      const accessToken = getAccessToken();
      
      // Ensure we have at least one form of authentication
      if (!userEmail && !accessToken) {
        throw new Error("Access verification failed. Please return to the tool access link from your email to re-verify your access.");
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ resumeText, jobDescription, email: userEmail, accessToken }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 403) {
          const errorMsg = errorData.error || "Access denied";
          if (errorMsg.includes("expired")) {
            throw new Error("Your access has expired. Please renew your subscription to continue using this tool.");
          }
          throw new Error("You don't have access to this tool. Please purchase the Resume Intelligence Suite to use this feature.");
        }
        
        if (response.status === 429) {
          // Rate limited - retry after delay
          if (retryCount < 2) {
            toast({
              title: "High demand",
              description: `Retrying in ${(retryCount + 1) * 5} seconds...`,
            });
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 5000));
            return performAnalysis(retryCount + 1);
          }
          throw new Error("Service is busy. Please wait a moment and try again.");
        }
        
        if (response.status === 402) {
          throw new Error("AI service temporarily unavailable. Please try again later.");
        }
        
        throw new Error(errorData.error || errorData.message || "Failed to analyze resume");
      }

      const data = await response.json();
      setInitialScore(data);
      setStep("initial_score");
    } catch (error: any) {
      console.error("Analysis error:", error);
      
      const errorMessage = error.name === 'AbortError' 
        ? "Analysis timed out. Please try again with a shorter resume."
        : error.message || "Please try again.";
      
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
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
    await performAnalysis(0);
    setIsAnalyzing(false);
  };

  const handleEnhanceResume = async () => {
    setStep("enhancing");
    setIsEnhancing(true);

    const userEmail = getStoredEmail();
    const accessToken = getAccessToken();
    
    // Ensure we have at least one form of authentication
    if (!userEmail && !accessToken) {
      toast({
        title: "Access verification failed",
        description: "Please return to the tool access link from your email to re-verify your access.",
        variant: "destructive",
      });
      setStep("initial_score");
      setIsEnhancing(false);
      return;
    }
    
    try {
      // Use retry wrapper for resilience
      const data = await withRetry(async () => {
        const { data, error } = await supabase.functions.invoke("enhance-resume", {
          body: { 
            resumeText, 
            jobDescription,
            selfProjection,
            missingKeywords: initialScore?.missing_keywords || [],
            improvements: initialScore?.improvements || [],
            experienceGaps: initialScore?.experience_gaps || [],
            skillsGaps: initialScore?.skills_gaps || [],
            techStackGaps: initialScore?.tech_stack_gaps?.map((t: string) => ({ technology: t, gap: "Missing from resume" })) || [],
            email: userEmail,
            accessToken,
          },
        });

        if (error) {
          // Check for specific error types
          if (error.message?.includes('403') || error.message?.includes('Access denied') || error.message?.includes('access')) {
            if (error.message?.includes('expired')) {
              throw new Error("Your access has expired. Please renew your subscription to continue using this tool.");
            }
            throw new Error("You don't have access to this tool. Please purchase the Resume Intelligence Suite to use this feature.");
          }
          if (error.message?.includes('429') || error.message?.includes('rate')) {
            throw new Error("Service is busy. Please wait a moment and try again.");
          }
          if (error.message?.includes('402')) {
            throw new Error("AI service temporarily unavailable. Please try again later.");
          }
          throw error;
        }
        if (data?.error) throw new Error(data.error);

        // Defensive parsing - validate the data structure
        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response from enhancement service. Please try again.");
        }
        
        return data;
      }, 2, 3000, "Resume enhancement");

      // Safely extract arrays with fallbacks
      const safeData = {
        enhancedContent: data.enhancedContent || "",
        contentImprovements: Array.isArray(data.contentImprovements) ? data.contentImprovements : [],
        addedKeywords: Array.isArray(data.addedKeywords) ? data.addedKeywords : [],
        quantifiedAchievements: Array.isArray(data.quantifiedAchievements) ? data.quantifiedAchievements : [],
        actionVerbUpgrades: Array.isArray(data.actionVerbUpgrades) ? data.actionVerbUpgrades : [],
        summaryRewrite: data.summaryRewrite || "",
        bulletPointImprovements: Array.isArray(data.bulletPointImprovements) ? data.bulletPointImprovements : [],
        transformationNotes: data.transformationNotes || "",
      };

      setEnhancedResume(safeData);
      // Initialize all changes as accepted by default
      setAcceptedContentChanges(new Set(safeData.contentImprovements.map((_: any, i: number) => i)));
      setAcceptedKeywords(new Set(safeData.addedKeywords.map((_: any, i: number) => i)));
      setAcceptedVerbUpgrades(new Set(safeData.actionVerbUpgrades.map((_: any, i: number) => i)));
      setAcceptedAchievements(new Set(safeData.quantifiedAchievements.map((_: any, i: number) => i)));
      setStep("improvements");
    } catch (error: any) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setStep("initial_score");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Build final resume with only accepted changes
  const buildFinalResume = () => {
    if (!enhancedResume) return resumeText;
    
    let finalContent = resumeText;
    
    // Apply accepted content improvements
    enhancedResume.contentImprovements.forEach((imp, index) => {
      if (acceptedContentChanges.has(index) && imp.original && imp.improved) {
        finalContent = finalContent.replace(imp.original, imp.improved);
      }
    });
    
    // Apply accepted action verb upgrades
    enhancedResume.actionVerbUpgrades.forEach((upgrade, index) => {
      if (acceptedVerbUpgrades.has(index) && upgrade.original && upgrade.improved) {
        const regex = new RegExp(`\\b${upgrade.original}\\b`, 'gi');
        finalContent = finalContent.replace(regex, upgrade.improved);
      }
    });
    
    return finalContent;
  };

  const toggleContentChange = (index: number) => {
    setAcceptedContentChanges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleKeyword = (index: number) => {
    setAcceptedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleVerbUpgrade = (index: number) => {
    setAcceptedVerbUpgrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAchievement = (index: number) => {
    setAcceptedAchievements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const acceptAllChanges = () => {
    if (!enhancedResume) return;
    setAcceptedContentChanges(new Set(enhancedResume.contentImprovements.map((_, i) => i)));
    setAcceptedKeywords(new Set(enhancedResume.addedKeywords.map((_, i) => i)));
    setAcceptedVerbUpgrades(new Set(enhancedResume.actionVerbUpgrades.map((_, i) => i)));
    setAcceptedAchievements(new Set(enhancedResume.quantifiedAchievements.map((_, i) => i)));
  };

  const declineAllChanges = () => {
    setAcceptedContentChanges(new Set());
    setAcceptedKeywords(new Set());
    setAcceptedVerbUpgrades(new Set());
    setAcceptedAchievements(new Set());
  };

  const handleFinalAnalysis = async () => {
    if (!enhancedResume) return;

    // Build final resume with only accepted changes
    const finalContent = buildFinalResume();
    setFinalResumeContent(finalContent);
    setIsAnalyzing(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const userEmail = getStoredEmail();
      const accessToken = getAccessToken();
      
      // Ensure we have at least one form of authentication
      if (!userEmail && !accessToken) {
        toast({
          title: "Access verification failed",
          description: "Please return to the tool access link from your email to re-verify your access.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            resumeText: finalContent, 
            jobDescription, 
            isPostTransformation: true, 
            email: userEmail,
            accessToken: accessToken 
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          const errorMsg = errorData.error || "Access denied";
          if (errorMsg.includes("expired")) {
            throw new Error("Your access has expired. Please renew your subscription to continue using this tool.");
          }
          throw new Error("You don't have access to this tool. Please purchase the Resume Intelligence Suite to use this feature.");
        }
        if (response.status === 429) {
          throw new Error("Service is busy. Please wait a moment and try again.");
        }
        if (response.status === 402) {
          throw new Error("AI service temporarily unavailable. Please try again later.");
        }
        throw new Error(errorData.error || "Failed to analyze");
      }

      const data = await response.json();
      setFinalScore(data);
      setStep("final_score");
    } catch (error: any) {
      console.error("Final analysis error:", error);
      const errorMessage = error.name === 'AbortError' 
        ? "Analysis timed out. Please try again."
        : error.message || "Please try again.";
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyEnhanced = async () => {
    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (content) {
      await navigator.clipboard.writeText(content);
      toast({ title: "Copied!", description: "Resume copied to clipboard" });
    }
  };

  const handleDownloadResume = async () => {
    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (!content) return;
    
    try {
      const { name, headline, contactInfo, summary, experiences, skills, education } = parseResumeContent(content);
      const lines = content.split("\n");

      // Only use the structured renderer when parsing looks *very* reliable.
      // If parsing is even slightly off, use the robust raw renderer to preserve all text.
      const hasStructuredData =
        experiences.length >= 1 &&
        experiences.every((e) => (e.bullets?.length ?? 0) > 0) &&
        experiences.some((e) => Boolean(e.company)) &&
        experiences.some((e) => e.title && e.title !== "Position");

      // Fallback (more robust): create a clean single-column DOCX from ALL raw content
      // This preserves every line/experience even if parsing is imperfect.
      const sectionHeaderRegex = /^(PROFESSIONAL\s+)?SUMMARY|^PROFILE|^OBJECTIVE|^ABOUT(\s+ME)?$|^(PROFESSIONAL\s+|WORK\s+)?EXPERIENCE|^EMPLOYMENT(\s+HISTORY)?|^CAREER(\s+HISTORY)?$|^(TECHNICAL\s+|CORE\s+)?SKILLS|^COMPETENCIES|^EXPERTISE|^TECHNOLOGIES$|^EDUCATION|^ACADEMIC|^QUALIFICATIONS$|^(KEY\s+)?ACHIEVEMENTS|^ACCOMPLISHMENTS|^AWARDS$/i;
      const dateLineRegex = /(\d{4}|\w+\.?\s+\d{4})\s*[-–—to]+\s*(\d{4}|Present|Current|Now)/i;

      const buildRawDocx = async () => {
        const children: Paragraph[] = [];
        let wroteName = false;

        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
            return;
          }

          const clean = trimmed.replace(/^[#*_]+|[#*_]+$/g, "").trim();

          // Name (first meaningful line, but never treat a section header as name)
          if (!wroteName && idx < 6 && clean.length < 60 && !clean.includes("@") && !sectionHeaderRegex.test(clean)) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: clean.toUpperCase(), bold: true, size: 40, font: "Calibri" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
              })
            );
            wroteName = true;
            return;
          }

          // Contact line (early)
          if (
            idx < 10 &&
            (clean.includes("@") || clean.match(/\(\d{3}\)|\d{3}[-.\s]\d{3}/) || clean.toLowerCase().includes("linkedin.com"))
          ) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: clean, size: 20, font: "Calibri", color: "666666" })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
              })
            );
            return;
          }

          // Section headers (case-insensitive)
          if (sectionHeaderRegex.test(clean)) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: clean.toUpperCase(), bold: true, size: 24, font: "Calibri", color: "1a365d" })],
                spacing: { before: 280, after: 80 },
                border: { bottom: { color: "1a365d", style: BorderStyle.SINGLE, size: 8 } },
              })
            );
            return;
          }

          // Bullets
          if (/^[•\-\*▪◦‣→]/.test(clean)) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: clean.replace(/^[•\-\*▪◦‣→]\s*/, ""), size: 21, font: "Calibri" })],
                bullet: { level: 0 },
                spacing: { before: 30, after: 30 },
              })
            );
            return;
          }

          // Role line heuristic (often includes dates)
          if (dateLineRegex.test(clean) && clean.length < 120) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: clean, bold: true, size: 22, font: "Calibri", color: "1a365d" })],
                spacing: { before: 120, after: 40 },
              })
            );
            return;
          }

          // Default paragraph
          children.push(
            new Paragraph({
              children: [new TextRun({ text: clean, size: 21, font: "Calibri" })],
              spacing: { before: 50, after: 50 },
            })
          );
        });

        const doc = new Document({
          sections: [
            {
              properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
              children,
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "optimized-resume.docx");
        toast({ title: "Downloaded!", description: "Resume saved as Word document" });
      };

      if (!hasStructuredData) {
        await buildRawDocx();
        return;
      }

      // Helper function for section headers
      const createSectionHeader = (text: string, color: string = "1a365d") =>
        new Paragraph({
          children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, font: "Calibri", color })],
          spacing: { before: 280, after: 100 },
          border: { bottom: { color, style: BorderStyle.SINGLE, size: 8 } },
        });

      // Classic single-column format
      const documentChildren: Paragraph[] = [];

      documentChildren.push(
        new Paragraph({
          children: [new TextRun({ text: (name || "Your Name").toUpperCase(), bold: true, size: 44, font: "Calibri" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
        })
      );
      
      if (headline) {
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: headline, size: 24, font: "Calibri", color: "555555", italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 }
        }));
      }
      
      if (contactInfo.length > 0) {
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: contactInfo.join('  |  '), size: 20, font: "Calibri", color: "666666" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }));
      }
      
      if (summary) {
        documentChildren.push(createSectionHeader("Professional Summary"));
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: summary, size: 21, font: "Calibri" })],
          spacing: { before: 60, after: 120 }
        }));
      }
      
      if (experiences.length > 0) {
        documentChildren.push(createSectionHeader("Professional Experience"));
        experiences.forEach(exp => {
          documentChildren.push(new Paragraph({
            children: [
              new TextRun({ text: exp.title || "Position", bold: true, size: 23, font: "Calibri", color: "1a365d" }),
              exp.dates ? new TextRun({ text: `  |  ${exp.dates}`, size: 20, font: "Calibri", color: "666666", italics: true }) : new TextRun({ text: "" })
            ],
            spacing: { before: 160, after: 40 }
          }));
          if (exp.company) {
            documentChildren.push(new Paragraph({
              children: [new TextRun({ text: exp.company, size: 21, font: "Calibri", color: "444444" })],
              spacing: { before: 0, after: 60 }
            }));
          }
          if (exp.bullets && exp.bullets.length > 0) {
            exp.bullets.forEach((bullet: string) => {
              documentChildren.push(new Paragraph({
                children: [new TextRun({ text: bullet, size: 20, font: "Calibri" })],
                bullet: { level: 0 },
                spacing: { before: 30, after: 30 }
              }));
            });
          }
        });
      }
      
      if (skills.length > 0) {
        documentChildren.push(createSectionHeader("Skills & Competencies"));
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: skills.join('  •  '), size: 20, font: "Calibri" })],
          spacing: { before: 60, after: 120 }
        }));
      }
      
      if (education.length > 0) {
        documentChildren.push(createSectionHeader("Education"));
        education.forEach(edu => {
          documentChildren.push(new Paragraph({
            children: [new TextRun({ text: edu.degree, size: 21, font: "Calibri" })],
            spacing: { before: 40, after: 40 }
          }));
        });
      }
      
      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          children: documentChildren
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "optimized-resume.docx");
      toast({ title: "Downloaded!", description: "Resume saved as Word document" });
    } catch (error) {
      console.error("Download error:", error);
      const blob = new Blob([content], { type: "text/plain" });
      saveAs(blob, "optimized-resume.txt");
      toast({ title: "Downloaded!", description: "Resume saved as text file" });
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
    setGeneratedCoverLetter(null);
    setShowCoverLetterPrompt(false);
    setShowCoverLetterResult(false);
    setCoverLetterDetails({
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      companyName: "",
      hiringManagerName: "",
    });
    // Reset change acceptance state
    setAcceptedContentChanges(new Set());
    setAcceptedKeywords(new Set());
    setAcceptedVerbUpgrades(new Set());
    setAcceptedAchievements(new Set());
    setFinalResumeContent("");
    // Reset view state
    setViewMode("comparison");
    setUseFullTransformation(true);
    // Reset format selection
    setSelectedFormat("classic");
  };

  // Download report function - PDF
  const handleDownloadReport = async () => {
    if (!initialScore) return;
    
    const getScoreColorHex = (score: number) => {
      if (score >= 75) return "#16a34a";
      if (score >= 50) return "#ca8a04";
      return "#dc2626";
    };
    
    const sectionTitle = (title: string, color = "#1a1a1a", borderColor = "#eee") => `
      <h2 style="font-size: 16px; color: ${color}; border-bottom: 2px solid ${borderColor}; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px; page-break-after: avoid;">${title}</h2>
    `;
    
    const tagStyle = (bgColor: string, textColor: string) => `
      display: inline-block; background: ${bgColor}; color: ${textColor}; padding: 3px 10px; border-radius: 12px; font-size: 11px; margin: 2px; page-break-inside: avoid;
    `;
    
    const cardStyle = (bgColor: string, borderColor: string) => `
      background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 12px 15px; margin-bottom: 10px; page-break-inside: avoid;
    `;
    
    const reportHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.5; orphans: 3; widows: 3;">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 3px solid #d4af37; padding-bottom: 15px; page-break-inside: avoid;">
          <h1 style="font-size: 24px; margin: 0; color: #1a1a1a;">Resume Intelligence Report</h1>
          <p style="color: #666; margin-top: 6px; font-size: 12px;">Generated by The Leader's Row - Rimo AI Coach</p>
        </div>
        
        <!-- Overall Score -->
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 48px; font-weight: bold; color: ${getScoreColorHex(initialScore.ats_score)};">
            ${initialScore.ats_score}<span style="font-size: 24px; color: #999;">/100</span>
          </div>
          ${initialScore.match_rate_target ? `<div style="margin-top: 5px; ${tagStyle(
            initialScore.match_rate_target.toLowerCase().includes('on track') ? '#dcfce7' : '#fef3c7',
            initialScore.match_rate_target.toLowerCase().includes('on track') ? '#166534' : '#92400e'
          )}">${initialScore.match_rate_target}</div>` : ''}
        </div>
        
        <div style="background: #f9f9f9; padding: 12px 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #444; font-size: 13px;">${initialScore.summary}</p>
        </div>
        
        <!-- Primary Score Breakdown -->
        ${sectionTitle('Score Breakdown')}
        <div style="display: table; width: 100%; margin-bottom: 15px;">
          ${[
            { label: "Keywords", score: initialScore.keyword_match_score },
            { label: "Years of Exp.", score: initialScore.experience_match_score },
            { label: "Skills", score: initialScore.skills_match_score },
            { label: "Format", score: initialScore.format_score },
          ].map(item => `
            <div style="display: table-cell; width: 25%; text-align: center; padding: 12px 4px; background: #fff; border: 1px solid #eee; page-break-inside: avoid;">
              <div style="font-size: 20px; font-weight: bold; color: ${getScoreColorHex(item.score)};">${item.score}%</div>
              <div style="color: #666; font-size: 10px; margin-top: 2px;">${item.label}</div>
            </div>
          `).join('')}
        </div>
        
        <!-- Secondary Scores -->
        ${(initialScore.hard_skills_score !== undefined || initialScore.soft_skills_score !== undefined || initialScore.searchability_score !== undefined || initialScore.measurable_results_score !== undefined) ? `
        <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
          ${initialScore.hard_skills_score !== undefined ? `
            <div style="flex: 1; min-width: 80px; text-align: center; padding: 10px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
              <div style="font-size: 16px; font-weight: bold; color: ${getScoreColorHex(initialScore.hard_skills_score)};">${initialScore.hard_skills_score}%</div>
              <div style="color: #666; font-size: 10px;">Hard Skills</div>
            </div>
          ` : ''}
          ${initialScore.soft_skills_score !== undefined ? `
            <div style="flex: 1; min-width: 80px; text-align: center; padding: 10px; background: #faf5ff; border-radius: 8px; border: 1px solid #e9d5ff;">
              <div style="font-size: 16px; font-weight: bold; color: ${getScoreColorHex(initialScore.soft_skills_score)};">${initialScore.soft_skills_score}%</div>
              <div style="color: #666; font-size: 10px;">Soft Skills</div>
            </div>
          ` : ''}
          ${initialScore.searchability_score !== undefined ? `
            <div style="flex: 1; min-width: 80px; text-align: center; padding: 10px; background: #f0fdfa; border-radius: 8px; border: 1px solid #99f6e4;">
              <div style="font-size: 16px; font-weight: bold; color: ${getScoreColorHex(initialScore.searchability_score)};">${initialScore.searchability_score}%</div>
              <div style="color: #666; font-size: 10px;">Searchability</div>
            </div>
          ` : ''}
          ${initialScore.measurable_results_score !== undefined ? `
            <div style="flex: 1; min-width: 80px; text-align: center; padding: 10px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a;">
              <div style="font-size: 16px; font-weight: bold; color: ${getScoreColorHex(initialScore.measurable_results_score)};">${initialScore.measurable_results_score}%</div>
              <div style="color: #666; font-size: 10px;">Metrics</div>
            </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- After Optimization -->
        ${finalScore ? `
        ${sectionTitle('After Optimization', '#16a34a', '#16a34a')}
        <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; justify-content: center;">
          <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
            <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Before → After</div>
            <div style="font-size: 24px; font-weight: bold;">
              <span style="color: ${getScoreColorHex(initialScore.ats_score)};">${Math.round(initialScore.ats_score)}</span>
              <span style="color: #999; margin: 0 8px;">→</span>
              <span style="color: #16a34a;">${Math.round(finalScore.ats_score || 0)}</span>
            </div>
            <div style="color: #16a34a; font-size: 14px; font-weight: bold;">+${Math.round((finalScore.ats_score || 0) - (initialScore.ats_score || 0))} points</div>
          </div>
        </div>
        ${finalScore.ats_score < 75 ? `
        <div style="${cardStyle('#fef3c7', '#f59e0b')}">
          <p style="margin: 0; color: #92400e; font-size: 13px; text-align: center;">⚠️ This role may not be a good fit for your profile based on the resume</p>
        </div>
        ` : ''}
        ` : ''}
        
        <!-- Deal Breakers -->
        ${initialScore.deal_breakers && initialScore.deal_breakers.length > 0 ? `
        ${sectionTitle('⛔ Deal Breakers', '#dc2626', '#fca5a5')}
        <div style="${cardStyle('#fef2f2', '#fca5a5')}">
          <ul style="margin: 0; padding-left: 18px;">
            ${initialScore.deal_breakers.map(db => `<li style="color: #991b1b; margin-bottom: 4px;">${db}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <!-- Quick Wins -->
        ${initialScore.quick_wins && initialScore.quick_wins.length > 0 ? `
        ${sectionTitle('⚡ Quick Wins (Immediate Impact)', '#16a34a', '#86efac')}
        <div style="${cardStyle('#f0fdf4', '#86efac')}">
          <ul style="margin: 0; padding-left: 18px;">
            ${initialScore.quick_wins.map(win => `<li style="color: #166534; margin-bottom: 4px;">${win}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <!-- Recruiter Tips -->
        ${initialScore.recruiter_tips && initialScore.recruiter_tips.length > 0 ? `
        ${sectionTitle('💡 Recruiter Tips')}
        <div style="${cardStyle('#faf5ff', '#e9d5ff')}">
          <ul style="margin: 0; padding-left: 18px;">
            ${initialScore.recruiter_tips.map(tip => `<li style="color: #6b21a8; margin-bottom: 4px;">${tip}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        
        <!-- Job Title Match -->
        ${initialScore.job_title_match ? `
        ${sectionTitle('🎯 Job Title Match')}
        <div style="${cardStyle(
          initialScore.job_title_match.match_level === 'exact' || initialScore.job_title_match.match_level === 'strong' ? '#f0fdf4' : 
          initialScore.job_title_match.match_level === 'partial' ? '#fffbeb' : '#fef2f2',
          initialScore.job_title_match.match_level === 'exact' || initialScore.job_title_match.match_level === 'strong' ? '#86efac' : 
          initialScore.job_title_match.match_level === 'partial' ? '#fde68a' : '#fca5a5'
        )}">
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            <div><strong>Target:</strong> ${initialScore.job_title_match.target_title}</div>
            <div><strong>Your Title:</strong> ${initialScore.job_title_match.resume_title}</div>
          </div>
          ${initialScore.job_title_match.recommendation && initialScore.job_title_match.match_level !== 'exact' ? 
            `<p style="margin: 8px 0 0 0; color: #666; font-size: 12px;">→ ${initialScore.job_title_match.recommendation}</p>` : ''}
        </div>
        ` : ''}
        
        <!-- Years of Experience & Leadership Analysis -->
        ${(initialScore.years_experience_analysis || initialScore.leadership_analysis) ? `
        ${sectionTitle('📊 Experience & Leadership Analysis')}
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
          ${initialScore.years_experience_analysis ? `
          <div style="flex: 1; min-width: 250px; ${cardStyle('#fff', '#e5e7eb')}">
            <strong style="color: #1a1a1a;">Years of Experience</strong>
            <div style="margin-top: 8px;">
              <div style="background: #eff6ff; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="font-size: 10px; color: #2563eb; text-transform: uppercase;">Job Requires</div>
                <div style="color: #1a1a1a;">${initialScore.years_experience_analysis.job_requires}</div>
              </div>
              <div style="background: #f9fafb; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Your Resume Shows</div>
                <div style="color: #1a1a1a;">${initialScore.years_experience_analysis.resume_shows}</div>
              </div>
              <div style="background: ${initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') ? '#f0fdf4' : '#fffbeb'}; padding: 8px; border-radius: 4px;">
                <div style="font-size: 10px; color: ${initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') ? '#16a34a' : '#d97706'}; text-transform: uppercase;">Gap Analysis</div>
                <div style="color: ${initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') ? '#166534' : '#92400e'}; font-weight: 500;">${initialScore.years_experience_analysis.gap}</div>
              </div>
            </div>
          </div>
          ` : ''}
          ${initialScore.leadership_analysis ? `
          <div style="flex: 1; min-width: 250px; ${cardStyle('#fff', '#e5e7eb')}">
            <strong style="color: #1a1a1a;">Leadership & Management</strong>
            <div style="margin-top: 8px;">
              <div style="background: #eff6ff; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="font-size: 10px; color: #2563eb; text-transform: uppercase;">Job Requires</div>
                <div style="color: #1a1a1a;">${initialScore.leadership_analysis.job_requires}</div>
              </div>
              <div style="background: #f9fafb; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                <div style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Your Resume Shows</div>
                <div style="color: #1a1a1a;">${initialScore.leadership_analysis.resume_shows}</div>
              </div>
              <div style="background: ${initialScore.leadership_analysis.gap.toLowerCase().includes('meets') ? '#f0fdf4' : '#fffbeb'}; padding: 8px; border-radius: 4px;">
                <div style="font-size: 10px; color: ${initialScore.leadership_analysis.gap.toLowerCase().includes('meets') ? '#16a34a' : '#d97706'}; text-transform: uppercase;">Gap Analysis</div>
                <div style="color: ${initialScore.leadership_analysis.gap.toLowerCase().includes('meets') ? '#166534' : '#92400e'}; font-weight: 500;">${initialScore.leadership_analysis.gap}</div>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Hard Skills & Soft Skills -->
        ${((initialScore.hard_skills_matched && initialScore.hard_skills_matched.length > 0) || (initialScore.hard_skills_missing && initialScore.hard_skills_missing.length > 0) || (initialScore.soft_skills_matched && initialScore.soft_skills_matched.length > 0) || (initialScore.soft_skills_missing && initialScore.soft_skills_missing.length > 0)) ? `
        ${sectionTitle('🔧 Skills Analysis')}
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 15px;">
          <div style="flex: 1; min-width: 200px; ${cardStyle('#fff', '#bfdbfe')}">
            <strong style="color: #2563eb;">Hard Skills (Technical)</strong>
            ${initialScore.hard_skills_matched && initialScore.hard_skills_matched.length > 0 ? `
              <div style="margin-top: 8px;">
                <div style="font-size: 10px; color: #16a34a; margin-bottom: 4px;">✓ Matched (${initialScore.hard_skills_matched.length})</div>
                <div>${initialScore.hard_skills_matched.slice(0, 10).map(s => `<span style="${tagStyle('#dcfce7', '#166534')}">${s}</span>`).join('')}</div>
              </div>
            ` : ''}
            ${initialScore.hard_skills_missing && initialScore.hard_skills_missing.length > 0 ? `
              <div style="margin-top: 8px;">
                <div style="font-size: 10px; color: #dc2626; margin-bottom: 4px;">✗ Missing (${initialScore.hard_skills_missing.length})</div>
                <div>${initialScore.hard_skills_missing.slice(0, 8).map(s => `<span style="${tagStyle('#fef2f2', '#991b1b')}">${s}</span>`).join('')}</div>
              </div>
            ` : ''}
          </div>
          <div style="flex: 1; min-width: 200px; ${cardStyle('#fff', '#e9d5ff')}">
            <strong style="color: #7c3aed;">Soft Skills (Interpersonal)</strong>
            ${initialScore.soft_skills_matched && initialScore.soft_skills_matched.length > 0 ? `
              <div style="margin-top: 8px;">
                <div style="font-size: 10px; color: #16a34a; margin-bottom: 4px;">✓ Matched (${initialScore.soft_skills_matched.length})</div>
                <div>${initialScore.soft_skills_matched.slice(0, 8).map(s => `<span style="${tagStyle('#dcfce7', '#166534')}">${s}</span>`).join('')}</div>
              </div>
            ` : ''}
            ${initialScore.soft_skills_missing && initialScore.soft_skills_missing.length > 0 ? `
              <div style="margin-top: 8px;">
                <div style="font-size: 10px; color: #f59e0b; margin-bottom: 4px;">✗ Missing (${initialScore.soft_skills_missing.length})</div>
                <div>${initialScore.soft_skills_missing.slice(0, 6).map(s => `<span style="${tagStyle('#fffbeb', '#92400e')}">${s}</span>`).join('')}</div>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- Measurable Results -->
        ${initialScore.measurable_results ? `
        ${sectionTitle('📈 Quantified Achievements')}
        <div style="${cardStyle('#fff', '#e5e7eb')}">
          <div style="display: flex; gap: 20px; margin-bottom: 10px;">
            <div><strong>${initialScore.measurable_results.count}</strong> found (ideal: ${initialScore.measurable_results.ideal_count})</div>
          </div>
          ${initialScore.measurable_results.examples_found && initialScore.measurable_results.examples_found.length > 0 ? `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; color: #16a34a; margin-bottom: 4px;">✓ Strong Quantified Statements</div>
              ${initialScore.measurable_results.examples_found.slice(0, 3).map(ex => `
                <div style="background: #f0fdf4; padding: 6px 10px; border-radius: 4px; margin-bottom: 4px; border-left: 3px solid #16a34a; font-size: 12px;">"${ex}"</div>
              `).join('')}
            </div>
          ` : ''}
          ${initialScore.measurable_results.missing_opportunities && initialScore.measurable_results.missing_opportunities.length > 0 ? `
            <div>
              <div style="font-size: 11px; color: #f59e0b; margin-bottom: 4px;">⚠ Opportunities to Add Metrics</div>
              <ul style="margin: 0; padding-left: 18px;">
                ${initialScore.measurable_results.missing_opportunities.map(opp => `<li style="color: #666; font-size: 12px; margin-bottom: 2px;">${opp}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Bullet Point Analysis -->
        ${initialScore.bullet_point_analysis ? `
        ${sectionTitle('📝 Bullet Point Quality')}
        <div style="${cardStyle('#fff', '#e5e7eb')}">
          <div style="display: flex; gap: 30px; margin-bottom: 10px; text-align: center;">
            <div><strong style="font-size: 18px;">${initialScore.bullet_point_analysis.total_bullets}</strong><br/><span style="font-size: 10px; color: #666;">Total Bullets</span></div>
            <div><strong style="font-size: 18px; color: ${initialScore.bullet_point_analysis.bullets_with_metrics / initialScore.bullet_point_analysis.total_bullets >= 0.5 ? '#16a34a' : '#f59e0b'};">${initialScore.bullet_point_analysis.bullets_with_metrics}</strong><br/><span style="font-size: 10px; color: #666;">With Metrics</span></div>
            <div><strong style="font-size: 18px;">${initialScore.bullet_point_analysis.average_bullets_per_role.toFixed(1)}</strong><br/><span style="font-size: 10px; color: #666;">Avg per Role</span></div>
          </div>
          ${initialScore.bullet_point_analysis.weak_bullets && initialScore.bullet_point_analysis.weak_bullets.length > 0 ? `
            <div style="margin-bottom: 8px;">
              <div style="font-size: 11px; color: #dc2626; margin-bottom: 4px;">Weak Bullets to Improve</div>
              ${initialScore.bullet_point_analysis.weak_bullets.slice(0, 2).map(b => `
                <div style="background: #fef2f2; padding: 6px 10px; border-radius: 4px; margin-bottom: 4px; border-left: 3px solid #dc2626; font-size: 11px;">"${b}"</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Word Count & Contact Info -->
        ${(initialScore.word_count_analysis || initialScore.contact_info_check) ? `
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
          ${initialScore.word_count_analysis ? `
          <div style="flex: 1; min-width: 180px; ${cardStyle('#fff', '#e5e7eb')}">
            <strong>Word Count</strong>
            <div style="font-size: 18px; font-weight: bold; color: ${initialScore.word_count_analysis.assessment === 'optimal' ? '#16a34a' : '#f59e0b'}; margin: 5px 0;">
              ~${initialScore.word_count_analysis.estimated_words} words
            </div>
            <div style="font-size: 11px; color: #666;">Ideal: ${initialScore.word_count_analysis.ideal_range}</div>
            <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">${initialScore.word_count_analysis.recommendation}</p>
          </div>
          ` : ''}
          ${initialScore.contact_info_check ? `
          <div style="flex: 1; min-width: 180px; ${cardStyle('#fff', '#e5e7eb')}">
            <strong>Contact Information</strong>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 8px; font-size: 12px;">
              <div>${initialScore.contact_info_check.has_email ? '✓' : '✗'} Email</div>
              <div>${initialScore.contact_info_check.has_phone ? '✓' : '✗'} Phone</div>
              <div>${initialScore.contact_info_check.has_linkedin ? '✓' : '⚠'} LinkedIn</div>
              <div>${initialScore.contact_info_check.has_location ? '✓' : '⚠'} Location</div>
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Section Analysis -->
        ${initialScore.section_analysis ? `
        ${sectionTitle('📋 Resume Sections')}
        <div style="${cardStyle('#fff', '#e5e7eb')}">
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            ${initialScore.section_analysis.sections_found && initialScore.section_analysis.sections_found.length > 0 ? `
              <div>
                <div style="font-size: 11px; color: #16a34a; margin-bottom: 4px;">✓ Sections Found</div>
                <div>${initialScore.section_analysis.sections_found.map(s => `<span style="${tagStyle('#dcfce7', '#166534')}">${s}</span>`).join('')}</div>
              </div>
            ` : ''}
            ${initialScore.section_analysis.sections_missing && initialScore.section_analysis.sections_missing.length > 0 ? `
              <div>
                <div style="font-size: 11px; color: #dc2626; margin-bottom: 4px;">✗ Missing Sections</div>
                <div>${initialScore.section_analysis.sections_missing.map(s => `<span style="${tagStyle('#fef2f2', '#991b1b')}">${s}</span>`).join('')}</div>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- Education & Industry -->
        ${(initialScore.education_match || initialScore.industry_alignment) ? `
        <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
          ${initialScore.education_match ? `
          <div style="flex: 1; min-width: 200px; ${cardStyle('#fff', '#e5e7eb')}">
            <strong>Education Match</strong>
            <div style="margin-top: 8px; font-size: 12px;">
              <div><span style="color: #666;">Required:</span> ${initialScore.education_match.job_requires}</div>
              <div><span style="color: #666;">You have:</span> ${initialScore.education_match.resume_shows}</div>
              <div style="margin-top: 5px;"><span style="${tagStyle(initialScore.education_match.meets_requirement ? '#dcfce7' : '#fffbeb', initialScore.education_match.meets_requirement ? '#166534' : '#92400e')}">${initialScore.education_match.meets_requirement ? '✓ Meets requirement' : '⚠ Gap identified'}</span></div>
            </div>
          </div>
          ` : ''}
          ${initialScore.industry_alignment ? `
          <div style="flex: 1; min-width: 200px; ${cardStyle('#fff', '#e5e7eb')}">
            <strong>Industry Alignment</strong>
            <div style="margin-top: 8px; font-size: 12px;">
              <div><span style="color: #666;">Target:</span> ${initialScore.industry_alignment.job_industry}</div>
              <div><span style="color: #666;">Your background:</span> ${initialScore.industry_alignment.resume_industries?.join(', ')}</div>
              <div style="margin-top: 5px;"><span style="${tagStyle(
                initialScore.industry_alignment.alignment === 'strong' ? '#dcfce7' : initialScore.industry_alignment.alignment === 'moderate' ? '#fffbeb' : '#fef2f2',
                initialScore.industry_alignment.alignment === 'strong' ? '#166534' : initialScore.industry_alignment.alignment === 'moderate' ? '#92400e' : '#991b1b'
              )}">${initialScore.industry_alignment.alignment} alignment</span></div>
            </div>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <!-- Certifications -->
        ${initialScore.certification_analysis && (initialScore.certification_analysis.resume_certs?.length > 0 || initialScore.certification_analysis.missing_certs?.length > 0) ? `
        ${sectionTitle('🏅 Certifications')}
        <div style="${cardStyle('#fff', '#e5e7eb')}">
          <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            ${initialScore.certification_analysis.resume_certs && initialScore.certification_analysis.resume_certs.length > 0 ? `
              <div>
                <div style="font-size: 11px; color: #16a34a; margin-bottom: 4px;">✓ Your Certifications</div>
                <div>${initialScore.certification_analysis.resume_certs.map(c => `<span style="${tagStyle('#dcfce7', '#166534')}">${c}</span>`).join('')}</div>
              </div>
            ` : ''}
            ${initialScore.certification_analysis.missing_certs && initialScore.certification_analysis.missing_certs.length > 0 ? `
              <div>
                <div style="font-size: 11px; color: #f59e0b; margin-bottom: 4px;">Consider Adding</div>
                <div>${initialScore.certification_analysis.missing_certs.map(c => `<span style="${tagStyle('#fffbeb', '#92400e')}">${c}</span>`).join('')}</div>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        <!-- ATS Formatting Issues -->
        ${initialScore.formatting_issues && initialScore.formatting_issues.length > 0 ? `
        ${sectionTitle('⚠️ ATS Formatting Issues', '#dc2626', '#fca5a5')}
        ${initialScore.formatting_issues.map(issue => `
          <div style="${cardStyle(
            issue.severity === 'critical' ? '#fef2f2' : issue.severity === 'warning' ? '#fffbeb' : '#fefce8',
            issue.severity === 'critical' ? '#fca5a5' : issue.severity === 'warning' ? '#fde68a' : '#fef08a'
          )} border-left: 4px solid ${issue.severity === 'critical' ? '#dc2626' : issue.severity === 'warning' ? '#f59e0b' : '#eab308'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #1a1a1a; font-size: 13px;">${issue.issue}</strong>
              <span style="${tagStyle(
                issue.severity === 'critical' ? '#fef2f2' : issue.severity === 'warning' ? '#fffbeb' : '#fefce8',
                issue.severity === 'critical' ? '#991b1b' : issue.severity === 'warning' ? '#92400e' : '#854d0e'
              )}">${issue.severity}</span>
            </div>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">→ ${issue.fix}</p>
          </div>
        `).join('')}
        ` : ''}
        
        <!-- Strengths -->
        ${sectionTitle('✅ Strengths')}
        <ul style="margin: 0 0 15px 0; padding-left: 18px;">
          ${initialScore.strengths.map(s => `<li style="color: #166534; margin-bottom: 4px; font-size: 12px;">${s}</li>`).join('')}
        </ul>
        
        <!-- Matched & Missing Keywords -->
        ${sectionTitle('🔑 Keywords Analysis')}
        <div style="margin-bottom: 15px;">
          <div style="font-size: 11px; color: #16a34a; margin-bottom: 6px;">✓ Matched Keywords (${initialScore.matched_keywords.length})</div>
          <div style="margin-bottom: 12px;">
            ${initialScore.matched_keywords.slice(0, 25).map(kw => `<span style="${tagStyle('#dcfce7', '#166534')}">${kw}</span>`).join('')}
            ${initialScore.matched_keywords.length > 25 ? `<span style="color: #666; font-size: 11px;">+${initialScore.matched_keywords.length - 25} more</span>` : ''}
          </div>
          <div style="font-size: 11px; color: #dc2626; margin-bottom: 6px;">✗ Missing Keywords (${initialScore.missing_keywords.length})</div>
          <div>
            ${initialScore.missing_keywords.slice(0, 20).map(kw => `<span style="${tagStyle('#fef2f2', '#991b1b')}">${kw}</span>`).join('')}
          </div>
        </div>
        
        <!-- Skills Gaps -->
        ${initialScore.skills_gaps && initialScore.skills_gaps.length > 0 ? `
        ${sectionTitle('⚠️ Critical Skill Gaps')}
        ${initialScore.skills_gaps.slice(0, 5).map(sg => `
          <div style="${cardStyle('#f9fafb', '#e5e7eb')}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="color: #1a1a1a;">${sg.skill}</strong>
              <span style="${tagStyle(sg.importance === 'critical' ? '#fef2f2' : '#fffbeb', sg.importance === 'critical' ? '#991b1b' : '#92400e')}">${sg.importance}</span>
            </div>
            <p style="margin: 0; color: #666; font-size: 12px;">${sg.context}</p>
          </div>
        `).join('')}
        ` : ''}
        
        <!-- Priority Improvements -->
        ${sectionTitle('🎯 Priority Improvements')}
        ${initialScore.improvements.slice(0, 8).map(imp => `
          <div style="${cardStyle(imp.priority === 'critical' ? '#fef2f2' : imp.priority === 'high' ? '#fffbeb' : '#f9fafb', imp.priority === 'critical' ? '#fca5a5' : imp.priority === 'high' ? '#fde68a' : '#e5e7eb')} border-left: 4px solid ${imp.priority === 'critical' ? '#dc2626' : imp.priority === 'high' ? '#f59e0b' : '#6b7280'};">
            <div style="font-weight: 600; color: #1a1a1a; font-size: 13px;">[${imp.priority.toUpperCase()}] ${imp.issue}</div>
            <div style="color: #666; font-size: 12px; margin-top: 4px;">→ ${imp.fix}</div>
          </div>
        `).join('')}
        
        <!-- Role Fit Assessment -->
        ${sectionTitle('📊 Role Fit Assessment')}
        <div style="${cardStyle('#f9fafb', '#e5e7eb')}">
          <p style="margin: 0; color: #444; font-size: 13px; line-height: 1.6;">${initialScore.role_fit_assessment}</p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; margin-top: 25px; border-top: 1px solid #eee; color: #999; font-size: 11px;">
          <p>Report generated by The Leader's Row | theleadersrow.com</p>
        </div>
      </div>
    `;
    
    const element = document.createElement("div");
    // Put the export DOM off-screen (but fully opaque) so html2canvas captures real pixels.
    // NOTE: opacity: 0 will produce a blank PDF because the rendered pixels are transparent.
    element.style.position = "fixed";
    element.style.left = "-10000px";
    element.style.top = "0";
    element.style.width = "800px";
    element.style.background = "#ffffff";
    element.style.color = "#111111";
    element.style.opacity = "1";
    element.style.pointerEvents = "none";
    element.style.overflow = "visible";
    element.style.zIndex = "2147483647";
    element.innerHTML = reportHtml;
    document.body.appendChild(element);
    
    try {
      // Give the browser time to layout + load fonts before capture (prevents blank PDFs).
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      await html2pdf()
        .set({
          margin: 10,
          filename: "resume-analysis-report.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"], avoid: ["div", "h2", "ul", "li", "p"] },
        })
        .from(element)
        .save();
      
      toast({ title: "Downloaded!", description: "ATS Report saved as PDF" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    } finally {
      document.body.removeChild(element);
    }
  };

  // Download formatted resume as PDF
  const handleDownloadFormattedPDF = async () => {
    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (!content) return;
    
    const { name, headline, contactInfo, summary, experiences, skills, education } = parseResumeContent(content);
    
    const resumeHtml = generateClassicResumeHTML(name, headline, contactInfo, summary, experiences, skills, education);
    
    const element = document.createElement("div");
    // Put the export DOM off-screen (but fully opaque) so html2canvas captures real pixels.
    // NOTE: opacity: 0 will produce a blank PDF because the rendered pixels are transparent.
    element.style.position = "fixed";
    element.style.left = "-10000px";
    element.style.top = "0";
    element.style.width = "800px";
    element.style.background = "#ffffff";
    element.style.color = "#111111";
    element.style.opacity = "1";
    element.style.pointerEvents = "none";
    element.style.overflow = "visible";
    element.style.zIndex = "2147483647";
    element.innerHTML = resumeHtml;
    document.body.appendChild(element);
    
    try {
      // Give the browser time to layout + load fonts before capture (prevents blank PDFs).
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      await html2pdf()
        .set({
          margin: 10,
          filename: "optimized-resume.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(element)
        .save();
      
      toast({ title: "Downloaded!", description: "Resume saved as PDF" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      document.body.removeChild(element);
    }
  };

  // Parse resume content into structured sections - comprehensive parsing
  const parseResumeContent = (content: string) => {
    const lines = content.split('\n');
    let name = "";
    let headline = "";
    let contactInfo: string[] = [];
    let summary = "";
    let experiences: { title: string; company: string; dates: string; bullets: string[] }[] = [];
    let skills: string[] = [];
    let education: { degree: string; school: string; dates: string }[] = [];
    
    let currentSection = "";
    let currentExperience: { title: string; company: string; dates: string; bullets: string[] } | null = null;
    let summaryLines: string[] = [];
    let pendingText: string[] = [];
    
    const sectionHeaders = {
      summary: /^(PROFESSIONAL\s+)?SUMMARY|^PROFILE|^OBJECTIVE|^ABOUT(\s+ME)?$/i,
      experience: /^(PROFESSIONAL\s+|WORK\s+)?EXPERIENCE|^EMPLOYMENT(\s+HISTORY)?|^CAREER(\s+HISTORY)?$/i,
      skills: /^(TECHNICAL\s+|CORE\s+)?SKILLS|^COMPETENCIES|^EXPERTISE|^TECHNOLOGIES$/i,
      education: /^EDUCATION|^ACADEMIC|^QUALIFICATIONS$/i,
      achievements: /^(KEY\s+)?ACHIEVEMENTS|^ACCOMPLISHMENTS|^AWARDS$/i
    };

    const datePattern = /(\d{4}|\w+\.?\s+\d{4})\s*[-–—to]+\s*(\d{4}|Present|Current|Now)/i;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      const cleanLine = trimmed.replace(/^[#*_]+|[#*_]+$/g, '').trim();
      
      // First non-empty line is usually the name
      if (!name && index < 5 && cleanLine.length < 60 && !cleanLine.includes('@') && !cleanLine.match(/\d{3}/)) {
        name = cleanLine;
        return;
      }
      
      // Contact info detection (within first 10 lines)
      if (index < 10 && (cleanLine.includes('@') || cleanLine.match(/\(\d{3}\)|\d{3}[-.\s]\d{3}/) || cleanLine.toLowerCase().includes('linkedin.com'))) {
        const parts = cleanLine.split(/[|•·]/).map(p => p.trim()).filter(p => p);
        contactInfo.push(...parts);
        return;
      }
      
      // Headline detection
      if (!headline && index < 6 && !currentSection && cleanLine.length < 100 && !cleanLine.includes('@')) {
        if (cleanLine.match(/Manager|Engineer|Developer|Designer|Analyst|Director|Lead|Specialist|Consultant|Executive|Product|Senior|Principal/i)) {
          headline = cleanLine;
          return;
        }
      }
      
      // Section header detection
      const cleanUpper = cleanLine.toUpperCase();
      if (sectionHeaders.summary.test(cleanLine) || sectionHeaders.summary.test(cleanUpper)) { 
        currentSection = 'summary'; 
        return; 
      }
      if (sectionHeaders.experience.test(cleanLine) || sectionHeaders.experience.test(cleanUpper)) { 
        if (currentExperience && currentExperience.title) {
          experiences.push(currentExperience);
        }
        currentExperience = null;
        currentSection = 'experience'; 
        return; 
      }
      if (sectionHeaders.skills.test(cleanLine) || sectionHeaders.skills.test(cleanUpper)) { 
        if (currentExperience && currentExperience.title) {
          experiences.push(currentExperience);
          currentExperience = null;
        }
        currentSection = 'skills'; 
        return; 
      }
      if (sectionHeaders.education.test(cleanLine) || sectionHeaders.education.test(cleanUpper)) { 
        if (currentExperience && currentExperience.title) {
          experiences.push(currentExperience);
          currentExperience = null;
        }
        currentSection = 'education'; 
        return; 
      }
      if (sectionHeaders.achievements.test(cleanLine) || sectionHeaders.achievements.test(cleanUpper)) { 
        if (currentExperience && currentExperience.title) {
          experiences.push(currentExperience);
          currentExperience = null;
        }
        currentSection = 'achievements'; 
        return; 
      }
      
      // Process based on current section
      // Define variables outside switch to avoid temporal dead zone issues
      const isBullet = /^[•\-\*▪◦‣→]/.test(cleanLine);
      const hasDate = datePattern.test(cleanLine);
      
      switch (currentSection) {
        case 'summary':
          if (cleanLine && cleanLine.length > 5) {
            summaryLines.push(cleanLine);
          }
          break;
          
        case 'experience': {
          // Job title patterns - must start with these keywords
          const isJobTitle = /^(Senior|Lead|Principal|Staff|Junior|Associate|Director|Manager|VP|Vice\s+President|Head|Chief|Product|Software|Data|UX|UI|Marketing|Sales|Engineering|Technical|Business|Project|Program|Operations)/i.test(cleanLine);
          
          // Detect company/location pattern - company names often have:
          // - Location markers (City, State/Country) 
          // - Common company suffixes (Inc, Corp, LLC, Ltd, Bank, Group, etc.)
          // - Separators like | or - between company and location
          const hasCompanySuffix = /\b(Inc\.?|Corp\.?|LLC|Ltd\.?|Bank|Group|Company|Co\.?|Technologies|Solutions|Services|Consulting|Financial|Capital|Partners|Associates|Healthcare|Media|Entertainment|Retail|Insurance)\b/i.test(cleanLine);
          const hasLocationMarker = /,\s*(CA|NY|TX|FL|WA|MA|IL|PA|OH|GA|NC|NJ|VA|AZ|CO|TN|MD|OR|MN|WI|SC|AL|LA|KY|OK|CT|UT|NV|AR|MS|KS|NM|NE|WV|ID|HI|NH|ME|MT|RI|DE|SD|ND|AK|VT|WY|DC|ON|BC|AB|QC|UK|Germany|Canada|India|Singapore|Australia|Remote)\b/i.test(cleanLine) ||
            /\|\s*[A-Z][a-z]+,?\s*[A-Z]{2}\b/.test(cleanLine);
          const isCompanyLine = hasCompanySuffix || hasLocationMarker;
          
          // A new job entry is detected when:
          // 1. Line starts with job title keyword AND doesn't have company suffix (prevents company lines being treated as titles)
          // 2. OR: Has a date, is short, not a bullet, AND the line starts with title-like text (not company)
          const isNewJobEntry = (isJobTitle && !isBullet && !hasCompanySuffix && !hasLocationMarker) || 
            (hasDate && cleanLine.length < 80 && !isBullet && isJobTitle && !hasCompanySuffix);
          
          // Company info line: has date OR company markers, but NOT a job title pattern at start
          const isCompanyInfoLine = (hasDate || isCompanyLine) && !isJobTitle;
          
          if (isBullet) {
            // Always add bullets to current experience or create one
            if (!currentExperience) {
              currentExperience = { title: "Position", company: "", dates: "", bullets: [] };
            }
            currentExperience.bullets.push(cleanLine.replace(/^[•\-\*▪◦‣→]\s*/, ''));
          } else if (isNewJobEntry) {
            // Save current experience if it has content
            if (currentExperience && (currentExperience.title !== "Position" || currentExperience.bullets.length > 0)) {
              experiences.push(currentExperience);
            }
            const dateMatch = cleanLine.match(datePattern);
            currentExperience = {
              title: cleanLine.replace(datePattern, '').replace(/[|,–—-]\s*$/, '').trim() || "Position",
              company: '',
              dates: dateMatch ? dateMatch[0] : '',
              bullets: []
            };
          } else if (currentExperience && isCompanyInfoLine) {
            // This is company/location/date info for current position
            const dateMatch = cleanLine.match(datePattern);
            if (dateMatch) {
              currentExperience.dates = dateMatch[0];
            }
            // Extract company name - remove date and trailing separators
            const companyText = cleanLine.replace(datePattern, '').replace(/[|,–—-]\s*$/, '').trim();
            if (companyText && !currentExperience.company) {
              // Split on separators and take company part (usually first)
              const parts = companyText.split(/\s*[|–—]\s*/);
              currentExperience.company = parts[0].trim();
              // If there's a location part, could append it
              if (parts.length > 1) {
                currentExperience.company += ' | ' + parts.slice(1).join(' | ');
              }
            }
          } else if (currentExperience && !currentExperience.company && cleanLine.length > 3 && cleanLine.length < 80) {
            // Short line after title without company yet - likely company name
            currentExperience.company = cleanLine;
          } else if (currentExperience && cleanLine.length > 15 && !isCompanyLine) {
            // Long substantial text that isn't company info - treat as bullet
            currentExperience.bullets.push(cleanLine);
          }
          break;
        }
          
        case 'skills': {
          const skillItems = cleanLine.split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 60);
          if (skillItems.length > 0) {
            skills.push(...skillItems);
          } else if (cleanLine.length > 2 && cleanLine.length < 60) {
            skills.push(cleanLine);
          }
          break;
        }
          
        case 'education':
          if (cleanLine.length > 5) {
            education.push({ degree: cleanLine, school: '', dates: '' });
          }
          break;
          
        case 'achievements':
          // Add achievements as bullets to a special experience entry or current one
          if (isBullet || cleanLine.length > 10) {
            if (!currentExperience) {
              currentExperience = { title: "Key Achievements", company: "", dates: "", bullets: [] };
            }
            currentExperience.bullets.push(cleanLine.replace(/^[•\-\*▪◦‣→]\s*/, ''));
          }
          break;
      }
    });
    
    // Don't forget the last experience
    if (currentExperience && (currentExperience.title || currentExperience.bullets.length > 0)) {
      experiences.push(currentExperience);
    }
    
    // Combine summary lines
    summary = summaryLines.join(' ');
    
    // Remove duplicate skills
    skills = [...new Set(skills)];
    
    return { name, headline, contactInfo: [...new Set(contactInfo)], summary, experiences, skills, education };
  };

  // Generate Classic Resume HTML - clean professional single-column format
  const generateClassicResumeHTML = (
    name: string,
    headline: string,
    contactInfo: string[],
    summary: string,
    experiences: any[],
    skills: string[],
    education: any[]
  ) => {
    const content = finalResumeContent || enhancedResume?.enhancedContent || "";

    const escapeHtml = (value: unknown) => {
      const s = String(value ?? "");
      return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    // Only use structured rendering when parsing looks reliable.
    const structuredOk =
      experiences.length > 0 &&
      experiences.some((e: any) => (e?.bullets?.length ?? 0) > 0) &&
      experiences.some(
        (e: any) =>
          (e?.title && e.title !== "Position") || Boolean(e?.company) || Boolean(e?.dates)
      );

    if (!structuredOk) {
      // Fallback: format ALL content directly (preserves every line exactly)
      const lines = content.split("\n");
      let formattedContent = "";
      let wroteName = false;

      const sectionHeaderRegex =
        /^(PROFESSIONAL\s+)?SUMMARY|^PROFILE|^OBJECTIVE|^ABOUT(\s+ME)?$|^(PROFESSIONAL\s+|WORK\s+)?EXPERIENCE|^EMPLOYMENT(\s+HISTORY)?|^CAREER(\s+HISTORY)?$|^(TECHNICAL\s+|CORE\s+)?SKILLS|^COMPETENCIES|^EXPERTISE|^TECHNOLOGIES$|^EDUCATION|^ACADEMIC|^QUALIFICATIONS$|^(KEY\s+)?ACHIEVEMENTS|^ACCOMPLISHMENTS|^AWARDS$/i;
      const dateLineRegex =
        /(\d{4}|\w+\.?\s+\d{4})\s*[-–—to]+\s*(\d{4}|Present|Current|Now)/i;

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          formattedContent += '<div style="height: 8px;"></div>';
          return;
        }

        const clean = trimmed.replace(/^[#*_]+|[#*_]+$/g, "").trim();
        const safe = escapeHtml(clean);

        // Name (first meaningful line, but never treat a section header as name)
        if (!wroteName && idx < 6 && clean.length < 60 && !clean.includes("@") && !sectionHeaderRegex.test(clean)) {
          formattedContent += `<h1 style="font-size: 26px; text-align: center; margin: 0 0 6px 0; letter-spacing: 1px; text-transform: uppercase;">${safe}</h1>`;
          wroteName = true;
          return;
        }

        // Contact line (early)
        if (
          idx < 10 &&
          (clean.includes("@") || clean.match(/\(\d{3}\)|\d{3}[-.\s]\d{3}/) || clean.toLowerCase().includes("linkedin.com"))
        ) {
          formattedContent += `<p style="font-size: 11px; text-align: center; margin: 0 0 6px 0; color: #666;">${safe}</p>`;
          return;
        }

        // Section header
        if (sectionHeaderRegex.test(clean)) {
          formattedContent += `<h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 4px; margin: 18px 0 10px 0; color: #333;">${safe}</h2>`;
          return;
        }

        // Role/date line
        if (dateLineRegex.test(clean) && clean.length < 120) {
          formattedContent += `<p style="font-size: 11px; margin: 10px 0 4px 0; line-height: 1.5; font-weight: 700; color: #222;">${safe}</p>`;
          return;
        }

        // Bullet
        if (/^[•\-\*▪◦‣→]/.test(clean)) {
          const bulletText = escapeHtml(clean.replace(/^[•\-\*▪◦‣→]\s*/, ""));
          formattedContent += `<p style="font-size: 11px; margin: 3px 0 3px 15px; line-height: 1.5; color: #444;">• ${bulletText}</p>`;
          return;
        }

        // Default paragraph
        formattedContent += `<p style="font-size: 11px; margin: 4px 0; line-height: 1.5; color: #444;">${safe}</p>`;
      });

      return `<div style="font-family: 'Georgia', serif; padding: 40px 50px; max-width: 750px; margin: 0 auto; color: #333;">${formattedContent}</div>`;
    }

    // Structured format
    return `
      <div style="font-family: 'Georgia', serif; padding: 40px 50px; max-width: 750px; margin: 0 auto; color: #333;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 12px; page-break-inside: avoid;">
          <h1 style="font-size: 26px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">${escapeHtml(name || "Your Name")}</h1>
          ${headline ? `<p style="font-size: 13px; color: #555; margin: 6px 0 0 0; font-style: italic;">${escapeHtml(headline)}</p>` : ""}
          ${contactInfo.length > 0 ? `<p style="font-size: 11px; color: #666; margin: 8px 0 0 0;">${contactInfo.map(escapeHtml).join(" | ")}</p>` : ""}
        </div>

        ${summary ? `
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 8px 0;">Professional Summary</h2>
          <p style="font-size: 11px; line-height: 1.6; color: #444; margin: 0;">${escapeHtml(summary)}</p>
        </div>
        ` : ""}

        ${experiences.length > 0 ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 10px 0; page-break-after: avoid;">Professional Experience</h2>
          ${experiences.map((exp: any) => `
            <div style="margin-bottom: 14px; page-break-inside: avoid;">
              <div style="font-size: 12px; color: #222; font-weight: 700;">
                <span>${escapeHtml(exp?.title || "Position")}</span>
                ${exp?.dates ? `<span style="float: right; font-size: 10px; color: #666; font-weight: 400;">${escapeHtml(exp.dates)}</span>` : ""}
                <div style="clear: both;"></div>
              </div>
              ${exp?.company ? `<div style="font-size: 11px; color: #555; font-style: italic; margin-top: 2px;">${escapeHtml(exp.company)}</div>` : ""}
              ${(exp?.bullets?.length ?? 0) > 0 ? `
                <div style="margin-top: 6px;">
                  ${exp.bullets
                    .map(
                      (b: string) =>
                        `<div style=\"font-size: 10px; line-height: 1.5; margin: 0 0 3px 0; color: #444;\">• ${escapeHtml(b)}</div>`
                    )
                    .join("")}
                </div>
              ` : ""}
            </div>
          `).join("")}
        </div>
        ` : ""}

        ${skills.length > 0 ? `
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 8px 0;">Skills</h2>
          <p style="font-size: 10px; line-height: 1.6; color: #444; margin: 0;">${skills.map(escapeHtml).join(" • ")}</p>
        </div>
        ` : ""}

        ${education.length > 0 ? `
        <div style="page-break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 8px 0;">Education</h2>
          ${education.map((edu: any) => `<p style="font-size: 11px; margin: 4px 0; color: #444;">${escapeHtml(edu?.degree ?? "")}</p>`).join("")}
        </div>
        ` : ""}
      </div>
    `;
  };

  // Generate Modern Resume HTML - two-column professional format
  const generateModernResumeHTML = (name: string, headline: string, contactInfo: string[], summary: string, experiences: any[], skills: string[], education: any[]) => {
    const content = finalResumeContent || enhancedResume?.enhancedContent || "";
    
    const hasStructuredData = experiences.length > 0;
    
    if (!hasStructuredData) {
      // Fallback: format ALL content as modern single-column
      const lines = content.split('\n');
      let headerContent = '';
      let bodyContent = '';
      let isFirstLine = true;
      
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          bodyContent += '<div style="height: 6px;"></div>';
          return;
        }
        
        if (isFirstLine) {
          headerContent += `<h1 style="font-size: 24px; margin: 0; color: white;">${trimmed}</h1>`;
          isFirstLine = false;
        } else if (idx < 5 && (trimmed.includes('@') || trimmed.match(/\d{3}/))) {
          headerContent += `<p style="font-size: 10px; color: #90cdf4; margin: 4px 0;">${trimmed}</p>`;
        } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && trimmed.length > 3) {
          bodyContent += `<h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 4px; margin: 16px 0 8px 0;">${trimmed}</h2>`;
        } else if (/^[•\-\*▪]/.test(trimmed)) {
          bodyContent += `<p style="font-size: 10px; margin: 3px 0 3px 12px; line-height: 1.5; color: #444;">• ${trimmed.replace(/^[•\-\*▪]\s*/, '')}</p>`;
        } else {
          bodyContent += `<p style="font-size: 10px; margin: 4px 0; line-height: 1.5; color: #444;">${trimmed}</p>`;
        }
      });
      
      return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a365d, #2c5282); color: white; padding: 25px 30px; margin-bottom: 0;">
            ${headerContent}
          </div>
          <div style="padding: 25px 30px;">
            ${bodyContent}
          </div>
        </div>
      `;
    }
    
    // Use structured two-column layout - ALL content included
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 35%; background: linear-gradient(180deg, #1a365d, #234876); color: white; padding: 25px 18px; vertical-align: top;">
              <h1 style="font-size: 20px; margin: 0 0 4px 0; word-wrap: break-word;">${name || "Your Name"}</h1>
              ${headline ? `<p style="font-size: 11px; color: #90cdf4; margin: 0 0 18px 0;">${headline}</p>` : ""}
              
              ${contactInfo.length > 0 ? `
              <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #90cdf4; margin: 0 0 8px 0; border-bottom: 1px solid #3182ce; padding-bottom: 4px;">Contact</h3>
                ${contactInfo.map(c => `<p style="font-size: 9px; margin: 4px 0; word-break: break-all; color: #e2e8f0;">${c}</p>`).join('')}
              </div>
              ` : ""}
              
              ${skills.length > 0 ? `
              <div style="margin-bottom: 20px; page-break-inside: avoid;">
                <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #90cdf4; margin: 0 0 8px 0; border-bottom: 1px solid #3182ce; padding-bottom: 4px;">Skills</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${skills.map(s => `<span style="font-size: 8px; padding: 3px 6px; background: #2c5282; border-radius: 2px; color: #e2e8f0; display: inline-block; margin: 2px;">${s}</span>`).join('')}
                </div>
              </div>
              ` : ""}
              
              ${education.length > 0 ? `
              <div style="page-break-inside: avoid;">
                <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #90cdf4; margin: 0 0 8px 0; border-bottom: 1px solid #3182ce; padding-bottom: 4px;">Education</h3>
                ${education.map(edu => `<p style="font-size: 9px; margin: 4px 0; color: #e2e8f0;">${edu.degree}</p>`).join('')}
              </div>
              ` : ""}
            </td>
            
            <td style="width: 65%; padding: 25px 22px; vertical-align: top;">
              ${summary ? `
              <div style="margin-bottom: 16px; page-break-inside: avoid;">
                <h2 style="font-size: 12px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin: 0 0 8px 0; border-bottom: 2px solid #1a365d; padding-bottom: 4px;">Summary</h2>
                <p style="font-size: 10px; line-height: 1.6; color: #444; margin: 0;">${summary}</p>
              </div>
              ` : ""}
              
              ${experiences.length > 0 ? `
              <div>
                <h2 style="font-size: 12px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin: 0 0 12px 0; border-bottom: 2px solid #1a365d; padding-bottom: 4px; page-break-after: avoid;">Experience</h2>
                ${experiences.map(exp => `
                  <div style="margin-bottom: 12px; page-break-inside: avoid;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                      <strong style="font-size: 11px; color: #1a365d;">${exp.title || "Position"}</strong>
                      ${exp.dates ? `<span style="font-size: 9px; color: #666;">${exp.dates}</span>` : ""}
                    </div>
                    ${exp.company ? `<div style="font-size: 10px; color: #666; margin-top: 1px;">${exp.company}</div>` : ""}
                    ${exp.bullets && exp.bullets.length > 0 ? `
                      <ul style="margin: 5px 0 0 0; padding-left: 14px; list-style-type: disc;">
                        ${exp.bullets.map((b: string) => `<li style="font-size: 9px; line-height: 1.5; margin-bottom: 2px; color: #444;">${b}</li>`).join('')}
                      </ul>
                    ` : ""}
                  </div>
                `).join('')}
              </div>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
    `;
  };

  // Cover letter generation
  const handleGenerateCoverLetter = async () => {
    if (!coverLetterDetails.candidateName.trim()) {
      toast({ title: "Name required", description: "Please enter your name", variant: "destructive" });
      return;
    }

    setIsGeneratingCoverLetter(true);
    setShowCoverLetterDetailsDialog(false);

    const userEmail = getStoredEmail();

    try {
      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          resumeText: enhancedResume?.enhancedContent || resumeText,
          jobDescription,
          candidateName: coverLetterDetails.candidateName,
          candidateEmail: coverLetterDetails.candidateEmail,
          candidatePhone: coverLetterDetails.candidatePhone,
          companyName: coverLetterDetails.companyName,
          hiringManagerName: coverLetterDetails.hiringManagerName,
          selfProjection,
          coverLetterLength,
          email: userEmail,
        },
      });

      if (error) {
        if (error.message?.includes('403') || error.message?.includes('Access denied')) {
          throw new Error("You don't have access to this tool. Please purchase the Resume Intelligence Suite.");
        }
        throw error;
      }
      if (data.error) throw new Error(data.error);

      setGeneratedCoverLetter(data.coverLetter);
      setShowCoverLetterResult(true);
      toast({ title: "Cover letter generated!", description: "Your personalized cover letter is ready" });
    } catch (error: any) {
      console.error("Cover letter error:", error);
      toast({ title: "Generation failed", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!generatedCoverLetter) return;
    
    try {
      const lines = generatedCoverLetter.split('\n');
      const children: Paragraph[] = [];
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          children.push(new Paragraph({ text: "", spacing: { before: 120 } }));
          return;
        }
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: trimmedLine, size: 24, font: "Calibri" })],
            spacing: { before: 60, after: 60 },
          })
        );
      });
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "cover-letter.docx");
      toast({ title: "Downloaded!", description: "Cover letter saved as Word document" });
    } catch (error) {
      console.error("Download error:", error);
      const blob = new Blob([generatedCoverLetter], { type: "text/plain" });
      saveAs(blob, "cover-letter.txt");
      toast({ title: "Downloaded!", description: "Cover letter saved" });
    }
  };

  const handleCopyCoverLetter = async () => {
    if (generatedCoverLetter) {
      await navigator.clipboard.writeText(generatedCoverLetter);
      toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
    }
  };

  // Copy ATS report as text
  const handleCopyReport = async () => {
    if (!initialScore) return;
    const reportText = `ATS Resume Analysis Report
Overall Score: ${Math.round(initialScore.ats_score)}/100

Summary: ${initialScore.summary}

Score Breakdown:
- Keywords: ${initialScore.keyword_match_score}%
- Years of Exp.: ${initialScore.experience_match_score}%
- Skills: ${initialScore.skills_match_score}%
- Format: ${initialScore.format_score}%

Strengths:
${initialScore.strengths.map(s => `• ${s}`).join('\n')}

Missing Keywords:
${initialScore.missing_keywords.slice(0, 15).join(', ')}

Priority Improvements:
${initialScore.improvements.slice(0, 5).map(imp => `[${imp.priority.toUpperCase()}] ${imp.issue}\n  → ${imp.fix}`).join('\n\n')}

Role Fit Assessment: ${initialScore.role_fit_assessment}

Generated by The Leader's Row - Rimo AI Coach`;
    
    await navigator.clipboard.writeText(reportText);
    toast({ title: "Copied!", description: "ATS Report copied to clipboard" });
  };

  // Download cover letter as PDF
  const handleDownloadCoverLetterPDF = async () => {
    if (!generatedCoverLetter) return;
    
    const coverLetterHtml = `
      <div style="font-family: 'Georgia', serif; padding: 60px; max-width: 700px; margin: 0 auto; line-height: 1.7;">
        <div style="white-space: pre-wrap; font-size: 14px; color: #333; page-break-inside: avoid;">
          ${generatedCoverLetter.split('\n\n').map(para => `<p style="margin: 0 0 16px 0; page-break-inside: avoid;">${para.replace(/\n/g, '<br>')}</p>`).join('')}
        </div>
      </div>
    `;
    
    const element = document.createElement("div");
    element.innerHTML = coverLetterHtml;
    document.body.appendChild(element);
    
    try {
      await html2pdf().set({
        margin: 15,
        filename: "cover-letter.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(element).save();
      
      toast({ title: "Downloaded!", description: "Cover letter saved as PDF" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      document.body.removeChild(element);
    }
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
            <div className="flex-1">
              <h1 className="text-2xl font-serif font-bold text-foreground">Resume Intelligence Suite</h1>
              <p className="text-muted-foreground">Score, optimize, and transform your resume for your target role</p>
            </div>
            {/* Start Fresh button for users who want to reset */}
            {(resumeText || jobDescription || initialScore) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={startFresh}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Start Fresh
              </Button>
            )}
          </div>

          {stepIndicator}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Your Resume
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearResume}
                  disabled={!resumeText.trim() && !resumeFileName}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
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
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" /> Target Job Description
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearJobDescription}
                  disabled={!jobDescription.trim()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Clear
                </Button>
              </div>
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
              <Sparkles className="w-4 h-4 text-primary" /> Define Your Professional Brand
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              To stand out in the marketplace, we need to know how you want to be positioned. Share your unique strengths, 
              leadership style, and the value you bring—this helps us craft a resume that authentically represents your brand 
              to hiring managers and recruiters.
            </p>
            <Textarea
              placeholder="Example: I'm a strategic product manager who turns ambiguous problems into clear, actionable roadmaps. My superpower is building trust across engineering, design, and business teams to drive outcomes that matter. I want to be known as a data-informed leader with deep customer empathy who consistently delivers impact..."
              value={selfProjection}
              onChange={(e) => setSelfProjection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2 italic">
              The more specific you are, the more powerfully your resume will position you in the marketplace.
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

          {/* Match Rate Target Banner */}
          {initialScore.match_rate_target && (
            <div className={`text-center mb-4 p-2 rounded-lg ${
              initialScore.match_rate_target.toLowerCase().includes('on track') 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-orange-500/10 border border-orange-500/30'
            }`}>
              <span className={`text-sm font-medium ${
                initialScore.match_rate_target.toLowerCase().includes('on track') 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {initialScore.match_rate_target}
              </span>
            </div>
          )}

          <div className="text-center mb-8">
            <div className={`text-7xl font-bold ${getScoreColor(initialScore.ats_score)}`}>
              {initialScore.ats_score}<span className="text-3xl text-muted-foreground">/100</span>
            </div>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{initialScore.summary}</p>
          </div>

          {/* Primary Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: "Keywords", score: initialScore.keyword_match_score },
              { label: "Years of Exp.", score: initialScore.experience_match_score },
              { label: "Skills", score: initialScore.skills_match_score },
              { label: "Format", score: initialScore.format_score },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </Card>
            ))}
          </div>

          {/* Secondary Score Breakdown - Hard/Soft Skills, Searchability & Measurable Results */}
          {(initialScore.hard_skills_score !== undefined || initialScore.soft_skills_score !== undefined || initialScore.searchability_score !== undefined || initialScore.measurable_results_score !== undefined) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {initialScore.hard_skills_score !== undefined && (
                <Card className="p-3 text-center bg-blue-500/5 border-blue-500/20">
                  <div className={`text-lg font-bold ${getScoreColor(initialScore.hard_skills_score)}`}>
                    {initialScore.hard_skills_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Hard Skills</div>
                </Card>
              )}
              {initialScore.soft_skills_score !== undefined && (
                <Card className="p-3 text-center bg-purple-500/5 border-purple-500/20">
                  <div className={`text-lg font-bold ${getScoreColor(initialScore.soft_skills_score)}`}>
                    {initialScore.soft_skills_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Soft Skills</div>
                </Card>
              )}
              {initialScore.searchability_score !== undefined && (
                <Card className="p-3 text-center bg-teal-500/5 border-teal-500/20">
                  <div className={`text-lg font-bold ${getScoreColor(initialScore.searchability_score)}`}>
                    {initialScore.searchability_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Searchability</div>
                </Card>
              )}
              {initialScore.measurable_results_score !== undefined && (
                <Card className="p-3 text-center bg-amber-500/5 border-amber-500/20">
                  <div className={`text-lg font-bold ${getScoreColor(initialScore.measurable_results_score)}`}>
                    {initialScore.measurable_results_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Metrics</div>
                </Card>
              )}
            </div>
          )}

          {/* Quick Wins - High-impact changes */}
          {initialScore.quick_wins && initialScore.quick_wins.length > 0 && (
            <Card className="p-4 mb-6 border-green-500/30 bg-green-500/5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" /> 
                Quick Wins
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">
                  Immediate impact
                </span>
              </h3>
              <ul className="space-y-2">
                {initialScore.quick_wins.map((win, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">→</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recruiter Tips */}
          {initialScore.recruiter_tips && initialScore.recruiter_tips.length > 0 && (
            <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> 
                Recruiter Tips
                <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full">
                  Pro insights
                </span>
              </h3>
              <ul className="space-y-2">
                {initialScore.recruiter_tips.map((tip, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Job Title Match */}
          {initialScore.job_title_match && (
            <Card className={`p-4 mb-6 ${
              initialScore.job_title_match.match_level === 'exact' || initialScore.job_title_match.match_level === 'strong'
                ? 'border-green-500/30 bg-green-500/5'
                : initialScore.job_title_match.match_level === 'partial'
                ? 'border-orange-500/30 bg-orange-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Job Title Match
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Target Job</div>
                  <div className="font-medium">{initialScore.job_title_match.target_title}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Your Current Title</div>
                  <div className="font-medium">{initialScore.job_title_match.resume_title}</div>
                </div>
              </div>
              {initialScore.job_title_match.recommendation && initialScore.job_title_match.match_level !== 'exact' && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                  → {initialScore.job_title_match.recommendation}
                </p>
              )}
            </Card>
          )}

          {/* Measurable Results Analysis */}
          {initialScore.measurable_results && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" /> Quantified Achievements
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  initialScore.measurable_results.count >= 8 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : initialScore.measurable_results.count >= 4
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {initialScore.measurable_results.count} found ({initialScore.measurable_results.ideal_count})
                </span>
              </h3>
              
              {initialScore.measurable_results.examples_found && initialScore.measurable_results.examples_found.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                    ✓ Strong Quantified Statements Found
                  </div>
                  <ul className="space-y-1.5">
                    {initialScore.measurable_results.examples_found.slice(0, 4).map((example, i) => (
                      <li key={i} className="text-sm text-foreground bg-green-500/5 rounded px-3 py-2 border-l-2 border-green-500">
                        "{example}"
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {initialScore.measurable_results.missing_opportunities && initialScore.measurable_results.missing_opportunities.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">
                    ⚠ Opportunities to Add Metrics
                  </div>
                  <ul className="space-y-1">
                    {initialScore.measurable_results.missing_opportunities.map((opp, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500">→</span> {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          {/* Resume Structure Analysis */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Word Count */}
            {initialScore.word_count_analysis && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Word Count
                </h3>
                <div className={`text-2xl font-bold mb-1 ${
                  initialScore.word_count_analysis.assessment === 'optimal' 
                    ? 'text-green-600' 
                    : 'text-orange-600'
                }`}>
                  ~{initialScore.word_count_analysis.estimated_words} words
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Ideal: {initialScore.word_count_analysis.ideal_range}
                </div>
                <p className="text-sm text-muted-foreground">{initialScore.word_count_analysis.recommendation}</p>
              </Card>
            )}

            {/* Contact Info Check */}
            {initialScore.contact_info_check && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {initialScore.contact_info_check.has_email ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {initialScore.contact_info_check.has_phone ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>Phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {initialScore.contact_info_check.has_linkedin ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <span>LinkedIn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {initialScore.contact_info_check.has_location ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <span>Location</span>
                  </div>
                </div>
                {initialScore.contact_info_check.issues && initialScore.contact_info_check.issues.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    {initialScore.contact_info_check.issues.map((issue, i) => (
                      <p key={i} className="text-xs text-orange-600 dark:text-orange-400">⚠ {issue}</p>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Section Analysis */}
          {initialScore.section_analysis && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Layout className="w-4 h-4" /> Resume Sections
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                    ✓ Sections Found
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {initialScore.section_analysis.sections_found?.map((section, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
                {initialScore.section_analysis.sections_missing && initialScore.section_analysis.sections_missing.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                      ✗ Missing Sections
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.section_analysis.sections_missing.map((section, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900/30 dark:text-red-300">
                          {section}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {initialScore.section_analysis.recommendations && initialScore.section_analysis.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  {initialScore.section_analysis.recommendations.map((rec, i) => (
                    <p key={i} className="text-sm text-muted-foreground">→ {rec}</p>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Bullet Point Analysis */}
          {initialScore.bullet_point_analysis && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileSignature className="w-4 h-4" /> Bullet Point Quality
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">{initialScore.bullet_point_analysis.total_bullets}</div>
                  <div className="text-xs text-muted-foreground">Total Bullets</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${
                    initialScore.bullet_point_analysis.bullets_with_metrics / initialScore.bullet_point_analysis.total_bullets >= 0.5
                      ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {initialScore.bullet_point_analysis.bullets_with_metrics}
                  </div>
                  <div className="text-xs text-muted-foreground">With Metrics</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {initialScore.bullet_point_analysis.average_bullets_per_role.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg per Role</div>
                </div>
              </div>
              
              {initialScore.bullet_point_analysis.weak_bullets && initialScore.bullet_point_analysis.weak_bullets.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                    Weak Bullets to Improve
                  </div>
                  {initialScore.bullet_point_analysis.weak_bullets.slice(0, 3).map((bullet, i) => (
                    <p key={i} className="text-sm text-muted-foreground bg-red-500/5 rounded px-3 py-2 mb-1 border-l-2 border-red-500">
                      "{bullet}"
                    </p>
                  ))}
                </div>
              )}
              
              {initialScore.bullet_point_analysis.strong_bullets && initialScore.bullet_point_analysis.strong_bullets.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                    Strong Bullets (Keep These!)
                  </div>
                  {initialScore.bullet_point_analysis.strong_bullets.slice(0, 2).map((bullet, i) => (
                    <p key={i} className="text-sm text-foreground bg-green-500/5 rounded px-3 py-2 mb-1 border-l-2 border-green-500">
                      "{bullet}"
                    </p>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Industry & Education */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* Industry Alignment */}
            {initialScore.industry_alignment && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Industry Alignment
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-medium">{initialScore.industry_alignment.job_industry}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Your background: </span>
                    <span className="font-medium">{initialScore.industry_alignment.resume_industries?.join(', ')}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    initialScore.industry_alignment.alignment === 'strong' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : initialScore.industry_alignment.alignment === 'moderate'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {initialScore.industry_alignment.alignment} alignment
                  </div>
                </div>
                {initialScore.industry_alignment.recommendation && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                    → {initialScore.industry_alignment.recommendation}
                  </p>
                )}
              </Card>
            )}

            {/* Education Match */}
            {initialScore.education_match && (
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ScrollText className="w-4 h-4" /> Education Match
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Required: </span>
                    <span className="font-medium">{initialScore.education_match.job_requires}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">You have: </span>
                    <span className="font-medium">{initialScore.education_match.resume_shows}</span>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    initialScore.education_match.meets_requirement 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}>
                    {initialScore.education_match.meets_requirement ? '✓ Meets requirement' : '⚠ Gap identified'}
                  </div>
                </div>
                {initialScore.education_match.notes && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                    {initialScore.education_match.notes}
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* Certifications */}
          {initialScore.certification_analysis && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Certifications
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {initialScore.certification_analysis.resume_certs && initialScore.certification_analysis.resume_certs.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                      ✓ Your Certifications
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.certification_analysis.resume_certs.map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {initialScore.certification_analysis.missing_certs && initialScore.certification_analysis.missing_certs.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">
                      Consider Adding
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.certification_analysis.missing_certs.map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Deal Breakers - Show first if any */}
          {initialScore.deal_breakers && initialScore.deal_breakers.length > 0 && (
            <Card className="p-4 mb-6 border-red-500/50 bg-red-500/10">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Deal Breakers
              </h3>
              <ul className="space-y-2">
                {initialScore.deal_breakers.map((db, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span> {db}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Formatting Issues - Critical for ATS */}
          {initialScore.formatting_issues && initialScore.formatting_issues.length > 0 && (
            <Card className="p-4 mb-6 border-red-500/30 bg-red-500/5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" /> 
                ATS Formatting Issues
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full dark:bg-red-900/30 dark:text-red-300">
                  May break ATS parsing
                </span>
              </h3>
              <div className="space-y-3">
                {initialScore.formatting_issues.map((issue, i) => (
                  <div key={i} className={`rounded-lg p-3 ${
                    issue.severity === 'critical' 
                      ? 'bg-red-500/10 border border-red-500/30' 
                      : issue.severity === 'warning' 
                      ? 'bg-orange-500/10 border border-orange-500/30' 
                      : 'bg-yellow-500/10 border border-yellow-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground text-sm">{issue.issue}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        issue.severity === 'critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : issue.severity === 'warning'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">→ {issue.fix}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Hard Skills vs Soft Skills Breakdown */}
          {((initialScore.hard_skills_matched && initialScore.hard_skills_matched.length > 0) || 
            (initialScore.hard_skills_missing && initialScore.hard_skills_missing.length > 0) ||
            (initialScore.soft_skills_matched && initialScore.soft_skills_matched.length > 0) ||
            (initialScore.soft_skills_missing && initialScore.soft_skills_missing.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Hard Skills */}
              <Card className="p-4">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" /> 
                  Hard Skills (Technical)
                </h3>
                {initialScore.hard_skills_matched && initialScore.hard_skills_matched.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                      ✓ Matched ({initialScore.hard_skills_matched.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.hard_skills_matched.slice(0, 12).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                          {skill}
                        </span>
                      ))}
                      {initialScore.hard_skills_matched.length > 12 && (
                        <span className="text-xs text-muted-foreground">+{initialScore.hard_skills_matched.length - 12} more</span>
                      )}
                    </div>
                  </div>
                )}
                {initialScore.hard_skills_missing && initialScore.hard_skills_missing.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                      ✗ Missing ({initialScore.hard_skills_missing.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.hard_skills_missing.slice(0, 10).map((skill, i) => (
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
                {initialScore.soft_skills_matched && initialScore.soft_skills_matched.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                      ✓ Matched ({initialScore.soft_skills_matched.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.soft_skills_matched.slice(0, 10).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {initialScore.soft_skills_missing && initialScore.soft_skills_missing.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">
                      ✗ Missing ({initialScore.soft_skills_missing.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {initialScore.soft_skills_missing.slice(0, 8).map((skill, i) => (
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

          {/* Keyword Format Suggestions */}
          {initialScore.keyword_format_suggestions && initialScore.keyword_format_suggestions.length > 0 && (
            <Card className="p-4 mb-6 border-blue-500/30 bg-blue-500/5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> 
                Keyword Format Tips
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                  Improve searchability
                </span>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use both the acronym AND full form to maximize ATS keyword matching:
              </p>
              <div className="space-y-2">
                {initialScore.keyword_format_suggestions.slice(0, 6).map((suggestion, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-background/50 rounded-lg p-2">
                    <span className="text-muted-foreground line-through">{suggestion.current}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-700 dark:text-green-300 font-medium">{suggestion.suggested}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Experience & Leadership Analysis */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {initialScore.years_experience_analysis && (
              <Card className="p-5 overflow-hidden">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Years of Experience
                </h3>
                <div className="space-y-4">
                  {/* Job Requires */}
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Job Requires
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.years_experience_analysis.job_requires}
                    </p>
                  </div>
                  
                  {/* Resume Shows */}
                  <div className="rounded-lg bg-muted/50 border border-muted p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Your Resume Shows
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.years_experience_analysis.resume_shows}
                    </p>
                  </div>
                  
                  {/* Gap Analysis */}
                  <div className={`rounded-lg p-3 ${
                    initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-orange-500/10 border border-orange-500/30'
                  }`}>
                    <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                      initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      Gap Analysis
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${
                      initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      {initialScore.years_experience_analysis.gap}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {initialScore.leadership_analysis && (
              <Card className="p-5 overflow-hidden">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Leadership & Management
                </h3>
                <div className="space-y-4">
                  {/* Job Requires */}
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Job Requires
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.leadership_analysis.job_requires}
                    </p>
                  </div>
                  
                  {/* Resume Shows */}
                  <div className="rounded-lg bg-muted/50 border border-muted p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Your Resume Shows
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.leadership_analysis.resume_shows}
                    </p>
                  </div>
                  
                  {/* Gap Analysis */}
                  <div className={`rounded-lg p-3 ${
                    initialScore.leadership_analysis.gap.toLowerCase().includes('meets') 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-orange-500/10 border border-orange-500/30'
                  }`}>
                    <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                      initialScore.leadership_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      Gap Analysis
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${
                      initialScore.leadership_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      {initialScore.leadership_analysis.gap}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Skills Gaps */}
          {initialScore.skills_gaps && initialScore.skills_gaps.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Critical Skill Gaps
              </h3>
              <div className="space-y-3">
                {initialScore.skills_gaps.map((sg, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{sg.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sg.importance === 'critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : sg.importance === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {sg.importance}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{sg.context}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tech Stack Gaps */}
          {initialScore.tech_stack_gaps && initialScore.tech_stack_gaps.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {initialScore.tech_stack_gaps.map((tech, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900/30 dark:text-red-300">
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Missing Keywords */}
          {initialScore.missing_keywords.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Keywords ({initialScore.missing_keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {initialScore.missing_keywords.slice(0, 15).map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                    {kw}
                  </span>
                ))}
                {initialScore.missing_keywords.length > 15 && (
                  <span className="text-xs text-muted-foreground">+{initialScore.missing_keywords.length - 15} more</span>
                )}
              </div>
            </Card>
          )}

          {/* Experience Gaps */}
          {initialScore.experience_gaps && initialScore.experience_gaps.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" /> Experience Gaps
              </h3>
              <ul className="space-y-2">
                {initialScore.experience_gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span> {gap}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Top Improvements Needed */}
          {initialScore.improvements.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Top Improvements Needed
              </h3>
              <div className="space-y-3">
                {initialScore.improvements.slice(0, 5).map((imp, i) => (
                  <div key={i} className={`border-l-2 pl-3 ${
                    imp.priority === 'critical' 
                      ? 'border-red-500' 
                      : imp.priority === 'high' 
                      ? 'border-orange-500' 
                      : 'border-yellow-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        imp.priority === 'critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : imp.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {imp.priority}
                      </span>
                    </div>
                    <div className="font-medium text-foreground text-sm">{imp.issue}</div>
                    <div className="text-sm text-muted-foreground">→ {imp.fix}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Role Fit Assessment */}
          {initialScore.role_fit_assessment && (
            <Card className="p-4 mb-6 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-2">Role Fit Assessment</h3>
              <p className="text-sm text-muted-foreground">{initialScore.role_fit_assessment}</p>
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

  // Step 4: Improvements - Review Changes
  if (step === "improvements" && enhancedResume) {
    const totalChanges = 
      enhancedResume.contentImprovements.length + 
      enhancedResume.actionVerbUpgrades.length;
    const acceptedCount = acceptedContentChanges.size + acceptedVerbUpgrades.size;

    const handleUseTransformed = () => {
      setUseFullTransformation(true);
      setFinalResumeContent(enhancedResume.enhancedContent);
    };

    const handleCustomize = () => {
      setUseFullTransformation(false);
      setViewMode("details");
    };

    const proceedToFinal = async () => {
      setIsAnalyzing(true);
      const content = useFullTransformation ? enhancedResume.enhancedContent : buildFinalResume();
      setFinalResumeContent(content);

      try {
        const userEmail = getStoredEmail();
        const accessToken = getAccessToken();

        // Ensure we have at least one form of authentication
        if (!userEmail && !accessToken) {
          toast({
            title: "Access verification failed",
            description: "Please return to the tool access link from your email to re-verify your access.",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              resumeText: content,
              jobDescription,
              isPostTransformation: true,
              email: userEmail,
              accessToken,
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 403) {
            const errorMsg = errorData.error || "Access denied";
            if (errorMsg.includes("Email or access token required")) {
              throw new Error("Access verification failed. Please return to the tool access link from your email to re-verify your access.");
            }
            if (errorMsg.includes("expired")) {
              throw new Error("Your access has expired. Please renew your subscription to continue using this tool.");
            }
            throw new Error("You don't have access to this tool. Please purchase the Resume Intelligence Suite to use this feature.");
          }

          if (response.status === 429) {
            throw new Error("Service is busy. Please wait a moment and try again.");
          }
          if (response.status === 402) {
            throw new Error("AI service temporarily unavailable. Please try again later.");
          }
          throw new Error(errorData.error || "Failed to analyze");
        }

        const data = await response.json();
        setFinalScore(data);
        setStep("final_score");
      } catch (error: any) {
        console.error("Final analysis error:", error);
        const errorMessage = error.name === 'AbortError' 
          ? "Analysis timed out. Please try again."
          : error.message || "Please try again.";
        toast({
          title: "Analysis failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("initial_score")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Resume Has Been Transformed</h1>
              <p className="text-muted-foreground">Review the AI-optimized version and choose how to proceed</p>
            </div>
          </div>

          {stepIndicator}

          {/* Before Optimization Score */}
          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground mb-1">Your Original ATS Score</div>
            <div className={`text-5xl font-bold ${getScoreColor(initialScore?.ats_score || 0)}`}>
              {initialScore?.ats_score || 0}<span className="text-2xl text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Transformation Summary */}
          {enhancedResume.transformationNotes && (
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Transformation Strategy
              </h3>
              <p className="text-sm text-muted-foreground">{enhancedResume.transformationNotes}</p>
            </Card>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === "comparison" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("comparison")}
            >
              <FileText className="w-4 h-4 mr-2" /> Full Resume Comparison
            </Button>
            <Button
              variant={viewMode === "details" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("details")}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> View Individual Changes ({totalChanges})
            </Button>
          </div>

          {viewMode === "comparison" ? (
            <>
              {/* Side-by-Side Full Resume Comparison */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Original Resume */}
                <Card className="p-4 border-red-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <h3 className="font-semibold text-foreground">Original Resume</h3>
                    <span className="text-xs text-muted-foreground ml-auto">ATS Score: {initialScore?.ats_score || 0}</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto rounded-lg bg-muted/30 p-4">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {resumeText}
                    </pre>
                  </div>
                </Card>

                {/* Transformed Resume */}
                <Card className={`p-4 ${useFullTransformation ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-green-500/20'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <h3 className="font-semibold text-foreground">AI-Transformed Resume</h3>
                    {useFullTransformation && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full ml-2">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="max-h-[500px] overflow-y-auto rounded-lg bg-green-500/5 p-4">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {enhancedResume.enhancedContent}
                    </pre>
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.addedKeywords.length}</div>
                  <div className="text-xs text-muted-foreground">Keywords Added</div>
                </Card>
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.quantifiedAchievements.length}</div>
                  <div className="text-xs text-muted-foreground">Achievements Quantified</div>
                </Card>
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.actionVerbUpgrades.length}</div>
                  <div className="text-xs text-muted-foreground">Verbs Upgraded</div>
                </Card>
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.contentImprovements.length}</div>
                  <div className="text-xs text-muted-foreground">Sections Improved</div>
                </Card>
              </div>

              {/* Action Buttons */}
              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4">How would you like to proceed?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={handleUseTransformed}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      useFullTransformation 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {useFullTransformation && <CheckCircle className="w-5 h-5 text-green-500" />}
                      <span className="font-medium text-foreground">Use AI-Transformed Resume</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accept the complete AI transformation. The resume has been fully rewritten to target your job description while preserving your authentic experience.
                    </p>
                  </button>
                  <button
                    onClick={handleCustomize}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      !useFullTransformation 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {!useFullTransformation && <CheckCircle className="w-5 h-5 text-primary" />}
                      <span className="font-medium text-foreground">Customize Individual Changes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review and accept/decline each change individually. Build your final resume by selecting only the improvements you want.
                    </p>
                  </button>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Individual Changes View */}
              <Card className="p-4 mb-6 bg-muted/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {acceptedCount} of {totalChanges} changes accepted
                    </p>
                    <p className="text-xs text-muted-foreground">Toggle each change below or use quick actions</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={acceptAllChanges}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Accept All
                    </Button>
                    <Button variant="outline" size="sm" onClick={declineAllChanges}>
                      Decline All
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Content Improvements */}
              {enhancedResume.contentImprovements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Content Improvements ({enhancedResume.contentImprovements.length})
                  </h3>
                  <div className="space-y-4">
                    {enhancedResume.contentImprovements.map((imp, index) => {
                      const isAccepted = acceptedContentChanges.has(index);
                      return (
                        <Card 
                          key={index} 
                          className={`p-4 transition-all ${isAccepted ? 'border-green-500/50 bg-green-500/5' : 'border-muted opacity-60'}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                                {imp.section}
                              </span>
                              {isAccepted && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Accepted
                                </span>
                              )}
                            </div>
                            <Button
                              variant={isAccepted ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleContentChange(index)}
                              className={isAccepted ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {isAccepted ? (
                                <><CheckCircle className="w-4 h-4 mr-1" /> Accepted</>
                              ) : (
                                "Accept Change"
                              )}
                            </Button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                              <div className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> BEFORE
                              </div>
                              <p className="text-sm text-muted-foreground">{imp.original || "N/A"}</p>
                            </div>
                            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                              <div className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> AFTER
                              </div>
                              <p className="text-sm text-foreground">{imp.improved || "N/A"}</p>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-3 italic border-l-2 border-primary/30 pl-2">
                            💡 {imp.reason}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Verb Upgrades */}
              {enhancedResume.actionVerbUpgrades.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Action Verb Upgrades ({enhancedResume.actionVerbUpgrades.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {enhancedResume.actionVerbUpgrades.map((upgrade, index) => {
                      const isAccepted = acceptedVerbUpgrades.has(index);
                      return (
                        <div
                          key={index}
                          onClick={() => toggleVerbUpgrade(index)}
                          className={`p-3 rounded-lg cursor-pointer transition-all border ${
                            isAccepted 
                              ? 'border-green-500/50 bg-green-500/10' 
                              : 'border-muted bg-muted/20 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isAccepted ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
                            }`}>
                              {isAccepted && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground line-through">{upgrade.original}</span>
                            <ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-foreground font-medium">{upgrade.improved}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Keywords to Add */}
              {enhancedResume.addedKeywords.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Keywords Added ({enhancedResume.addedKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {enhancedResume.addedKeywords.map((kw, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Summary */}
              <Card className="p-4 mb-6 bg-muted/30">
                <h3 className="font-semibold text-foreground mb-2">Your Customized Resume Summary</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {acceptedContentChanges.size} content improvements accepted</li>
                  <li>• {acceptedVerbUpgrades.size} action verb upgrades accepted</li>
                </ul>
              </Card>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => setStep("initial_score")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
            <Button 
              size="lg" 
              onClick={proceedToFinal} 
              disabled={isAnalyzing || (!useFullTransformation && acceptedCount === 0)}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scoring Resume...</>
              ) : (
                <>Get Final Score <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
          {!useFullTransformation && acceptedCount === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please accept at least one change or select the full transformation
            </p>
          )}
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
                  {Math.round(initialScore.ats_score)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Improvement</div>
                <div className={`text-4xl font-bold ${improvement > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  +{Math.round(improvement)}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">After</div>
                <div className={`text-5xl font-bold ${getScoreColor(finalScore.ats_score)}`}>
                  {Math.round(finalScore.ats_score)}
                </div>
              </div>
            </div>
            
            {/* Role Fit Warning */}
            {finalScore.ats_score < 75 && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">This role may not be a good fit for your profile based on the resume</span>
                </div>
              </div>
            )}
          </div>

          {/* Category Improvements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Keywords", before: initialScore.keyword_match_score, after: finalScore.keyword_match_score },
              { label: "Years of Exp.", before: initialScore.experience_match_score, after: finalScore.experience_match_score },
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

          {/* Cover Letter Prompt */}
          {!showCoverLetterResult && !isGeneratingCoverLetter && (
            <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-primary" /> Want a Matching Cover Letter?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our AI can create a personalized cover letter that complements your optimized resume.
                  </p>
                </div>
                <Button onClick={() => setShowCoverLetterDetailsDialog(true)}>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Cover Letter
                </Button>
              </div>
            </Card>
          )}

          {/* Generating Cover Letter */}
          {isGeneratingCoverLetter && (
            <Card className="p-6 mb-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Generating your personalized cover letter...</p>
            </Card>
          )}

          {/* Downloads Section - Organized by Document Type */}
          <div className="space-y-4 mb-8">
            
            {/* ATS Report Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">ATS Report</h3>
                    <p className="text-xs text-muted-foreground">Your complete resume analysis</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyReport}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <FileDown className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </Card>

            {/* Cover Letter Section */}
            {showCoverLetterResult && generatedCoverLetter ? (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Cover Letter</h3>
                      <p className="text-xs text-muted-foreground">Personalized for this role</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyCoverLetter}>
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCoverLetterPDF}>
                      <FileDown className="w-4 h-4 mr-1" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCoverLetter}>
                      <Download className="w-4 h-4 mr-1" /> DOCX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowCoverLetterDetailsDialog(true)}>
                      <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4 max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm">
                  {generatedCoverLetter}
                </div>
              </Card>
            ) : !isGeneratingCoverLetter && (
              <Card className="p-4 border-dashed border-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Cover Letter</h3>
                      <p className="text-xs text-muted-foreground">Generate a matching cover letter for this role</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowCoverLetterDetailsDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate
                  </Button>
                </div>
              </Card>
            )}

            {isGeneratingCoverLetter && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Generating your personalized cover letter...</span>
                </div>
              </Card>
            )}

            {/* Optimized Resume Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Optimized Resume</h3>
                    <p className="text-xs text-muted-foreground">Your ATS-optimized resume ready to use</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyEnhanced}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              
              {/* Download Options */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">Download your optimized resume:</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleDownloadFormattedPDF}>
                    <FileDown className="w-4 h-4 mr-1" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadResume}>
                    <Download className="w-4 h-4 mr-1" /> DOCX
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Another
            </Button>
            <Button onClick={onComplete}>
              Done
            </Button>
          </div>

          {/* Cover Letter Details Dialog */}
          <Dialog open={showCoverLetterDetailsDialog} onOpenChange={setShowCoverLetterDetailsDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-primary" />
                  Cover Letter Details
                </DialogTitle>
                <DialogDescription>
                  Provide your details to create a personalized cover letter.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Your Name *</Label>
                    <Input
                      id="candidateName"
                      placeholder="John Smith"
                      value={coverLetterDetails.candidateName}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, candidateName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidateEmail">Email</Label>
                    <Input
                      id="candidateEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={coverLetterDetails.candidateEmail}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidatePhone">Phone (optional)</Label>
                    <Input
                      id="candidatePhone"
                      placeholder="+1 (555) 123-4567"
                      value={coverLetterDetails.candidatePhone}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, candidatePhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name (optional)</Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Inc."
                      value={coverLetterDetails.companyName}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiringManager">Hiring Manager Name (optional)</Label>
                  <Input
                    id="hiringManager"
                    placeholder="Jane Doe"
                    value={coverLetterDetails.hiringManagerName}
                    onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, hiringManagerName: e.target.value }))}
                  />
                </div>
                
                {/* Cover Letter Length Selection */}
                <div className="space-y-3 pt-2 border-t">
                  <Label>Cover Letter Length</Label>
                  <RadioGroup 
                    value={coverLetterLength} 
                    onValueChange={(value) => setCoverLetterLength(value as CoverLetterLength)}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="short" id="short" className="mt-1" />
                      <div>
                        <Label htmlFor="short" className="font-medium cursor-pointer">Short</Label>
                        <p className="text-xs text-muted-foreground">~200 words, concise</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="medium" id="medium" className="mt-1" />
                      <div>
                        <Label htmlFor="medium" className="font-medium cursor-pointer">Medium</Label>
                        <p className="text-xs text-muted-foreground">~350 words, balanced</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" className="mt-1" />
                      <div>
                        <Label htmlFor="detailed" className="font-medium cursor-pointer">Detailed</Label>
                        <p className="text-xs text-muted-foreground">~500 words, comprehensive</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button className="w-full" onClick={handleGenerateCoverLetter}>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate {coverLetterLength.charAt(0).toUpperCase() + coverLetterLength.slice(1)} Cover Letter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return null;
}
