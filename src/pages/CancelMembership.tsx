import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const cancelSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  reason: z
    .string()
    .max(1000, "Reason must be less than 1000 characters")
    .optional(),
});

type FormData = z.infer<typeof cancelSchema>;

const CancelMembership = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    reason: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = cancelSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Please fix the errors",
        description: "Some fields need your attention.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send cancellation request email
      const { error } = await supabase.functions.invoke("send-cancellation-request", {
        body: {
          fullName: formData.fullName,
          email: formData.email,
          reason: formData.reason || "No reason provided",
        },
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error sending cancellation request:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly at connect@theleadersrow.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-screen bg-background">
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
                Request Received
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                We've received your cancellation request. Your membership will remain active until the end of your current billing cycle.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You will <span className="text-secondary font-medium">not be charged</span> for the next billing period. 
                We'll send a confirmation email to <span className="font-medium">{formData.email}</span> shortly.
              </p>
              <div className="mt-8 p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  If you have any questions, please contact us at{" "}
                  <a href="mailto:connect@theleadersrow.com" className="text-secondary hover:underline">
                    connect@theleadersrow.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-20 bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Cancel Membership
              </h1>
              <p className="text-muted-foreground text-lg">
                We're sorry to see you go. Please fill out the form below to cancel your Weekly Edge membership.
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Important Information</p>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Your membership will remain active until the end of your current billing cycle</li>
                    <li>• You will <span className="text-secondary font-medium">not be charged</span> for the next billing period</li>
                    <li>• You'll continue to have full access until your membership ends</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 md:p-10 shadow-card">
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Your name"
                    className={`mt-2 ${errors.fullName ? "border-destructive" : ""}`}
                  />
                  {errors.fullName && (
                    <p className="text-destructive text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address *
                  </Label>
                  <p className="text-muted-foreground text-sm mt-1 mb-2">
                    Please use the email associated with your membership
                  </p>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className={`${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Reason (Optional) */}
                <div>
                  <Label htmlFor="reason" className="text-foreground font-medium">
                    Reason for Cancellation <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <p className="text-muted-foreground text-sm mt-1 mb-2">
                    Your feedback helps us improve
                  </p>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    placeholder="Let us know why you're cancelling..."
                    rows={4}
                    className={`${errors.reason ? "border-destructive" : ""}`}
                  />
                  {errors.reason && (
                    <p className="text-destructive text-sm mt-1">{errors.reason}</p>
                  )}
                </div>

                {/* Submit */}
                <Button 
                  type="submit" 
                  variant="destructive" 
                  size="xl" 
                  className="w-full mt-4" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Submit Cancellation Request"
                  )}
                </Button>

                <p className="text-center text-muted-foreground text-sm">
                  Changed your mind?{" "}
                  <a href="/weekly-edge" className="text-secondary hover:underline">
                    Learn more about Weekly Edge
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CancelMembership;