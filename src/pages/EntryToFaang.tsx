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
    title: "Strategic Benchmark",
    subtitle: "Current Reality → Next Level Standard",
    description: "Stop guessing and get extremely real about where you stand today—skills, scope, visibility, confidence, and credibility.",
    outcomes: [
      "Your true baseline (not what you think your level is)",
      "A clear view of what the next role requires",
      "A career 'starting point' you can build from strategically",
    ],
    deliverables: ["Strategic Benchmark Scorecard", "Current vs Target Role Snapshot"],
  },
  {
    icon: Target,
    title: "Gap Mapping",
    subtitle: "Find the Real Blockers",
    description: "If your effort isn't converting into results, your system has gaps. This module reveals what's actually holding you back.",
    outcomes: [
      "Identify your blockers: clarity gaps, skill gaps, positioning gaps, confidence gaps",
      "Understand why 'hard work' isn't translating into career movement",
      "Prioritize what will produce the biggest lift",
    ],
    deliverables: ["Gap Map Dashboard", "Skill Priority Ladder (top gaps + actions)"],
  },
  {
    icon: Award,
    title: "Identity & Positioning",
    subtitle: "Become the Person Who Gets Chosen",
    description: "Shift from being seen as 'qualified' to being seen as 'next-level.' Build your next-level identity before the title arrives.",
    outcomes: [
      "Build your next-level identity + confidence",
      "Upgrade your positioning from execution → leadership",
      "Create a clear 'why you' narrative",
    ],
    deliverables: ["Identity Statement", "Positioning Pillars + Leadership Signal Checklist"],
  },
  {
    icon: Users,
    title: "Brand & Network Activation",
    subtitle: "Visibility Through People",
    description: "Stop being invisible. Your network becomes your distribution channel. Build momentum without begging for referrals.",
    outcomes: [
      "Build a high-value brand that matches your next-level goal",
      "Activate visibility through the right people",
      "Create consistent interview flow and internal opportunity pull",
    ],
    deliverables: ["Brand Signal Framework", "Outreach Scripts", "Weekly Network Momentum System"],
  },
  {
    icon: MessageSquare,
    title: "Interview Mastery: Phase 1",
    subtitle: "Clarity + Structure",
    description: "Become great on paper and in first rounds. Show up as a structured, strategic candidate who feels easy to say yes to.",
    outcomes: [
      "Strong interview foundations (confidence, structure, clarity)",
      "Build 'hireable' signals in your stories and answers",
      "Close early-stage interview gaps fast",
    ],
    deliverables: ["STAR + Strategic Story Bank", "Interview Answer Structures"],
  },
  {
    icon: Brain,
    title: "Interview Mastery: Phase 2",
    subtitle: "Product Judgment + Strategy",
    description: "Master the interviews that decide the offer: product sense, tradeoffs, execution judgment, and leadership thinking.",
    outcomes: [
      "Strong product thinking under pressure",
      "Tradeoff mastery and structured decision-making",
      "Become the candidate who sounds like they've already done the job",
    ],
    deliverables: ["Product Judgment Playbook", "Executive Product Thinking Framework"],
  },
  {
    icon: Shield,
    title: "Executive Performance & Influence",
    subtitle: "High-Stakes Meetings & Power Dynamics",
    description: "Learn how careers actually grow: not through effort alone, but through influence, trust, communication, and leadership energy.",
    outcomes: [
      "Executive presence in high-stakes moments",
      "Influence without authority",
      "Learn power dynamics so you're never blindsided again",
    ],
    deliverables: ["Executive Presence Checklist", "Influence + Power Dynamics Toolkit", "High-Stakes Meeting System"],
  },
  {
    icon: Rocket,
    title: "The Leader's Playbook",
    subtitle: "System Reuse & Repeatable Growth",
    description: "Your lifetime career operating system. Promotions, pivots, layoffs, leadership jumps—this becomes your repeatable method.",
    outcomes: [
      "A reusable personal 'Career OS'",
      "A system you can apply to any new goal",
      "Long-term compounding growth through iteration",
    ],
    deliverables: ["Leader's Playbook Dashboard", "Career Growth System for Life"],
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
];

