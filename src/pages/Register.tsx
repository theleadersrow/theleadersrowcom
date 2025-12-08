import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
    .min(5, "Please enter your full address")
    .max(500, "Address is too long"),
  occupation: z
    .string()
    .min(2, "Please enter your occupation")
    .max(100, "Occupation must be less than 100 characters"),
  program: z.string().min(1, "Please select a program"),
});

type FormData = z.infer<typeof registerSchema>;

const Register = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    program: "",
  });

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
      const { error } = await supabase.functions.invoke("send-registration-email", {
        body: formData,
      });

      if (error) {
        throw error;
      }

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
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-screen bg-background">
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
                Thank You!
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Thank you for your interest! A member of our team will contact you within 
                24–48 hours to complete your registration and guide you through next steps.
              </p>
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

                {/* Address */}
                <div>
                  <Label htmlFor="address" className="text-foreground font-medium">
                    Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="123 Main St, City, Country"
                    className={`mt-2 ${errors.address ? "border-destructive" : ""}`}
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm mt-1">{errors.address}</p>
                  )}
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
                      <SelectItem value="200k-method">200K Method ($2,000)</SelectItem>
                      <SelectItem value="weekly-edge">Weekly Edge ($100/month)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.program && (
                    <p className="text-destructive text-sm mt-1">{errors.program}</p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" variant="gold" size="xl" className="w-full mt-4" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Register;
