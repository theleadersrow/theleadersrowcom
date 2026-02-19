import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Video, CheckCircle, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WebinarRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-webinar-confirmation", {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
        },
      });

      if (error) throw error;

      setIsRegistered(true);
      toast.success("You're registered! Check your email for confirmation.");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <Layout>
        <section className="section-padding bg-gradient-to-b from-muted to-background">
          <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                You're Registered! 🎉
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Check your email for the confirmation and Zoom link.
              </p>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-secondary" />
                      <span>Monday, January 20th, 2026</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-secondary" />
                      <span>5:30 PM - 6:30 PM Central (1 hour)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-secondary" />
                      <span>Zoom Webinar (link in your email)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-muted-foreground mt-6">
                Can't find the email? Check your spam folder or contact us at{" "}
                <a href="mailto:theleadersrow@gmail.com" className="text-secondary hover:underline">
                  theleadersrow@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding bg-gradient-to-b from-navy to-navy/95">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block bg-secondary/20 text-secondary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                Free Live Webinar
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream mb-4">
                The Strategic Career Mastery Program
              </h1>
              <p className="text-cream/80 text-lg max-w-2xl mx-auto">
                Learn the proven framework that helps professionals land $200K+ roles at top tech companies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Event Details */}
              <Card className="bg-cream/5 border-cream/20">
                <CardHeader>
                  <CardTitle className="text-cream">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-cream/90">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Monday, January 20th, 2026</p>
                      <p className="text-sm text-cream/60">Mark your calendar</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-cream/90">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">5:30 PM - 6:30 PM Central</p>
                      <p className="text-sm text-cream/60">1 hour session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-cream/90">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Live on Zoom</p>
                      <p className="text-sm text-cream/60">Link sent after registration</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-cream/10">
                    <h4 className="font-medium text-cream mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary" />
                      What You'll Learn
                    </h4>
                    <ul className="space-y-2 text-cream/80 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        The exact framework used to land $200K+ offers
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        How to position yourself for senior roles
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Negotiation strategies that maximize comp
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Live Q&A with real examples
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Form */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Register Now</CardTitle>
                  <CardDescription>
                    Save your spot for this free webinar. Limited seats available.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Registering..." : "Register for Free"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      By registering, you agree to receive emails about this event and related content.
                    </p>
                  </form>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Join other ambitious professionals</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default WebinarRegistration;
