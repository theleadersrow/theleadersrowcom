import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Users, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

      // Send confirmation email
      await supabase.functions.invoke("send-beta-registration-email", {
        body: { name: data.fullName, email: data.email },
      });

      setIsSubmitted(true);
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
      <div className="min-h-screen bg-background">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Limited Beta Access
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Resume Intelligence Suite
              <span className="block text-primary mt-2">Live Beta Testing</span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Tuesday, January 6, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>6:00–7:30 PM Central (CT)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>20 Spots Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  About This Session
                </h2>
                <p className="text-muted-foreground mb-4">
                  You're invited to apply for a live beta session of the Resume Intelligence Suite — a tool that helps you quickly understand how strong your resume is for the roles you're targeting, where it's falling short, and what to change to increase your interview conversion.
                </p>
                
                <h3 className="font-semibold text-foreground mt-6 mb-3">
                  In this 90-minute session, you'll:
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    Walk through the Resume Intelligence experience live (with guided prompts)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    Identify gaps in your resume (impact, keywords, role-fit, structure, clarity)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    Get a prioritized improvement checklist you can implement immediately
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    Share feedback so we can improve the tool before wider launch
                  </li>
                </ul>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2">Important Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Limited to 20 invited beta users</li>
                    <li>• Submitting this form is an application to participate</li>
                    <li>• If selected, you'll receive an email confirmation + Zoom link</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-6">
                  Apply to Participate
                </h2>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                I agree to receive event communication by email if selected (confirmation + Zoom link + reminders). *
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BetaEvent;
