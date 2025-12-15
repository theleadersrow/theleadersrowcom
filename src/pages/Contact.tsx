import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { CheckCircle2, Mail, MessageSquare, PenLine, Star, Send, Quote, MapPin, Calendar, Clock, Video } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/lib/locationData";

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type FormData = z.infer<typeof contactSchema>;

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

const Contact = () => {
  const { toast: toastNotify } = useToast();
  const [activeTab, setActiveTab] = useState<"contact" | "review" | "call">("contact");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Review form state
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewData, setReviewData] = useState({
    name: "",
    email: "",
    role: "",
    company: "",
    location: "",
    country: "",
    quote: "",
    outcome: "",
    program: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = reviewSchema.safeParse({
      ...reviewData,
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

    setReviewSubmitting(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        name: reviewData.name.trim(),
        email: reviewData.email.trim(),
        role: reviewData.role.trim() || null,
        company: reviewData.company.trim() || null,
        quote: reviewData.quote.trim(),
        outcome: reviewData.outcome.trim() || null,
        program: reviewData.program || null,
        rating,
      });

      if (error) throw error;

      setReviewSuccess(true);
      toast.success("Thank you for your review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toastNotify({
        title: "Please fix the errors",
        description: "Some fields need your attention.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || "",
          message: formData.message,
        },
      });

      if (error) {
        throw error;
      }

      console.log("Email sent successfully:", data);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Error sending email:", error);
      toastNotify({
        title: "Failed to send message",
        description: "Please try again or email us directly at theleadersrow@gmail.com",
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
                Message Sent!
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Thank you for reaching out! We'll get back to you as soon as possible.
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
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-10">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Contact Us
              </h1>
              <p className="text-muted-foreground text-lg">
                Get in touch or share your experience with us.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-muted rounded-xl p-1.5 flex-wrap justify-center gap-1">
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "contact"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Get in Touch</span>
                  <span className="sm:hidden">Contact</span>
                </button>
                <button
                  onClick={() => setActiveTab("review")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "review"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PenLine className="w-4 h-4" />
                  <span className="hidden sm:inline">Write a Review</span>
                  <span className="sm:hidden">Review</span>
                </button>
                <button
                  onClick={() => setActiveTab("call")}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "call"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Book a Strategy Call</span>
                  <span className="sm:hidden">Book Call</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "contact" ? (
              <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                    Get in Touch
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                    Have questions about our programs? We're here to help you find the 
                    right path for your career growth.
                  </p>

                  <div className="flex items-start gap-4 p-6 bg-muted/50 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                      <a
                        href="mailto:theleadersrow@gmail.com"
                        className="text-muted-foreground hover:text-secondary transition-colors"
                      >
                        theleadersrow@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card rounded-3xl p-8 shadow-card">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground font-medium">
                        Your Name *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="John Smith"
                        className={`mt-2 ${errors.name ? "border-destructive" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

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

                    <div>
                      <Label htmlFor="phone" className="text-foreground font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-foreground font-medium">
                        Your Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="How can we help you?"
                        rows={5}
                        className={`mt-2 ${errors.message ? "border-destructive" : ""}`}
                      />
                      {errors.message && (
                        <p className="text-destructive text-sm mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      variant="gold" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </div>
            ) : activeTab === "review" ? (
              reviewSuccess ? (
              <div className="max-w-md mx-auto text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Thank You!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your review has been submitted successfully. We truly appreciate you taking the time to share your experience with us.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your testimonial will be reviewed and may be featured on our website.
                </p>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <Quote className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                    Share Your Experience
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
                    Your story could inspire others on their career journey. Tell us how The Leader's Row has helped you grow.
                  </p>
                </div>

                {/* Review Form */}
                <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-8 shadow-soft">
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
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
                        <Label htmlFor="review-name" className="text-sm font-medium mb-2 block">
                          Your Name *
                        </Label>
                        <Input
                          id="review-name"
                          placeholder="John Doe"
                          value={reviewData.name}
                          onChange={(e) => setReviewData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-email" className="text-sm font-medium mb-2 block">
                          Email *
                        </Label>
                        <Input
                          id="review-email"
                          type="email"
                          placeholder="john@example.com"
                          value={reviewData.email}
                          onChange={(e) => setReviewData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    {/* Role & Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="review-role" className="text-sm font-medium mb-2 block">
                          Your Role
                        </Label>
                        <Input
                          id="review-role"
                          placeholder="Senior Product Manager"
                          value={reviewData.role}
                          onChange={(e) => setReviewData(prev => ({ ...prev, role: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-company" className="text-sm font-medium mb-2 block">
                          Company
                        </Label>
                        <Input
                          id="review-company"
                          placeholder="Tech Company"
                          value={reviewData.company}
                          onChange={(e) => setReviewData(prev => ({ ...prev, company: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Location & Country */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="review-location" className="text-sm font-medium mb-2 block">
                          <MapPin className="w-3.5 h-3.5 inline mr-1" />
                          City / Location
                        </Label>
                        <Input
                          id="review-location"
                          placeholder="San Francisco"
                          value={reviewData.location}
                          onChange={(e) => setReviewData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-country" className="text-sm font-medium mb-2 block">
                          Country
                        </Label>
                        <Select
                          value={reviewData.country}
                          onValueChange={(value) => setReviewData(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50 max-h-[300px]">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Program */}
                    <div>
                      <Label htmlFor="review-program" className="text-sm font-medium mb-2 block">
                        Which program did you participate in?
                      </Label>
                      <Select
                        value={reviewData.program}
                        onValueChange={(value) => setReviewData(prev => ({ ...prev, program: value }))}
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
                      <Label htmlFor="review-quote" className="text-sm font-medium mb-2 block">
                        Your Experience *
                      </Label>
                      <Textarea
                        id="review-quote"
                        placeholder="Share your story... What challenges were you facing? How did The Leader's Row help you? What results have you seen?"
                        value={reviewData.quote}
                        onChange={(e) => setReviewData(prev => ({ ...prev, quote: e.target.value }))}
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
                      <Label htmlFor="review-outcome" className="text-sm font-medium mb-2 block">
                        Key Outcome (optional)
                      </Label>
                      <Input
                        id="review-outcome"
                        placeholder="e.g., 'Landed FAANG offer' or '$50K salary increase'"
                        value={reviewData.outcome}
                        onChange={(e) => setReviewData(prev => ({ ...prev, outcome: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        A short summary of your biggest win
                      </p>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {reviewSubmitting ? (
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
              )
            ) : (
              /* Strategy Call Tab */
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-secondary" />
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
                    Strategic Discovery Call
                  </h2>
                  <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                    Let's discuss your career goals and find the right path to accelerate your growth as a Product Leader.
                  </p>
                </div>

                {/* What to expect */}
                <div className="grid sm:grid-cols-3 gap-4 mb-10">
                  <div className="bg-card p-5 rounded-xl border border-border text-center">
                    <Clock className="w-8 h-8 text-secondary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">30 Minutes</h3>
                    <p className="text-sm text-muted-foreground">
                      A focused session to understand your needs
                    </p>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-border text-center">
                    <Video className="w-8 h-8 text-secondary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Via Zoom</h3>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a Zoom link upon booking
                    </p>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-border text-center">
                    <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">Your Schedule</h3>
                    <p className="text-sm text-muted-foreground">
                      Pick a time that works best for you
                    </p>
                  </div>
                </div>

                {/* Calendly Embed */}
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <iframe
                    src="https://calendly.com/theleadersrow/30min?embed_domain=theleadersrow.com&embed_type=Inline"
                    width="100%"
                    height="700"
                    frameBorder="0"
                    title="Schedule a Discovery Call"
                    className="min-h-[700px]"
                  />
                </div>

                {/* Note */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                  After booking, you'll receive a confirmation email with the Zoom meeting link.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;