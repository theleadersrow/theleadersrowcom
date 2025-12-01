import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Users, 
  Target, 
  TrendingUp,
  Award,
  MessageSquare,
  Briefcase,
  Rocket
} from "lucide-react";

const modules = [
  {
    icon: Star,
    title: "Build Your Personal Brand + Create a Top-Tier Resume & LinkedIn",
    description: "Identify your strengths and value — then transform them into a brand that attracts attention. You'll leave with a resume rewritten to be one of the top resumes for your target roles and a fully optimized LinkedIn profile that increases recruiter traction.",
  },
  {
    icon: MessageSquare,
    title: "Position Your Brand & Become a Strong Storyteller",
    description: "Learn how to talk about your work in a clear, confident, and memorable way that makes your value obvious.",
  },
  {
    icon: Target,
    title: "Product Judgment & First-Principles Thinking",
    description: "Develop strong product instincts and learn to break down problems clearly, evaluate tradeoffs, and make smart decisions — skills that signal seniority.",
  },
  {
    icon: CheckCircle2,
    title: "Master All PM Interview Techniques",
    description: "Learn simple, repeatable frameworks for Product Sense, Execution, Analytics, and Strategy. Know exactly how to structure your thinking and answer confidently.",
  },
  {
    icon: Award,
    title: "Communicate & Present Like a Product Leader",
    description: "Speak clearly, present persuasively, and share ideas with leadership-level clarity.",
  },
  {
    icon: Users,
    title: "Develop Executive Presence",
    description: "Build the tone, behavior, and confidence that shift perception from 'contributor' to leader.",
  },
  {
    icon: Briefcase,
    title: "Negotiate Seniority, Offers & Compensation",
    description: "Use proven strategies and scripts to negotiate titles, pay, equity, benefits, and role scope — without fear.",
  },
  {
    icon: Rocket,
    title: "Future-Proof & Create Opportunities",
    description: "Learn how to build visibility, attract advocacy, and create long-term, sustainable growth.",
  },
];

const whoIsFor = [
  "Professionals who want to stand out in the job market",
  "Those looking to improve interview performance",
  "People ready to position themselves for senior roles",
  "Leaders wanting to strengthen communication & presence",
  "Anyone ready to negotiate better offers",
  "Professionals seeking to build long-term growth momentum",
  "Those who want to move faster with clarity & structure",
];

const programFormat = [
  "Weekly 2-hour coaching sessions",
  "Weekly practice labs",
  "Clear weekly deliverables",
  "Real-time feedback",
  "Career asset creation (resume, LinkedIn, stories, scripts, decks)",
  "A supportive community",
  "Measurable progress week-by-week",
];

const TheNextLeap = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            <p className="text-secondary font-medium mb-4">8-Week Accelerator</p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-6">
              The Next Leap
            </h1>
            <p className="text-xl md:text-2xl text-cream/80 mb-8 leading-relaxed">
              An 8-Week Accelerator to Unblock Your Growth and Elevate Your Career
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Register Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
              Who This Program Is For
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {whoIsFor.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6">
              What You'll Learn
            </h2>
            <p className="text-muted-foreground text-lg">
              Eight powerful modules designed to transform every aspect of your professional presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <module.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {index + 1}. {module.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Format */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
              Program Format
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {programFormat.map((item, index) => (
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-secondary" />
              <span className="font-serif text-5xl md:text-6xl font-semibold text-cream">$2,000</span>
            </div>
            <p className="text-cream/70 mb-8 text-lg leading-relaxed max-w-xl mx-auto">
              A single salary increase from leveling up often returns 10–50x this investment. 
              This is an investment in your long-term earning potential and career trajectory.
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Register Now
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TheNextLeap;
