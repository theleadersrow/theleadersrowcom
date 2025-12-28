import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Linkedin, ArrowLeft, ArrowRight, Sparkles, CheckCircle, 
  Target, Eye, MessageSquare, TrendingUp, AlertCircle, Copy, Loader2, FileText, RefreshCw, Upload, Link, Briefcase,
  Wand2, Search, CheckSquare, Square, Zap, Users, Star, Mail, Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

interface HeadlineOption {
  headline: string;
  style: string;
  whyItWorks: string;
}

interface RecruiterSimulation {
  searchVisibility: {
    score: number;
    ranking: string;
  };
  matchingKeywords: Array<{
    keyword: string;
    frequency: string;
    importance: string;
  }>;
  missingKeywords: Array<{
    keyword: string;
    searchVolume: string;
    recommendation: string;
  }>;
  recruiterSearchQueries: Array<{
    query: string;
    wouldMatch: boolean;
    reason: string;
  }>;
  inMailLikelihood: {
    score: number;
    factors: string[];
  };
  topRecommendations: Array<{
    action: string;
    impact: string;
  }>;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

interface OutreachMessage {
  message: string;
  context: string;
  tips?: string[];
  subject?: string;
}

interface OutreachMessages {
  recruiterConnection: OutreachMessage;
  hiringManagerConnection: OutreachMessage;
  coldEmail: OutreachMessage & { subject: string };
  followUpMessage: { message: string; context: string };
  personalizationTips: string[];
}

type Step = "input" | "analyzing" | "score" | "improving" | "suggestions" | "checklist" | "headlines" | "about" | "recruiter-sim" | "outreach" | "rescore-input" | "rescoring";

// Helper function to get stored email from localStorage
const getStoredEmail = (): string | undefined => {
  try {
    // First check linkedin_suite_access (the correct key used by RimoLanding)
    const linkedinAccess = localStorage.getItem("linkedin_suite_access");
    if (linkedinAccess) {
      const parsed = JSON.parse(linkedinAccess);
      if (parsed.email) return parsed.email;
    }
    // Fallback to resume_suite_access
    const resumeAccess = localStorage.getItem("resume_suite_access");
    if (resumeAccess) {
      const parsed = JSON.parse(resumeAccess);
      if (parsed.email) return parsed.email;
    }
    // Also check interview_prep_access
    const interviewAccess = localStorage.getItem("interview_prep_access");
    if (interviewAccess) {
      const parsed = JSON.parse(interviewAccess);
      if (parsed.email) return parsed.email;
    }
  } catch (e) {
    console.error("Error reading stored access:", e);
  }
  return undefined;
};

const LINKEDIN_SUITE_ACCESS_KEY = "linkedin_suite_access";

interface AccessInfo {
  hasAccess: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  email?: string;
}

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