const workOnItems = [
  {
    icon: Compass,
    title: "Level Calibration & Career Strategy",
    points: [
      "Diagnose your true operating level vs. your current title",
      "Define your North Star goal + timeline",
      "Benchmark against next-level expectations",
    ],
  },
  {
    icon: Target,
    title: "Gap Identification & Prioritization",
    points: [
      "Map gaps across product judgment, execution, leadership, influence",
      "Create your 'Gap-to-Outcome' plan (no noise, no overwhelm)",
      "Choose your top 3 compounding skills",
    ],
  },
  {
    icon: Award,
    title: "Identity & Positioning Shift",
    points: [
      "Build your next-level identity before the title arrives",
      "Define your leadership edge + signature strengths",
      "Create positioning statements for interviews + promotions",
    ],
  },
  {
    icon: MessageSquare,
    title: "Interview Performance at Senior/Principal Bar",
    points: [
      "Build structured, strategic answers that signal seniority",
      "Master product sense, tradeoffs, and execution judgment",
      "Become the candidate who sounds like they've done the job",
    ],
  },
  {
    icon: Shield,
    title: "Executive Storytelling & Decision Judgment",
    points: [
      "Speak with clarity, conviction, brevity, and control",
      "Navigate conflict, negotiation, and perception management",
      "Build executive presence in high-stakes moments",
    ],
  },
  {
    icon: TrendingUp,
    title: "Negotiation Tactics That Protect Your Value",
    points: [
      "Learn power dynamics so you're never blindsided",
      "Drive alignment across stakeholders",
      "Capture compensation that matches your true level",
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
    question: "Is this program just interview prep?",
    answer: "No. Interview performance is one expression of seniority — not the source of it. The 200K Method™ focuses on how you think, decide, and position yourself so interviews, leveling conversations, and negotiations become a natural extension of your operating level.",
  },
  {
    question: "Who is this program best suited for?",
    answer: "This program is designed for experienced Product Managers and Product Leaders who are delivering at a higher level than their current title, feel mis-positioned or under-leveled, are targeting Senior PM, Principal, GPM, or Director roles, and want clarity and execution — not motivation. If you already have strong fundamentals and real-world experience, this program will resonate.",
  },
  {
    question: "I'm busy. How much time does this realistically take?",
    answer: "You should expect 2 hours/week for live sessions and 1–2 hours/week for reflection, preparation, and application. This is intentionally designed to integrate into a demanding role. The work is focused — not time-consuming.",
  },
  {
    question: "Will this help if I'm not actively interviewing?",
    answer: "Yes. Many participants join before they are interviewing to recalibrate positioning, build leadership narrative, increase leverage inside their current role, and prepare intentionally rather than reactively. You don't need urgency — you need clarity.",
  },
  {
    question: "How is this different from other PM career programs?",
    answer: "Most PM programs focus on tools, tactics, and templates. The 200K Method™ focuses on decision-making clarity, leadership identity, signal over effort, and repeatable career leverage. This is a thinking and execution system, not a checklist.",
  },
  {
    question: "How is this different from Weekly Edge?",
    answer: "The 200K Method is an intensive 8-week accelerator focused on career repositioning, personal branding, interview mastery, and landing $200K+ roles. Weekly Edge is an ongoing membership for continuous skill building. Many graduates of 200K Method continue with Weekly Edge to maintain momentum.",
  },
  {
    question: "Is this suitable if I'm already at a $200K+ compensation level?",
    answer: "Yes — if you are targeting step-change scope or influence, preparing for Principal, GPM, or Director roles, or seeking long-term career leverage, not just comp optimization. This is about operating level, not just salary.",
  },
  {
    question: "Is this a group program or 1:1 coaching?",
    answer: "This is a small, curated cohort experience. The group format allows you to learn from peers at a similar level, pressure-test your thinking, and receive live coaching and feedback. The cohort size is intentionally limited to preserve depth.",
  },
  {
    question: "What results can I expect?",
    answer: "Outcomes vary by individual, but participants consistently leave with a clear understanding of their true operating level, leadership-caliber narrative and positioning, stronger judgment and confidence in decisions, readiness for high-stakes interviews and negotiations, and a repeatable framework for future career moves. This is not a promise of a job — it's a promise of clarity and leverage.",
  },
  {
    question: "What if I miss a session?",
    answer: "Live participation is strongly encouraged. If you miss a session, recordings may be available and you are still expected to complete the work. This program rewards engagement.",
  },
  {
    question: "What if I'm unsure this is the right fit?",
    answer: "That's exactly why there is an application. This is not a program you should join impulsively. If there's mutual alignment, we'll move forward.",
  },
  {
    question: "When does the next cohort start?",
    answer: "The next cohort runs from February 5th to March 26th, 2026. Sessions are held every Thursday from 7:00 PM to 9:00 PM CT.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Because of the live, high-touch nature of this program, refunds are not offered once the cohort begins. This ensures commitment on both sides.",
  },
  {
    question: "Is there ongoing support after the 8 weeks?",
    answer: "Yes! You'll have access to our private community where you can continue to connect with your cohort, ask questions, and receive support even after the program ends.",
  },
];

const commonObjections = [
  {
    objection: "I've done programs like this before.",
    response: "This program is not about content — it's about calibration and execution. If you're open to examining how you think and show up, it will feel different.",
  },
  {
    objection: "I don't want fluff or motivation.",
    response: "Neither do we. This is structured, practical, and grounded.",
  },
  {
    objection: "I'm not sure I'm 'ready' yet.",
    response: "Readiness is clarity — not confidence. That's what this work creates.",
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
              The Next-Level PM System
            </p>
            <p className="text-lg md:text-xl text-cream/90 font-medium mb-6">
              Maximum Potential Activation
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
              <p className="text-cream text-lg">Feb 5th – Mar 26th, 2026</p>
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
            <p className="text-secondary font-medium mb-2">8-Module Career Operating System</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              The Complete Curriculum
            </h2>
            <p className="text-muted-foreground italic">
              "We're not chasing outcomes. We're building the system that guarantees outcomes."
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {modules.map((module, index) => (
              <div
                key={index}
                className="group bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <module.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-secondary/60 text-sm font-medium mb-1">
                      Module {index + 1}
                    </div>
                    <h3 className="font-semibold text-foreground leading-snug">
                      {module.title}
                    </h3>
                    <p className="text-secondary/80 text-xs font-medium">{module.subtitle}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {module.description}
                </p>
                
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground mb-2">Core Outcomes:</p>
                  <ul className="space-y-1">
                    {module.outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-secondary flex-shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs font-semibold text-foreground mb-1">Deliverables:</p>
                  <p className="text-xs text-muted-foreground">
                    {module.deliverables.join(" • ")}
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

      {/* Common Objections */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Common Objections
              </h2>
            </div>

            <div className="space-y-4">
              {commonObjections.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-card rounded-xl border border-border/50 p-6 shadow-soft"
                >
                  <p className="text-foreground font-semibold mb-2 flex items-start gap-2">
                    <span className="text-secondary">"</span>
                    {item.objection}
                    <span className="text-secondary">"</span>
                  </p>
                  <p className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-secondary/30">
                    {item.response}
                  </p>
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
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-secondary" />
                <span className="font-serif text-5xl md:text-6xl font-semibold text-cream">$2,000</span>
              </div>
            </div>
            <p className="text-cream/70 mb-6 text-lg leading-relaxed max-w-xl mx-auto">
              A single salary increase from leveling up often returns 10–50x this investment. 
              This is an investment in your long-term earning potential and career trajectory.
            </p>
            
            {/* Next Cohort Info */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Next Cohort</p>
              <p className="text-cream text-lg">Feb 5th – Mar 26th, 2026</p>
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
