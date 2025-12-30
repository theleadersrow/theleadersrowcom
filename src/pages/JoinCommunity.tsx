import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ExternalLink, MessageSquare, Mail, Users, Linkedin, Twitter, Instagram } from "lucide-react";

const JoinCommunity = () => {
  const slackLink = "https://join.slack.com/t/theleadersrow/shared_invite/zt-3m35e5fgn-tBvwjgodOf9KmLhBZHQhSg";

  const joinOptions = [
    {
      title: "Join Slack Community",
      description: "Connect with peers, get support, and participate in discussions.",
      icon: MessageSquare,
      href: slackLink,
      external: true,
      primary: true,
    },
    {
      title: "Subscribe to Newsletter",
      description: "Weekly insights, frameworks, and career strategies delivered to your inbox.",
      icon: Mail,
      href: "/newsletter",
      external: false,
      primary: false,
    },
  ];

  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/in/omoniyitolu",
      color: "bg-[#0077B5]",
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      href: "https://twitter.com",
      color: "bg-[#1DA1F2]",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com",
      color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              Stay Connected
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Join the Community
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay connected and never miss an update. Join our community channels 
              to receive the latest content, insights, and opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Main Join Options */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {joinOptions.map((option) => (
              <div 
                key={option.title}
                className={`bg-card border rounded-2xl p-6 md:p-8 ${
                  option.primary ? "border-secondary shadow-elevated" : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    option.primary ? "bg-secondary/10" : "bg-muted"
                  }`}>
                    <option.icon className={`h-7 w-7 ${option.primary ? "text-secondary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {option.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <Button 
                    variant={option.primary ? "gold" : "outline"} 
                    size="lg"
                    asChild
                  >
                    {option.external ? (
                      <a 
                        href={option.href} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Join Now
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <a href={option.href} className="flex items-center gap-2">
                        Subscribe
                      </a>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-8">
              Follow on Social Media
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className={`w-12 h-12 ${social.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <social.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors">
                    {social.name}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              Why Join?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Weekly Content", description: "Fresh insights and strategies every week" },
                { title: "Early Access", description: "Be first to know about new tools and events" },
                { title: "Community Support", description: "Connect with like-minded professionals" },
              ].map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default JoinCommunity;
