import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, CheckCircle2, Target, Mic2, TrendingUp, BookOpen, Zap, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const teaserPoints = [
  { icon: Target, text: "The 3 Career Accelerators top PMs use to stand out" },
  { icon: Mic2, text: "Why executive presence matters more than technical skills" },
  { icon: TrendingUp, text: "The positioning secret behind $200K+ PM roles" },
];

const whatYouGet = [
  { icon: BookOpen, title: "Strategic Frameworks", description: "Proven mental models for career advancement" },
  { icon: Zap, title: "Quick Wins", description: "Actionable tactics you can implement today" },
  { icon: Award, title: "Positioning Secrets", description: "How top PMs differentiate themselves" },
];

const Guide = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("email_leads")
        .insert({ email: email.trim(), lead_magnet: "200k-quick-start" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed! Check your email for the guide.");
        } else {
          throw error;
        }
      } else {
        const { error: emailError } = await supabase.functions.invoke('send-blueprint-email', {
          body: { email: email.trim() }
        });

        if (emailError) {
          console.error("Error sending email:", emailError);
          toast.error("Guide saved! Email delivery may be delayed.");
        }

        setIsSuccess(true);
        toast.success("Success! Check your email for the Quick Start Guide.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Content */}
              <div>
                <span className="inline-block text-xs font-bold text-secondary bg-secondary/20 px-3 py-1 rounded-full mb-4">
                  FREE RESOURCE
                </span>
                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-cream mb-4">
                  200K Method Quick Start Guide
                </h1>
                <p className="text-lg text-cream/80 mb-8 leading-relaxed">
                  Discover the 3 key strategies that separate $200K+ Product Leaders from everyone else. 
                  A quick preview of what's possible when you position yourself strategically.
                </p>

                <ul className="space-y-4">
                  {teaserPoints.map((point, index) => (
                    <li key={index} className="flex items-center gap-3 text-cream/90">
                      <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <point.icon className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-base">{point.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form Card */}
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated">
                {isSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">You're in!</h3>
                    <p className="text-muted-foreground mb-6">
                      Check your email for the Quick Start Guide. Ready to go deeper?
                    </p>
                    <Button variant="gold" asChild>
                      <Link to="/200k-method">Explore 200K Method</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Get Your Free Guide
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter your email and we'll send it right over.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                        required
                      />
                      <Button 
                        type="submit" 
                        variant="gold" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Send Me the Guide
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                What's Inside the Guide
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A preview of the strategies that have helped hundreds of PMs level up their careers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {whatYouGet.map((item, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Ready for the Full Transformation?
            </h2>
            <p className="text-muted-foreground mb-8">
              The Quick Start Guide is just a preview. The 200K Method is an 8-week accelerator 
              that gives you the complete system to land your next senior role.
            </p>
            <Button variant="gold" size="lg" asChild>
              <Link to="/200k-method">Learn About 200K Method</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Guide;
