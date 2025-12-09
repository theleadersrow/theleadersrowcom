import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Mail, Sparkles, TrendingUp, Users, ExternalLink } from "lucide-react";
import { z } from "zod";

const newsletterSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
});

type FormData = z.infer<typeof newsletterSchema>;

const benefits = [
  {
    icon: Sparkles,
    title: "Weekly Leadership Insights",
    description: "Practical tips and strategies to sharpen your leadership skills every week.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth Tactics",
    description: "Actionable advice to accelerate your product management career.",
  },
  {
    icon: Users,
    title: "Exclusive Community Updates",
    description: "Be the first to know about new programs, events, and opportunities.",
  },
];

const Newsletter = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = newsletterSchema.safeParse(formData);

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

    // Simulate subscription (you can integrate with an email service later)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "You're subscribed!",
      description: "Welcome to The Leader's Row newsletter.",
    });
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
                You're In!
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Thank you for subscribing to The Leader's Row newsletter.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Get ready for weekly insights to help you grow, lead, and rise.
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
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Mail className="w-4 h-4" />
                Free Weekly Newsletter
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6">
                Level Up Your Leadership
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                Join thousands of ambitious professionals receiving weekly insights 
                on leadership, career growth, and product management excellence.
              </p>
            </div>

            {/* Substack CTA */}
            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-3xl p-8 md:p-12 text-center mb-16">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Read Our Latest Articles
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                Dive into our archive of leadership insights, career strategies, and product management wisdom on Substack.
              </p>
              <a
                href="https://nainasheth.substack.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="gold" size="lg" className="gap-2">
                  Visit Our Substack
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Benefits */}
              <div className="space-y-6">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-8">
                  What You'll Get
                </h2>
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4 p-6 bg-muted/50 rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="bg-card rounded-3xl p-8 shadow-card">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Subscribe Now
                </h3>
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

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe for Free"}
                  </Button>

                  <p className="text-muted-foreground text-xs text-center">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Newsletter;
