import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Check, Sparkles, Calendar, Users, BookOpen, Video, MessageSquare, Trophy, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Programs that use checkout sessions (not direct payment links)
const CHECKOUT_PROGRAMS = ["200k-method"];

// Program details for pricing breakdown
const PROGRAM_DETAILS = {
  "200k-method": {
    name: "The 200K Method",
    price: "$1,800",
    originalPrice: "$2,000",
    priceSubtext: "One-time payment",
    promoNote: "10% off — valid till Jan 16th, 2026",
    description: "A comprehensive 8-week intensive program designed to help you land a $200K+ role",
    features: [
      { icon: Video, text: "8 live weekly group coaching sessions (90 min each)" },
      { icon: BookOpen, text: "Complete career transformation curriculum" },
      { icon: MessageSquare, text: "1-on-1 resume & LinkedIn review" },
      { icon: Users, text: "Private community access for 6 months" },
      { icon: Trophy, text: "Interview preparation & mock interviews" },
      { icon: Calendar, text: "Salary negotiation masterclass" },
      { icon: Sparkles, text: "Lifetime access to course materials" },
    ],
    highlight: "10% Off",
  },
};

const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name cannot contain numbers"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[\d\s+()-]+$/, "Please enter a valid phone number"),
  address: z
    .string()
    .min(5, "Please enter your street address")
    .max(200, "Address is too long"),
  city: z
    .string()
    .min(2, "Please enter your city")
    .max(100, "City name is too long"),
  state: z
    .string()
    .min(2, "Please enter your state/province")
    .max(100, "State name is too long"),
  country: z
    .string()
    .min(2, "Please enter your country")
    .max(100, "Country name is too long"),
  zipcode: z
    .string()
    .min(3, "Please enter a valid zip/postal code")
    .max(20, "Zip code is too long"),
  occupation: z
    .string()
    .min(2, "Please enter your occupation")
    .max(100, "Occupation must be less than 100 characters"),
  program: z.string().min(1, "Please select a program"),
});

type FormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedProgram = searchParams.get("program") || "";
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    occupation: "",
    program: preselectedProgram,
  });

  const checkPaymentStatus = useCallback(async () => {
    if (!formData.email || isPaymentConfirmed) return;
    
    setIsCheckingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-payment-status", {
        body: { email: formData.email },
      });

      if (error) {
        console.error("Error checking payment status:", error);
        return;
      }

      if (data?.paid) {
        setIsPaymentConfirmed(true);
        toast({
          title: "Payment Confirmed! 🎉",
          description: "Your registration is now complete. Welcome aboard!",
        });
      }
    } catch (error) {
      console.error("Error checking payment:", error);
    } finally {
      setIsCheckingPayment(false);
      setPollCount(prev => prev + 1);
    }
  }, [formData.email, isPaymentConfirmed, toast]);

  // Poll for payment status every 5 seconds after form submission
  useEffect(() => {
    if (!isSubmitted || isPaymentConfirmed) return;
    
    const isPaidProgram = CHECKOUT_PROGRAMS.includes(formData.program);
    if (!isPaidProgram) return;

    // Initial check after 3 seconds
    const initialTimeout = setTimeout(() => {
      checkPaymentStatus();
    }, 3000);

    // Then poll every 5 seconds for up to 10 minutes
    const pollInterval = setInterval(() => {
      if (pollCount < 120) { // 120 * 5 seconds = 10 minutes
        checkPaymentStatus();
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollInterval);
    };
  }, [isSubmitted, isPaymentConfirmed, formData.program, checkPaymentStatus, pollCount]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);

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
      // Send registration email first
      const { error } = await supabase.functions.invoke("send-registration-email", {
        body: formData,
      });

      if (error) {
        throw error;
      }

      // Check if this program uses checkout session
      const isPaidProgram = CHECKOUT_PROGRAMS.includes(formData.program);
      
      if (isPaidProgram) {
        // Create checkout session via edge function
        const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-200k-checkout", {
          body: formData,
        });

        if (checkoutError) {
          throw checkoutError;
        }

        if (checkoutData?.url) {
          // Redirect to Stripe Checkout (avoids popup blockers)
          window.location.href = checkoutData.url;
          return;
        }
      }

      // For programs without payment, just show success
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error sending registration:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly at connect@theleadersrow.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    const isPaidProgram = CHECKOUT_PROGRAMS.includes(formData.program);
    const programDetails = PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS];
    
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-screen bg-background">
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              {isPaymentConfirmed ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
                    Payment Confirmed! 🎉
                  </h1>
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-green-800 mb-2">
                      ✅ Your Registration is Complete
                    </h2>
                    <p className="text-green-700">
                      Welcome to <strong>{programDetails?.name}</strong>! You'll receive a confirmation email shortly with all the details to get started.
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Check your inbox at <strong>{formData.email}</strong> for next steps and access instructions.
                  </p>
                </>
              ) : isPaidProgram ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-8">
                    <CreditCard className="w-10 h-10 text-amber-600" />
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
                    Almost There!
                  </h1>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-amber-800 mb-2">
                      ⚠️ Action Required: Complete Your Payment
                    </h2>
                    <p className="text-amber-700 mb-4">
                      A Stripe payment window has opened in a new tab. Please complete your payment there to confirm your registration for <strong>{programDetails?.name}</strong>.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-amber-100">
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong>Didn't see the payment window?</strong> It may have been blocked by your browser.
                      </p>
                      <Button
                        variant="gold"
                        size="lg"
                        onClick={async () => {
                          const { data } = await supabase.functions.invoke("create-200k-checkout", {
                            body: formData,
                          });
                          if (data?.url) {
                            window.open(data.url, '_blank');
                          }
                        }}
                        className="w-full"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Open Payment Page
                      </Button>
                    </div>
                  </div>
                  
                  {/* Payment status indicator */}
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Checking payment status...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Waiting for payment confirmation...</span>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkPaymentStatus}
                    disabled={isCheckingPayment}
                    className="mb-4"
                  >
                    {isCheckingPayment ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Check Payment Status
                  </Button>
                  
                  <p className="text-muted-foreground text-sm">
                    Your registration is <strong>not complete</strong> until payment is processed. This page will automatically update when we detect your payment.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10 text-secondary" />
                  </div>
                  <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
                    Thank You!
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Thank you for your interest! A member of our team will contact you within 24–48 hours to complete your registration and guide you through next steps.
                  </p>
                </>
              )}
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
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Register Now
              </h1>
              <p className="text-muted-foreground text-lg">
                Take the first step toward unlocking your full potential.
              </p>
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
                    placeholder="John Smith"
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
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                    className={`mt-2 ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-foreground font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`mt-2 ${errors.phone ? "border-destructive" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <Label htmlFor="address" className="text-foreground font-medium">
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="123 Main St, Apt 4B"
                    className={`mt-2 ${errors.address ? "border-destructive" : ""}`}
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-foreground font-medium">
                      City *
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="New York"
                      className={`mt-2 ${errors.city ? "border-destructive" : ""}`}
                    />
                    {errors.city && (
                      <p className="text-destructive text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-foreground font-medium">
                      State/Province *
                    </Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="NY"
                      className={`mt-2 ${errors.state ? "border-destructive" : ""}`}
                    />
                    {errors.state && (
                      <p className="text-destructive text-sm mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Country and Zipcode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-foreground font-medium">
                      Country *
                    </Label>
                    <Input
                      id="country"
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="United States"
                      className={`mt-2 ${errors.country ? "border-destructive" : ""}`}
                    />
                    {errors.country && (
                      <p className="text-destructive text-sm mt-1">{errors.country}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zipcode" className="text-foreground font-medium">
                      Zip/Postal Code *
                    </Label>
                    <Input
                      id="zipcode"
                      type="text"
                      value={formData.zipcode}
                      onChange={(e) => handleChange("zipcode", e.target.value)}
                      placeholder="10001"
                      className={`mt-2 ${errors.zipcode ? "border-destructive" : ""}`}
                    />
                    {errors.zipcode && (
                      <p className="text-destructive text-sm mt-1">{errors.zipcode}</p>
                    )}
                  </div>
                </div>

                {/* Occupation */}
                <div>
                  <Label htmlFor="occupation" className="text-foreground font-medium">
                    Occupation *
                  </Label>
                  <Input
                    id="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    placeholder="Product Manager"
                    className={`mt-2 ${errors.occupation ? "border-destructive" : ""}`}
                  />
                  {errors.occupation && (
                    <p className="text-destructive text-sm mt-1">{errors.occupation}</p>
                  )}
                </div>

                {/* Program Selection */}
                <div>
                  <Label htmlFor="program" className="text-foreground font-medium">
                    Select Program *
                  </Label>
                  <Select
                    value={formData.program}
                    onValueChange={(value) => handleChange("program", value)}
                  >
                    <SelectTrigger className={`mt-2 ${errors.program ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="Choose a program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="200k-method">The 200K Method</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.program && (
                    <p className="text-destructive text-sm mt-1">{errors.program}</p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                {formData.program && PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS] && (
                  <div className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-xl font-semibold text-foreground">
                            {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].name}
                          </h3>
                          {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].highlight && (
                            <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                              {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].highlight}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                          {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {'originalPrice' in PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS] && (
                          <div className="font-serif text-lg text-muted-foreground/50 line-through">
                            {(PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS] as any).originalPrice}
                          </div>
                        )}
                        <div className="font-serif text-2xl font-bold text-secondary">
                          {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].price}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].priceSubtext}
                        </div>
                        {'promoNote' in PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS] && (
                          <div className="text-xs text-secondary font-medium mt-1">
                            {(PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS] as any).promoNote}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-secondary/10 pt-4">
                      <h4 className="text-sm font-medium text-foreground mb-3">What's included:</h4>
                      <ul className="space-y-2.5">
                        {PROGRAM_DETAILS[formData.program as keyof typeof PROGRAM_DETAILS].features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center mt-0.5">
                              <feature.icon className="w-3 h-3 text-secondary" />
                            </div>
                            <span className="text-foreground/80">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}

                {/* Payment Notice */}
                <Alert className="bg-secondary/5 border-secondary/20">
                  <CreditCard className="h-4 w-4 text-secondary" />
                  <AlertDescription className="text-foreground/80">
                    <strong>Payment Required:</strong> After submitting this form, you'll be redirected to our secure Stripe payment page to complete your registration. Your enrollment is only confirmed once payment is successfully processed.
                  </AlertDescription>
                </Alert>

                {/* Submit */}
                <Button type="submit" variant="gold" size="xl" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  🔒 Secure payment powered by Stripe
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
