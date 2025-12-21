import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar, Clock, Users, CheckCircle, Sparkles, ArrowRight,
  FileText, Linkedin, Eye, MessageSquare, BarChart3, Bot
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  subscribeToNewsletter: z.boolean().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

type ToolType = "resume_suite" | "linkedin_signal" | "career_advisor";

const toolInfo = {
  resume_suite: {
    name: "Resume Intelligence Suite",
    description: "Walk through the Resume Intelligence experience live, identify gaps in your resume, and get a prioritized improvement checklist.",
    color: "amber",
    icon: FileText,
    features: [
      "Live guided session",
      "Resume gap analysis", 
      "ATS scoring walkthrough",
      "Improvement checklist"
    ]
  },
  linkedin_signal: {
    name: "LinkedIn Signal Score",
    description: "Get your LinkedIn profile scored the way recruiters see it, then receive AI-powered suggestions to boost your visibility.",
    color: "blue",
    icon: Linkedin,
    features: [
      "Live guided session",
      "Recruiter-view scoring",
      "Profile optimization tips",
      "AI suggestions walkthrough"
    ]
  },
  career_advisor: {
    name: "AI Personal Advisor",
    description: "Your personal AI advisor for career, life decisions, and professional growth. Get 24/7 strategic guidance tailored to your unique situation.",
    color: "purple",
    icon: Bot,
    features: [
      "24/7 AI advisor access",
      "Personalized guidance",
      "Strategic decision support",
      "Goal tracking & accountability"
    ]
  }
};

const BetaEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [selectedToolType, setSelectedToolType] = useState<ToolType>("resume_suite");

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
      subscribeToNewsletter: true,
    },
  });

  const openRegistration = (toolType: ToolType) => {
    setSelectedToolType(toolType);
    setShowRegistrationDialog(true);
  };

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
          tool_type: selectedToolType,
          subscribe_to_newsletter: data.subscribeToNewsletter || false,
        });

      if (error) throw error;

      await supabase.functions.invoke("send-beta-registration-email", {
        body: { 
          name: data.fullName, 
          email: data.email,
          toolType: selectedToolType,
          toolName: toolInfo[selectedToolType].name
        },
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
              <p className="text-muted-foreground text-lg leading-relaxed mb-2">
                Thanks! Your application for <strong>{toolInfo[selectedToolType].name}</strong> beta testing has been received.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If selected, you'll get an email confirmation with your calendar invite + Zoom link. Because spots are limited to 20, invitations may take priority based on fit and response order.
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

  const currentTool = toolInfo[selectedToolType];

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
            Live Beta Testing Events
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Join our exclusive live sessions to test AI-powered career tools and get personalized feedback.
          </p>
          <p className="text-sm text-muted-foreground">
            Limited spots • Interactive sessions • Direct feedback opportunity
          </p>
        </div>

        {/* Beta Testing Events */}
        <div className="w-full max-w-4xl mx-auto mb-10">
          <h2 className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">
            Select a Beta Event to Register
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resume Intelligence Suite Beta */}
            <div className="border-2 border-amber-500/50 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 overflow-hidden hover:border-amber-500 transition-all group">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                      Live Beta Event
                    </span>
                    <h3 className="font-semibold text-lg text-foreground mt-1">
                      Resume Intelligence Suite
                    </h3>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Walk through the Resume Intelligence experience live, identify gaps in your resume, and get a prioritized improvement checklist.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 rounded-lg px-2.5 py-1.5 text-amber-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">Jan 6, 2025</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 rounded-lg px-2.5 py-1.5 text-amber-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">6–8 PM CT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-amber-500/10 rounded-lg px-2.5 py-1.5 text-amber-700">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium">20 Spots</span>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {toolInfo.resume_suite.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => openRegistration("resume_suite")}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* LinkedIn Signal Score Beta */}
            <div className="border-2 border-blue-500/50 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 overflow-hidden hover:border-blue-500 transition-all group">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Linkedin className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                      Live Beta Event
                    </span>
                    <h3 className="font-semibold text-lg text-foreground mt-1">
                      LinkedIn Signal Score
                    </h3>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Get your LinkedIn profile scored the way recruiters see it, then receive AI-powered suggestions to boost your visibility.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 rounded-lg px-2.5 py-1.5 text-blue-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">Jan 7, 2025</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 rounded-lg px-2.5 py-1.5 text-blue-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">6–8 PM CT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-blue-500/10 rounded-lg px-2.5 py-1.5 text-blue-700">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium">20 Spots</span>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {toolInfo.linkedin_signal.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => openRegistration("linkedin_signal")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* AI Career Advisor - Coming Soon */}
            <div className="md:col-span-2 border-2 border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-500/10 overflow-hidden opacity-80">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-xs bg-purple-500/20 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      Coming Soon
                    </span>
                    <h3 className="font-semibold text-lg text-foreground mt-1">
                      AI Personal Advisor
                    </h3>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Your personal AI advisor for career, life decisions, and professional growth. Get 24/7 strategic guidance tailored to your unique situation.
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs bg-purple-500/10 rounded-lg px-2.5 py-1.5 text-purple-700">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">TBD</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-purple-500/10 rounded-lg px-2.5 py-1.5 text-purple-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-medium">Time TBD</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs bg-purple-500/10 rounded-lg px-2.5 py-1.5 text-purple-700">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium">Limited Spots</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 mb-5">
                  {toolInfo.career_advisor.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    disabled
                    className="flex-1 bg-purple-600/50 text-white cursor-not-allowed"
                  >
                    Registration Opens Soon
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/career-advisor")}
                    className="border-purple-500/50 text-purple-700 hover:bg-purple-500/10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <strong>Limited spots available.</strong> Apply now — invitations based on fit and response order.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Want to explore the full tools?{" "}
            <button onClick={() => navigate("/career-coach")} className="text-primary hover:underline">
              Visit Rimo AI Career Coach
            </button>
          </p>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedToolType === "resume_suite" ? "bg-amber-500/20" : "bg-blue-500/20"
              }`}>
                {selectedToolType === "resume_suite" ? (
                  <FileText className="w-5 h-5 text-amber-600" />
                ) : (
                  <Linkedin className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {currentTool.name} — Beta Testing
                </DialogTitle>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Live session on <strong>{selectedToolType === "linkedin_signal" ? "January 7, 2025" : "January 6, 2025"} at 6:00–8:00 PM CT</strong>. Limited to 20 participants.
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
                        <FormLabel>Company (Optional)</FormLabel>
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
              <div className="space-y-4">
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
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                        >
                          {[
                            { value: "actively_interviewing", label: "Actively interviewing" },
                            { value: "preparing_soon", label: "Preparing to interview soon (1-2 months)" },
                            { value: "exploring", label: "Exploring options (3+ months)" },
                            { value: "other", label: "Other" },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <label
                                htmlFor={option.value}
                                className="text-sm font-medium leading-none cursor-pointer"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
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
                        <Input placeholder="e.g., Senior PM at FAANG, Director of Product" {...field} />
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
                      <FormLabel>LinkedIn URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 3: Consent */}
              <div className="space-y-4">
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
                        <FormLabel className="text-sm font-normal">
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
                        <FormLabel className="text-sm font-normal">
                          I agree to receive event communication by email if selected (confirmation + Zoom link + reminders). *
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscribeToNewsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Subscribe to our newsletter for career tips, tools updates, and exclusive content.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
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
