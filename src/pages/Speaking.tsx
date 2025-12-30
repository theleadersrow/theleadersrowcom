import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mic, Users, Calendar, BookOpen, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";

const speakingOptions = [
  {
    title: "Keynotes",
    icon: Mic,
    description: "High-impact presentations that inspire action and drive transformation for your audience.",
    topics: ["Career acceleration strategies", "Leadership in tech", "Breaking through career plateaus", "Building executive presence"],
  },
  {
    title: "Corporate Workshops",
    icon: Users,
    description: "Interactive sessions designed to upskill teams and accelerate professional development.",
    topics: ["Interview excellence", "Personal branding", "Strategic career planning", "Negotiation mastery"],
  },
  {
    title: "Leadership Offsites",
    icon: Calendar,
    description: "Facilitated sessions that align leadership teams and drive strategic clarity.",
    topics: ["Team alignment", "Vision setting", "Leadership development", "Strategic planning"],
  },
  {
    title: "Product & Tech Talks",
    icon: BookOpen,
    description: "Deep-dive sessions on product management, technology leadership, and innovation.",
    topics: ["Product strategy", "Tech leadership", "Building high-performing teams", "Scaling organizations"],
  },
  {
    title: "Media & Podcast Appearances",
    icon: MessageSquare,
    description: "Engaging conversations for podcasts, panels, and media opportunities.",
    topics: ["Career development", "Tech industry insights", "Leadership lessons", "Personal growth"],
  },
];

const Speaking = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Speaking & Engagements
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Insights for leaders and teams. From keynotes to workshops, 
              I help organizations unlock potential and drive meaningful change.
            </p>
            <Button variant="gold" size="lg" asChild>
              <Link to="/contact?type=speaking" className="flex items-center gap-2">
                Book Me to Speak
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Speaking Options */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8">
              {speakingOptions.map((option) => (
                <div 
                  key={option.title}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-elevated transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <option.icon className="h-7 w-7 text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {option.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.topics.map((topic) => (
                          <span 
                            key={topic}
                            className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/contact?type=${option.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          Inquire
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Book Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
              Why Organizations Choose to Work With Me
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Proven track record with Fortune 500 companies",
                "Actionable frameworks, not just inspiration",
                "Tailored content for your specific audience",
                "Engaging, interactive presentation style",
                "Deep expertise in tech and leadership",
                "Practical takeaways attendees can apply immediately",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{point}</span>
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Ready to Inspire Your Team?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Let's discuss how I can bring value to your next event, offsite, or conference.
            </p>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact?type=speaking" className="flex items-center gap-2">
                Get in Touch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Speaking;
