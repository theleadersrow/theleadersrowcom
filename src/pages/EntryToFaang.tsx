import Layout from "@/components/layout/Layout";
import TestimonialsMarquee from "@/components/home/TestimonialsMarquee";
import RightSidebar from "@/components/200k/RightSidebar";
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
    description: "Stop guessing. Get precise.\n\nThis module establishes your true leadership baseline — across scope, impact, visibility, credibility, and strategic thinking — and compares it directly to the standard required at your next level.\n\nYou cannot move forward strategically if you don't know exactly where you stand.",
    outcomes: [
      "A quantified baseline of your current leadership capacity",
      "Clear visibility into the scope and standards of your next role",
      "Awareness of your strategic vs tactical work mix",
      "A data-backed starting point to build from intentionally",
    ],
    deliverables: ["Strategic Benchmark Scorecard", "Current vs Target Role Snapshot", "Strategic vs Tactical Work Analysis", "Leadership Visibility Audit"],
  },
  {
    icon: Target,
    title: "Gap Mapping",
    subtitle: "Find the Real Blockers",
    description: "If your effort isn't converting into results, your system has gaps.\nThis module diagnoses exactly where you're under-positioned — in skill, scope, signal, or strategy — and shows you what must change.",
    outcomes: [
      "Identify your true gap: clarity, skill, positioning, behavior, or leadership signal",
      "Understand why \"hard work\" isn't translating into promotion or pay",
      "Distinguish tactical work from strategic impact",
      "Prioritize the 1–2 moves that will create the biggest lift",
    ],
    deliverables: ["Career Gap Diagnostic Dashboard", "Strategic vs Tactical Work Audit", "Skill Priority Ladder (Top Gaps + Execution Plan)", "Leadership Signal Assessment"],
  },
  {
    icon: Award,
    title: "Identity & Positioning",
    subtitle: "Become the Person Who Gets Chosen",
    description: "Shift from being seen as \"qualified\" to being evaluated as \"next-level.\"\nRebuild how the market perceives you — on paper, online, and in the room.\nYou won't wait for the title. You will position for it.",
    outcomes: [
      "Build a next-level identity rooted in strategic impact",
      "Upgrade your resume & LinkedIn from execution → leadership signal",
      "Develop a clear, compelling \"why you\" narrative backed by proof",
      "Align your positioning with higher scope, higher compensation roles",
    ],
    deliverables: ["Executive Positioning Header", "Leadership-Level Resume Rewrite", "LinkedIn Headline + About Section", "3 Positioning Pillars Framework", "Leadership Signal Checklist", "2-Week Identity Activation Plan"],
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
    answer: "No. Interview performance is one expression of seniority — not the source of it. The Strategic Career Mastery Program™ focuses on how you think, decide, and position yourself so interviews, leveling conversations, and negotiations become a natural extension of your operating level.",
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
    answer: "Most PM programs focus on tools, tactics, and templates. The Strategic Career Mastery Program™ focuses on decision-making clarity, leadership identity, signal over effort, and repeatable career leverage. This is a thinking and execution system, not a checklist.",
  },
  {
    question: "How is this different from Weekly Edge?",
    answer: "The Strategic Career Mastery Program is an intensive 8-week accelerator focused on career repositioning, personal branding, interview mastery, and landing senior roles. Weekly Edge is an ongoing membership for continuous skill building. Many graduates of the Strategic Career Mastery Program continue with Weekly Edge to maintain momentum.",
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
  {
    question: "Is there a payment plan?",
    answer: "Yes. We offer flexible payment options to make the program accessible. You can pay in full or split your investment into installments. Details are provided during the enrollment process.",
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
      <RightSidebar />
      
      {/* Hero */}
      <section id="hero" className="pt-24 pb-12 md:pt-28 md:pb-16 bg-navy relative overflow-hidden min-h-[calc(100vh-80px)] flex items-center scroll-mt-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Title & CTA */}
            <div>
              <p className="text-secondary font-medium mb-4">
                <span className="bg-secondary/20 px-3 py-1 rounded-full text-sm">8-Week Cohort-Based Executive Program</span>
              </p>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-cream mb-4">
                The Strategic Career Mastery Program™
              </h1>
              <p className="text-lg md:text-xl text-secondary font-medium mb-6">
                Benchmark. Reposition. Operate at the Next Level.
              </p>
              <p className="text-cream/80 text-sm leading-relaxed mb-6 max-w-xl">
                Stop chasing random tactics.{"\n\n"}
                This is a structured career calibration system for high-performing PMs and business leaders ready for promotion, expanded scope, or higher-impact roles.{"\n\n"}
                You will benchmark your true level, reposition your market signal, and begin operating at the standard your next role demands.
              </p>
              
              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <Link to="/register?program=200k-method">
                  <Button variant="hero" size="lg" className="group">
                    Begin My Strategic Elevation
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="#curriculum">
                  <Button variant="outline" size="lg" className="border-cream/30 text-cream hover:bg-cream/10">
                    See Program Architecture
                  </Button>
                </a>
              </div>
              <p className="text-cream/60 text-sm mb-4">
                High-touch coaching with structured diagnostics, asset rebuilds, executive simulations, and implementation accountability.
              </p>
              <div className="text-cream/70 text-sm mb-6">
                <span className="text-secondary font-semibold">Next Cohort:</span> April 2 – May 21, 2026
              </div>

              {/* Testimonials Snapshot */}
              <div className="bg-cream/5 border border-cream/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-secondary fill-secondary" />
                    ))}
                  </div>
                  <span className="text-cream/70 text-sm">From Our Members</span>
                </div>
                <p className="text-cream/90 text-sm leading-relaxed mb-3 line-clamp-3">
                  "I finally understood the level I was actually operating at — and what had to change. Once I recalibrated my positioning and communication, interviews and internal conversations shifted immediately."
                </p>
                <a 
                  href="#reviews" 
                  className="text-secondary text-sm font-medium hover:underline inline-flex items-center gap-1"
                >
                  See more transformation stories
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
            
            {/* Right Column - Key Points */}
            <div className="bg-cream/5 border border-cream/20 rounded-xl p-6">
              <p className="text-cream/90 text-sm mb-5 leading-relaxed">
                An 8-week strategic elevation system for PMs and business professionals ready to operate beyond their current title.
              </p>
              <p className="text-cream/80 text-sm mb-4 leading-relaxed">
                You won't just prepare for interviews.{" "}
                You will recalibrate how you think, communicate, and position yourself — so the next level becomes a natural progression, not a stretch.
              </p>
              <p className="text-cream font-medium text-sm mb-4">Build Your Career Operating System For:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  "Executive-level communication",
                  "Offer-winning positioning",
                  "Senior-level scope articulation",
                  "Leadership presence & visibility",
                  "Strategic narrative control",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-cream/80 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-cream/80 text-xs mb-4 leading-relaxed font-medium">
                This is not career advice.
              </p>
              <p className="text-cream/70 text-xs mb-5 leading-relaxed">
                It's a structured upgrade to how you show up, signal value, and lead.
              </p>
              <div className="pt-4 border-t border-cream/10">
                <p className="text-cream/60 text-xs font-medium mb-2">The Transformation Path</p>
                <p className="text-secondary font-semibold text-xs">
                  Benchmark → Diagnose → Reposition → Signal → Operate → Elevate
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Simple Promise */}
      <section id="promise" className="py-12 bg-secondary/10 border-y border-secondary/20 scroll-mt-20">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-secondary font-medium text-sm mb-2">The Simple Promise</p>
            <p className="text-xl md:text-2xl font-serif font-semibold text-foreground leading-relaxed mb-4">
              You leave with a repeatable <span className="text-secondary">Career Operating System</span> — a structured framework to recalibrate your identity, positioning, and leadership signal every time you step into greater scope.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              This is not about working harder.<br />
              It's about operating at the level your next role demands.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section id="difference" className="section-padding bg-navy scroll-mt-20">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-6">
              What Makes This Different
            </h2>
            <p className="text-cream/90 text-lg mb-4">
              We don't chase outcomes.
            </p>
            <p className="text-cream/70 leading-relaxed">
              We recalibrate how you operate — <span className="text-secondary font-semibold">so outcomes follow.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section id="who-for" className="section-padding bg-background scroll-mt-20">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
                Who This Program Is For
              </h2>
              <p className="text-muted-foreground">
                This program is for you if:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                "You are already performing at a high level — but not being evaluated at that level",
                "You're ready for a promotion, larger scope, or strategic ownership",
                "You want to reposition your market signal — not just polish your resume",
                "You feel capable… but under-leveled",
                "You want a structured system to calibrate your identity and leadership presence",
                "You're serious about operating at the next tier — not casually \"exploring options\"",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-card rounded-xl p-4 border border-border/50">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Who This Is NOT For */}
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-3">
                Who This Program Is <span className="text-muted-foreground">NOT</span> For
              </h3>
              <p className="text-muted-foreground">
                This program is not for you if:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {[
                "You're looking for basic interview prep",
                "You're early in your career and still building foundational skills",
                "You want shortcuts instead of behavioral elevation",
                "You're unwilling to receive direct calibration and feedback",
                "You're satisfied with incremental growth",
                "You want motivation more than structure",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-xl p-4 border border-border/50">
                  <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Closing Line */}
            <div className="bg-secondary/10 rounded-xl p-5 text-center border border-secondary/20">
              <p className="text-foreground font-medium leading-relaxed italic">
                This is for experienced professionals ready to be recalibrated — <span className="text-secondary font-semibold">not convinced.</span>
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 8 Modules */}
      <section id="curriculum" className="section-padding bg-background scroll-mt-20">
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
      <section id="outcome" className="section-padding bg-navy relative overflow-hidden scroll-mt-20">
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
      <section id="experience" className="section-padding bg-muted/30 scroll-mt-20">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-secondary font-medium mb-2">How It Works</p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Program Experience
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                This is not passive learning.<br />
                It's structured elevation through feedback, execution, and calibration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Accountability Triads */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Accountability Triads</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  You're not doing this alone.
                </p>
                <ul className="space-y-2 mb-4">
                  {["Weekly check-ins", "Execution tracking", "Built-in momentum"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground"><span className="text-secondary font-semibold">Outcome:</span> You build real traction.</p>
                </div>
              </div>

              {/* Live Simulations */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Live Simulations</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Practice high-stakes conversations.
                </p>
                <ul className="space-y-2 mb-4">
                  {["Interview rounds", "Executive storytelling", "Stakeholder pushback", "Product judgment drills"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground"><span className="text-secondary font-semibold">Outcome:</span> You don't just prepare — you perform.</p>
                </div>
              </div>

              {/* Pitch Creation & Delivery */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Pitch Creation & Delivery</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Craft your next-level narrative.
                </p>
                <ul className="space-y-2 mb-4">
                  {["Positioning statement", "Leadership story", "Promo + interview pitch"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground"><span className="text-secondary font-semibold">Outcome:</span> You become clear and convincing.</p>
                </div>
              </div>

              {/* Asset Recalibration */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Asset Recalibration</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Upgrade the signals that represent you.
                </p>
                <ul className="space-y-2 mb-4">
                  {["Resume", "LinkedIn", "Story bank", "Structured interview answers"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground"><span className="text-secondary font-semibold">Outcome:</span> Your profile becomes high-signal.</p>
                </div>
              </div>

              {/* Deep-Level Calibration */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-bold">5</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Deep-Level Calibration</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Refine how you think and show up.
                </p>
                <ul className="space-y-2 mb-4">
                  {["Leadership presence", "Communication clarity", "Scope articulation"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground"><span className="text-secondary font-semibold">Outcome:</span> You start operating at the next level.</p>
                </div>
              </div>

              {/* Private Community */}
              <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="text-secondary font-bold">6</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Private Community</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Stay in the right room.
                </p>
                <ul className="space-y-2 mb-4">
                  {["Support", "Frameworks", "Momentum"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                  <p className="text-xs text-foreground"><span className="text-secondary font-semibold">Outcome:</span> You sustain elevation.</p>
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
      <section id="faq" className="section-padding bg-muted/30 scroll-mt-20">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about the Strategic Career Mastery Program.
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

      {/* Testimonials */}
      <TestimonialsMarquee />

      {/* Investment & CTA */}
      <section id="investment" className="section-padding bg-navy scroll-mt-20">
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
            <p className="text-cream/70 mb-8 text-lg leading-relaxed max-w-xl mx-auto">
              One promotion or role upgrade can return 10–50x this investment. This is not a course purchase—it's an investment in your long-term earning power, confidence, and career trajectory.
            </p>
            
            {/* Next Cohort Info */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Next Cohort</p>
              <p className="text-cream text-lg">April 2nd – May 21st, 2026</p>
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
