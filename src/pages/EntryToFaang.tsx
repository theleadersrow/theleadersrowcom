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
  X,
  Brain,
  Compass,
  Zap,
  Shield
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const modules = [
  {
    icon: Compass,
    title: "The Strategic Benchmark",
    subtitle: "Internal + External Level Alignment",
    description: "Diagnose your true PM operating level. Identify target roles and companies aligned to your leverage. Expose gaps between self-perception and market signals.",
    outcome: "Absolute clarity on where you are — and where you belong.",
  },
  {
    icon: Brain,
    title: "Decision Identity: How Senior PMs Think",
    subtitle: "Thinking at Scale",
    description: "How senior leaders frame problems. What decisions actually signal level. Why execution alone doesn't translate upward.",
    outcome: "You stop 'doing more' and start signaling seniority.",
  },
  {
    icon: MessageSquare,
    title: "Narrative Control: Engineering Your PM Brand",
    subtitle: "Leadership-Caliber Positioning",
    description: "Build a leadership-caliber narrative. Reposition past work for scale and impact. Control how your value is interpreted.",
    outcome: "You sound like the level you're targeting.",
  },
  {
    icon: Users,
    title: "High-Value Profile & Network Activation",
    subtitle: "Strategic Visibility",
    description: "Optimize resume and LinkedIn with influence metrics. Activate the right network, not a broad one. Position yourself for pull, not push.",
    outcome: "Your profile works for you, not against you.",
  },
  {
    icon: CheckCircle2,
    title: "Interview Mastery: Executive-Level Performance",
    subtitle: "Hire-Level Performance",
    description: "Advanced behavioral and product sense frameworks. Communicate tradeoffs, judgment, and scope. Perform under senior-level scrutiny.",
    outcome: "Interview confidence rooted in clarity, not memorization.",
  },
  {
    icon: Target,
    title: "Product Judgment: High-Stakes Decision Making",
    subtitle: "Leadership-Level Reasoning",
    description: "Apply economic, system, and leverage thinking. Navigate ambiguity at scale. Make decisions that reflect leadership maturity.",
    outcome: "Stronger judgment, clearer reasoning, better outcomes.",
  },
  {
    icon: Award,
    title: "Executive Presence & Influence",
    subtitle: "Gravitas & Power Dynamics",
    description: "Communicate with clarity and gravitas. Manage power dynamics up, down, and across. Build an influence portfolio.",
    outcome: "You are perceived as a peer, not a candidate.",
  },
  {
    icon: Rocket,
    title: "Future-Proofing: The Leader's Playbook",
    subtitle: "Repeatable Career System",
    description: "Build a repeatable self-assessment system. Avoid future plateaus. Define your next strategic horizon.",
    outcome: "You leave with a system, not just a result.",
  },
];

const whoIsFor = [
  {
    label: "Strong Executors, Under-Leveled",
    description: "You consistently deliver results, but your title and comp haven't caught up.",
  },
  {
    label: "Title-Stuck Despite Expanding Scope",
    description: "Your responsibilities have grown, but your level hasn't.",
  },
  {
    label: "Targeting Step-Change Roles",
    description: "You are not interested in lateral moves or marginal upgrades.",
  },
  {
    label: "Internally Stuck, Externally Capable",
    description: "You sense misalignment between your true capability and how you're perceived. You want clarity, not more effort.",
  },
];

const whoIsNotFor = [
  {
    label: "Surface-Level Seekers",
    description: "If you want motivation, hacks, or generic advice — this is not for you.",
  },
  {
    label: "Passive Learners",
    description: "This is an execution lab, not a lecture series.",
  },
  {
    label: "Early-Career PMs",
    description: "This program assumes strong fundamentals and real experience.",
  },
];

const workOnItems = [
  {
    icon: Brain,
    title: "Decision & Identity Calibration",
    points: [
      "Clarify your true operating level vs. your current title",
      "Understand how senior leaders are evaluated beyond execution",
      "Rebuild confidence rooted in judgment, not validation",
    ],
  },
  {
    icon: MessageSquare,
    title: "Narrative & Positioning",
    points: [
      "Engineer a leadership narrative that hiring committees trust",
      "Align perception with actual impact",
      "Stop underselling or over-explaining your work",
    ],
  },
  {
    icon: Target,
    title: "Product Judgment at Scale",
    points: [
      "Strengthen high-stakes decision-making",
      "Apply economic, systems, and leverage thinking",
      "Signal seniority through how you frame problems and tradeoffs",
    ],
  },
  {
    icon: Zap,
    title: "Signal Execution (Interviews + Visibility)",
    points: [
      "Translate leadership thinking into hire-level interview performance",
      "Communicate clearly under pressure",
      "Demonstrate level without theatrics",
    ],
  },
  {
    icon: TrendingUp,
    title: "Value Capture",
    points: [
      "Negotiate compensation, scope, and leveling from a position of clarity",
      "Stop leaving value on the table",
      "Anchor discussions to impact, not hope",
    ],
  },
];

