import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Target, BarChart3, Briefcase, Brain, Compass, 
  ArrowRight, Clock, Zap, CheckCircle, Sparkles,
  Linkedin, Eye, MessageSquare, Lock, FileText, TrendingUp,
  AlertTriangle, Mail, Loader2, Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";


interface RimoLandingProps {
  onStartAssessment: () => void;
  onStartResumeSuite: () => void;
  onStartLinkedIn: () => void;
  onStartCareerAdvisor: () => void;
  onStartInterviewPrep?: () => void;
}

const RESUME_SUITE_ACCESS_KEY = "resume_suite_access";
const LINKEDIN_SUITE_ACCESS_KEY = "linkedin_suite_access";
const CAREER_ADVISOR_ACCESS_KEY = "career_advisor_access";
const INTERVIEW_PREP_ACCESS_KEY = "interview_prep_access";
const PENDING_PURCHASE_EMAIL_KEY = "pending_purchase_email";
const PENDING_PURCHASE_TOOL_KEY = "pending_purchase_tool";

interface AccessInfo {
  hasAccess: boolean;
  expiresAt?: string;
  daysRemaining?: number;
  email?: string;
}

type RoleFilter = "all" | "pm" | "swe";

export function RimoLanding({ onStartAssessment, onStartResumeSuite, onStartLinkedIn, onStartCareerAdvisor, onStartInterviewPrep }: RimoLandingProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showInterviewPrepDialog, setShowInterviewPrepDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showLinkedInPaymentDialog, setShowLinkedInPaymentDialog] = useState(false);
  const [showInterviewPrepPaymentDialog, setShowInterviewPrepPaymentDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryToolType, setRecoveryToolType] = useState<"resume_suite" | "linkedin_signal" | "interview_prep">("resume_suite");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"input" | "not_found" | "sending">("input");
  const [email, setEmail] = useState("");
  const [linkedInEmail, setLinkedInEmail] = useState("");
  const [interviewPrepEmail, setInterviewPrepEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resumeAccess, setResumeAccess] = useState<AccessInfo>({ hasAccess: false });
  const [linkedInAccess, setLinkedInAccess] = useState<AccessInfo>({ hasAccess: false });
  const [careerAdvisorAccess, setCareerAdvisorAccess] = useState<AccessInfo>({ hasAccess: false });
  const [interviewPrepAccess, setInterviewPrepAccess] = useState<AccessInfo>({ hasAccess: false });

  useEffect(() => {
    const init = async () => {
      // Check for magic link verification
      const verifyToken = searchParams.get("verify");
      const toolType = searchParams.get("tool");
      
      if (verifyToken) {
        setIsVerifying(true);
        try {
          const { data, error } = await supabase.functions.invoke("verify-tool-access", {
            body: { accessToken: verifyToken, action: "verify" },
          });

          if (error) throw error;

          if (data.valid) {
            // Store access locally
            const accessData = {
              expiry: new Date(data.expiresAt).getTime(),
              email: data.email,
              daysRemaining: data.daysRemaining,
            };
            
            if (data.toolType === "resume_suite") {
              localStorage.setItem(RESUME_SUITE_ACCESS_KEY, JSON.stringify(accessData));
              setResumeAccess({ 
                hasAccess: true, 
                expiresAt: data.expiresAt, 
                daysRemaining: data.daysRemaining,
                email: data.email 
              });
              toast.success("Access verified! You can now use the Resume Intelligence Suite.");
            } else if (data.toolType === "linkedin_signal") {
              localStorage.setItem(LINKEDIN_SUITE_ACCESS_KEY, JSON.stringify(accessData));
              setLinkedInAccess({ 
                hasAccess: true, 
                expiresAt: data.expiresAt, 
                daysRemaining: data.daysRemaining,
                email: data.email 
              });
              toast.success("Access verified! You can now use the LinkedIn Signal Score.");
            }
            
            // Clear URL params
            setSearchParams({});
          } else {
            toast.error(data.error || "Invalid access link. Please check your email for the correct link.");
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Failed to verify access. Please try again.");
        } finally {
          setIsVerifying(false);
        }
        return;
      }

      // Check for purchase success - grant immediate access
      const purchaseType = searchParams.get("purchase");
      if (purchaseType === "resume_success" || purchaseType === "linkedin_success" || purchaseType === "interview_prep_success") {
        const pendingEmail = localStorage.getItem(PENDING_PURCHASE_EMAIL_KEY);
        let pendingTool = "resume_suite";
        if (purchaseType === "linkedin_success") pendingTool = "linkedin_signal";
        if (purchaseType === "interview_prep_success") pendingTool = "interview_prep";
        
        if (pendingEmail) {
          setIsProcessing(true);
          try {
            const { data, error } = await supabase.functions.invoke("send-tool-access-email", {
              body: { email: pendingEmail, toolType: pendingTool },
            });

            if (error) throw error;

            // Grant immediate access using the returned token
            if (data.accessToken && data.expiresAt) {
              const accessData = {
                expiry: new Date(data.expiresAt).getTime(),
                email: pendingEmail,
                daysRemaining: 30,
              };
              
              if (pendingTool === "resume_suite") {
                localStorage.setItem(RESUME_SUITE_ACCESS_KEY, JSON.stringify(accessData));
                setResumeAccess({ 
                  hasAccess: true, 
                  expiresAt: data.expiresAt, 
                  daysRemaining: 30,
                  email: pendingEmail 
                });
                toast.success("Payment successful! Your Resume Intelligence Suite access is now active.");
              } else if (pendingTool === "linkedin_signal") {
                localStorage.setItem(LINKEDIN_SUITE_ACCESS_KEY, JSON.stringify(accessData));
                setLinkedInAccess({ 
                  hasAccess: true, 
                  expiresAt: data.expiresAt, 
                  daysRemaining: 30,
                  email: pendingEmail 
                });
                toast.success("Payment successful! Your LinkedIn Signal Score access is now active.");
              } else if (pendingTool === "interview_prep") {
                localStorage.setItem(INTERVIEW_PREP_ACCESS_KEY, JSON.stringify(accessData));
                setInterviewPrepAccess({ 
                  hasAccess: true, 
                  expiresAt: data.expiresAt, 
                  daysRemaining: 30,
                  email: pendingEmail 
                });
                toast.success("Payment successful! Your Interview Prep Pro access is now active.");
              }
            }

            localStorage.removeItem(PENDING_PURCHASE_EMAIL_KEY);
            localStorage.removeItem(PENDING_PURCHASE_TOOL_KEY);
            // Access granted immediately - no need to show "check email" dialog
          } catch (error) {
            console.error("Failed to activate access:", error);
            toast.error("Payment received but failed to activate. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        } else {
          toast.info("Payment successful! Please enter your email to activate your access.");
        }
        
        // Clear URL params
        setSearchParams({});
        return;
      }

      // Check stored access (but validate against backend so cancelled/expired access is removed)
      await checkStoredAccess();
      
      // Check career advisor subscription
      checkCareerAdvisorAccess();
    };

    init();
  }, [searchParams, setSearchParams]);

  const checkStoredAccess = async () => {
    const DAY_MS = 1000 * 60 * 60 * 24;

    const validateOne = async (
      storageKey: string,
      toolType: "resume_suite" | "linkedin_signal" | "interview_prep",
      setAccess: (info: AccessInfo) => void
    ) => {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;

      try {
        const parsed = JSON.parse(stored) as { expiry: number; email?: string };
        const expiry = Number(parsed.expiry);
        const storedEmail = parsed.email;

        if (!expiry || Date.now() >= expiry) {
          localStorage.removeItem(storageKey);
          setAccess({ hasAccess: false });
          return;
        }

        // If we don't know the email, we can't validate; treat as no access.
        if (!storedEmail) {
          localStorage.removeItem(storageKey);
          setAccess({ hasAccess: false });
          return;
        }

        const { data, error } = await supabase.functions.invoke("verify-tool-access", {
          body: { email: storedEmail, toolType, action: "check" },
        });

        if (error) throw error;

        if (!data?.hasAccess) {
          localStorage.removeItem(storageKey);
          setAccess({ hasAccess: false });
          return;
        }

        const canonicalExpiresAt = data.expiresAt as string | undefined;
        const canonicalExpiryMs = canonicalExpiresAt ? new Date(canonicalExpiresAt).getTime() : expiry;
        const remaining = Math.max(0, Math.ceil((canonicalExpiryMs - Date.now()) / DAY_MS));

        localStorage.setItem(
          storageKey,
          JSON.stringify({ expiry: canonicalExpiryMs, email: storedEmail, daysRemaining: remaining })
        );

        setAccess({
          hasAccess: true,
          expiresAt: canonicalExpiresAt,
          daysRemaining: data.daysRemaining ?? remaining,
          email: storedEmail,
        });
      } catch {
        localStorage.removeItem(storageKey);
        setAccess({ hasAccess: false });
      }
    };

    await Promise.all([
      validateOne(RESUME_SUITE_ACCESS_KEY, "resume_suite", setResumeAccess),
      validateOne(LINKEDIN_SUITE_ACCESS_KEY, "linkedin_signal", setLinkedInAccess),
      validateOne(INTERVIEW_PREP_ACCESS_KEY, "interview_prep", setInterviewPrepAccess),
    ]);
  };

  const checkCareerAdvisorAccess = () => {
    try {
      const stored = localStorage.getItem(CAREER_ADVISOR_ACCESS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.expiry && new Date(data.expiry) > new Date()) {
          const daysRemaining = Math.ceil((new Date(data.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          setCareerAdvisorAccess({ 
            hasAccess: true, 
            expiresAt: new Date(data.expiry).toISOString(),
            daysRemaining,
            email: data.email 
          });
        }
      }
    } catch (e) {
      console.error("Error checking career advisor access:", e);
    }
  };

  const handleResumeSuiteClick = () => {
    if (resumeAccess.hasAccess) {
      onStartResumeSuite();
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handleLinkedInClick = () => {
    if (linkedInAccess.hasAccess) {
      onStartLinkedIn();
    } else {
      setShowLinkedInPaymentDialog(true);
    }
  };

  const handleCheckout = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    
    try {
      // First check if user already has access
      const { data: accessData, error: accessError } = await supabase.functions.invoke("verify-tool-access", {
        body: { email, toolType: "resume_suite", action: "check" },
      });

      if (!accessError && accessData?.hasAccess) {
        setShowPaymentDialog(false);
        toast.success(`You already have access with this email! ${accessData.daysRemaining} days remaining.`, {
          duration: 5000,
        });
        // Store email and grant access directly
        setResumeAccess({ hasAccess: true, email, expiresAt: accessData.expiresAt });
        localStorage.setItem(RESUME_SUITE_ACCESS_KEY, JSON.stringify({ 
          hasAccess: true, 
          email, 
          expiresAt: accessData.expiresAt 
        }));
        return;
      }

      // Record the email for tracking
      await supabase.from("tool_purchases").insert({
        email,
        tool_type: "resume_suite",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Store email temporarily to send access email after payment
      localStorage.setItem(PENDING_PURCHASE_EMAIL_KEY, email);
      localStorage.setItem(PENDING_PURCHASE_TOOL_KEY, "resume_suite");
      
      // Create subscription checkout session
      const { data, error } = await supabase.functions.invoke("create-tool-subscription", {
        body: { email, toolType: "resume_suite" },
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        const paymentWindow = window.open(data.url, "_blank");
        if (paymentWindow) {
          paymentWindow.focus();
        }
      }
      
      setShowPaymentDialog(false);
      toast.info("Complete your purchase in the new tab. Access activates automatically when you return.");
    } catch (error) {
      console.error("Failed to record purchase intent:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkedInCheckout = async () => {
    if (!linkedInEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    
    try {
      // First check if user already has access
      const { data: accessData, error: accessError } = await supabase.functions.invoke("verify-tool-access", {
        body: { email: linkedInEmail, toolType: "linkedin_signal", action: "check" },
      });

      if (!accessError && accessData?.hasAccess) {
        setShowLinkedInPaymentDialog(false);
        toast.success(`You already have access with this email! ${accessData.daysRemaining} days remaining.`, {
          duration: 5000,
        });
        // Store email and grant access directly
        setLinkedInAccess({ hasAccess: true, email: linkedInEmail, expiresAt: accessData.expiresAt });
        localStorage.setItem(LINKEDIN_SUITE_ACCESS_KEY, JSON.stringify({ 
          hasAccess: true, 
          email: linkedInEmail, 
          expiresAt: accessData.expiresAt 
        }));
        return;
      }

      // Record the email for tracking
      await supabase.from("tool_purchases").insert({
        email: linkedInEmail,
        tool_type: "linkedin_signal",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Store email temporarily
      localStorage.setItem(PENDING_PURCHASE_EMAIL_KEY, linkedInEmail);
      localStorage.setItem(PENDING_PURCHASE_TOOL_KEY, "linkedin_signal");
      
      // Create subscription checkout session
      const { data, error: checkoutError } = await supabase.functions.invoke("create-tool-subscription", {
        body: { email: linkedInEmail, toolType: "linkedin_signal" },
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      if (data?.url) {
        const paymentWindow = window.open(data.url, "_blank");
        if (paymentWindow) {
          paymentWindow.focus();
        }
      }
      
      setShowLinkedInPaymentDialog(false);
      toast.info("Complete your purchase in the new tab. Access activates automatically when you return.");
    } catch (error) {
      console.error("Failed to record purchase intent:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInterviewPrepCheckout = async () => {
    if (!interviewPrepEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    
    try {
      // First check if user already has access
      const { data: accessData, error: accessError } = await supabase.functions.invoke("verify-tool-access", {
        body: { email: interviewPrepEmail, toolType: "interview_prep", action: "check" },
      });

      if (!accessError && accessData?.hasAccess) {
        setShowInterviewPrepPaymentDialog(false);
        toast.success(`You already have access with this email! ${accessData.daysRemaining} days remaining.`, {
          duration: 5000,
        });
        // Store email and grant access directly
        setInterviewPrepAccess({ hasAccess: true, email: interviewPrepEmail, expiresAt: accessData.expiresAt });
        localStorage.setItem(INTERVIEW_PREP_ACCESS_KEY, JSON.stringify({ 
          expiry: new Date(accessData.expiresAt).getTime(), 
          email: interviewPrepEmail, 
          daysRemaining: accessData.daysRemaining 
        }));
        return;
      }

      // Record the email for tracking
      await supabase.from("tool_purchases").insert({
        email: interviewPrepEmail,
        tool_type: "interview_prep",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Store email temporarily
      localStorage.setItem(PENDING_PURCHASE_EMAIL_KEY, interviewPrepEmail);
      localStorage.setItem(PENDING_PURCHASE_TOOL_KEY, "interview_prep");
      
      // Create subscription checkout session
      const { data, error: checkoutError } = await supabase.functions.invoke("create-tool-subscription", {
        body: { email: interviewPrepEmail, toolType: "interview_prep" },
      });

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      if (data?.url) {
        const paymentWindow = window.open(data.url, "_blank");
        if (paymentWindow) {
          paymentWindow.focus();
        }
      }
      
      setShowInterviewPrepPaymentDialog(false);
      toast.info("Complete your purchase in the new tab. Access activates automatically when you return.");
    } catch (error) {
      console.error("Failed to record purchase intent:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRecoveryDialog = (toolType: "resume_suite" | "linkedin_signal" | "interview_prep") => {
    setRecoveryToolType(toolType);
    setRecoveryEmail("");
    setRecoveryStep("input");
    setShowRecoveryDialog(true);
  };

  const handleRecoveryCheck = async () => {
    if (!recoveryEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsProcessing(true);
    try {
      // First, try instant lookup
      const { data, error } = await supabase.functions.invoke("verify-tool-access", {
        body: { email: recoveryEmail, toolType: recoveryToolType, action: "check" },
      });

      if (error) throw error;

      if (data.hasAccess) {
        // Grant immediate access
        const accessData = {
          expiry: new Date(data.expiresAt).getTime(),
          email: recoveryEmail,
          daysRemaining: data.daysRemaining,
        };
        
        if (recoveryToolType === "resume_suite") {
          localStorage.setItem(RESUME_SUITE_ACCESS_KEY, JSON.stringify(accessData));
          setResumeAccess({ 
            hasAccess: true, 
            expiresAt: data.expiresAt, 
            daysRemaining: data.daysRemaining,
            email: recoveryEmail 
          });
          toast.success("Access restored! You can now use the Resume Intelligence Suite.");
        } else if (recoveryToolType === "linkedin_signal") {
          localStorage.setItem(LINKEDIN_SUITE_ACCESS_KEY, JSON.stringify(accessData));
          setLinkedInAccess({ 
            hasAccess: true, 
            expiresAt: data.expiresAt, 
            daysRemaining: data.daysRemaining,
            email: recoveryEmail 
          });
          toast.success("Access restored! You can now use the LinkedIn Signal Score.");
        } else if (recoveryToolType === "interview_prep") {
          localStorage.setItem(INTERVIEW_PREP_ACCESS_KEY, JSON.stringify(accessData));
          setInterviewPrepAccess({ 
            hasAccess: true, 
            expiresAt: data.expiresAt, 
            daysRemaining: data.daysRemaining,
            email: recoveryEmail 
          });
          toast.success("Access restored! You can now use Interview Prep Pro.");
        }
        setShowRecoveryDialog(false);
      } else {
        // Not found - offer to send magic link
        setRecoveryStep("not_found");
      }
    } catch (error) {
      console.error("Recovery check failed:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendRecoveryLink = async () => {
    setRecoveryStep("sending");
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-tool-access-email", {
        body: { email: recoveryEmail, toolType: recoveryToolType, recoveryOnly: true },
      });

      if (error) throw error;

      // Check if no active purchase was found
      if (data.notFound) {
        toast.error("No active purchase found for this email. Please contact support if you believe this is an error.");
        setRecoveryStep("not_found");
        return;
      }

      // If we got access data back, grant immediate access
      if (data.accessToken && data.expiresAt) {
        const accessData = {
          expiry: new Date(data.expiresAt).getTime(),
          email: recoveryEmail,
          daysRemaining: 30,
        };
        
        if (recoveryToolType === "resume_suite") {
          localStorage.setItem(RESUME_SUITE_ACCESS_KEY, JSON.stringify(accessData));
          setResumeAccess({ 
            hasAccess: true, 
            expiresAt: data.expiresAt, 
            daysRemaining: 30,
            email: recoveryEmail 
          });
          toast.success("Access restored! A backup link was also sent to your email.");
        } else if (recoveryToolType === "linkedin_signal") {
          localStorage.setItem(LINKEDIN_SUITE_ACCESS_KEY, JSON.stringify(accessData));
          setLinkedInAccess({ 
            hasAccess: true, 
            expiresAt: data.expiresAt, 
            daysRemaining: 30,
            email: recoveryEmail 
          });
          toast.success("Access restored! A backup link was also sent to your email.");
        } else if (recoveryToolType === "interview_prep") {
          localStorage.setItem(INTERVIEW_PREP_ACCESS_KEY, JSON.stringify(accessData));
          setInterviewPrepAccess({ 
            hasAccess: true, 
            expiresAt: data.expiresAt, 
            daysRemaining: 30,
            email: recoveryEmail 
          });
          toast.success("Access restored! A backup link was also sent to your email.");
        }
        setShowRecoveryDialog(false);
      } else {
        toast.success("Recovery link sent! Check your email.");
        setShowRecoveryDialog(false);
      }
    } catch (error) {
      console.error("Failed to send recovery link:", error);
      toast.error("Failed to send recovery link. Please contact support.");
      setRecoveryStep("not_found");
    } finally {
      setIsProcessing(false);
    }
  };

  // Expiry warning banner component
  const ExpiryWarning = ({ daysRemaining, toolName }: { daysRemaining: number; toolName: string }) => {
    if (daysRemaining > 7) return null;
    
    return (
      <div className="mb-4 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong> remaining on your {toolName} access.
          {daysRemaining <= 3 && " Renew soon to continue using the tool!"}
        </p>
      </div>
    );
  };

  if (isVerifying) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Verifying your access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-up">
      {/* Expiry Warnings */}
      {resumeAccess.hasAccess && resumeAccess.daysRemaining && (
        <ExpiryWarning daysRemaining={resumeAccess.daysRemaining} toolName="Resume Intelligence Suite" />
      )}
      {linkedInAccess.hasAccess && linkedInAccess.daysRemaining && (
        <ExpiryWarning daysRemaining={linkedInAccess.daysRemaining} toolName="LinkedIn Signal Score" />
      )}

      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-serif font-bold text-foreground">Rimo</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Your AI Career Coach
        </h1>
        <p className="text-muted-foreground mb-2">
          AI-powered tools to help you understand where you stand, optimize your resume, and prepare for what's next.
        </p>
        {/* Role Toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground mr-2">Show tools for:</span>
          <div className="flex rounded-full border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                roleFilter === "all" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter("pm")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                roleFilter === "pm" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Product Managers
            </button>
            <button
              onClick={() => setRoleFilter("swe")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                roleFilter === "swe" 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Engineers
            </button>
          </div>
        </div>
      </div>

      {/* Compact Tools Grid */}
      <div className="w-full max-w-4xl mx-auto mb-10">
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Strategic Assessment - FREE - Best for: Both */}
          <button
            onClick={onStartAssessment}
            className={`border-2 rounded-xl p-5 hover:bg-violet-500/5 transition-all group text-left bg-gradient-to-br from-violet-500/5 to-transparent ${
              roleFilter === "all" ? "border-violet-500/40" : "border-violet-500/60 ring-2 ring-violet-500/20"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors flex-shrink-0">
                <Target className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">Strategic Level Assessment</h3>
                  <span className="text-xs bg-violet-500/20 text-violet-600 px-2 py-0.5 rounded-full font-bold">FREE</span>
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Discover where you stand and what's blocking your next leap.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 8 min</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Skill analysis</span>
                  <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Blocker diagnosis</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
          </button>

          {/* Resume Intelligence Suite - Best for: Both */}
          <button
            onClick={onStartResumeSuite}
            className={`border-2 rounded-xl p-5 hover:bg-amber-500/5 transition-all group text-left bg-gradient-to-br from-amber-500/5 to-transparent ${
              roleFilter === "all" ? "border-amber-500/40" : "border-amber-500/60 ring-2 ring-amber-500/20"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">Resume Intelligence</h3>
                  {resumeAccess.hasAccess ? (
                    <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">$99/qtr</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  ATS scoring + AI rewrite personalized to your target role.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Free scan</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Before/After</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI rewrite</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
            {!resumeAccess.hasAccess && (
              <div className="mt-3 pt-3 border-t border-amber-500/20 flex justify-end">
                <span 
                  onClick={(e) => { e.stopPropagation(); openRecoveryDialog("resume_suite"); }}
                  className="text-xs text-primary hover:underline"
                >
                  Already purchased?
                </span>
              </div>
            )}
          </button>

          {/* Interview Prep - Best for: Both, but especially SWE */}
          <button
            onClick={onStartInterviewPrep}
            className={`border-2 rounded-xl p-5 hover:bg-emerald-500/5 transition-all group text-left bg-gradient-to-br from-emerald-500/5 to-transparent ${
              roleFilter === "swe" 
                ? "border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-md" 
                : roleFilter === "pm" 
                  ? "border-emerald-500/30 opacity-80" 
                  : "border-emerald-500/40"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">Interview Prep</h3>
                  {interviewPrepAccess.hasAccess ? (
                    <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {interviewPrepAccess.daysRemaining}d
                    </span>
                  ) : (
                    <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-medium">3 Free → $249/qtr</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Company-specific mock interviews with AI feedback.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> FAANG-ready</span>
                  <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Real-time feedback</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> STAR coaching</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
            {!interviewPrepAccess.hasAccess && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20 flex justify-end">
                <span 
                  onClick={(e) => { e.stopPropagation(); openRecoveryDialog("interview_prep"); }}
                  className="text-xs text-primary hover:underline"
                >
                  Already purchased?
                </span>
              </div>
            )}
          </button>

          {/* LinkedIn Signal Score - Best for: PM */}
          <button
            onClick={handleLinkedInClick}
            className={`border-2 rounded-xl p-5 hover:bg-blue-500/5 transition-all group text-left bg-gradient-to-br from-blue-500/5 to-transparent ${
              roleFilter === "pm" 
                ? "border-blue-500/60 ring-2 ring-blue-500/30 shadow-md" 
                : roleFilter === "swe" 
                  ? "border-blue-500/30 opacity-80" 
                  : "border-blue-500/40"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-foreground">LinkedIn Signal Score</h3>
                  {linkedInAccess.hasAccess ? (
                    <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full font-medium">$99/qtr</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-3">
                  Score your profile like recruiters do + AI optimization tips.
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Recruiter view</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Score impact</span>
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI suggestions</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
            </div>
            {!linkedInAccess.hasAccess && (
              <div className="mt-3 pt-3 border-t border-blue-500/20 flex justify-end">
                <span 
                  onClick={(e) => { e.stopPropagation(); openRecoveryDialog("linkedin_signal"); }}
                  className="text-xs text-primary hover:underline"
                >
                  Already purchased?
                </span>
              </div>
            )}
          </button>

        </div>

        {/* Coming Soon Section */}
        <div className="mt-4 border border-muted rounded-xl p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-muted-foreground">Rimo – Personal Advisor</h3>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>
              <p className="text-xs text-muted-foreground/70">Your ongoing AI advisor for career decisions and life strategy.</p>
            </div>
          </div>
        </div>
      </div>


      {/* Resume Suite Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Resume Intelligence Suite
            </DialogTitle>
            <DialogDescription>
              Full access for 3 months. Your access activates immediately after payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">$99</span>
              <span className="text-muted-foreground ml-2">/ quarter</span>
              <p className="text-xs text-muted-foreground mt-1">Auto-renews every 3 months. Cancel anytime.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Your email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                For access confirmation & backup access link
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> ATS scoring & analysis</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI-powered resume enhancement</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Before/after comparison</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Access from any device</li>
            </ul>
            <Button onClick={handleCheckout} className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Continue to Payment</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* LinkedIn Payment Dialog */}
      <Dialog open={showLinkedInPaymentDialog} onOpenChange={setShowLinkedInPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-600" />
              LinkedIn Signal Score
            </DialogTitle>
            <DialogDescription>
              Full access for 3 months. Auto-renews quarterly unless cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">$99</span>
              <span className="text-muted-foreground ml-2">/ quarter</span>
              <p className="text-xs text-muted-foreground mt-1">Auto-renews every 3 months. Cancel anytime.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="linkedin-email" className="text-sm font-medium text-foreground">
                Your email address
              </label>
              <Input
                id="linkedin-email"
                type="email"
                placeholder="you@example.com"
                value={linkedInEmail}
                onChange={(e) => setLinkedInEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                For access confirmation & backup access link
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Profile signal scoring</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI optimization suggestions</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Section-by-section rewrites</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Access from any device</li>
            </ul>
            <Button onClick={handleLinkedInCheckout} className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Continue to Payment</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interview Prep Payment Dialog */}
      <Dialog open={showInterviewPrepPaymentDialog} onOpenChange={setShowInterviewPrepPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              Interview Prep Pro
            </DialogTitle>
            <DialogDescription>
              Full access for 3 months. Auto-renews quarterly unless cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-foreground">$249</span>
              <span className="text-muted-foreground ml-2">/ quarter</span>
              <p className="text-xs text-muted-foreground mt-1">Auto-renews every 3 months. Cancel anytime.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="interview-prep-email" className="text-sm font-medium text-foreground">
                Your email address
              </label>
              <Input
                id="interview-prep-email"
                type="email"
                placeholder="you@example.com"
                value={interviewPrepEmail}
                onChange={(e) => setInterviewPrepEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                For access confirmation & backup access link
              </p>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Unlimited mock interview sessions</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI assesses answers & recommends changes</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sample answers based on your experience</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Role-playing for PM & SWE roles</li>
              <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> STAR format coaching</li>
            </ul>
            <Button onClick={handleInterviewPrepCheckout} className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Continue to Payment</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Interview Prep Coming Soon Dialog */}
      <Dialog open={showInterviewPrepDialog} onOpenChange={setShowInterviewPrepDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              AI Interview Prep
            </DialogTitle>
            <DialogDescription>
              Coming soon! We're building an AI-powered interview preparation tool with mock interviews, 
              real-time feedback, and personalized coaching.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Want to be notified when this launches? Book a strategy call and we'll keep you in the loop.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInterviewPrepDialog(false)} className="flex-1">
                Close
              </Button>
              <Button asChild className="flex-1">
                <a href="/book-call" target="_blank" rel="noopener noreferrer">
                  Book Strategy Call
                </a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Recover Your Access
            </DialogTitle>
            <DialogDescription>
              {recoveryStep === "input" && "Enter the email you used when purchasing to restore access."}
              {recoveryStep === "not_found" && "We couldn't find an active purchase with that email."}
              {recoveryStep === "sending" && "Sending you a new access link..."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {recoveryStep === "input" && (
              <>
                <div className="space-y-2">
                  <label htmlFor="recovery-email" className="text-sm font-medium text-foreground">
                    Purchase email address
                  </label>
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="you@example.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRecoveryCheck()}
                  />
                </div>
                <Button onClick={handleRecoveryCheck} className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                  ) : (
                    "Find My Purchase"
                  )}
                </Button>
              </>
            )}
            
            {recoveryStep === "not_found" && (
              <>
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <p className="text-sm text-amber-700">
                    No active purchase found for <strong>{recoveryEmail}</strong>. 
                    This could mean the purchase was made with a different email, or the access has expired.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  If you believe this is an error, we can send a new access link to this email (only works if you have an active purchase).
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRecoveryStep("input")} className="flex-1">
                    Try Different Email
                  </Button>
                  <Button onClick={handleSendRecoveryLink} disabled={isProcessing} className="flex-1">
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      "Send Link Anyway"
                    )}
                  </Button>
                </div>
              </>
            )}
            
            {recoveryStep === "sending" && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Sending access link to {recoveryEmail}...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
}
