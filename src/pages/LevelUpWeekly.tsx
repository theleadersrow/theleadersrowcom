import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Calendar, Clock, Users, Zap } from "lucide-react";

const careerAssets = [
  {
    title: "High-Impact Communication",
    description: "Learn to speak with clarity, confidence, and influence — whether it's in meetings, interviews, or cross-functional discussions.",
  },
  {
    title: "Productivity & Time Mastery Systems",
    description: "Build routines and structures that help you work smarter, prioritize effectively, and manage your energy like top performers do.",
  },
  {
    title: "Stakeholder Alignment & Management",
    description: "Develop the ability to navigate difficult personalities, build trust quickly, and drive alignment without friction.",
  },
  {
    title: "Storytelling for Influence",
    description: "Turn your ideas, projects, and results into compelling stories that inspire action and make your work unforgettable.",
  },
  {
    title: "Leadership Habits & High-Performance Behaviors",
    description: "Adopt the habits that distinguish strong leaders — from decision-making to communication to presence.",
  },
  {
    title: "Cross-Functional Influence",
    description: "Master the art of influencing without authority and moving teams forward, even when you don't own the final call.",
  },
  {
    title: "Structured Problem-Solving",
    description: "Learn to deconstruct ambiguity, find clarity fast, and deliver solutions with confidence and logic.",
  },
  {
    title: "Decision-Making Frameworks",
    description: "Build repeatable mental models that help you evaluate tradeoffs and make smarter decisions under pressure.",
  },
  {
    title: "Presentation & Executive Communication Skills",
    description: "Craft and deliver presentations that communicate ideas clearly, showcase leadership, and drive outcomes.",
  },
];

const whatsIncluded = [
  "75–90 minute live session each week",
  "20–30 minutes of live Q&A",
  "Worksheets and practical examples",
  "Scripts and frameworks you can use immediately",
  "A new skill focus each week",
  "Continuous career growth momentum",
];

const WeeklyEdge = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <p className="text-secondary font-medium mb-4">Ongoing Skill Building</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-6">
              Weekly Edge
            </h1>
            <p className="text-xl md:text-2xl text-cream/80 mb-6 leading-relaxed">
              Weekly live skill-building sessions for product professionals who want to stay 
              relevant and grow continuously.
            </p>
            
            {/* Session Schedule */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Live Sessions</p>
              <p className="text-cream text-lg">Every Wednesday, 7–8:30pm CT</p>
            </div>
            
            <div className="block">
              <Link to="/register">
                <Button variant="hero" size="xl" className="group">
                  Join Membership
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Build */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-secondary" />
              <p className="text-secondary font-semibold">What You'll Build Inside Weekly Edge</p>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6">
              Build Career Assets That Compound
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Weekly Edge isn't about learning "topics."
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              It's about building career assets that make you sharper, faster, more confident, 
              and impossible to overlook. Every week, you add a new high-leverage skill to your 
              toolkit — one that compounds your growth and strengthens your leadership identity.
            </p>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="font-serif text-2xl font-semibold text-foreground mb-1">Wednesday</p>
                <p className="text-muted-foreground text-sm">7–8:30pm CT</p>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <Clock className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="font-serif text-2xl font-semibold text-foreground mb-1">90 min</p>
                <p className="text-muted-foreground text-sm">Session Length</p>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="font-serif text-2xl font-semibold text-foreground mb-1">20-30 min</p>
                <p className="text-muted-foreground text-sm">Live Q&A</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Weekly Career Asset Collection */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-secondary font-semibold mb-4">⭐ Your Weekly Career Asset Collection</p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                9 High-Leverage Skills You'll Master
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerAssets.map((asset, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <span className="text-secondary font-bold">{index + 1}</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                    {asset.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {asset.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Final Positioning Line */}
            <div className="mt-12 text-center bg-card rounded-2xl p-8 shadow-soft border border-secondary/20">
              <p className="text-foreground text-lg md:text-xl leading-relaxed font-medium">
                Each of these skills becomes a long-term asset — sharpening your execution, 
                elevating your presence, and expanding your leadership potential week after week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
              What's Included
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {whatsIncluded.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investment & CTA */}
      <section className="section-padding bg-navy">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-6">
              Investment
            </h2>
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="font-serif text-5xl md:text-6xl font-semibold text-cream">$100</span>
              <span className="text-cream/60 text-xl">/month</span>
            </div>
            <p className="text-cream/70 mb-8 text-lg leading-relaxed max-w-xl mx-auto">
              Invest in continuous growth and stay ahead of the curve. 
              Cancel anytime if it's not the right fit.
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Join Membership
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default WeeklyEdge;