const programFormat = [
  "8 weeks | Live, cohort-based",
  "Weekly 2-hour sessions",
  "Small, high-caliber group",
  "Personalized strategy & positioning",
  "Interview + leveling preparation",
  "Salary & negotiation strategy",
  "Private peer community",
];

const learningModel = [
  {
    title: "Strategic Framing",
    description: "One core concept or decision lens",
  },
  {
    title: "Live Application",
    description: "Breakouts, exercises, real scenarios",
  },
  {
    title: "Coaching & Hot Seats",
    description: "Direct feedback on thinking, narrative, and execution",
  },
  {
    title: "Commitment & Calibration",
    description: "Clear actions to apply immediately",
  },
];

const outcomes = [
  {
    icon: Shield,
    title: "Internal Clarity & Self-Trust",
    description: "Confidence grounded in judgment and alignment",
  },
  {
    icon: Award,
    title: "Leadership-Caliber Positioning",
    description: "A narrative that reflects your true value",
  },
  {
    icon: CheckCircle2,
    title: "Hire-Level Readiness",
    description: "Across interviews, leveling, and visibility",
  },
  {
    icon: TrendingUp,
    title: "Negotiation Strategy",
    description: "Anchored to impact, not hope",
  },
  {
    icon: Rocket,
    title: "A Repeatable Career System",
    description: "Not a one-time win",
  },
];

