import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, CheckCircle2, Target, Mic2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const teaserPoints = [
  { icon: Target, text: "The 3 Career Accelerators top PMs use" },
  { icon: Mic2, text: "Why executive presence matters more than skills" },
  { icon: TrendingUp, text: "The positioning secret to $200K+ roles" },
];

const LeadMagnet = () => {
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
        // Send the blueprint email
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
    <section id="lead-magnet" className="py-16 bg-gradient-to-br from-navy via-navy-dark to-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <span className="inline-block text-xs font-bold text-secondary bg-secondary/20 px-3 py-1 rounded-full mb-4">
                FREE GUIDE
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
                200K Method Quick Start Guide
              </h2>
              <p className="text-cream/70 mb-6">
                Discover the 3 key strategies that separate $200K+ Product Leaders from everyone else. A quick preview of what's possible.
              </p>

              <ul className="space-y-3">
                {teaserPoints.map((point, index) => (
                  <li key={index} className="flex items-center gap-3 text-cream/80">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">You're in!</h3>
                  <p className="text-muted-foreground">
                    Check your email for the Quick Start Guide. Ready to go deeper? Explore the full 200K Method.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Get the Free Quick Start Guide
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    A preview of the strategies inside the 200K Method program.
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
                          Get the Free Guide
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
  );
};

export default LeadMagnet;