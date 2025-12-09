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
    title: "The Strategic Benchmark",
  },
  {
    icon: Briefcase,
    title: "Narrative Control: Engineering Your PM Brand",
  },
  {
    icon: Users,
    title: "High-Value Profile and Network Activation",
  },
  {
    icon: CheckCircle2,
    title: "Interview Mastery: The Advanced Framework Toolkit",
  },
  {
    icon: Target,
    title: "Product Judgment: Mastering High-Stakes Decisions",
  },
  {
    icon: Award,
    title: "Executive Presence: Communication for Impact",
  },
  {
    icon: TrendingUp,
    title: "The Influence Engine: Managing Power Dynamics",
  },
  {
    icon: Rocket,
    title: "Future-Proofing and The Leader's Playbook",
  },
];

const whoIsFor = [
  "Aspiring PMs breaking into the field",
  "Early–mid career PMs seeking faster growth",
  "Senior PMs looking for visibility and promotion",
  "Experienced leaders who want to elevate their brand, influence, compensation, and long-term trajectory",
];

const programFormat = [
  "8 Weeks of Structured Growth",
  "Weekly Live Coaching Sessions",
  "Hands-On Skill Workshops",
  "Personalized Career Feedback",
  "Real-World Practice",
  "End-to-End Career Support",
  "Private Community Support",
];

const The200KMethod = () => {
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
              200K Method
            </h1>
            <p className="text-lg md:text-xl text-cream/80 mb-6 leading-relaxed max-w-3xl">
              The 200K Method is an 8-week career acceleration program that transforms ambitious Product Managers into highly visible, well-positioned, and top-paid leaders. We rebuild your personal brand, sharpen your product thinking, elevate your communication, and help you master interviews and negotiation—so you can step into senior roles with confidence and clarity.
            </p>
            
            {/* Next Cohort Info */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Next Cohort</p>
              <p className="text-cream text-lg">Jan 8th – Feb 26th, 2025</p>
              <p className="text-cream/70 text-sm">Every Thursday, 7–9pm CT</p>
            </div>
            
            <div className="block">
              <Link to="/register">
                <Button variant="hero" size="xl" className="group">
                  Register Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
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

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 shadow-soft hover:shadow-card transition-all duration-300 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <module.icon className="w-5 h-5 text-secondary" />
                </div>
                <span className="font-medium text-foreground leading-tight">
                  {module.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Will Achieve */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-10">
              What You Will Achieve
            </h2>
            
            <div className="space-y-8">
              <div className="border-l-4 border-secondary pl-6">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Strategic Leveling & Targeting (Phase 1)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Objectively pinpoint the exact PM level you are qualified for and the type of company that maximizes your career and compensation potential.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-6">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Brand & Perception Control (Phase 2 & 3)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Systematically define and broadcast a "Product Leader" identity. You will rewrite your professional narrative, optimize your resume/LinkedIn with metrics of influence, and activate a high-value professional network.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-6">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Interview & Judgment Mastery (Phase 4 & 5)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Move beyond basic frameworks. Master advanced strategic thinking, complex trade-off justification, and executive-level behavioral tactics to conquer interviews for Director-track roles.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-6">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Executive Influence & Visibility (Phase 6 & 7)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Develop the communication style and presence of a senior executive. Learn to manage stakeholders (up, down, and laterally) and build an "Influence Portfolio" to ensure your contributions lead directly to promotion and visibility.
                </p>
              </div>

              <div className="border-l-4 border-secondary pl-6">
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  Future-Proofing (Phase 8)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Walk away with a repeatable, adaptable system for continuous self-assessment and strategic career evolution, ensuring long-term relevance in a rapidly changing tech landscape.
                </p>
              </div>
            </div>

            <div className="mt-10 p-6 bg-navy/5 rounded-xl border border-navy/10">
              <p className="text-foreground font-medium text-center italic">
                This is not a course on what a PM does; it is a strategic masterclass on how a PM achieves their next-level career destiny.
              </p>
            </div>
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
            <p className="text-cream/70 mb-6 text-lg leading-relaxed max-w-xl mx-auto">
              A single salary increase from leveling up often returns 10–50x this investment. 
              This is an investment in your long-term earning potential and career trajectory.
            </p>
            
            {/* Next Cohort Info */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Next Cohort</p>
              <p className="text-cream text-lg">Jan 8th – Feb 26th, 2025</p>
              <p className="text-cream/70 text-sm">Every Thursday, 7–9pm CT</p>
            </div>
            
            <div className="block">
              <Link to="/register">
                <Button variant="hero" size="xl" className="group">
                  Register Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default The200KMethod;