  // Access and payment states
  const [accessInfo, setAccessInfo] = useState<AccessInfo>({ hasAccess: false });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentEmail, setPaymentEmail] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // New feature states
  const [headlineOptions, setHeadlineOptions] = useState<HeadlineOption[]>([]);
  const [selectedHeadline, setSelectedHeadline] = useState<string>("");
  const [generatedAbout, setGeneratedAbout] = useState<string>("");
  const [aboutKeyElements, setAboutKeyElements] = useState<string[]>([]);
  const [recruiterSim, setRecruiterSim] = useState<RecruiterSimulation | null>(null);
  const [outreachMessages, setOutreachMessages] = useState<OutreachMessages | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [liveScorePreview, setLiveScorePreview] = useState<number | null>(null);
  
  // Expandable checklist item states
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  // Check access on mount
  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = () => {
    try {
      const stored = localStorage.getItem(LINKEDIN_SUITE_ACCESS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiry && new Date(parsed.expiry) > new Date()) {
          const daysRemaining = Math.ceil((new Date(parsed.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          setAccessInfo({ 
            hasAccess: true, 
            expiresAt: new Date(parsed.expiry).toISOString(),
            daysRemaining,
            email: parsed.email 
          });
          return;
        }
      }
    } catch (e) {
      console.error("Error checking access:", e);
    }
    setAccessInfo({ hasAccess: false });
  };

  const handlePaymentCheckout = async () => {
    if (!paymentEmail.trim() || !paymentEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-tool-subscription", {
        body: { email: paymentEmail.trim(), toolType: "linkedin_signal" },
      });

      if (error) throw error;

      if (data?.url) {
        localStorage.setItem("pending_purchase_email", paymentEmail.trim());
        localStorage.setItem("pending_purchase_tool", "linkedin_signal");
        window.open(data.url, "_blank");
        setShowPaymentDialog(false);
        toast.success("Checkout opened in new tab. Complete payment to unlock Pro features.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Change detection for rescore
  const detectedChanges = useMemo(() => {
    if (!profileText || !updatedProfileText) return null;
    
    const originalLines = profileText.trim().split('\n').filter(l => l.trim());
    const updatedLines = updatedProfileText.trim().split('\n').filter(l => l.trim());
    
    const originalSet = new Set(originalLines.map(l => l.trim().toLowerCase()));
    const updatedSet = new Set(updatedLines.map(l => l.trim().toLowerCase()));
    
    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];
    
    // Find added lines
    updatedLines.forEach(line => {
      const normalized = line.trim().toLowerCase();
      if (!originalSet.has(normalized)) {
        // Check if it's a modification of an existing line
        const similarOriginal = originalLines.find(ol => {
          const olNorm = ol.trim().toLowerCase();
          const similarity = calculateSimilarity(olNorm, normalized);
          return similarity > 0.5 && similarity < 0.95;
        });
        if (similarOriginal) {
          modified.push(line.trim());
        } else {
          added.push(line.trim());
        }
      }
    });
    
    // Find removed lines
    originalLines.forEach(line => {
      const normalized = line.trim().toLowerCase();
      if (!updatedSet.has(normalized)) {
        const similarUpdated = updatedLines.find(ul => {
          const ulNorm = ul.trim().toLowerCase();
          const similarity = calculateSimilarity(ulNorm, normalized);
          return similarity > 0.5 && similarity < 0.95;
        });
        if (!similarUpdated) {
          removed.push(line.trim());
        }
      }
    });
    
    const hasChanges = added.length > 0 || removed.length > 0 || modified.length > 0;
    const normalizedOriginal = profileText.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ').toLowerCase();
    const normalizedUpdated = updatedProfileText.trim().replace(/\r\n/g, '\n').replace(/\s+/g, ' ').toLowerCase();
    const isIdentical = normalizedOriginal === normalizedUpdated;
    
    return { added, removed, modified, hasChanges, isIdentical };
  }, [profileText, updatedProfileText]);

  // Simple similarity calculation (Jaccard-like)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  };

  // Initialize checklist when suggestions are available
  useEffect(() => {
    if (suggestions && analysis) {
      setChecklist([
        {
          id: "headline",
          label: "Update Your Headline",
          description: "Use our AI headline generator to create attention-grabbing options",
          completed: false,
          action: () => setStep("headlines")
        },
        {
          id: "about",
          label: "Rewrite Your About Section",
          description: "Get an AI-crafted summary that tells your career story",
          completed: false,
          action: () => setStep("about")
        },
        {
          id: "keywords",
          label: "Add Missing Keywords",
          description: `Add these keywords: ${suggestions.keywordAdditions.slice(0, 3).join(", ")}...`,
          completed: false
        },
        {
          id: "experience",
          label: "Update Experience Bullets",
          description: `${suggestions.experienceRewrites.length} bullets need improvement`,
          completed: false
        },
        {
          id: "skills",
          label: "Add Recommended Skills",
          description: `Add: ${suggestions.skillsToAdd.slice(0, 3).join(", ")}...`,
          completed: false
        },
        {
          id: "outreach",
          label: "Draft Outreach Messages",
          description: "Generate personalized connection requests & cold emails",
          completed: false,
          action: () => handleGenerateOutreach()
        },
        {
          id: "recruiter",
          label: "Check Recruiter Visibility",
          description: "See how recruiters will find your profile",
          completed: false,
          action: () => handleRecruiterSimulation()
        }
      ]);
    }
  }, [suggestions, analysis]);

  const handleFetchLinkedInProfile = async () => {
    if (!linkedinUrl.trim() || !linkedinUrl.includes("linkedin.com")) {
      toast.error("Please enter a valid LinkedIn URL");
      return;
    }

    setIsFetchingProfile(true);

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("scrape-linkedin", {
        body: { linkedinUrl, email },
      });

      if (error) {
        if (error.message?.includes('403') || error.message?.includes('Access denied') || error.message?.includes('access')) {
          if (error.message?.includes('expired')) {
            toast.error("Your access has expired. Please renew your subscription.");
          } else {
            toast.error("You don't have access to this tool. Please purchase the LinkedIn Signal Score to use this feature.");
          }
          return;
        }
        throw error;
      }

      if (data.profileContent) {
        setProfileText(data.profileContent);
        toast.success("Profile content generated! Please review and edit to match your actual profile.");
      }
    } catch (error: any) {
      console.error("Error fetching LinkedIn profile:", error);
      if (error.message?.includes('access') || error.message?.includes('403')) {
        toast.error(error.message);
      } else {
        toast.error("Could not fetch profile. Please paste your content manually.");
        window.open(linkedinUrl, "_blank");
      }
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
      if (file.type === 'text/plain') {
        const text = await file.text();
        setResumeText(text);
        toast.success("Resume loaded successfully!");
        setIsUploadingResume(false);
        return;
      }

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
      if (resumeFileInputRef.current) {
        resumeFileInputRef.current.value = "";
      }
    }
  };

  const handleAnalyze = async () => {
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

    if (!hasProfileContent && hasLinkedInUrl) {
      setIsFetchingProfile(true);
      try {
        const email = getStoredEmail();
        const { data, error } = await supabase.functions.invoke("scrape-linkedin", {
          body: { linkedinUrl, email },
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
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
          profileText,
          resumeText,
          requestType: "score",
          email,
        },
      });

      if (error) {
        if (error.message?.includes('403') || error.message?.includes('Access denied') || error.message?.includes('access')) {
          if (error.message?.includes('expired')) {
            toast.error("Your access has expired. Please renew your subscription to continue using this tool.");
          } else {
            toast.error("You don't have access to this tool. Please purchase the LinkedIn Signal Score to use this feature.");
          }
          setStep("input");
          return;
        }
        throw error;
      }
      setAnalysis(data.analysis);
      setStep("score");
    } catch (error: any) {
      console.error("Error analyzing LinkedIn:", error);
      if (error.message?.includes('access') || error.message?.includes('403')) {
        toast.error(error.message);
      } else {
        toast.error("Failed to analyze profile. Please try again.");
      }
      setStep("input");
    }
  };

  const handleGetSuggestions = async () => {
    setStep("improving");

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
          profileText,
          resumeText,
          requestType: "improve",
          email,
        },
      });

      if (error) {
        if (error.message?.includes('403') || error.message?.includes('Access denied') || error.message?.includes('access')) {
          if (error.message?.includes('expired')) {
            toast.error("Your access has expired. Please renew your subscription.");
          } else {
            toast.error("You don't have access to this tool. Please purchase the LinkedIn Signal Score.");
          }
          setStep("score");
          return;
        }
        throw error;
      }
      setSuggestions(data.suggestions);
      setStep("checklist"); // Go to interactive checklist instead of suggestions
    } catch (error: any) {
      console.error("Error getting suggestions:", error);
      if (error.message?.includes('access') || error.message?.includes('403')) {
        toast.error(error.message);
      } else {
        toast.error("Failed to generate suggestions. Please try again.");
      }
      setStep("score");
    }
  };

  const handleGenerateHeadlines = async () => {
    setIsGenerating(true);
    setStep("headlines");

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
          profileText,
          resumeText,
          requestType: "generate_headlines",
          email,
        },
      });

      if (error) throw error;
      setHeadlineOptions(data.headlines || []);
      updateChecklistItem("headline", true);
    } catch (error) {
      console.error("Error generating headlines:", error);
      toast.error("Failed to generate headlines. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAbout = async () => {
    setIsGenerating(true);
    setStep("about");

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
          profileText,
          resumeText,
          requestType: "generate_about",
          email,
        },
      });

      if (error) throw error;
      setGeneratedAbout(data.aboutSection || "");
      setAboutKeyElements(data.keyElements || []);
      updateChecklistItem("about", true);
    } catch (error) {
      console.error("Error generating About section:", error);
      toast.error("Failed to generate About section. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecruiterSimulation = async () => {
    setIsGenerating(true);
    setStep("recruiter-sim");

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
          profileText,
          resumeText,
          requestType: "recruiter_simulation",
          email,
        },
      });

      if (error) throw error;
      setRecruiterSim(data);
      updateChecklistItem("recruiter", true);
    } catch (error) {
      console.error("Error running recruiter simulation:", error);
      toast.error("Failed to run recruiter simulation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateOutreach = async () => {
    setIsGenerating(true);
    setStep("outreach");

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          targetJobDescription,
          profileText,
          resumeText,
          requestType: "generate_outreach",
          email,
        },
      });

      if (error) throw error;
      setOutreachMessages(data);
      updateChecklistItem("outreach", true);
    } catch (error) {
      console.error("Error generating outreach messages:", error);
      toast.error("Failed to generate outreach messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateChecklistItem = (id: string, completed: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed } : item
    ));
  };

  const handleStartRescore = () => {
    setUpdatedProfileText(profileText);
    setPreviousAnalysis(analysis);
    setStep("rescore-input");
  };

  // Helper to normalize text for comparison (remove extra whitespace, normalize line endings)
  const normalizeText = (text: string): string => {
    return text
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  const handleRescore = async () => {
    if (!updatedProfileText.trim()) {
      toast.error("Please paste your updated LinkedIn profile");
      return;
    }

    // Check if the profile content has actually changed
    const normalizedOriginal = normalizeText(profileText);
    const normalizedUpdated = normalizeText(updatedProfileText);
    
    if (normalizedOriginal === normalizedUpdated) {
      // No meaningful changes detected - keep the same score
      toast.info("No changes detected in your profile. Your score remains the same.", {
        description: "Make updates to your LinkedIn profile to see score improvements."
      });
      setStep("score");
      return;
    }

    setStep("rescoring");

    try {
      const email = getStoredEmail();
      const { data, error } = await supabase.functions.invoke("analyze-linkedin", {
        body: {
          linkedinUrl,
          targetIndustry,
          targetRole,
          profileText: updatedProfileText,
          resumeText,
          requestType: "score",
          email,
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
      setStep("checklist");
    }
  };

  // Live score preview as user types in rescore
  useEffect(() => {
    if (step === "rescore-input" && updatedProfileText.length > 100) {
      const timer = setTimeout(() => {
        // Simple heuristic: estimate score improvement based on text changes
        if (previousAnalysis) {
          const lengthImprovement = Math.min((updatedProfileText.length - profileText.length) / 100, 10);
          const hasKeywords = suggestions?.keywordAdditions.some(k => 
            updatedProfileText.toLowerCase().includes(k.toLowerCase())
          );
          const keywordBonus = hasKeywords ? 5 : 0;
          const estimated = Math.min(previousAnalysis.overallScore + lengthImprovement + keywordBonus, 100);
          setLiveScorePreview(Math.round(estimated));
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [updatedProfileText, step, previousAnalysis, profileText, suggestions]);

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

  const completedItems = checklist.filter(item => item.completed).length;
  const progressPercentage = checklist.length > 0 ? (completedItems / checklist.length) * 100 : 0;

  // Input step
  if (step === "input") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Career Coach Hub
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Linkedin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            LinkedIn Profile Signal Score
          </h1>
          <p className="text-muted-foreground">
            Get your profile scored the way recruiters see it, then use our AI tools to boost your visibility.
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Profile Content {!linkedinUrl.includes("linkedin.com") && <span className="text-destructive">*</span>}
              </label>
              <Textarea
                placeholder="Click 'Fetch Profile' above or paste your LinkedIn headline, about section, and experience here..."
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                className="min-h-[180px]"
              />
            </div>

            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Your Resume (optional but recommended)
              </label>
              
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

              {resumeText && (
                <p className="text-xs text-green-600 mb-2">✓ Resume loaded ({resumeText.length} characters)</p>
              )}

              <Textarea
                placeholder="Or paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleAnalyze} className="w-full" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze My Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading states
  if (step === "analyzing" || step === "improving" || step === "rescoring") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
          {step === "analyzing" ? "Analyzing Your Profile" : step === "improving" ? "Creating Your Optimization Plan" : "Re-Scoring Your Profile"}
        </h2>
        <p className="text-muted-foreground">
          {step === "analyzing" 
            ? "Our AI is reviewing your profile through the lens of a recruiter..."
            : step === "improving"
            ? "Building personalized recommendations to maximize your visibility..."
            : "Comparing your updated profile against the previous version..."}
        </p>
      </div>
    );
  }

  // Score display
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
          
          {analysis.potentialImprovement && analysis.potentialImprovement > 0 && !previousAnalysis && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">
                +{analysis.potentialImprovement}% improvement possible
              </span>
            </div>
          )}
          
          {scoreImprovement !== null && scoreImprovement > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">+{scoreImprovement} points improvement!</span>
            </div>
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

        {/* Free vs Pro Comparison */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-border bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Free Analysis ✓
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> Overall Signal Score</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> 6 Profile Dimension Scores</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> Strengths & Critical Gaps</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" /> Recruiter Perspective Preview</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/40 bg-gradient-to-br from-blue-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Pro Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> AI Headline Generator (5+ options)</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> About Section Rewriter</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> Experience Bullet Rewrites</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> Recruiter Search Simulation</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> Keyword & Skills Optimization</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> Personalized Outreach Messages</li>
                <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" /> Re-score After Changes</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Get AI Help CTA */}
        <Card className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-transparent">
          <CardContent className="py-6 text-center">
            <Zap className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Ready to Boost Your Score?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get a personalized optimization checklist with AI-powered tools to rewrite your headline, 
              about section, and see how recruiters will find you.
            </p>
            {accessInfo.hasAccess ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-4 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Pro Access Active ({accessInfo.daysRemaining} days remaining)</span>
                </div>
                <Button onClick={handleGetSuggestions} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get My Optimization Plan
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-foreground">$99</span>
                  <span className="text-muted-foreground">/ quarter</span>
                </div>
                <Button onClick={() => setShowPaymentDialog(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Unlock Pro Optimization
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-blue-600" />
                LinkedIn Signal Score Pro
              </DialogTitle>
              <DialogDescription>
                Unlock all optimization features for 3 months.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">$99</span>
                <span className="text-muted-foreground ml-2">/ quarter</span>
                <p className="text-xs text-muted-foreground mt-1">Auto-renews every 3 months. Cancel anytime.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="payment-email" className="text-sm font-medium text-foreground">
                  Your email address
                </label>
                <Input
                  id="payment-email"
                  type="email"
                  placeholder="you@example.com"
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  For access confirmation & backup access link
                </p>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI Headline Generator</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> About Section Rewriter</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Experience Bullet Rewrites</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Recruiter Search Simulation</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Personalized Outreach Messages</li>
              </ul>
              <Button onClick={handlePaymentCheckout} className="w-full" size="lg" disabled={isProcessingPayment}>
                {isProcessingPayment ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <>Continue to Payment</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Interactive Checklist
  if (step === "checklist" && suggestions && analysis) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("score")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Score
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Your Profile Optimization Checklist</h1>
          <p className="text-muted-foreground mb-4">
            Complete each step to maximize your LinkedIn visibility
          </p>
          <div className="flex items-center justify-center gap-4">
            <Progress value={progressPercentage} className="w-48 h-3" />
            <span className="text-sm font-medium">{completedItems}/{checklist.length} complete</span>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {checklist.map((item, index) => {
            const isExpanded = expandedItems.has(item.id);
            const toggleExpand = () => {
              setExpandedItems(prev => {
                const newSet = new Set(prev);
                if (newSet.has(item.id)) {
                  newSet.delete(item.id);
                } else {
                  newSet.add(item.id);
                }
                return newSet;
              });
            };

            // Items 3 (keywords), 4 (experience), 5 (skills) are expandable
            const isExpandable = ["keywords", "experience", "skills"].includes(item.id);
            
            return (
              <Card 
                key={item.id} 
                className={`transition-all ${item.completed ? 'bg-green-500/5 border-green-500/30' : 'hover:border-primary/50'}`}
              >
                <CardContent className="p-4">
                  <div 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => {
                      if (isExpandable) {
                        toggleExpand();
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                  >
                    <div className="flex-shrink-0">
                      {item.completed ? (
                        <CheckSquare className="w-6 h-6 text-green-500" />
                      ) : (
                        <Square className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${item.completed ? 'text-green-700 line-through' : ''}`}>
                        {index + 1}. {item.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {item.action && !item.completed && !isExpandable && (
                      <Button size="sm" variant="outline">
                        <Wand2 className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    {isExpandable && (
                      <ArrowRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </div>

                  {/* Expandable Content for Keywords */}
                  {item.id === "keywords" && isExpanded && suggestions && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Select keywords to add to your profile:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {suggestions.keywordAdditions.map((keyword, i) => {
                          const isSelected = selectedKeywords.has(keyword);
                          return (
                            <button
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedKeywords(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(keyword)) {
                                    newSet.delete(keyword);
                                  } else {
                                    newSet.add(keyword);
                                  }
                                  return newSet;
                                });
                              }}
                              className={`px-3 py-1.5 text-sm rounded-full transition-all border flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-blue-500/20 text-blue-700 border-blue-500 dark:text-blue-300'
                                  : 'bg-muted/50 text-muted-foreground border-muted hover:border-blue-500/50'
                              }`}
                            >
                              {isSelected && <CheckCircle className="w-3 h-3" />}
                              {keyword}
                            </button>
                          );
                        })}
                      </div>
                      {selectedKeywords.size > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedKeywords.size} keywords selected
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const keywordText = Array.from(selectedKeywords).join(", ");
                              navigator.clipboard.writeText(keywordText);
                              toast.success("Keywords copied to clipboard!");
                              updateChecklistItem("keywords", true);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Selected
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expandable Content for Experience Bullets */}
                  {item.id === "experience" && isExpanded && suggestions && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      {suggestions.experienceRewrites.slice(0, 3).map((exp, i) => {
                        const expKey = `exp-${i}`;
                        const isExpExpanded = expandedItems.has(expKey);
                        return (
                          <div key={i} className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{exp.companyRole}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(exp.improved);
                                  toast.success("Improved bullet copied!");
                                }}
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                <span className="text-xs">Copy</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">{exp.whyBetter}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedItems(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(expKey)) {
                                    newSet.delete(expKey);
                                  } else {
                                    newSet.add(expKey);
                                  }
                                  return newSet;
                                });
                              }}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              {isExpExpanded ? "Hide improved text ▲" : "View improved text ▼"}
                            </button>
                            {isExpExpanded && (
                              <div className="mt-2 p-3 rounded-md bg-green-500/5 border border-green-500/20">
                                <p className="text-sm text-foreground">{exp.improved}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateChecklistItem("experience", true);
                          toast.success("Experience marked as reviewed!");
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark as Done
                      </Button>
                    </div>
                  )}

                  {/* Expandable Content for Skills */}
                  {item.id === "skills" && isExpanded && suggestions && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Recommended skills by priority:</p>
                      <div className="space-y-2 mb-4">
                        {suggestions.skillsToAdd.map((skill, i) => {
                          const priority = i < 3 ? "high" : i < 6 ? "medium" : "low";
                          const isSelected = selectedSkills.has(skill);
                          return (
                            <div
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSkills(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(skill)) {
                                    newSet.delete(skill);
                                  } else {
                                    newSet.add(skill);
                                  }
                                  return newSet;
                                });
                              }}
                              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-purple-500/10 border-purple-500/50'
                                  : 'bg-muted/30 border-muted hover:border-purple-500/30'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected ? 'border-purple-500 bg-purple-500' : 'border-muted-foreground'
                                }`}>
                                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                                <span className="font-medium text-sm">{skill}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                priority === 'high' ? 'bg-red-500/10 text-red-600' :
                                priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                                'bg-gray-500/10 text-gray-600'
                              }`}>
                                {priority} priority
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {selectedSkills.size > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {selectedSkills.size} skills selected
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const skillText = Array.from(selectedSkills).join(", ");
                              navigator.clipboard.writeText(skillText);
                              toast.success("Skills copied to clipboard!");
                              updateChecklistItem("skills", true);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Selected
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:border-blue-500/50 transition-all" onClick={handleGenerateHeadlines}>
            <CardContent className="p-4 text-center">
              <Wand2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">AI Headlines</h3>
              <p className="text-xs text-muted-foreground">Generate 5 options</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-purple-500/50 transition-all" onClick={handleGenerateAbout}>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">AI About Section</h3>
              <p className="text-xs text-muted-foreground">Write my summary</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-orange-500/50 transition-all" onClick={handleGenerateOutreach}>
            <CardContent className="p-4 text-center">
              <Send className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Outreach Drafter</h3>
              <p className="text-xs text-muted-foreground">Connection requests</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-green-500/50 transition-all" onClick={handleRecruiterSimulation}>
            <CardContent className="p-4 text-center">
              <Search className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Recruiter Sim</h3>
              <p className="text-xs text-muted-foreground">See how I appear</p>
            </CardContent>
          </Card>
        </div>

        {/* View All Suggestions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Quick Copy: Keywords & Skills to Add</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Keywords:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.keywordAdditions.map((keyword, i) => (
                  <span 
                    key={i} 
                    className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-500/20"
                    onClick={() => copyToClipboard(keyword, "Keyword")}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.skillsToAdd.map((skill, i) => (
                  <span 
                    key={i} 
                    className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full cursor-pointer hover:bg-purple-500/20"
                    onClick={() => copyToClipboard(skill, "Skill")}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Reminder */}
        <Card className="border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Important: Update LinkedIn First!
                </h4>
                <p className="text-sm text-muted-foreground">
                  To get the most accurate results from this tool, make sure to <strong>update your actual LinkedIn profile</strong> with the suggested changes before re-scoring. The re-score feature analyzes the text you paste — so copy your updated profile directly from LinkedIn after making changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Re-Score CTA */}
        <Card className="border-2 border-green-500/30 bg-gradient-to-r from-green-500/5 to-transparent">
          <CardContent className="py-6 text-center">
            <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Made Changes? Re-Score!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              After updating your LinkedIn, paste your new profile content to see your improvement!
            </p>
            <Button onClick={handleStartRescore} size="lg" variant="outline" className="border-green-500/50 hover:bg-green-500/10">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-Score My Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI Headline Generator
  if (step === "headlines") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("checklist")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Checklist
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">AI Headline Generator</h1>
          <p className="text-muted-foreground">
            Choose from 5 attention-grabbing headline options tailored for {targetRole}
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Crafting your perfect headlines...</p>
          </div>
        ) : headlineOptions.length > 0 ? (
          <div className="space-y-4">
            {headlineOptions.map((option, i) => (
              <Card 
                key={i} 
                className={`cursor-pointer transition-all ${selectedHeadline === option.headline ? 'border-blue-500 bg-blue-500/5' : 'hover:border-blue-500/50'}`}
                onClick={() => setSelectedHeadline(option.headline)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">
                          {option.style}
                        </span>
                        {selectedHeadline === option.headline && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="font-medium text-lg mb-2">{option.headline}</p>
                      <p className="text-sm text-muted-foreground">{option.whyItWorks}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(option.headline, "Headline");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4 mt-6">
              <Button variant="outline" onClick={handleGenerateHeadlines} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate More
              </Button>
              <Button onClick={() => setStep("checklist")} className="flex-1">
                Continue to Checklist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Wand2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Generate Headlines?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will create 5 unique headline options optimized for your target role.
              </p>
              <Button onClick={handleGenerateHeadlines} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Headlines
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // AI About Section Writer
  if (step === "about") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("checklist")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Checklist
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">AI About Section Writer</h1>
          <p className="text-muted-foreground">
            A compelling summary crafted to tell your career story
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Writing your perfect About section...</p>
          </div>
        ) : generatedAbout ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Your New About Section</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(generatedAbout, "About section")}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-line text-sm">
                  {generatedAbout}
                </div>
              </CardContent>
            </Card>

            {aboutKeyElements.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Key Elements Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aboutKeyElements.map((element, i) => (
                      <span key={i} className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full">
                        ✓ {element}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleGenerateAbout} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={() => setStep("checklist")} className="flex-1">
                Continue to Checklist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Write Your About Section?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will craft a compelling summary based on your experience and target role.
              </p>
              <Button onClick={handleGenerateAbout} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Write My About Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Recruiter Search Simulation
  if (step === "recruiter-sim") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("checklist")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Checklist
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Recruiter Search Simulation</h1>
          <p className="text-muted-foreground">
            See how recruiters will find your profile in their searches
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Simulating recruiter searches...</p>
          </div>
        ) : recruiterSim ? (
          <div className="space-y-6">
            {/* Search Visibility Score */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="py-6 text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {recruiterSim.searchVisibility.score}
                </div>
                <p className="text-sm text-muted-foreground">Search Visibility Score</p>
                <p className="text-sm font-medium text-green-600 mt-1">
                  You rank in the {recruiterSim.searchVisibility.ranking} of profiles
                </p>
              </CardContent>
            </Card>

            {/* InMail Likelihood */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  InMail Likelihood: {recruiterSim.inMailLikelihood.score}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={recruiterSim.inMailLikelihood.score} className="h-2 mb-3" />
                <div className="flex flex-wrap gap-2">
                  {recruiterSim.inMailLikelihood.factors.map((factor, i) => (
                    <span key={i} className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                      {factor}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Matching Keywords */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Matching Keywords (Found in Your Profile)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recruiterSim.matchingKeywords.map((kw, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{kw.keyword}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{kw.frequency}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          kw.importance === 'high' ? 'bg-green-500/10 text-green-600' : 
                          kw.importance === 'medium' ? 'bg-yellow-500/10 text-yellow-600' : 
                          'bg-gray-500/10 text-gray-600'
                        }`}>
                          {kw.importance}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Missing Keywords */}
            <Card className="border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Missing Keywords (Add These!)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recruiterSim.missingKeywords.map((kw, i) => (
                    <div key={i} className="p-3 bg-red-500/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{kw.keyword}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          kw.searchVolume === 'high' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {kw.searchVolume} search volume
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{kw.recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recruiter Search Queries */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  Sample Recruiter Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recruiterSim.recruiterSearchQueries.map((query, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs bg-background px-2 py-1 rounded">{query.query}</code>
                        {query.wouldMatch ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{query.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Recommendations */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary" />
                  Top Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recruiterSim.topRecommendations.map((rec, i) => {
                    const colors = [
                      { bg: "bg-green-500/15", border: "border-green-500/40", text: "text-green-700 dark:text-green-400", badge: "bg-green-500" },
                      { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-700 dark:text-blue-400", badge: "bg-blue-500" },
                      { bg: "bg-orange-500/15", border: "border-orange-500/40", text: "text-orange-700 dark:text-orange-400", badge: "bg-orange-500" },
                    ];
                    const color = colors[i % colors.length];
                    
                    return (
                      <div 
                        key={i} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${color.bg} border ${color.border} transition-all hover:scale-[1.01]`}
                      >
                        <span className={`w-6 h-6 rounded-full ${color.badge} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm`}>
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${color.text}`}>{rec.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">{rec.impact}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => setStep("checklist")} className="w-full">
              Back to Optimization Checklist
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Simulate Recruiter Searches?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                See exactly which keywords will help recruiters find your profile.
              </p>
              <Button onClick={handleRecruiterSimulation} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Run Simulation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Outreach Drafter
  if (step === "outreach") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("checklist")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Checklist
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">LinkedIn Outreach Drafter</h1>
          <p className="text-muted-foreground">
            Personalized connection requests and cold emails for recruiters
          </p>
        </div>

        {isGenerating ? (
          <div className="text-center py-12">
            <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Crafting personalized outreach messages...</p>
          </div>
        ) : outreachMessages ? (
          <div className="space-y-6">
            {/* Recruiter Connection Request */}
            <Card className="border-orange-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  Connection Request for Recruiters
                </CardTitle>
                <CardDescription>{outreachMessages.recruiterConnection.context}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20 mb-3">
                  <p className="text-sm">{outreachMessages.recruiterConnection.message}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {outreachMessages.recruiterConnection.message.length}/300 characters
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(outreachMessages.recruiterConnection.message, "Recruiter connection request")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                {outreachMessages.recruiterConnection.tips && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Tips:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {outreachMessages.recruiterConnection.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hiring Manager Connection Request */}
            <Card className="border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  Connection Request for Hiring Managers
                </CardTitle>
                <CardDescription>{outreachMessages.hiringManagerConnection.context}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/20 mb-3">
                  <p className="text-sm">{outreachMessages.hiringManagerConnection.message}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {outreachMessages.hiringManagerConnection.message.length}/300 characters
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(outreachMessages.hiringManagerConnection.message, "Hiring manager connection request")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                {outreachMessages.hiringManagerConnection.tips && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Tips:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {outreachMessages.hiringManagerConnection.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cold Email/InMail */}
            <Card className="border-purple-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  Cold Email / InMail to Recruiters
                </CardTitle>
                <CardDescription>{outreachMessages.coldEmail.context}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1">Subject Line:</p>
                  <div className="p-2 bg-purple-500/5 rounded border border-purple-500/20 flex items-center justify-between">
                    <p className="text-sm font-medium">{outreachMessages.coldEmail.subject}</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(outreachMessages.coldEmail.subject, "Subject line")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20 mb-3">
                  <p className="text-sm whitespace-pre-wrap">{outreachMessages.coldEmail.message}</p>
                </div>
                <div className="flex items-center justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(`Subject: ${outreachMessages.coldEmail.subject}\n\n${outreachMessages.coldEmail.message}`, "Cold email")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Full Email
                  </Button>
                </div>
                {outreachMessages.coldEmail.tips && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Tips:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {outreachMessages.coldEmail.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up Message */}
            <Card className="border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-green-600" />
                  Follow-up Message (If No Response)
                </CardTitle>
                <CardDescription>{outreachMessages.followUpMessage.context}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20 mb-3">
                  <p className="text-sm">{outreachMessages.followUpMessage.message}</p>
                </div>
                <div className="flex items-center justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(outreachMessages.followUpMessage.message, "Follow-up message")}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personalization Tips */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Personalization Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {outreachMessages.personalizationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleGenerateOutreach} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={() => setStep("checklist")} className="flex-1">
                Back to Checklist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Ready to Draft Outreach Messages?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI will create personalized connection requests and cold emails based on your profile.
              </p>
              <Button onClick={handleGenerateOutreach} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Outreach Messages
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Re-score input with live preview
  if (step === "rescore-input") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-up">
        <button
          onClick={() => setStep("checklist")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Checklist
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Re-Score Your Updated Profile
          </h1>
          <p className="text-muted-foreground">
            Paste your updated LinkedIn profile to see your new score
          </p>
        </div>

        {/* Live Score Preview */}
        {liveScorePreview && previousAnalysis && (
          <Card className="mb-6 border-green-500/30 bg-green-500/5">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Estimated Score Preview</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl text-muted-foreground">{previousAnalysis.overallScore}</span>
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-3xl font-bold text-green-600">{liveScorePreview}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                (Actual score calculated after submission)
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Updated Profile Content</CardTitle>
            <CardDescription>
              After updating your LinkedIn with the suggestions, paste your new profile content here.
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

            {/* Change Detection Indicator */}
            {updatedProfileText.length > 50 && detectedChanges && (
              <Card className={`border-2 ${
                detectedChanges.isIdentical 
                  ? 'border-yellow-500/50 bg-yellow-500/5' 
                  : detectedChanges.hasChanges 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : 'border-muted'
              }`}>
                <CardContent className="py-4">
                  {detectedChanges.isIdentical ? (
                    <div className="flex items-center gap-3 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">No Changes Detected</p>
                        <p className="text-sm text-muted-foreground">
                          Your profile content appears identical to the original. Make updates to see score improvements.
                        </p>
                      </div>
                    </div>
                  ) : detectedChanges.hasChanges ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Changes Detected!</span>
                      </div>
                      
                      <div className="grid gap-2 text-sm">
                        {detectedChanges.added.length > 0 && (
                          <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                            <p className="font-medium text-green-700 dark:text-green-400 mb-1">
                              + {detectedChanges.added.length} New Content Added
                            </p>
                            <ul className="space-y-1 max-h-24 overflow-y-auto">
                              {detectedChanges.added.slice(0, 3).map((line, i) => (
                                <li key={i} className="text-xs text-muted-foreground truncate">
                                  "{line.substring(0, 80)}{line.length > 80 ? '...' : ''}"
                                </li>
                              ))}
                              {detectedChanges.added.length > 3 && (
                                <li className="text-xs text-muted-foreground italic">
                                  ...and {detectedChanges.added.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {detectedChanges.modified.length > 0 && (
                          <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                            <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">
                              ↻ {detectedChanges.modified.length} Lines Modified
                            </p>
                            <ul className="space-y-1 max-h-24 overflow-y-auto">
                              {detectedChanges.modified.slice(0, 3).map((line, i) => (
                                <li key={i} className="text-xs text-muted-foreground truncate">
                                  "{line.substring(0, 80)}{line.length > 80 ? '...' : ''}"
                                </li>
                              ))}
                              {detectedChanges.modified.length > 3 && (
                                <li className="text-xs text-muted-foreground italic">
                                  ...and {detectedChanges.modified.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                        
                        {detectedChanges.removed.length > 0 && (
                          <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                            <p className="font-medium text-red-700 dark:text-red-400 mb-1">
                              − {detectedChanges.removed.length} Lines Removed
                            </p>
                            <ul className="space-y-1 max-h-24 overflow-y-auto">
                              {detectedChanges.removed.slice(0, 3).map((line, i) => (
                                <li key={i} className="text-xs text-muted-foreground truncate line-through">
                                  "{line.substring(0, 80)}{line.length > 80 ? '...' : ''}"
                                </li>
                              ))}
                              {detectedChanges.removed.length > 3 && (
                                <li className="text-xs text-muted-foreground italic">
                                  ...and {detectedChanges.removed.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm">Analyzing changes...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleRescore} 
              className="w-full" 
              size="lg"
              disabled={detectedChanges?.isIdentical}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {detectedChanges?.isIdentical ? 'No Changes to Score' : 'Re-Score My Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
