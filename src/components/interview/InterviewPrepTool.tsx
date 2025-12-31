import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ArrowLeft, Send, Bot, User, Loader2, Play, 
  Target, Building2, Briefcase, MessageSquare,
  CheckCircle, ChevronRight, Sparkles, RotateCcw,
  Code, Brain, Users, Lightbulb, TrendingUp, Zap,
  FileText, Award, Lock, Mail, Crown
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const FREE_QUESTIONS_LIMIT = 3;
const INTERVIEW_PREP_ACCESS_KEY = "interview_prep_access";
const INTERVIEW_PREP_USAGE_KEY = "interview_prep_usage";

interface InterviewPrepToolProps {
  onBack: () => void;
  onUpgrade?: () => void;
}

interface AccessInfo {
  hasAccess: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  email?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface WorkExperience {
  currentRole: string;
  yearsExperience: string;
  keyProjects: string;
  biggestAchievement: string;
  technicalSkills: string;
}

interface InterviewContext {
  roleType: "product" | "software";
  level: string;
  company: string;
  location: string;
  interviewType: string;
  workExperience: WorkExperience;
}

type OnboardingStep = "role" | "level" | "company" | "interview_category" | "work_experience" | "ready";

const LEVELS = {
  product: [
    { value: "associate", label: "Associate PM", description: "0-2 years experience" },
    { value: "pm", label: "Product Manager", description: "2-5 years experience" },
    { value: "senior", label: "Senior PM", description: "5-8 years experience" },
    { value: "principal", label: "Principal PM", description: "8+ years experience" },
    { value: "director", label: "Director / GPM", description: "Team leadership" },
  ],
  software: [
    { value: "junior", label: "Junior Engineer", description: "0-2 years experience" },
    { value: "mid", label: "Software Engineer", description: "2-5 years experience" },
    { value: "senior", label: "Senior Engineer", description: "5-8 years experience" },
    { value: "staff", label: "Staff Engineer", description: "8+ years experience" },
    { value: "principal", label: "Principal / Architect", description: "Technical leadership" },
  ],
};

// Company-specific interview categories
const COMPANY_INTERVIEW_CATEGORIES = {
  product: {
    "Google": [
      { value: "product_sense", label: "Product Sense (Googleyness)", description: "User-focused product design with Google's 10x thinking", icon: Lightbulb },
      { value: "analytical", label: "Analytical & Metrics", description: "Data-driven decisions, A/B testing, success metrics", icon: TrendingUp },
      { value: "strategy", label: "Product Strategy", description: "Market analysis, competitive positioning, vision", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "Google product case walkthroughs", icon: FileText },
      { value: "leadership", label: "Leadership Style", description: "Cross-functional influence, team dynamics", icon: Users },
      { value: "execution", label: "Execution & Leadership", description: "Cross-functional collaboration, prioritization", icon: Zap },
      { value: "behavioral", label: "Googleyness & Leadership", description: "Culture fit, values, past experiences", icon: Award },
    ],
    "Meta": [
      { value: "product_sense", label: "Product Sense", description: "Designing for billions, social impact", icon: Lightbulb },
      { value: "execution", label: "Execution", description: "Shipping fast, iterating, handling ambiguity", icon: Zap },
      { value: "analytical", label: "Data & Analytics", description: "Metrics-driven decisions, growth analysis", icon: TrendingUp },
      { value: "strategy", label: "Product Strategy", description: "Platform strategy, ecosystem thinking", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "Meta product case frameworks", icon: FileText },
      { value: "leadership", label: "Leadership & Drive", description: "Impact, ownership, influencing without authority", icon: Users },
      { value: "behavioral", label: "Cultural Fit", description: "Move fast, be bold, focus on impact", icon: Award },
    ],
    "Amazon": [
      { value: "product_sense", label: "Product Sense (Customer Obsession)", description: "Working backwards from customer needs", icon: Lightbulb },
      { value: "leadership_principles", label: "Leadership Principles", description: "All 16 LPs - Ownership, Bias for Action, etc.", icon: Award },
      { value: "metrics", label: "Metrics & Business", description: "Flywheel thinking, input/output metrics", icon: TrendingUp },
      { value: "strategy", label: "Product Strategy", description: "Long-term thinking, competitive moats", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "Working Backwards document practice", icon: FileText },
      { value: "leadership", label: "Leadership Style", description: "Bar-raising, disagree and commit", icon: Users },
      { value: "execution", label: "Deliver Results", description: "High bar, driving execution at scale", icon: Zap },
    ],
    "Apple": [
      { value: "product_craft", label: "Product Craft", description: "Attention to detail, design excellence", icon: Sparkles },
      { value: "hardware_software", label: "Hardware-Software Integration", description: "Holistic product thinking", icon: Lightbulb },
      { value: "user_experience", label: "User Experience", description: "Simplicity, delight, accessibility", icon: Users },
      { value: "strategy", label: "Product Strategy", description: "Innovation, market creation, ecosystem", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "Apple product deep-dives", icon: FileText },
      { value: "leadership", label: "Leadership Style", description: "Collaborative excellence, DRI culture", icon: Users },
      { value: "behavioral", label: "Cultural Fit", description: "Secrecy, excellence, collaboration", icon: Award },
    ],
    "Microsoft": [
      { value: "product_sense", label: "Product Sense", description: "Enterprise + Consumer product thinking", icon: Lightbulb },
      { value: "technical", label: "Technical Depth", description: "Platform thinking, technical trade-offs", icon: Code },
      { value: "growth_mindset", label: "Growth Mindset", description: "Learning culture, adaptability", icon: Brain },
      { value: "strategy", label: "Product Strategy", description: "Cloud-first, AI-driven product vision", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "Enterprise product scenarios", icon: FileText },
      { value: "leadership", label: "Leadership Style", description: "Inclusive leadership, empowerment", icon: Users },
      { value: "behavioral", label: "Cultural Fit", description: "Inclusion, empowerment, innovation", icon: Award },
    ],
    "OpenAI": [
      { value: "product_sense", label: "AI Product Sense", description: "Building responsible AI products", icon: Brain },
      { value: "technical", label: "Technical Understanding", description: "AI/ML concepts, limitations, capabilities", icon: Code },
      { value: "safety", label: "Safety & Alignment", description: "Responsible AI, user trust, ethics", icon: Target },
      { value: "strategy", label: "Product Strategy", description: "AI market, developer experience, APIs", icon: Lightbulb },
      { value: "case_study", label: "Case Study Prep", description: "AI product design challenges", icon: FileText },
      { value: "leadership", label: "Leadership Style", description: "Mission-driven leadership", icon: Users },
      { value: "behavioral", label: "Mission Alignment", description: "Safe AGI, research collaboration", icon: Award },
    ],
    "Perplexity": [
      { value: "product_sense", label: "Search & AI Product Sense", description: "Reinventing search with AI", icon: Lightbulb },
      { value: "technical", label: "Technical Understanding", description: "LLMs, retrieval, ranking", icon: Brain },
      { value: "user_experience", label: "User Experience", description: "Speed, accuracy, information design", icon: Users },
      { value: "strategy", label: "Product Strategy", description: "Search disruption, AI-first approach", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "AI search product cases", icon: FileText },
      { value: "growth", label: "Growth & Monetization", description: "User acquisition, retention, business model", icon: TrendingUp },
      { value: "behavioral", label: "Startup Culture", description: "Speed, ownership, adaptability", icon: Zap },
    ],
    "Coinbase": [
      { value: "product_sense", label: "Crypto Product Sense", description: "Building for crypto-native users", icon: Lightbulb },
      { value: "regulatory", label: "Compliance & Safety", description: "Regulatory understanding, trust", icon: Target },
      { value: "technical", label: "Blockchain Understanding", description: "DeFi, wallets, on-chain products", icon: Code },
      { value: "strategy", label: "Product Strategy", description: "Crypto mass adoption roadmap", icon: Target },
      { value: "case_study", label: "Case Study Prep", description: "Crypto product scenarios", icon: FileText },
      { value: "leadership", label: "Leadership Style", description: "Clear communication, long-term vision", icon: Users },
      { value: "growth", label: "Growth & Adoption", description: "Mainstream crypto adoption", icon: TrendingUp },
      { value: "behavioral", label: "Cultural Fit", description: "Clear communication, long-term thinking", icon: Award },
    ],
  },
  software: {
    "Google": [
      { value: "coding", label: "Coding (Leetcode-style)", description: "Algorithms, data structures, optimization", icon: Code },
      { value: "system_design", label: "System Design", description: "Scalable systems, distributed computing", icon: Building2 },
      { value: "googleyness", label: "Googleyness & Leadership", description: "Culture fit, collaboration, ambiguity", icon: Award },
      { value: "technical_depth", label: "Technical Discussion", description: "Past projects, architecture decisions", icon: Brain },
      { value: "behavioral", label: "Behavioral", description: "Teamwork, conflict resolution", icon: Users },
    ],
    "Meta": [
      { value: "coding", label: "Coding", description: "Two 45-min coding rounds", icon: Code },
      { value: "system_design", label: "System Design", description: "Scale to billions, efficiency", icon: Building2 },
      { value: "behavioral", label: "Behavioral", description: "Meta values, past experiences", icon: Users },
      { value: "technical", label: "Technical Deep Dive", description: "Domain expertise, past projects", icon: Brain },
    ],
    "Amazon": [
      { value: "coding", label: "Coding & Problem Solving", description: "OA + onsite coding rounds", icon: Code },
      { value: "system_design", label: "System Design (OOD)", description: "Object-oriented & distributed design", icon: Building2 },
      { value: "leadership_principles", label: "Leadership Principles", description: "All 16 LPs with STAR format", icon: Award },
      { value: "bar_raiser", label: "Bar Raiser", description: "Deep dive on any area", icon: Target },
    ],
    "Apple": [
      { value: "coding", label: "Coding", description: "Algorithm & implementation focus", icon: Code },
      { value: "system_design", label: "System Design", description: "iOS/macOS architecture, performance", icon: Building2 },
      { value: "domain", label: "Domain Expertise", description: "Team-specific technical depth", icon: Brain },
      { value: "behavioral", label: "Behavioral & Culture", description: "Collaboration, excellence", icon: Award },
    ],
    "Microsoft": [
      { value: "coding", label: "Coding", description: "Problem solving, optimization", icon: Code },
      { value: "system_design", label: "System Design", description: "Azure-scale systems, cloud architecture", icon: Building2 },
      { value: "technical", label: "Technical Discussion", description: "Past projects, debugging approach", icon: Brain },
      { value: "behavioral", label: "Growth Mindset", description: "Learning, collaboration, inclusion", icon: Award },
    ],
    "OpenAI": [
      { value: "coding", label: "Coding", description: "Algorithms + ML implementation", icon: Code },
      { value: "system_design", label: "ML Systems Design", description: "Training infra, serving, scale", icon: Building2 },
      { value: "ml_depth", label: "ML/AI Deep Dive", description: "Research understanding, LLMs", icon: Brain },
      { value: "mission", label: "Mission Alignment", description: "Safety, responsible AI", icon: Award },
    ],
    "Perplexity": [
      { value: "coding", label: "Coding", description: "Practical problem solving", icon: Code },
      { value: "system_design", label: "Search & Retrieval Systems", description: "RAG, indexing, ranking", icon: Building2 },
      { value: "ml", label: "ML/LLM Understanding", description: "Prompting, fine-tuning, evaluation", icon: Brain },
      { value: "startup", label: "Startup Fit", description: "Speed, ownership, scrappiness", icon: Zap },
    ],
    "Coinbase": [
      { value: "coding", label: "Coding", description: "Security-focused implementation", icon: Code },
      { value: "system_design", label: "System Design", description: "Blockchain infra, trading systems", icon: Building2 },
      { value: "blockchain", label: "Blockchain & Crypto", description: "Smart contracts, DeFi, security", icon: Brain },
      { value: "behavioral", label: "Cultural Fit", description: "Clear communication, crypto passion", icon: Award },
    ],
  },
};

// Default categories for companies not in the list
const DEFAULT_INTERVIEW_CATEGORIES = {
  product: [
    { value: "product_sense", label: "Product Sense", description: "Design and improve products", icon: Lightbulb },
    { value: "analytical", label: "Metrics & Analytics", description: "Data-driven decisions", icon: TrendingUp },
    { value: "strategy", label: "Product Strategy", description: "Vision, roadmap, and market analysis", icon: Target },
    { value: "case_study", label: "Case Study Prep", description: "Product case walkthroughs and frameworks", icon: FileText },
    { value: "leadership", label: "Leadership Style", description: "Influence, team dynamics, stakeholder management", icon: Users },
    { value: "execution", label: "Execution", description: "Shipping and prioritization", icon: Zap },
    { value: "behavioral", label: "Behavioral", description: "Past experiences (STAR)", icon: Award },
  ],
  software: [
    { value: "coding", label: "Coding", description: "Algorithms and data structures", icon: Code },
    { value: "system_design", label: "System Design", description: "Architecture and scalability", icon: Building2 },
    { value: "technical", label: "Technical Discussion", description: "Problem-solving approach", icon: Brain },
    { value: "behavioral", label: "Behavioral", description: "Past experiences (STAR)", icon: Award },
  ],
};

const FEATURED_COMPANIES = [
  { name: "Google", color: "bg-red-500/10 text-red-600 border-red-200" },
  { name: "Meta", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { name: "Amazon", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  { name: "Apple", color: "bg-gray-500/10 text-gray-600 border-gray-200" },
  { name: "Microsoft", color: "bg-sky-500/10 text-sky-600 border-sky-200" },
  { name: "OpenAI", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  { name: "Perplexity", color: "bg-violet-500/10 text-violet-600 border-violet-200" },
  { name: "Coinbase", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
];

const OTHER_COMPANIES = ["Netflix", "Stripe", "Airbnb", "Uber", "Spotify", "Salesforce", "Adobe", "LinkedIn"];

export function InterviewPrepTool({ onBack, onUpgrade }: InterviewPrepToolProps) {
  const [step, setStep] = useState<OnboardingStep>("role");
  const [context, setContext] = useState<InterviewContext>({
    roleType: "product",
    level: "",
    company: "",
    location: "",
    interviewType: "",
    workExperience: {
      currentRole: "",
      yearsExperience: "",
      keyProjects: "",
      biggestAchievement: "",
      technicalSkills: "",
    },
  });
  const [customCompany, setCustomCompany] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Access and usage tracking
  const [accessInfo, setAccessInfo] = useState<AccessInfo>({ hasAccess: false });
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [showPaywallDialog, setShowPaywallDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentEmail, setPaymentEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  // Check access and load usage on mount
  useEffect(() => {
    checkAccess();
    loadUsage();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkAccess = async () => {
    try {
      const stored = localStorage.getItem(INTERVIEW_PREP_ACCESS_KEY);
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

  const handleRecoveryCheck = async () => {
    if (!recoveryEmail.trim() || !recoveryEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsCheckingAccess(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-tool-access", {
        body: { email: recoveryEmail.trim(), toolType: "interview_prep", action: "check" },
      });
      
      if (error) throw error;
      
      if (data?.hasAccess) {
        const daysRemaining = Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const accessData = { 
          expiry: data.expiresAt, 
          email: recoveryEmail.trim() 
        };
        localStorage.setItem(INTERVIEW_PREP_ACCESS_KEY, JSON.stringify(accessData));
        setAccessInfo({ 
          hasAccess: true, 
          expiresAt: data.expiresAt,
          daysRemaining,
          email: recoveryEmail.trim() 
        });
        setShowRecoveryDialog(false);
        toast.success(`Access restored! ${daysRemaining} days remaining.`);
      } else {
        toast.error("No active access found for this email. Please purchase access or try a different email.");
      }
    } catch (err) {
      console.error("Recovery check error:", err);
      toast.error("Failed to verify access. Please try again.");
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const loadUsage = () => {
    try {
      const stored = localStorage.getItem(INTERVIEW_PREP_USAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Reset if it's a new day
        const today = new Date().toDateString();
        if (data.date === today) {
          setQuestionsUsed(data.count || 0);
        } else {
          // New day, reset count
          localStorage.setItem(INTERVIEW_PREP_USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
          setQuestionsUsed(0);
        }
      }
    } catch (e) {
      console.error("Error loading usage:", e);
    }
  };

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const newCount = questionsUsed + 1;
    localStorage.setItem(INTERVIEW_PREP_USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
    setQuestionsUsed(newCount);
  };

  const canAskQuestion = () => {
    return accessInfo.hasAccess || questionsUsed < FREE_QUESTIONS_LIMIT;
  };

  const getRemainingFreeQuestions = () => {
    return Math.max(0, FREE_QUESTIONS_LIMIT - questionsUsed);
  };

  const handleRoleSelect = (role: "product" | "software") => {
    setContext(prev => ({ ...prev, roleType: role }));
    setStep("level");
  };

  const handleLevelSelect = (level: string) => {
    setContext(prev => ({ ...prev, level }));
    setStep("company");
  };

  const handleCompanySelect = (company: string) => {
    setContext(prev => ({ ...prev, company }));
    setStep("interview_category");
  };

  const handleCustomCompany = () => {
    if (customCompany.trim()) {
      setContext(prev => ({ ...prev, company: customCompany.trim() }));
      setStep("interview_category");
    }
  };

  const handleInterviewTypeSelect = (type: string) => {
    setContext(prev => ({ ...prev, interviewType: type }));
    setStep("work_experience");
  };

  const handleWorkExperienceChange = (field: keyof WorkExperience, value: string) => {
    setContext(prev => ({
      ...prev,
      workExperience: { ...prev.workExperience, [field]: value },
    }));
  };

  const handleWorkExperienceSubmit = () => {
    // Validate at least current role is filled
    if (!context.workExperience.currentRole.trim()) {
      toast.error("Please enter your current role to continue");
      return;
    }
    setStep("ready");
  };

  const getInterviewCategories = () => {
    const companyCategories = COMPANY_INTERVIEW_CATEGORIES[context.roleType];
    return companyCategories[context.company as keyof typeof companyCategories] || DEFAULT_INTERVIEW_CATEGORIES[context.roleType];
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [],
            context,
            action: "start",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      await streamResponse(response);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview. Please try again.");
      setInterviewStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const streamResponse = async (response: Response) => {
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
              return newMessages;
            });
          }
        } catch {
          // Incomplete JSON, continue
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user can ask questions
    if (!canAskQuestion()) {
      setShowPaywallDialog(true);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Increment usage for free users
    if (!accessInfo.hasAccess) {
      incrementUsage();
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
            context,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      await streamResponse(response);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetInterview = () => {
    setMessages([]);
    setInterviewStarted(false);
    setStep("role");
    setContext({
      roleType: "product",
      level: "",
      company: "",
      location: "",
      interviewType: "",
      workExperience: {
        currentRole: "",
        yearsExperience: "",
        keyProjects: "",
        biggestAchievement: "",
        technicalSkills: "",
      },
    });
  };

  // Render onboarding steps
  if (!interviewStarted) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => {
              if (step === "role") {
                onBack();
              } else if (step === "level") {
                setStep("role");
              } else if (step === "company") {
                setStep("level");
              } else if (step === "interview_category") {
                setStep("company");
              } else if (step === "work_experience") {
                setStep("interview_category");
              } else if (step === "ready") {
                setStep("work_experience");
              }
            }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-lg">Interview Prep</h2>
              <p className="text-xs text-muted-foreground">Company-specific mock interviews with AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {accessInfo.hasAccess ? (
              <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Pro ({accessInfo.daysRemaining}d left)
              </span>
            ) : (
              <>
                <button
                  onClick={() => setShowRecoveryDialog(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Restore access
                </button>
                <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded-full">
                  {getRemainingFreeQuestions()} free left
                </span>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {["role", "level", "company", "interview_category", "work_experience", "ready"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s ? "bg-primary text-primary-foreground" : 
                    ["role", "level", "company", "interview_category", "work_experience", "ready"].indexOf(step) > i 
                      ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  {i < 5 && <div className={`w-6 h-0.5 ${
                    ["role", "level", "company", "interview_category", "work_experience", "ready"].indexOf(step) > i 
                      ? "bg-primary/20" : "bg-muted"
                  }`} />}
                </div>
              ))}
            </div>

            {/* Step: Role Selection */}
            {step === "role" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">What role are you interviewing for?</h3>
                  <p className="text-muted-foreground">We'll tailor questions to your specific role type</p>
                </div>
                <div className="grid gap-4">
                  <button
                    onClick={() => handleRoleSelect("product")}
                    className="p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                        <Target className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Product Manager</h4>
                        <p className="text-sm text-muted-foreground">Product sense, strategy, metrics, stakeholder management</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect("software")}
                    className="p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Code className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Software Engineer</h4>
                        <p className="text-sm text-muted-foreground">System design, coding, technical discussions, architecture</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Level Selection */}
            {step === "level" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">What level are you targeting?</h3>
                  <p className="text-muted-foreground">Questions will be calibrated to this level</p>
                </div>
                <div className="grid gap-3">
                  {LEVELS[context.roleType].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleLevelSelect(level.value)}
                      className="p-4 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{level.label}</h4>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => setStep("role")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step: Company Selection */}
            {step === "company" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Which company are you interviewing at?</h3>
                  <p className="text-muted-foreground">We have company-specific interview formats for top tech companies</p>
                </div>
                
                {/* Featured Companies with specific prep */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">🎯 Companies with tailored prep</p>
                  <div className="grid grid-cols-2 gap-3">
                    {FEATURED_COMPANIES.map((company) => (
                      <button
                        key={company.name}
                        onClick={() => handleCompanySelect(company.name)}
                        className={`p-4 border-2 rounded-lg hover:border-primary transition-all text-center font-semibold ${company.color}`}
                      >
                        {company.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Companies */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Other top companies</p>
                  <div className="grid grid-cols-4 gap-2">
                    {OTHER_COMPANIES.map((company) => (
                      <button
                        key={company}
                        onClick={() => handleCompanySelect(company)}
                        className="p-2 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center text-sm"
                      >
                        {company}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or enter company name..."
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg bg-background"
                    onKeyDown={(e) => e.key === "Enter" && handleCustomCompany()}
                  />
                  <Button onClick={handleCustomCompany} disabled={!customCompany.trim()}>
                    Continue
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setStep("level")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step: Interview Category (Company-specific) */}
            {step === "interview_category" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">{context.company} Interview Focus</h3>
                  <p className="text-muted-foreground">Select the interview round you want to practice</p>
                </div>

                {FEATURED_COMPANIES.some(c => c.name === context.company) && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center text-sm">
                    <Sparkles className="w-4 h-4 inline-block mr-2 text-primary" />
                    Tailored for {context.company}'s specific interview format and culture
                  </div>
                )}

                <div className="grid gap-3">
                  {getInterviewCategories().map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleInterviewTypeSelect(type.value)}
                        className="p-4 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    );
                  })}
                </div>
                <Button variant="ghost" onClick={() => setStep("company")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step: Work Experience */}
            {step === "work_experience" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Tell us about your experience</h3>
                  <p className="text-muted-foreground">This helps us tailor questions to your background and provide personalized feedback</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Role / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g., Senior Product Manager at Stripe"
                      value={context.workExperience.currentRole}
                      onChange={(e) => handleWorkExperienceChange("currentRole", e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <select
                      value={context.workExperience.yearsExperience}
                      onChange={(e) => handleWorkExperienceChange("yearsExperience", e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                    >
                      <option value="">Select...</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-8">5-8 years</option>
                      <option value="8-12">8-12 years</option>
                      <option value="12+">12+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Key Projects / Products</label>
                    <Textarea
                      placeholder="Briefly describe 1-2 significant projects you've worked on. These will be referenced in behavioral questions."
                      value={context.workExperience.keyProjects}
                      onChange={(e) => handleWorkExperienceChange("keyProjects", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Biggest Achievement</label>
                    <Textarea
                      placeholder="What's a professional accomplishment you're most proud of? We'll use this for STAR-format questions."
                      value={context.workExperience.biggestAchievement}
                      onChange={(e) => handleWorkExperienceChange("biggestAchievement", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  {context.roleType === "software" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Technical Skills / Stack</label>
                      <input
                        type="text"
                        placeholder="e.g., Python, React, AWS, Kubernetes, Machine Learning"
                        value={context.workExperience.technicalSkills}
                        onChange={(e) => handleWorkExperienceChange("technicalSkills", e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg bg-background"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400">
                  💡 The more context you provide, the more personalized and realistic your interview will be.
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep("interview_category")} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button onClick={handleWorkExperienceSubmit} className="flex-1">
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Ready */}
            {step === "ready" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Ready to start!</h3>
                  <p className="text-muted-foreground">Your personalized {context.company} interview is ready</p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Role:</strong> {context.roleType === "product" ? "Product Manager" : "Software Engineer"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Level:</strong> {LEVELS[context.roleType].find(l => l.value === context.level)?.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Company:</strong> {context.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Focus:</strong> {getInterviewCategories().find(t => t.value === context.interviewType)?.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Your Background:</strong> {context.workExperience.currentRole}</span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">What to expect:</h4>
                  <ul className="text-sm text-emerald-700/80 dark:text-emerald-400/80 space-y-1">
                    <li>• Questions tailored to {context.company}'s interview style</li>
                    <li>• Real-time feedback on your responses</li>
                    <li>• Suggestions using your actual work experience</li>
                    <li>• Examples of stronger answers</li>
                    <li>• Follow-up probing questions</li>
                  </ul>
                </div>

                <Button onClick={startInterview} size="lg" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start {context.company} Interview
                </Button>

                <Button variant="ghost" onClick={() => setStep("work_experience")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Quick action handler
  const handleQuickAction = (action: string) => {
    if (isLoading) return;
    setInput(action);
    setTimeout(() => sendMessage(), 50);
  };

  // Format message with better styling
  const formatMessageContent = (content: string) => {
    // Split by score pattern and other markers
    const lines = content.split('\n');
    
    return lines.map((line, i) => {
      // Score line
      if (line.match(/\*\*Score:\s*\d+\/10\*\*/)) {
        const score = line.match(/(\d+)\/10/)?.[1];
        const scoreNum = parseInt(score || '0');
        const scoreColor = scoreNum >= 8 ? 'text-green-600' : scoreNum >= 6 ? 'text-amber-600' : 'text-red-500';
        return (
          <div key={i} className={`text-lg font-bold ${scoreColor} mb-2`}>
            Score: {score}/10
          </div>
        );
      }
      // Good feedback
      if (line.startsWith('✅')) {
        return <div key={i} className="text-green-700 dark:text-green-400 text-sm mb-1">{line}</div>;
      }
      // Fix feedback
      if (line.startsWith('⚠️')) {
        return <div key={i} className="text-amber-700 dark:text-amber-400 text-sm mb-1">{line}</div>;
      }
      // Example
      if (line.startsWith('📝')) {
        return <div key={i} className="text-blue-700 dark:text-blue-400 text-sm italic mb-1">{line}</div>;
      }
      // Next question or separator
      if (line.startsWith('---')) {
        return <hr key={i} className="my-3 border-border/50" />;
      }
      if (line.includes('**Next question:**')) {
        return <div key={i} className="font-medium text-foreground mt-2">{line.replace(/\*\*/g, '')}</div>;
      }
      // Bold text
      if (line.includes('**')) {
        const formatted = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        return <div key={i} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted }} />;
      }
      return line.trim() ? <div key={i} className="text-sm">{line}</div> : <div key={i} className="h-1" />;
    });
  };

  // Interview chat UI - Full screen immersive experience
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header - Sticky at top */}
      <div className="border-b px-4 py-4 flex items-center justify-between bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            setInterviewStarted(false);
            setMessages([]);
          }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-xl flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              {context.company} Interview Session
            </h2>
            <p className="text-sm text-muted-foreground">
              {LEVELS[context.roleType].find(l => l.value === context.level)?.label} • {getInterviewCategories().find(t => t.value === context.interviewType)?.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {accessInfo.hasAccess ? (
            <span className="text-sm bg-green-500/20 text-green-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
              <Crown className="w-4 h-4" /> Pro Access
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRecoveryDialog(true)}
                className="text-sm text-primary hover:underline"
              >
                Restore access
              </button>
              <span className="text-sm bg-amber-500/20 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                {getRemainingFreeQuestions()}/{FREE_QUESTIONS_LIMIT} free questions
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={resetInterview} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New Session</span>
          </Button>
        </div>
      </div>

      {/* Messages Area - Scrollable center with max width */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-6 space-y-6 pb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="space-y-2 text-base leading-relaxed">{formatMessageContent(msg.content)}</div>
                  ) : (
                    <p className="text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="bg-card border rounded-2xl px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Bottom Section - Quick Actions + Input */}
      <div className="border-t bg-background/95 backdrop-blur-sm shadow-lg">
        {/* Quick Actions */}
        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2 justify-center sm:justify-start">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("Give me a hint")}
              disabled={isLoading}
              className="text-sm h-9 gap-2"
            >
              <Lightbulb className="w-4 h-4" /> Get a Hint
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("Show me an example answer")}
              disabled={isLoading}
              className="text-sm h-9 gap-2"
            >
              <FileText className="w-4 h-4" /> Example Answer
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("Skip to next question")}
              disabled={isLoading}
              className="text-sm h-9 gap-2"
            >
              <ChevronRight className="w-4 h-4" /> Skip Question
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction("Make it harder")}
              disabled={isLoading}
              className="text-sm h-9 gap-2"
            >
              <TrendingUp className="w-4 h-4" /> Harder
            </Button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here... (Press Enter to send, Shift+Enter for new line)"
              disabled={isLoading}
              className="min-h-[80px] max-h-[200px] resize-none text-base"
              rows={3}
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !input.trim()} 
              size="lg"
              className="h-auto px-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2 max-w-4xl mx-auto">
            Tip: Structure your answers using the STAR method (Situation, Task, Action, Result) for behavioral questions
          </p>
        </div>
      </div>

      {/* Paywall Dialog */}
      <Dialog open={showPaywallDialog} onOpenChange={setShowPaywallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Upgrade to Interview Prep Pro
            </DialogTitle>
            <DialogDescription>
              You've used all {FREE_QUESTIONS_LIMIT} free practice questions. Unlock unlimited access to ace your interviews.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <span className="text-4xl font-bold text-foreground">$249</span>
              <span className="text-muted-foreground ml-2">/ quarter</span>
              <p className="text-xs text-muted-foreground mt-1">Billed every 3 months. Cancel anytime.</p>
            </div>
            
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> <span>Unlimited mock interview sessions</span></li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> <span>AI feedback & improvement suggestions</span></li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> <span>Company-specific prep (Google, Meta, Amazon...)</span></li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> <span>STAR format coaching & sample answers</span></li>
            </ul>

            <div className="space-y-2">
              <label htmlFor="upgrade-email" className="text-sm font-medium">
                Enter your email to continue
              </label>
              <Input
                id="upgrade-email"
                type="email"
                placeholder="you@example.com"
                value={paymentEmail}
                onChange={(e) => setPaymentEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
              onClick={async () => {
                if (!paymentEmail.trim() || !paymentEmail.includes("@")) {
                  toast.error("Please enter a valid email address");
                  return;
                }
                setIsProcessing(true);
                try {
                  const { data, error } = await supabase.functions.invoke("create-tool-subscription", {
                    body: { email: paymentEmail.trim(), toolType: "interview_prep" },
                  });
                  if (error) throw error;
                  if (data?.url) {
                    localStorage.setItem("pending_purchase_email", paymentEmail.trim());
                    localStorage.setItem("pending_purchase_tool", "interview_prep");
                    window.open(data.url, "_blank");
                    setShowPaywallDialog(false);
                    toast.success("Checkout opened in new tab");
                  }
                } catch (err) {
                  console.error("Checkout error:", err);
                  toast.error("Failed to start checkout. Please try again.");
                } finally {
                  setIsProcessing(false);
                }
              }} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" 
              size="lg"
              disabled={isProcessing || !paymentEmail.trim()}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now - $249/quarter
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Secure payment via Stripe. Your data is protected.
            </p>
            
            <button
              onClick={() => {
                setShowPaywallDialog(false);
                setShowRecoveryDialog(true);
              }}
              className="text-sm text-primary hover:underline w-full text-center"
            >
              Already purchased? Restore your access
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Restore Your Access
            </DialogTitle>
            <DialogDescription>
              Enter the email you used to purchase Interview Prep Pro to restore your access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label htmlFor="recovery-email" className="text-sm font-medium">
                Your purchase email
              </label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="you@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRecoveryCheck()}
                className="w-full"
              />
            </div>

            <Button 
              onClick={handleRecoveryCheck}
              className="w-full" 
              size="lg"
              disabled={isCheckingAccess || !recoveryEmail.trim()}
            >
              {isCheckingAccess ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Restore Access
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              If you've purchased access, we'll restore it instantly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
