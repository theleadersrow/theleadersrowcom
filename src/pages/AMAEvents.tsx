import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, CheckCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AMAEvents = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentRole: "",
    question: "",
  });

  const nextEvent = {
    title: "Ask Me Anything: Career Acceleration",
    date: "January 15, 2025",
    time: "6-7pm CST",
    description: "Join us for an interactive Q&A session where you can ask anything about career growth, job searching, interview prep, and more.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('beta_event_registrations')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          current_position: formData.currentRole,
          target_roles: formData.question || "AMA Event Registration",
          phone: "N/A",
          job_search_status: "AMA Event",
          tool_type: "ama_event",
          agrees_to_communication: true,
          understands_beta_terms: true,
        });

      if (error) throw error;

      setIsRegistered(true);
      toast({
        title: "Registration Successful!",
        description: "You're registered for the next AMA event. Check your email for details.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered) {
    return (
      <Layout>
        <section className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
                You're Registered!
              </h1>
              <p className="text-muted-foreground mb-8">
                We've sent a confirmation email with all the details for the upcoming AMA event. 
                Make sure to add it to your calendar!
              </p>
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <h3 className="font-semibold text-foreground mb-4">{nextEvent.title}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {nextEvent.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {nextEvent.time}
                  </div>
                </div>
              </div>
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
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageSquare className="h-4 w-4" />
              Live Event
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Ask Me Anything Events
            </h1>
            <p className="text-lg text-muted-foreground">
              Get your career questions answered in real-time during our interactive Q&A sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Event Details & Registration */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Event Info */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Next Event
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {nextEvent.title}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <span>{nextEvent.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="h-5 w-5 text-secondary" />
                      <span>{nextEvent.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="h-5 w-5 text-secondary" />
                      <span>Limited spots available</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    {nextEvent.description}
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-4">
                  What to Expect
                </h3>
                <ul className="space-y-3">
                  {[
                    "Live Q&A with career experts",
                    "Real-time answers to your questions",
                    "Insights from other professionals",
                    "Actionable takeaways",
                    "Recording sent after the event",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Registration Form */}
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Register Now
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        value={formData.currentRole}
                        onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                        required
                        placeholder="Senior Product Manager"
                      />
                    </div>
                    <div>
                      <Label htmlFor="question">
                        Question for the AMA (optional)
                      </Label>
                      <Textarea
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        placeholder="What would you like to ask during the session?"
                        rows={3}
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
                    <p className="text-xs text-muted-foreground text-center">
                      By registering, you agree to receive event updates via email.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AMAEvents;
