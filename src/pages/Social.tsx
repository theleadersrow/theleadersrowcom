import Layout from "@/components/layout/Layout";
import { Linkedin, Twitter, Instagram, Youtube, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const socialLinks = [
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://linkedin.com/in/omoniyitolu",
    description: "Professional insights, career tips, and industry perspectives",
    color: "bg-[#0077B5]",
    followers: "10K+",
  },
  {
    name: "Twitter / X",
    icon: Twitter,
    url: "https://twitter.com",
    description: "Quick takes on leadership, tech careers, and professional growth",
    color: "bg-[#1DA1F2]",
    followers: "5K+",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://instagram.com",
    description: "Behind the scenes, motivation, and career inspiration",
    color: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    followers: "3K+",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com",
    description: "In-depth career tutorials, interviews, and educational content",
    color: "bg-[#FF0000]",
    followers: "Coming Soon",
  },
];

const Social = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Connect With Me
            </h1>
            <p className="text-lg text-muted-foreground">
              Follow along for career insights, leadership tips, and exclusive content 
              across all platforms. Join the conversation and stay updated on the latest.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card border border-border rounded-2xl p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`${social.color} p-3 rounded-xl text-white`}>
                    <social.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-secondary transition-colors">
                        {social.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {social.description}
                    </p>
                    <span className="text-xs font-medium text-secondary">
                      {social.followers} followers
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-16 max-w-2xl mx-auto text-center">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
                Want More Exclusive Content?
              </h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for weekly insights, frameworks, and strategies 
                that don't get shared anywhere else.
              </p>
              <Button variant="gold" size="lg" asChild>
                <a href="/newsletter">
                  Subscribe to Newsletter
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Social;
