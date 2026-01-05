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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    label: "Strong Executors",
    description: "PMs who are strong executors but under-leveled for their actual impact.",
  },
  {
    label: "Title-Stuck Leaders",
    description: "Leaders stuck at the same title despite growing scope and responsibility.",
  },
  {
    label: "Step-Change Seekers",
    description: "Professionals targeting step-change roles, not lateral moves.",
  },
];

const whoIsNotFor = [
  {
    label: "Surface-Level Seekers",
    description: "If you're looking for motivation or surface-level advice, this isn't it.",
  },
  {
    label: "Passive Learners",
    description: "This is an active, hands-on coaching and execution environment.",
  },
];

const programFormat = [
  "8 weeks, live cohort-based",
  "Weekly high-impact coaching sessions",
  "Personalized career strategy & positioning",
  "Interview + leveling preparation",
  "Salary & negotiation strategy",
  "Private, high-caliber community",
];

const faqs = [
  {
    question: "When does the next cohort start?",
    answer: "The next cohort runs from January 22nd to March 12th, 2025. Sessions are held every Thursday from 7:00 PM to 9:00 PM CT.",
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
    answer: "This program is designed for experienced Product Managers (3+ years) who are aiming for GPM, Principal, or Director-level roles. It's ideal for those who feel strategically stuck, undervalued, or need a proven framework for career advancement.",
  },
  {
    question: "What will I achieve by the end of the program?",
    answer: "You'll have a refined personal brand, an optimized resume and LinkedIn profile, mastery of advanced interview frameworks, executive-level communication skills, and a repeatable system for continuous career growth.",
  },
  {
    question: "Is there ongoing support after the 8 weeks?",
    answer: "Yes! You'll have access to our private Slack community where you can continue to connect with your cohort, ask questions, and receive support even after the program ends.",
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
              <span className="bg-secondary/20 px-3 py-1 rounded-full text-sm mr-2">Most Popular Program</span>
              8-Week Cohort-Based
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-4">
              The 200K Method™
            </h1>
            <p className="text-xl md:text-2xl text-secondary font-medium mb-4">
              Career Recalibration for Product Leaders
            </p>
            <p className="text-xl md:text-2xl text-cream font-medium mb-6">
              Stop guessing your value. Start commanding it.
            </p>
            <p className="text-lg text-cream/80 mb-4 leading-relaxed max-w-3xl">
              An intensive 8-week, cohort-based program designed for experienced Product Managers ready to make a calculated leap into high-impact, $200K+ roles (Senior PM, Principal, GPM, Director).
            </p>
            <div className="bg-cream/5 border border-cream/20 rounded-xl p-4 mb-6 max-w-xl">
              <p className="text-cream font-semibold">This is not interview prep.</p>
              <p className="text-secondary font-medium">This is career strategy at the leadership level.</p>
            </div>
            
            {/* Next Cohort Info */}
            <div className="bg-cream/10 backdrop-blur-sm rounded-xl p-4 mb-8 inline-block">
              <p className="text-secondary font-semibold mb-1">Next Cohort</p>
              <p className="text-cream text-lg">Jan 22nd – Mar 12th, 2025</p>
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
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
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

      {/* What You'll Work On */}
      <section className="section-padding bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-4">
              What You'll Work On
            </h2>
            <p className="text-cream/70 text-lg">
              Over 8 weeks, we help you:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto mb-16">
            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Clarity on Levels</h3>
              <p className="text-cream/60 text-sm">Get precise clarity on your current level vs. your next level.</p>
            </div>
            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Executive Brand</h3>
              <p className="text-cream/60 text-sm">Build an executive-ready personal brand that hiring committees trust.</p>
            </div>
            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Product Judgment</h3>
              <p className="text-cream/60 text-sm">Sharpen advanced product judgment and decision-making.</p>
            </div>
            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Interview Performance</h3>
              <p className="text-cream/60 text-sm">Master interview performance at the Senior / Principal / Director bar.</p>
            </div>
            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Negotiation Mastery</h3>
              <p className="text-cream/60 text-sm">Negotiate compensation, scope, and leveling with confidence.</p>
            </div>
          </div>

          {/* Program Structure */}
          <div className="max-w-4xl mx-auto">
            <h3 className="font-serif text-2xl font-semibold text-cream mb-6 text-center">
              Program Structure
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programFormat.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-cream/5 rounded-xl p-4 border border-cream/10">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span className="text-cream">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8 Modules - What You'll Learn */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              The 8 Modules
            </h2>
            <p className="text-muted-foreground text-lg">
              Eight powerful modules designed to transform every aspect of your professional presence.
            </p>
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
                <div className="text-secondary/60 text-sm font-medium mb-2">
                  Module {index + 1}
                </div>
                <h3 className="font-semibold text-foreground leading-snug mb-2">
                  {module.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {module.description}
                </p>
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-12">
            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Absolute Clarity</h3>
              <p className="text-cream/60 text-sm">Absolute clarity on your positioning.</p>
            </div>

            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <Award className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Leadership Narrative</h3>
              <p className="text-cream/60 text-sm">A leadership-caliber narrative.</p>
            </div>

            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Interview Readiness</h3>
              <p className="text-cream/60 text-sm">Strong hire-level interview readiness.</p>
            </div>

            <div className="bg-cream/5 backdrop-blur-sm rounded-2xl p-6 border border-cream/10 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">Negotiation Strategy</h3>
              <p className="text-cream/60 text-sm">A negotiation strategy aligned to your value.</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl md:text-2xl text-cream font-medium mb-2">High-stakes career moves.</p>
            <p className="text-xl md:text-2xl text-secondary font-semibold">Built for maximum ROI.</p>
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
              <p className="text-cream text-lg">Jan 22nd – Mar 12th, 2025</p>
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