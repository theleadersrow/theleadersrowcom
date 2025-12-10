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
  Rocket,
  X
} from "lucide-react";

const modules = [
  {
    icon: Star,
    title: "The Strategic Benchmark",
    description: "Pinpoint your exact PM level and identify target companies that maximize your career and compensation potential.",
  },
  {
    icon: Briefcase,
    title: "Narrative Control: Engineering Your PM Brand",
    description: "Define and broadcast a compelling Product Leader identity with a rewritten professional narrative.",
  },
  {
    icon: Users,
    title: "High-Value Profile and Network Activation",
    description: "Optimize your resume and LinkedIn with metrics of influence, and activate a high-value professional network.",
  },
  {
    icon: CheckCircle2,
    title: "Interview Mastery: The Advanced Framework Toolkit",
    description: "Master strategic execution and behavioral interviewing at the executive level.",
  },
  {
    icon: Target,
    title: "Product Judgment: Mastering High-Stakes Decisions",
    description: "Elevate decision-making through economic and systems thinking.",
  },
  {
    icon: Award,
    title: "Executive Presence: Communication for Impact",
    description: "Develop the gravitas and speaking style of a senior leader.",
  },
  {
    icon: TrendingUp,
    title: "The Influence Engine: Managing Power Dynamics",
    description: "Learn to manage stakeholders up, down, and laterally while building your Influence Portfolio.",
  },
  {
    icon: Rocket,
    title: "Future-Proofing and The Leader's Playbook",
    description: "Create a repeatable system for continuous self-assessment and strategic career evolution.",
  },
];

const whoIsFor = [
  {
    label: "Experienced PMs",
    description: "You have 3+ years in Product and have mastered the fundamentals.",
  },
  {
    label: "The Strategically Stuck",
    description: "You are a Senior PM (or equivalent) aiming for GPM, Principal, or Director roles.",
  },
  {
    label: "The Undervalued",
    description: "You need to bridge the gap between your impact and your current compensation/title.",
  },
  {
    label: "The Brand Builder",
    description: "You want to define and broadcast an Executive-Ready personal brand and narrative.",
  },
  {
    label: "The System Seeker",
    description: "You require a proven, repeatable framework for interviewing, negotiating, and strategic career growth.",
  },
];

const whoIsNotFor = [
  {
    label: "Entry-Level Professionals",
    description: "The content is too advanced for first-time PMs.",
  },
  {
    label: "Passive Learners",
    description: "This is an active, hands-on coaching and role-playing environment.",
  },
  {
    label: "The \"Hack\" Seekers",
    description: "If you are looking for a magic trick to double your salary without improving your skills, communication, or strategic value, this is not the right fit.",
  },
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
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-4">
              200K Method: The Product Leader's Recalibration
            </h1>
            <p className="text-xl md:text-2xl text-cream font-medium mb-6">
              Stop guessing your worth. Start commanding it.
            </p>
            <p className="text-lg text-cream/80 mb-4 leading-relaxed max-w-3xl">
              This 8-week accelerator is the definitive strategic playbook for experienced Product Managers aiming to execute a calculated career leap into high-impact, $200K+ roles (GPM, Principal, Director).
            </p>
            <p className="text-lg text-cream/80 mb-6 leading-relaxed max-w-3xl">
              We provide the precise framework to: define your next level, engineer an executive-ready personal brand, master advanced product judgment, and negotiate like a CEO. This is high-stakes career strategy, built for maximum ROI.
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
                  Join Now
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
          <div className="max-w-5xl mx-auto">
            {/* Who This Is For */}
            <div className="mb-16">
              <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Who This Program Is For
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  This program is designed for ambitious, experienced Product Managers ready for their next strategic leap.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whoIsFor.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-card rounded-xl p-5 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{item.label}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who This Is NOT For */}
            <div className="bg-muted/30 rounded-2xl p-8 border border-border/30">
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-6 text-center">
                ⛔ Who This Is NOT For
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {whoIsNotFor.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-background rounded-xl p-5 border border-destructive/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                        <X className="w-4 h-4 text-destructive" />
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="section-padding bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
              What You'll Learn
            </h2>
            <p className="text-cream/70 text-lg">
              Eight powerful modules designed to transform every aspect of your professional presence.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={index}
                className="group bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10 hover:bg-cream/10 hover:border-secondary/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:bg-secondary/30 transition-colors">
                  <module.icon className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-secondary/60 text-sm font-medium mb-2">
                  Module {index + 1}
                </div>
                <h3 className="font-semibold text-cream leading-snug mb-2">
                  {module.title}
                </h3>
                <p className="text-cream/60 text-sm leading-relaxed">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Will Achieve */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              What You Will Achieve
            </h2>
            <p className="text-muted-foreground text-lg">
              A strategic masterclass on how a PM achieves their next-level career destiny.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Strategic Leveling</h3>
              <p className="text-muted-foreground text-sm">Pinpoint your exact PM level and target companies for maximum potential.</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Brand & Perception</h3>
              <p className="text-muted-foreground text-sm">Define your Product Leader identity with optimized resume and LinkedIn.</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Interview Mastery</h3>
              <p className="text-muted-foreground text-sm">Master advanced frameworks and executive-level tactics for Director roles.</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Executive Presence</h3>
              <p className="text-muted-foreground text-sm">Develop senior executive communication and stakeholder management.</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Visibility & Influence</h3>
              <p className="text-muted-foreground text-sm">Build an Influence Portfolio that leads to promotion and recognition.</p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Future-Proofing</h3>
              <p className="text-muted-foreground text-sm">Create a repeatable system for continuous career evolution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Format & Experience */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Program Format & Experience
            </h2>
            <p className="text-lg text-secondary font-medium mb-10">
              This is not a lecture series—it is a live execution lab.
            </p>

            {/* The Learning Model */}
            <div className="mb-12">
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
                The Learning Model: Learn, Apply, Coach
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Each 2-hour session is structured to maximize retention and immediate application. You won't just watch slides; you will build, speak, and refine in real-time.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Live Strategy & Frameworks</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Active Breakout Rooms (Pairs & Triads)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Live Coaching & Hot Seats</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">Personalized Feedback</span>
                </div>
              </div>
            </div>

            {/* Beyond the Classroom */}
            <div>
              <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
                Beyond the Classroom
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The transformation continues between sessions:
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-background rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Private Community Access</p>
                </div>
                <div className="bg-background rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Accountability Triads</p>
                </div>
                <div className="bg-background rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Asset Reviews</p>
                </div>
              </div>
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
                  Join Now
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