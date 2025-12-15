import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Target, BarChart3, Briefcase, Brain, Compass, 
  ArrowRight, Clock, Zap, CheckCircle, Sparkles,
  Linkedin, Eye, MessageSquare, Lock, CreditCard, FileText, TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface RimoLandingProps {
  onStartAssessment: () => void;
  onStartResumeSuite: () => void;
  onStartLinkedIn: () => void;
}

const RESUME_SUITE_ACCESS_KEY = "resume_suite_access";

const LINKEDIN_SUITE_ACCESS_KEY = "linkedin_suite_access";

export function RimoLanding({ onStartAssessment, onStartResumeSuite, onStartLinkedIn }: RimoLandingProps) {
  const [searchParams] = useSearchParams();
  const [showInterviewPrepDialog, setShowInterviewPrepDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showLinkedInPaymentDialog, setShowLinkedInPaymentDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [linkedInEmail, setLinkedInEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResumeAccess, setHasResumeAccess] = useState(false);
  const [hasLinkedInAccess, setHasLinkedInAccess] = useState(false);

  useEffect(() => {
    const purchaseType = searchParams.get("purchase");
    if (purchaseType === "resume_success") {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(RESUME_SUITE_ACCESS_KEY, JSON.stringify({ expiry }));
      setHasResumeAccess(true);
      toast.success("Payment successful! You now have access to the Resume Intelligence Suite for 1 month.");
    } else if (purchaseType === "linkedin_success") {
      const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem(LINKEDIN_SUITE_ACCESS_KEY, JSON.stringify({ expiry }));
      setHasLinkedInAccess(true);
      toast.success("Payment successful! You now have access to the LinkedIn Signal Score for 1 month.");
    }

    // Check resume access
    const storedResume = localStorage.getItem(RESUME_SUITE_ACCESS_KEY);
    if (storedResume) {
      const { expiry } = JSON.parse(storedResume);
      if (Date.now() < expiry) {
        setHasResumeAccess(true);
      } else {
        localStorage.removeItem(RESUME_SUITE_ACCESS_KEY);
      }
    }

    // Check LinkedIn access
    const storedLinkedIn = localStorage.getItem(LINKEDIN_SUITE_ACCESS_KEY);
    if (storedLinkedIn) {
      const { expiry } = JSON.parse(storedLinkedIn);
      if (Date.now() < expiry) {
        setHasLinkedInAccess(true);
      } else {
        localStorage.removeItem(LINKEDIN_SUITE_ACCESS_KEY);
      }
    }
  }, [searchParams]);

  const handleResumeSuiteClick = () => {
    if (hasResumeAccess) {
      onStartResumeSuite();
    } else {
      setShowPaymentDialog(true);
    }
  };

  const handleLinkedInClick = () => {
    if (hasLinkedInAccess) {
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

    // Record the email for tracking before opening payment link
    try {
      await supabase.from("tool_purchases").insert({
        email,
        tool_type: "resume_suite",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error("Failed to record purchase intent:", error);
    }

    // Open direct Stripe Payment Link
    window.open("https://buy.stripe.com/bJeeVc6i5cqS5gz3kv9sk0b", "_blank");
    setShowPaymentDialog(false);
    toast.info("Complete your purchase in the new tab. Return here after payment.");
  };

  const handleLinkedInCheckout = async () => {
    if (!linkedInEmail) {
      toast.error("Please enter your email address");
      return;
    }

    // Record the email for tracking before opening payment link
    try {
      await supabase.from("tool_purchases").insert({
        email: linkedInEmail,
        tool_type: "linkedin_signal",
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error("Failed to record purchase intent:", error);
    }

    // Open direct Stripe Payment Link
    window.open("https://buy.stripe.com/6oUcN49uhgH86kD4oz9sk0c", "_blank");
    setShowLinkedInPaymentDialog(false);
    toast.info("Complete your purchase in the new tab. Return here after payment.");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-up">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-serif font-bold text-foreground">Rimo</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Your AI Career Coach
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          AI-powered tools to help you understand where you stand, optimize your resume, and prepare for what's next.
        </p>
        <p className="text-sm text-muted-foreground">
          Powered by advanced AI • Built for Product Managers
        </p>
      </div>

      {/* AI Tools Suite */}
      <div className="w-full max-w-3xl mx-auto mb-10">
        <h2 className="text-center text-sm font-medium text-muted-foreground mb-4">AI-POWERED TOOLS</h2>
        
        <div className="grid gap-4">
          {/* Strategic Assessment Tool - FREE */}
          <div className="border-2 border-emerald-500/30 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent overflow-hidden">
            <button
              onClick={onStartAssessment}
              className="w-full p-6 hover:bg-emerald-500/5 transition-all group text-left"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                  <Target className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-foreground">Strategic Level Assessment</h3>
                    <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Free</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Get a clear, honest assessment of where you operate today and what's blocking your next leap.
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 8-10 min</span>
                    <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Skill analysis</span>
                    <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Blocker diagnosis</span>
                    <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5" /> Role fit</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Resume Intelligence Suite - PAID */}
          <div className="border-2 border-amber-500/30 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent overflow-hidden">
            <button
              onClick={handleResumeSuiteClick}
              className="w-full p-6 hover:bg-amber-500/5 transition-all group text-left"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                  <FileText className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-lg text-foreground">Resume Intelligence Suite</h3>
                    <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">$19.99</span>
                    {hasResumeAccess ? (
                      <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    Your resume transformed for your target job + your unique professional identity. AI uses your self-description to create authentic, personalized content that gets through ATS and impresses hiring managers.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      <span><strong>ATS Score</strong> — Job-specific analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span><strong>AI Rewrite</strong> — Personalized to you</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Before & After</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> Role-targeted</span>
                    <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Keywords Added</span>
                  </div>
                </div>
              </div>
            </button>
            <div className="px-6 pb-4 text-xs text-muted-foreground border-t border-border/50 pt-3 bg-muted/20">
              <span className="font-medium">You provide:</span> Resume + Job Description + How you want to be perceived → <span className="font-medium">You get:</span> ATS Score + Personalized AI Rewrite + New Score
            </div>
          </div>

          {/* LinkedIn Profile Signal Score - PAID */}
          <div className="border-2 border-blue-500/30 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent overflow-hidden">
            <button
              onClick={handleLinkedInClick}
              className="w-full p-6 hover:bg-blue-500/5 transition-all group text-left"
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                  <Linkedin className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-lg text-foreground">LinkedIn Signal Score</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full font-medium">$19.99</span>
                    {hasLinkedInAccess ? (
                      <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <ArrowRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    Get your profile scored the way recruiters see it, then get AI suggestions to boost visibility.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span><strong>Signal Score</strong> — Recruiter view</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span><strong>AI Optimize</strong> — Get suggestions</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Headline rewrites</span>
                    <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Leadership signals</span>
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Score improvement</span>
                  </div>
                </div>
              </div>
            </button>
            <div className="px-6 pb-4 text-xs text-muted-foreground border-t border-border/50 pt-3 bg-muted/20">
              <span className="font-medium">You get:</span> Profile Signal Score → Dimension Analysis → AI Suggestions → Projected Score Impact
            </div>
          </div>

          {/* Interview Prep Tool - Coming Soon */}
          <button
            onClick={() => setShowInterviewPrepDialog(true)}
            className="w-full bg-card border border-border rounded-xl p-6 hover:border-secondary/50 transition-all group text-left opacity-75"
          >
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                <Sparkles className="w-7 h-7 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-foreground">AI Interview Prep</h3>
                  <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Practice mock interviews with personalized AI feedback, coaching, and real-time guidance.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Mock interviews</span>
                  <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Personalized coaching</span>
                  <span className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5" /> Performance insights</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          No login required
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Strategic Assessment free
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          AI-powered insights
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Actionable results
        </span>
      </div>

      {/* Differentiator */}
      <div className="max-w-lg mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          <Zap className="w-4 h-4 inline mr-1 text-primary" />
          <strong className="text-foreground">Rimo is your AI career companion.</strong> Built specifically for Product Managers 
          to calibrate career positioning, optimize resumes, and prepare for high-stakes opportunities.
        </p>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Resume Intelligence Suite
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p>
                Get the complete resume transformation experience for just <strong className="text-foreground">$19.99</strong> with 1 month of unlimited use.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Initial ATS Score</strong> — See exactly how your resume performs against your target job</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">AI Content Transformation</strong> — Get your resume rewritten with missing keywords, quantified achievements & stronger language</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">New ATS Score</strong> — See your improved score and exactly what changed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Unlimited use</strong> — Optimize for as many roles as you want for 30 days</span>
                </li>
              </ul>
              <div className="space-y-3 pt-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Button 
                  onClick={handleCheckout} 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Get Access for $19.99"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Secure payment via Stripe • One-time payment • 30-day access
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
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
            <DialogDescription className="pt-4 space-y-4">
              <p>
                Get your profile analyzed like a recruiter would for just <strong className="text-foreground">$19.99</strong> with 1 month of unlimited use.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Signal Score</strong> — See how recruiters view your profile across 6 dimensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">AI Optimization</strong> — Get headline rewrites, about section, and experience bullets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Projected Impact</strong> — See exactly how changes will improve your score</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Unlimited use</strong> — Optimize for different roles for 30 days</span>
                </li>
              </ul>
              <div className="space-y-3 pt-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={linkedInEmail}
                  onChange={(e) => setLinkedInEmail(e.target.value)}
                  className="w-full"
                />
                <Button 
                  onClick={handleLinkedInCheckout} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Get Access for $19.99"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Secure payment via Stripe • One-time payment • 30-day access
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Interview Prep Coming Soon Dialog */}
      <Dialog open={showInterviewPrepDialog} onOpenChange={setShowInterviewPrepDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Interview Prep
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p>
                Practice mock interviews with personalized AI feedback and coaching.
              </p>
              <div className="bg-secondary/20 rounded-lg p-4 text-center">
                <p className="text-lg font-semibold text-foreground">Coming Soon!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This premium feature will be launching soon. Stay tuned!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowInterviewPrepDialog(false)}>Got it</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
