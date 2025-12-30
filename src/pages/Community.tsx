import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, ArrowRight, ExternalLink } from "lucide-react";

const Community = () => {
  const slackLink = "https://join.slack.com/t/theleadersrow/shared_invite/zt-3m35e5fgn-tBvwjgodOf9KmLhBZHQhSg";

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Leader's Row Community
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Join Our Private Slack Community
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with ambitious professionals, share insights, get support, 
              and accelerate your career alongside like-minded leaders.
            </p>
            <Button variant="gold" size="lg" asChild>
              <a 
                href={slackLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Join Slack Community
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
              What You'll Get Access To
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Real-Time Support",
                  description: "Get answers to your career questions from peers and mentors who've been there.",
                },
                {
                  title: "Exclusive Content",
                  description: "Access resources, templates, and insights shared only with community members.",
                },
                {
                  title: "Networking Opportunities",
                  description: "Connect with professionals across industries who are on similar journeys.",
                },
                {
                  title: "Accountability Partners",
                  description: "Find accountability buddies to keep you on track with your career goals.",
                },
                {
                  title: "Job Opportunities",
                  description: "Get access to job postings and referrals shared within the community.",
                },
                {
                  title: "Weekly Discussions",
                  description: "Participate in curated discussions on career growth, leadership, and more.",
                },
              ].map((benefit) => (
                <div 
                  key={benefit.title}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Ready to Join the Conversation?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Join hundreds of ambitious professionals already in the community.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <a 
                href={slackLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Join Slack Now
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Community;
