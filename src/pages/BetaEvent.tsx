import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, Clock, Users, CheckCircle, Sparkles, ArrowRight,
  Target, FileText, BarChart3, TrendingUp, Briefcase, Brain,
  Linkedin, Eye, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  currentPosition: z.string().min(2, "Current position is required"),
  company: z.string().optional(),
  jobSearchStatus: z.string().min(1, "Please select your current status"),
  targetRoles: z.string().min(2, "Please describe your target roles"),
  linkedinUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  understandsBetaTerms: z.boolean().refine(val => val === true, "You must acknowledge this is a limited beta session"),
  agreesToCommunication: z.boolean().refine(val => val === true, "You must agree to receive event communications"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const BetaEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      currentPosition: "",
      company: "",
      jobSearchStatus: "",
      targetRoles: "",
      linkedinUrl: "",
      understandsBetaTerms: false,
      agreesToCommunication: false,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("beta_event_registrations")
        .insert({
          full_name: data.fullName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          current_position: data.currentPosition,
          company: data.company || null,
          job_search_status: data.jobSearchStatus,
          target_roles: data.targetRoles,
          linkedin_url: data.linkedinUrl || null,
          understands_beta_terms: data.understandsBetaTerms,
          agrees_to_communication: data.agreesToCommunication,
        });

      if (error) throw error;

      await supabase.functions.invoke("send-beta-registration-email", {
        body: { name: data.fullName, email: data.email },
      });

      setIsSubmitted(true);
      setShowRegistrationDialog(false);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card border border-border rounded-2xl p-12 shadow-lg">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Application Received!
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Thanks! Your application has been received. If selected, you'll get an email confirmation with your calendar invite + Zoom link. Because spots are limited to 20, invitations may take priority based on fit and response order.
              </p>
              <Button asChild className="mt-8">
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 animate-fade-up">
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
            {/* Beta Testing Event - FEATURED */}
            <div className="border-2 border-purple-500/50 rounded-xl bg-gradient-to-r from-purple-500/10 to-amber-500/5 overflow-hidden ring-2 ring-purple-500/20">
              <button
                onClick={() => setShowRegistrationDialog(true)}
                className="w-full p-6 hover:bg-purple-500/5 transition-all group text-left"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                    <Calendar className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-foreground">Resume Intelligence Suite — Live Beta Testing</h3>
                      <span className="text-xs bg-purple-500/20 text-purple-600 px-2 py-0.5 rounded-full font-medium animate-pulse">Live Event</span>
                      <ArrowRight className="w-4 h-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      Join our exclusive live beta session. Walk through the Resume Intelligence experience, identify gaps in your resume, and get a prioritized improvement checklist.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm bg-purple-500/10 rounded-lg px-3 py-1.5 text-purple-700">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Jan 6, 2026</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm bg-purple-500/10 rounded-lg px-3 py-1.5 text-purple-700">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">6:00–8:00 PM CT</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm bg-purple-500/10 rounded-lg px-3 py-1.5 text-purple-700">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">20 Spots</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Live guided session</span>
                      <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Resume gap analysis</span>
                      <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-purple-600" /> Improvement checklist</span>
                    </div>
                  </div>
                </div>
              </button>
              <div className="px-6 pb-4 text-sm text-purple-700 border-t border-purple-500/20 pt-3 bg-purple-500/5">
                <strong>Limited spots available.</strong> Apply now — invitations based on fit and response order.
              </div>
            </div>

            {/* Strategic Assessment Tool - FREE */}
            <div className="border-2 border-emerald-500/30 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent overflow-hidden">
              <button
                onClick={() => navigate("/career-coach")}
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
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Resume Intelligence Suite - PAID */}
            <div className="border-2 border-amber-500/30 rounded-xl bg-gradient-to-r from-amber-500/5 to-transparent overflow-hidden">
              <button
                onClick={() => navigate("/career-coach")}
                className="w-full p-6 hover:bg-amber-500/5 transition-all group text-left"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                    <FileText className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-foreground">Resume Intelligence Suite</h3>
                      <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">$49.99</span>
                      <ArrowRight className="w-4 h-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      Your resume transformed for your target job + your unique professional identity.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                        <BarChart3 className="w-4 h-4 text-amber-600" />
                        <span><strong>ATS Score</strong> — Job-specific</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-lg px-3 py-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span><strong>AI Rewrite</strong> — Personalized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* LinkedIn Profile Signal Score - PAID */}
            <div className="border-2 border-blue-500/30 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent overflow-hidden">
              <button
                onClick={() => navigate("/career-coach")}
                className="w-full p-6 hover:bg-blue-500/5 transition-all group text-left"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                    <Linkedin className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-foreground">LinkedIn Signal Score</h3>
                      <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-0.5 rounded-full font-medium">$29.99</span>
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
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span><strong>AI Optimize</strong> — Suggestions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Explore all tools at{" "}
            <button onClick={() => navigate("/career-coach")} className="text-primary hover:underline">
              Rimo AI Career Coach
            </button>
          </p>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Apply for Beta Testing</DialogTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Live session on <strong>January 6, 2026 at 6:00–8:00 PM CT</strong>. Limited to 20 participants.
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Basic Information
                </h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Position / Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Senior Product Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: Quick Fit */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Fit
                </h3>

                <FormField
                  control={form.control}
                  name="jobSearchStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What best describes you right now? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2 mt-2"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="actively_interviewing" id="actively" />
                            <Label htmlFor="actively" className="font-normal cursor-pointer">
                              Actively interviewing
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="preparing_soon" id="preparing" />
                            <Label htmlFor="preparing" className="font-normal cursor-pointer">
                              Preparing to interview soon (next 1–2 months)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="exploring" id="exploring" />
                            <Label htmlFor="exploring" className="font-normal cursor-pointer">
                              Exploring options (3+ months)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other" className="font-normal cursor-pointer">
                              Other
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role(s) you're targeting *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior PM, Director of Product" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 3: Consent */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Consent & Expectations
                </h3>

                <FormField
                  control={form.control}
                  name="understandsBetaTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          I understand this is a live beta testing session and spots are limited to 20 invited participants. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreesToCommunication"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          I agree to receive event communication by email if selected. *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BetaEvent;
