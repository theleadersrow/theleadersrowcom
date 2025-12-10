import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, CheckCircle2, FileText, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const benefits = [
  { icon: FileText, text: "Personal Brand Audit Checklist" },
  { icon: Target, text: "5-Step Framework for $200K+ Roles" },
  { icon: Users, text: "Executive Presence Quick Guide" },
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
        .insert({ email: email.trim(), lead_magnet: "starter-kit" });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed! Check your email for the guide.");
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success("Success! Check your email for the guide.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-navy via-navy-dark to-navy relative overflow-hidden">
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
                FREE RESOURCE
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
                Get the 200K Method Starter Kit
              </h2>
              <p className="text-cream/70 mb-6">
                The exact frameworks top performers use to break into $200K+ leadership roles. Free, actionable, and immediately useful.
              </p>

              <ul className="space-y-3 mb-6">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-cream/80">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <span>{benefit.text}</span>
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
                    Check your email for the Starter Kit. Your leadership journey starts now.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Download Your Free Starter Kit
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Join 1,000+ ambitious professionals getting career-accelerating resources.
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