const faqs = [
  {
    question: "When does the next cohort start?",
    answer: "The next cohort runs from January 22nd to March 12th, 2026. Sessions are held every Thursday from 7:00 PM to 9:00 PM CT.",
  },
  {
    question: "What if I can't attend a live session?",
    answer: "All sessions are recorded and available to cohort members. You'll have access to the replay, along with all worksheets and materials, so you can catch up at your own pace.",
  },
  {
    question: "How is this different from Weekly Edge?",
    answer: "The 200K Method is an intensive 8-week accelerator focused on career repositioning, personal branding, interview mastery, and landing $200K+ roles. Weekly Edge is an ongoing membership for continuous skill building. Many graduates of 200K Method continue with Weekly Edge to maintain momentum.",
  },
  {
    question: "What is the refund policy?",
    answer: "Due to the intensive nature of the program and limited cohort sizes, all payments are final and non-refundable. We recommend reviewing all program details and reaching out with questions before enrolling to ensure it's the right fit for you.",
  },
  {
    question: "Who is this program for?",
    answer: "This program is designed for experienced Product Managers (3+ years) who are aiming for Senior PM, Principal, GPM, or Director-level roles. It's ideal for those who feel strategically stuck, undervalued, or need a proven framework for career advancement.",
  },
  {
    question: "What will I achieve by the end of the program?",
    answer: "You'll have internal clarity and self-trust, a leadership-caliber positioning narrative, hire-level readiness across interviews and visibility, a negotiation strategy anchored to impact, and a repeatable career system for continuous growth.",
  },
  {
    question: "Is there ongoing support after the 8 weeks?",
    answer: "Yes! You'll have access to our private community where you can continue to connect with your cohort, ask questions, and receive support even after the program ends.",
  },
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
            <p className="text-secondary font-medium mb-4">
              <span className="bg-secondary/20 px-3 py-1 rounded-full text-sm mr-2">High Demand</span>
              8-Week Cohort-Based
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-4">
              The 200K Method™
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-medium mb-2">
              Career Recalibration for Senior Product Leaders
            </p>
            <p className="text-lg md:text-xl text-cream/90 font-medium mb-6">
              Clarity. Positioning. Execution at the $200K+ Level.
            </p>
            
            <div className="bg-cream/5 border border-cream/20 rounded-xl p-5 mb-6 max-w-2xl">
              <p className="text-cream text-lg mb-3">
                <span className="font-semibold">Stop guessing your value.</span>{" "}
                Start operating at the level you're already capable of.
              </p>
              <p className="text-cream/80 leading-relaxed mb-4">
                The 200K Method™ is an intensive, 8-week, cohort-based coaching program for experienced Product Leaders who are ready to make a step-change leap into Senior PM, Principal, GPM, or Director roles — without over-indexing on luck, interviews, or brute effort.
              </p>
              <div className="space-y-1">
                <p className="text-cream font-semibold">This is not interview prep.</p>
                <p className="text-cream font-semibold">This is not resume coaching.</p>
                <p className="text-secondary font-semibold text-lg">This is career recalibration at the leadership level.</p>
              </div>
            </div>
            
            {/* Next Cohort Info */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Next Cohort</p>
              <p className="text-cream text-lg">Jan 22nd – Mar 12th, 2026</p>
              <p className="text-cream/70 text-sm">Every Thursday, 7–9pm CT</p>
            </div>
            
            <div className="block">
              <Link to="/register?program=200k-method">
                <Button variant="hero" size="xl" className="group">
                  Join Now
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Program Philosophy */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-secondary font-medium mb-2">Program Philosophy</p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6">
                Most Product Managers Don't Stall Because They Lack Execution
              </h2>
            </div>
            
            <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-soft mb-8">
              <p className="text-lg text-foreground font-medium mb-6">They stall because:</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">Their internal clarity doesn't match their external impact</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">Their decision-making signals don't translate at scale</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">Their identity, narrative, and execution are misaligned</p>
                </div>
              </div>
            </div>
            
            <div className="bg-navy rounded-2xl p-8 text-center">
              <p className="text-secondary font-semibold text-lg mb-2">The 200K Method™ fixes that.</p>
              <p className="text-cream/80 text-lg leading-relaxed">
                We recalibrate how you think, decide, and show up — so $200K+ roles become a natural outcome, not a stretch.
              </p>
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
                <p className="text-secondary font-medium mb-2">Senior, High-Performing Product Leaders Who Are:</p>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                  Who This Program Is For
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
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
              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
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

      {/* What You Will Work On */}
      <section className="section-padding bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-secondary font-medium mb-2">Reframed to integrate results-driven coaching</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
              What You Will Work On
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            {workOnItems.map((item, index) => (
              <div key={index} className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-cream mb-4">{index + 1}. {item.title}</h3>
                <ul className="space-y-2">
                  {item.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-cream/70 text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Program Structure */}
          <div className="max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl font-semibold text-cream mb-6 text-center">
              Program Structure
            </h3>
            <p className="text-cream/60 text-center mb-8">
              This is a guided execution environment, not a content dump.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {programFormat.slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-cream/5 rounded-xl p-4 border border-cream/10">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-cream text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              {programFormat.slice(4).map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-cream/5 rounded-xl p-4 border border-cream/10">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-cream text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Learning Model */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                The Learning Model
              </h2>
              <p className="text-secondary font-semibold text-xl">Learn → Apply → Coach</p>
              <p className="text-muted-foreground mt-2">Every session follows the same structure:</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {learningModel.map((item, index) => (
                <div key={index} className="bg-card rounded-xl p-5 border border-border/50 shadow-soft text-center">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-secondary font-semibold">{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8 Modules */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-secondary font-medium mb-2">Refined Curriculum</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              The 8 Modules
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <module.icon className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-secondary/60 text-sm font-medium mb-1">
                  Module {index + 1}
                </div>
                <h3 className="font-semibold text-foreground leading-snug mb-1">
                  {module.title}
                </h3>
                <p className="text-secondary/80 text-xs font-medium mb-3">{module.subtitle}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {module.description}
                </p>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground">
                    <span className="text-secondary font-medium">Outcome:</span> {module.outcome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Outcome */}
      <section className="section-padding bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
              The Outcome
            </h2>
            <p className="text-cream/70 text-lg">
              You leave with:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto mb-12">
            {outcomes.map((item, index) => (
              <div key={index} className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold text-cream mb-2 text-sm">{item.title}</h3>
                <p className="text-cream/60 text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Experience */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Program Experience
              </h2>
              <p className="text-lg text-secondary font-medium">
                This is not a classroom. It is a live execution lab.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-6 text-center">
                Between Sessions:
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Private community access</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Accountability triads</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Asset reviews</p>
                  <p className="text-muted-foreground text-xs mt-1">(resume, narrative, interview responses)</p>
                </div>
                <div className="bg-card rounded-xl p-5 border border-border/50 text-center">
                  <p className="font-semibold text-foreground">Ongoing calibration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Promise */}
      <section className="py-16 bg-navy">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-cream/70 text-lg mb-4">You don't leave this program "motivated."</p>
            <p className="text-cream text-xl md:text-2xl font-medium leading-relaxed">
              You leave <span className="text-secondary font-semibold">clear, calibrated, and operating differently</span> — with the ability to create high-stakes career results again and again.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about the 200K Method.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border/50 px-6 shadow-soft"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-secondary transition-colors py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
              <p className="text-cream text-lg">Jan 22nd – Mar 12th, 2026</p>
              <p className="text-cream/70 text-sm">Every Thursday, 7–9pm CT</p>
            </div>
            
            <div className="block">
              <Link to="/register?program=200k-method">
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
