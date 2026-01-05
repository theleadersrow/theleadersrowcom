import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, CheckCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AMAFeedback = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const emailFromUrl = searchParams.get("email") || "";
  const nameFromUrl = searchParams.get("name") || "";
  
  const [formData, setFormData] = useState({
    email: emailFromUrl,
    fullName: nameFromUrl,
    overallRating: 0,
    contentQuality: 0,
    speakerQuality: 0,
    wouldRecommend: "",
    mostValuable: "",
    suggestions: "",
    topicsForNext: "",
    testimonial: "",
    allowTestimonialUse: false,
  });

  // Get the most recent first Friday (event date)
  const getLastEventDate = () => {
    const now = new Date();
    let eventDate = new Date(now.getFullYear(), now.getMonth(), 1);
    while (eventDate.getDay() !== 5) {
      eventDate.setDate(eventDate.getDate() + 1);
    }
    if (eventDate > now) {
      eventDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      while (eventDate.getDay() !== 5) {
        eventDate.setDate(eventDate.getDate() + 1);
      }
    }
    return eventDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating for the session.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("ama_feedback").insert({
        email: formData.email,
        full_name: formData.fullName || null,
        event_date: getLastEventDate(),
        overall_rating: formData.overallRating,
        content_quality: formData.contentQuality || null,
        speaker_quality: formData.speakerQuality || null,
        would_recommend: formData.wouldRecommend === "yes" ? true : formData.wouldRecommend === "no" ? false : null,
        most_valuable: formData.mostValuable || null,
        suggestions: formData.suggestions || null,
        topics_for_next: formData.topicsForNext || null,
        testimonial: formData.testimonial || null,
        allow_testimonial_use: formData.allowTestimonialUse,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      });
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
                Thank You for Your Feedback!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your insights help us make the Monthly AMA sessions even better. 
                We appreciate you taking the time to share your thoughts!
              </p>
              <Button onClick={() => window.location.href = "/ama-events"}>
                Back to AMA Events
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="h-4 w-4" />
              Share Your Experience
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              AMA Session Feedback
            </h1>
            <p className="text-muted-foreground">
              Your feedback helps us improve future sessions. This takes about 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Name (optional)</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                </div>

                {/* Ratings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Rate the Session</h3>
                  
                  <StarRating
                    value={formData.overallRating}
                    onChange={(val) => setFormData({ ...formData, overallRating: val })}
                    label="Overall Experience *"
                  />
                  
                  <StarRating
                    value={formData.contentQuality}
                    onChange={(val) => setFormData({ ...formData, contentQuality: val })}
                    label="Content Quality"
                  />
                  
                  <StarRating
                    value={formData.speakerQuality}
                    onChange={(val) => setFormData({ ...formData, speakerQuality: val })}
                    label="Speaker/Host Quality"
                  />
                </div>

                {/* Would Recommend */}
                <div className="space-y-3">
                  <Label>Would you recommend this to a colleague?</Label>
                  <RadioGroup
                    value={formData.wouldRecommend}
                    onValueChange={(val) => setFormData({ ...formData, wouldRecommend: val })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="recommend-yes" />
                      <Label htmlFor="recommend-yes" className="font-normal cursor-pointer">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="recommend-no" />
                      <Label htmlFor="recommend-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maybe" id="recommend-maybe" />
                      <Label htmlFor="recommend-maybe" className="font-normal cursor-pointer">Maybe</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Open-ended Questions */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mostValuable">What was most valuable about the session?</Label>
                    <Textarea
                      id="mostValuable"
                      value={formData.mostValuable}
                      onChange={(e) => setFormData({ ...formData, mostValuable: e.target.value })}
                      placeholder="Tell us what you found most helpful..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="suggestions">How could we improve?</Label>
                    <Textarea
                      id="suggestions"
                      value={formData.suggestions}
                      onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                      placeholder="Any suggestions for improvement..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="topicsForNext">What topics would you like covered next?</Label>
                    <Textarea
                      id="topicsForNext"
                      value={formData.topicsForNext}
                      onChange={(e) => setFormData({ ...formData, topicsForNext: e.target.value })}
                      placeholder="Topics for future sessions..."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Testimonial */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground">Share a Testimonial (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    If you'd like, share a brief testimonial we can feature on our website.
                  </p>
                  
                  <div>
                    <Textarea
                      id="testimonial"
                      value={formData.testimonial}
                      onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                      placeholder="Share your experience with the AMA session..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowTestimonialUse"
                      checked={formData.allowTestimonialUse}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, allowTestimonialUse: checked === true })
                      }
                    />
                    <Label htmlFor="allowTestimonialUse" className="font-normal cursor-pointer text-sm">
                      I allow RIMO to use my testimonial on their website and marketing materials
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="gold" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AMAFeedback;