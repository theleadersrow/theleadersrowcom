import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Send, CheckCircle2, Quote } from "lucide-react";
import { z } from "zod";

const reviewSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  role: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
  quote: z.string().trim().min(20, "Please share at least 20 characters about your experience").max(1000),
  outcome: z.string().trim().max(200).optional(),
  program: z.string().optional(),
  rating: z.number().min(1).max(5),
});

const Review = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    quote: "",
    outcome: "",
    program: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = reviewSchema.safeParse({
      ...formData,
      rating,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role.trim() || null,
        company: formData.company.trim() || null,
        quote: formData.quote.trim(),
        outcome: formData.outcome.trim() || null,
        program: formData.program || null,
        rating,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background pt-20 pb-16 px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Thank You!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your review has been submitted successfully. We truly appreciate you taking the time to share your experience with us.
            </p>
            <p className="text-sm text-muted-foreground">
              Your testimonial will be reviewed and may be featured on our website.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-24 sm:pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Share Your Experience
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
              Your story could inspire others on their career journey. Tell us how The Leader's Row has helped you grow.
            </p>
          </div>

          {/* Form */}
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  How would you rate your experience? *
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "text-secondary fill-secondary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Your Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role" className="text-sm font-medium mb-2 block">
                    Your Role
                  </Label>
                  <Input
                    id="role"
                    placeholder="Senior Product Manager"
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-sm font-medium mb-2 block">
                    Company
                  </Label>
                  <Input
                    id="company"
                    placeholder="Tech Company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                </div>
              </div>

              {/* Program */}
              <div>
                <Label htmlFor="program" className="text-sm font-medium mb-2 block">
                  Which program did you participate in?
                </Label>
                <Select
                  value={formData.program}
                  onValueChange={(value) => handleChange("program", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="200k-method">200K Method</SelectItem>
                    <SelectItem value="weekly-edge">Weekly Edge</SelectItem>
                    <SelectItem value="ai-career-coach">AI Career Coach</SelectItem>
                    <SelectItem value="other">Other / Multiple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Testimonial */}
              <div>
                <Label htmlFor="quote" className="text-sm font-medium mb-2 block">
                  Your Experience *
                </Label>
                <Textarea
                  id="quote"
                  placeholder="Share your story... What challenges were you facing? How did The Leader's Row help you? What results have you seen?"
                  value={formData.quote}
                  onChange={(e) => handleChange("quote", e.target.value)}
                  rows={5}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 20 characters
                </p>
              </div>

              {/* Outcome */}
              <div>
                <Label htmlFor="outcome" className="text-sm font-medium mb-2 block">
                  Key Outcome (optional)
                </Label>
                <Input
                  id="outcome"
                  placeholder="e.g., 'Landed FAANG offer' or '$50K salary increase'"
                  value={formData.outcome}
                  onChange={(e) => handleChange("outcome", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A short summary of your biggest win
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree that your review may be featured on our website.
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Review;