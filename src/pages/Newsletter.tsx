import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, ExternalLink, Sparkles, TrendingUp, Users } from "lucide-react";

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
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
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

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center text-center p-6 bg-muted/50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Substack CTA */}
            <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Subscribe on Substack
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                Dive into our archive of leadership insights, career strategies, and product management wisdom — and get new articles delivered straight to your inbox.
              </p>
              <a
                href="https://nainasheth.substack.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="gold" size="lg" className="gap-2">
                  Subscribe Now
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Newsletter;
