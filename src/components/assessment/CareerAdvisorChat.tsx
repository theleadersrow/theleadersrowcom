import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Send, Sparkles, MessageCircle, Lock, Loader2, 
  User, Bot, Trash2, Crown, Settings, GraduationCap, Briefcase, Users
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CareerAdvisorChatProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const FREE_CHAT_LIMIT = 4;
const CHAT_USAGE_KEY = "career_advisor_usage";
const CAREER_ADVISOR_ACCESS_KEY = "career_advisor_access";
const CHAT_SESSION_KEY = "career_advisor_session_id";
const USER_PROFILE_KEY = "career_advisor_profile";

type UserProfileType = "student" | "professional" | "other";

interface UserProfile {
  type: UserProfileType;
  context?: string;
}

interface UsageInfo {
  count: number;
  lastReset: string;
}

interface AccessInfo {
  hasAccess: boolean;
  expiresAt?: string;
  email?: string;
}

const generateSessionId = () => {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export function CareerAdvisorChat({ onBack }: CareerAdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [accessInfo, setAccessInfo] = useState<AccessInfo>({ hasAccess: false });
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingContext, setOnboardingContext] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check URL params for success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success("Welcome to Career Advisor Pro! You now have unlimited access.");
      window.history.replaceState({}, '', window.location.pathname);
      // Re-check subscription after successful payment
      const storedEmail = localStorage.getItem(CAREER_ADVISOR_ACCESS_KEY);
      if (storedEmail) {
        try {
          const data = JSON.parse(storedEmail);
          if (data.email) {
            checkSubscriptionByEmail(data.email);
          }
        } catch {}
      }
    }
    if (params.get('canceled') === 'true') {
      toast.info("Payment canceled. Your free chats are still available.");
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Initialize session and load chat history
  useEffect(() => {
    const initSession = async () => {
      // Get or create session ID
      let storedSessionId = localStorage.getItem(CHAT_SESSION_KEY);
      if (!storedSessionId) {
        storedSessionId = generateSessionId();
        localStorage.setItem(CHAT_SESSION_KEY, storedSessionId);
      }
      setSessionId(storedSessionId);

      // Check for stored user profile
      const storedProfile = localStorage.getItem(USER_PROFILE_KEY);
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile) as UserProfile;
          setUserProfile(profile);
        } catch (e) {
          console.error("Error parsing stored profile:", e);
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }

      // Load chat history from database
      await loadChatHistory(storedSessionId);
      
      checkAccess();
      checkUsage();
      setIsLoadingHistory(false);
    };

    initSession();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (!isLoadingHistory) {
      inputRef.current?.focus();
    }
  }, [isLoadingHistory]);

  const loadChatHistory = async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('career_advisor_chats')
        .select('messages')
        .eq('session_id', sid)
        .maybeSingle();

      if (error) {
        console.error("Error loading chat history:", error);
        return;
      }

      if (data?.messages && Array.isArray(data.messages)) {
        // Safely cast the messages
        const loadedMessages = data.messages as unknown as Message[];
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    if (!sessionId) return;

    try {
      const email = accessInfo.email || upgradeEmail || null;
      const messagesJson = JSON.parse(JSON.stringify(newMessages));
      
      // Check if session exists
      const { data: existing } = await supabase
        .from('career_advisor_chats')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('career_advisor_chats')
          .update({
            email: email,
            messages: messagesJson,
            updated_at: new Date().toISOString()
          })
          .eq('session_id', sessionId);
      } else {
        // Insert new
        await supabase
          .from('career_advisor_chats')
          .insert([{
            session_id: sessionId,
            email: email,
            messages: messagesJson
          }]);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const checkAccess = async () => {
    try {
      const stored = localStorage.getItem(CAREER_ADVISOR_ACCESS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.expiry && new Date(data.expiry) > new Date()) {
          setAccessInfo({ 
            hasAccess: true, 
            expiresAt: new Date(data.expiry).toISOString(),
            email: data.email 
          });
          if (data.email) {
            setUpgradeEmail(data.email);
          }
          return true;
        }
      }
    } catch (e) {
      console.error("Error checking cached access:", e);
    }
    return false;
  };

  const checkSubscriptionByEmail = async (email: string) => {
    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('check-career-advisor-subscription', {
        body: { email }
      });

      if (error) throw error;

      if (data?.subscribed) {
        const accessData = {
          expiry: data.subscription_end,
          email: email
        };
        localStorage.setItem(CAREER_ADVISOR_ACCESS_KEY, JSON.stringify(accessData));
        setAccessInfo({ 
          hasAccess: true, 
          expiresAt: data.subscription_end,
          email 
        });
        setShowPaywall(false);
        toast.success("Subscription verified! You have unlimited access.");
        return true;
      } else {
        toast.info("No active subscription found for this email.");
        return false;
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error("Failed to check subscription. Please try again.");
      return false;
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const checkUsage = () => {
    try {
      const stored = localStorage.getItem(CHAT_USAGE_KEY);
      if (stored) {
        const data: UsageInfo = JSON.parse(stored);
        const lastReset = new Date(data.lastReset);
        const today = new Date();
        if (lastReset.toDateString() !== today.toDateString()) {
          const newUsage = { count: 0, lastReset: today.toISOString() };
          localStorage.setItem(CHAT_USAGE_KEY, JSON.stringify(newUsage));
          setUsageCount(0);
        } else {
          setUsageCount(data.count);
        }
      } else {
        const newUsage = { count: 0, lastReset: new Date().toISOString() };
        localStorage.setItem(CHAT_USAGE_KEY, JSON.stringify(newUsage));
        setUsageCount(0);
      }
    } catch (e) {
      console.error("Error checking usage:", e);
    }
  };

  const incrementUsage = () => {
    try {
      const newCount = usageCount + 1;
      const usage = { count: newCount, lastReset: new Date().toISOString() };
      localStorage.setItem(CHAT_USAGE_KEY, JSON.stringify(usage));
      setUsageCount(newCount);
      return newCount;
    } catch (e) {
      console.error("Error incrementing usage:", e);
      return usageCount;
    }
  };

  const canSendMessage = () => {
    if (accessInfo.hasAccess) return true;
    return usageCount < FREE_CHAT_LIMIT;
  };

  const getRemainingFreeChats = () => {
    return Math.max(0, FREE_CHAT_LIMIT - usageCount);
  };

  const handleSelectProfile = (type: UserProfileType) => {
    const profile: UserProfile = { type, context: onboardingContext.trim() || undefined };
    setUserProfile(profile);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const getProfileLabel = (type: UserProfileType) => {
    switch (type) {
      case "student": return "Student";
      case "professional": return "Professional";
      case "other": return "Other";
    }
  };

  const streamChat = useCallback(async (currentMessages: Message[]) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-advisor-chat`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: currentMessages, userProfile }),
    });

    if (resp.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }

    if (resp.status === 402) {
      throw new Error("Service temporarily unavailable. Please try again later.");
    }

    if (!resp.ok || !resp.body) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to get response");
    }

    return resp.body;
  }, []);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (!canSendMessage()) {
      setShowPaywall(true);
      return;
    }

    const userMessage: Message = { role: "user", content: trimmedInput };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    if (!accessInfo.hasAccess) {
      incrementUsage();
    }

    try {
      const body = await streamChat(updatedMessages);
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save chat history after response
      const finalMessages = [...updatedMessages, { role: "assistant" as const, content: assistantContent }];
      await saveChatHistory(finalMessages);

      if (!accessInfo.hasAccess && usageCount >= FREE_CHAT_LIMIT - 1) {
        setTimeout(() => setShowPaywall(true), 1000);
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = async () => {
    setMessages([]);
    setShowPaywall(false);
    
    // Generate new session ID
    const newSessionId = generateSessionId();
    localStorage.setItem(CHAT_SESSION_KEY, newSessionId);
    setSessionId(newSessionId);
    
    // Reset profile to trigger onboarding
    localStorage.removeItem(USER_PROFILE_KEY);
    setUserProfile(null);
    setShowOnboarding(true);
    setOnboardingContext("");
  };

  const handleUpgrade = async () => {
    if (!upgradeEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('create-career-advisor-checkout', {
        body: { customerEmail: upgradeEmail.trim() }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.info("Stripe checkout opened in a new tab. Complete payment to unlock unlimited access.");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleVerifySubscription = async () => {
    if (!upgradeEmail.trim()) {
      toast.error("Please enter your email to verify subscription");
      return;
    }
    await checkSubscriptionByEmail(upgradeEmail.trim());
  };

  const handleManageSubscription = async () => {
    if (!accessInfo.email) {
      toast.error("No subscription email found");
      return;
    }

    try {
      setIsCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke('career-advisor-portal', {
        body: { email: accessInfo.email }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.info("Stripe portal opened in a new tab.");
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error("Failed to open subscription management. Please try again.");
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] max-h-[700px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-2" />
        <p className="text-muted-foreground text-sm">Loading your conversation...</p>
      </div>
    );
  }

  // Onboarding screen
  if (showOnboarding && !userProfile) {
    return (
      <div className="flex flex-col h-[calc(100vh-180px)] max-h-[700px] relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Career Advisor
            </h2>
            <p className="text-xs text-muted-foreground">Let me get to know you first</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-violet-500" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Welcome! Tell me about yourself</h3>
              <p className="text-muted-foreground text-sm">
                This helps me tailor my advice to your specific situation and career stage.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleSelectProfile("student")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <GraduationCap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Student</p>
                  <p className="text-xs text-muted-foreground">College, university, bootcamp, or recent grad</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectProfile("professional")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Briefcase className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Professional</p>
                  <p className="text-xs text-muted-foreground">Currently employed or actively job searching</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectProfile("other")}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <User className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Other</p>
                  <p className="text-xs text-muted-foreground">Freelancer, entrepreneur, career changer, or exploring options</p>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                You can always update this later by starting a new chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-h-[700px] relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Career Advisor
              {accessInfo.hasAccess && (
                <span className="text-xs bg-violet-500/20 text-violet-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
              {userProfile && (
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {getProfileLabel(userProfile.type)}
                </span>
              )}
            </h2>
            <p className="text-xs text-muted-foreground">
              {accessInfo.hasAccess ? (
                "Unlimited access active"
              ) : (
                `${getRemainingFreeChats()} free chats remaining today`
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {accessInfo.hasAccess && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleManageSubscription}
              disabled={isCheckingSubscription}
            >
              <Settings className="w-4 h-4 mr-1" />
              Manage
            </Button>
          )}
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 pr-4 border rounded-lg bg-muted/20">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="font-medium text-lg mb-2">Hi! I'm your Career Advisor</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                {userProfile?.type === "student" 
                  ? "I can help with internships, first jobs, career planning, networking, and making the most of your education. What would you like to explore?"
                  : userProfile?.type === "professional"
                  ? "I can help with career growth, leadership, negotiations, workplace dynamics, and strategic moves. What's on your mind?"
                  : "I'm here to help with job searching, career transitions, salary negotiation, workplace dynamics, and professional growth. What's on your mind?"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto">
                {(userProfile?.type === "student" ? [
                  "How do I land my first internship?",
                  "What skills should I develop in college?",
                  "How do I network without experience?",
                  "Tips for entry-level interviews",
                ] : userProfile?.type === "professional" ? [
                  "How do I negotiate a higher salary?",
                  "I want to get promoted faster",
                  "How do I handle a difficult manager?",
                  "Should I change careers?",
                ] : [
                  "How do I transition to a new field?",
                  "Building credibility as a freelancer",
                  "How do I price my services?",
                  "Tips for career reinvention",
                ]).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-xs p-3 rounded-lg border bg-background hover:bg-muted transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-500" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-violet-500" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Paywall Overlay */}
      {showPaywall && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <div className="bg-background border rounded-xl p-6 max-w-sm mx-4 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-violet-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Unlock Unlimited Access</h3>
            <p className="text-muted-foreground text-sm mb-4">
              You've used your {FREE_CHAT_LIMIT} free chats today. Upgrade to Career Advisor Pro 
              for unlimited conversations and personalized career guidance.
            </p>
            
            <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4 mb-4">
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="text-3xl font-bold text-violet-600">$29.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">Auto-renews monthly. Cancel anytime.</p>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={upgradeEmail}
                onChange={(e) => setUpgradeEmail(e.target.value)}
                className="text-center"
              />
              
              <Button 
                onClick={handleUpgrade} 
                className="w-full bg-violet-600 hover:bg-violet-700"
                disabled={isCheckingSubscription}
              >
                {isCheckingSubscription ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Subscribe Now
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button 
                variant="outline" 
                onClick={handleVerifySubscription} 
                className="w-full"
                disabled={isCheckingSubscription}
              >
                {isCheckingSubscription ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Already subscribed? Verify
              </Button>
              
              <Button variant="ghost" onClick={() => setShowPaywall(false)} className="w-full text-muted-foreground">
                Come back tomorrow
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="mt-4 flex gap-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your career..."
          disabled={isLoading || (showPaywall && !accessInfo.hasAccess)}
          className="flex-1"
        />
        <Button 
          onClick={handleSend} 
          disabled={!input.trim() || isLoading || (showPaywall && !accessInfo.hasAccess)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
