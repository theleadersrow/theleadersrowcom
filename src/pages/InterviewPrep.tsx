import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, ArrowRight, CheckCircle, Star, Target, Brain, 
  Building2, MessageSquare, Trophy, Zap, Clock, Users,
  Play, BarChart3, Sparkles, Shield, TrendingUp, Code, Briefcase,
  XCircle, AlertTriangle, Award, Layers, Search, Eye,
  UserCheck, FileCheck, BookOpen, Rocket, ThumbsUp, ThumbsDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type RoleFilter = "all" | "pm" | "swe";

const companies = [
  { name: "Google", logo: "G" },
  { name: "Meta", logo: "M" },
  { name: "Amazon", logo: "A" },
  { name: "Apple", logo: "" },
  { name: "Microsoft", logo: "MS" },
  { name: "Netflix", logo: "N" },
  { name: "Stripe", logo: "S" },
  { name: "Airbnb", logo: "A" },
];

const outcomes = [
  { metric: "2.3x", label: "More likely to get Strong Hire", sublabel: "with committee-level prep" },
  { metric: "85%", label: "Interview confidence boost", sublabel: "after using our scoring" },
  { metric: "40+", label: "Hours of prep time saved", sublabel: "vs. traditional mock interviews" },
];

const testimonials = [
  {
    quote: "The hiring committee simulation showed me exactly why I was getting 'soft passes' — my ownership signals were too weak. Fixed it in 3 weeks, landed Staff PM at Google.",
    name: "Sarah K.",
    role: "Staff PM at Google",
    previousRole: "Senior PM at Series B startup",
    type: "pm" as const,
  },
  {
    quote: "The system design scoring broke down exactly where my architecture decisions weren't at Staff level. The company-specific feedback for Meta was spot-on. Got L6.",
    name: "James L.",
    role: "Staff Engineer at Meta",
    previousRole: "Senior SWE at Mid-size Tech",
    type: "swe" as const,
  },
  {
    quote: "I thought I was ready. The tool showed me I was signaling Senior when I needed Principal-level answers. Changed my entire narrative approach.",
    name: "Priya T.",
    role: "Principal PM at Stripe",
    previousRole: "Senior PM at Big Tech",
    type: "pm" as const,
  },
  {
    quote: "The bar-raiser simulation caught concerns I never saw coming. Practiced handling objections. Amazon L6 offer with signing bonus.",
    name: "David C.",
    role: "Senior SDE at Amazon",
    previousRole: "SWE at Startup",
    type: "swe" as const,
  },
];

const pmCategories = [
  { name: "Product Sense", icon: Brain, description: "Design products that solve real problems with strategic depth" },
  { name: "Execution", icon: Target, description: "Prioritization, trade-offs, and shipping under constraints" },
  { name: "Strategy & Vision", icon: TrendingUp, description: "Long-term roadmaps, market analysis, competitive positioning" },
  { name: "Leadership & Influence", icon: Users, description: "Cross-functional impact, stakeholder management, conflict" },
  { name: "Technical Depth", icon: Layers, description: "Systems thinking, architecture decisions, technical trade-offs" },
  { name: "Data & Metrics", icon: BarChart3, description: "Success measurement, A/B testing, metric frameworks" },
];

const sweCategories = [
  { name: "System Design", icon: Layers, description: "Architect scalable, reliable distributed systems" },
  { name: "Coding & Algorithms", icon: Code, description: "Data structures, complexity analysis, optimal solutions" },
  { name: "Technical Leadership", icon: Users, description: "Tech debt, architecture decisions, mentoring" },
  { name: "Execution & Delivery", icon: Target, description: "Project planning, debugging, production incidents" },
  { name: "Behavioral", icon: MessageSquare, description: "Ownership, collaboration, handling ambiguity" },
  { name: "Domain Expertise", icon: Brain, description: "Deep technical knowledge in your area of focus" },
];

const howItWorks = [
  {
    step: 1,
    icon: Mic,
    title: "Simulated Hiring Interviews",
    description: "Run AI-led mock interviews for PMs and Engineers across real interview categories. The AI adapts, interrupts, probes, and challenges — like a real interviewer.",
  },
  {
    step: 2,
    icon: BarChart3,
    title: "Hiring-Grade Scoring",
    description: "Every answer scored across problem framing, strategy/technical depth, execution rigor, decision quality, communication, and ownership. Get level calibration: Below • At • Above level.",
  },
  {
    step: 3,
    icon: Users,
    title: "Hiring Committee Simulation",
    description: "See feedback from Product/Technical interviewer, Execution interviewer, Bar-raiser, and Hiring manager perspectives. Know exactly who would hesitate — and why.",
  },
  {
    step: 4,
    icon: BookOpen,
    title: "Narrative & STAR Intelligence",
    description: "Your stories analyzed to detect repetition, missing leadership signals, weak metrics, and gaps that cause silent rejections. Build a strategic signal portfolio.",
  },
  {
    step: 5,
    icon: Award,
    title: "Clear Readiness Verdict",
    description: "Overall readiness score, Strong Hire signals, red flags, level readiness verdict, and targeted coaching plan. No guessing. No false confidence.",
  },
];

const failureReasons = [
  { reason: "Their answers don't signal the right level", icon: TrendingUp },
  { reason: "Their stories don't prove ownership or impact", icon: UserCheck },
  { reason: "One interviewer flags a concern they never see coming", icon: AlertTriangle },
  { reason: "They sound capable — but not confidently hireable", icon: Eye },
];

const differentiators = [
  { label: "Category-by-category", description: "Deep scoring across all interview dimensions" },
  { label: "Signal-by-signal", description: "Track every hire/no-hire indicator" },
  { label: "Level-by-level", description: "Know if you're interviewing at your target level" },
  { label: "Real hiring tradeoffs", description: "Understand what tips the decision" },
];

const whoItsFor = [
  "Preparing for PM, Senior PM, Principal, Staff, or Engineering leadership roles",
  "Interviewing at FAANG, fintech, AI, infra, or high-growth startups",
  "Tired of generic mock interviews and surface-level feedback",
  "Serious about leveling, compensation, and career leverage",
];

const whoItsNotFor = [
  "Anyone who wants shortcuts or memorized answers",
  "People who don't want honest feedback",
];

const outcomesAfter = [
  { text: "What level you're actually interviewing at", icon: TrendingUp },
  { text: "What signals you're under-communicating", icon: Eye },
  { text: "Which stories help — and which hurt", icon: FileCheck },
  { text: "Where you'd lose a hiring committee", icon: Users },
  { text: "How to fix it before the real interview", icon: Rocket },
];

const freeFeatures = [
  "3 free interview questions",
  "Basic answer feedback",
  "Level calibration preview",
  "PM & SWE interview formats",
];

const proFeatures = [
  "Unlimited mock interviews",
  "Full hiring committee simulation",
  "Company-specific scoring (Google, Amazon, Meta, etc.)",
  "Confidence calibration analysis",
  "STAR bank & narrative intelligence",
  "Career leverage index",
  "Offer readiness & leveling prediction",
  "Signal coverage guarantee",
  "Objection handling mode",
];

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const handleStartFree = () => {
    navigate("/interview-tool");
  };

  const filteredTestimonials = roleFilter === "all" 
    ? testimonials 
    : testimonials.filter(t => t.type === roleFilter);

  const currentCategories = roleFilter === "swe" ? sweCategories : roleFilter === "pm" ? pmCategories : [...pmCategories.slice(0, 3), ...sweCategories.slice(0, 3)];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <Badge variant="outline" className="mb-4 px-4 py-2 text-sm font-medium border-emerald-500/30 bg-emerald-500/5">
              <Trophy className="w-4 h-4 mr-2 inline text-emerald-600" />
              AI-Powered Interview Intelligence Platform
            </Badge>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Simulates Real Hiring Loops.
              <span className="block text-emerald-600 mt-2">Scores You Like a Committee.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              The AI interview intelligence platform that tells you exactly what's holding you back 
              from a <strong className="text-emerald-600">Strong Hire</strong> decision.
            </p>
            
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              For <strong className="text-foreground">Product Managers</strong> and <strong className="text-foreground">Software Engineers</strong> targeting 
              FAANG, fintech, AI companies, and high-growth startups.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                onClick={handleStartFree}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Interview Intelligence Session
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-emerald-500/30 hover:bg-emerald-500/5 px-8 py-6 text-lg"
              >
                See How It Works
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Company Logos */}
            <div className="flex flex-wrap justify-center gap-4 items-center opacity-60">
              <span className="text-sm text-muted-foreground mr-2">Prep for:</span>
              {companies.map((company) => (
                <div 
                  key={company.name}
                  className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-sm font-semibold text-muted-foreground"
                  title={company.name}
                >
                  {company.logo || company.name[0]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outcome Metrics */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {outcomes.map((outcome, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">
                  {outcome.metric}
                </div>
                <div className="text-foreground font-medium mb-1">{outcome.label}</div>
                <div className="text-sm text-muted-foreground">{outcome.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For - Qualification Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Who This Is For</h2>
              <p className="text-lg text-muted-foreground">Built for professionals who are serious about landing at the next level</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* This is for you */}
              <Card className="p-6 md:p-8 border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <ThumbsUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Perfect For You If...</h3>
                </div>
                <ul className="space-y-4">
                  {whoItsFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* This is NOT for you */}
              <Card className="p-6 md:p-8 border-destructive/30 bg-destructive/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <ThumbsDown className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Not For You If...</h3>
                </div>
                <ul className="space-y-4">
                  {whoItsNotFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-muted-foreground border-t border-border pt-4">
                  If you just want practice questions, this isn't for you.<br />
                  If you want <strong className="text-foreground">clarity, confidence, and hiring-level feedback</strong>, you're in the right place.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-xs border-amber-500/30 text-amber-600">
              <AlertTriangle className="w-3 h-3 mr-1 inline" />
              The Hidden Problem
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Most Talented Candidates Still Fail Interviews
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most professionals don't fail because they lack skill. They fail because:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
            {failureReasons.map((item, i) => (
              <Card key={i} className="p-5 flex items-start gap-4 border-amber-500/20 bg-amber-500/5">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-foreground font-medium">{item.reason}</p>
              </Card>
            ))}
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-2">
              And most interview prep tools?
            </p>
            <p className="text-lg text-foreground font-medium">
              They help you <em>answer questions</em>, not <strong>clear the hiring bar</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* The Differentiator */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What Makes TheLeadersRow Different
              </h2>
              <div className="max-w-xl mx-auto">
                <p className="text-muted-foreground mb-4">We don't ask:</p>
                <p className="text-lg text-foreground/60 line-through mb-4">"Was that a good answer?"</p>
                <p className="text-muted-foreground mb-4">We ask:</p>
                <p className="text-2xl font-bold text-emerald-600">"Would this get a Strong Hire vote?"</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {differentiators.map((item, i) => (
                <Card key={i} className="p-5 text-center border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
                  <h4 className="font-semibold text-foreground mb-2">{item.label}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-8 max-w-xl mx-auto">
              TheLeadersRow evaluates you the same way top companies do — with real hiring tradeoffs and committee-level feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Interview Categories + Role Toggle */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Interview Categories We Cover
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Real interview dimensions scored at hiring-committee level
              </p>
              
              {/* Role Toggle */}
              <div className="inline-flex items-center gap-2 p-1.5 bg-background rounded-xl border border-border shadow-sm">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    roleFilter === "all" 
                      ? "bg-emerald-600 text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  All Roles
                </button>
                <button
                  onClick={() => setRoleFilter("pm")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    roleFilter === "pm" 
                      ? "bg-amber-600 text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Product Manager
                </button>
                <button
                  onClick={() => setRoleFilter("swe")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    roleFilter === "swe" 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Code className="w-4 h-4" />
                  Software Engineer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentCategories.map((category, i) => (
                <Card key={i} className="p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <category.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </Card>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              The AI adapts, interrupts, probes, and challenges — like a real interviewer.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple process. Sophisticated intelligence.</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {howItWorks.map((step) => (
              <Card key={step.step} className="p-6 flex items-start gap-6 hover:border-emerald-500/30 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center relative">
                    <step.icon className="w-7 h-7 text-emerald-600" />
                    <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Walk Away With */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You'll Walk Away With
            </h2>
            <p className="text-lg text-muted-foreground">
              After using TheLeadersRow, you'll know:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {outcomesAfter.map((item, i) => (
              <Card key={i} className="p-5 text-center border-emerald-500/20 bg-emerald-500/5">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-muted-foreground">
              This is what real interviewers see.<br />
              <strong className="text-foreground">Now you do too.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Practice to Strong Hire
            </h2>
            <p className="text-muted-foreground text-lg">
              See what {roleFilter === "pm" ? "Product Managers" : roleFilter === "swe" ? "Engineers" : "PMs & Engineers"} are saying after landing their dream roles
            </p>
          </div>

          <div className={`grid grid-cols-1 gap-6 max-w-6xl mx-auto ${
            filteredTestimonials.length === 2 
              ? "md:grid-cols-2 max-w-4xl" 
              : filteredTestimonials.length >= 4 
                ? "md:grid-cols-2" 
                : "md:grid-cols-2"
          }`}>
            {filteredTestimonials.map((testimonial, i) => (
              <Card key={i} className="p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${testimonial.type === 'pm' ? 'border-amber-500/30 text-amber-600' : 'border-blue-500/30 text-blue-600'}`}>
                    {testimonial.type === 'pm' ? 'PM' : 'SWE'}
                  </Badge>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-border pt-4">
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-emerald-600 font-medium">{testimonial.role}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Previously: {testimonial.previousRole}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Authority Statement */}
          <Card className="max-w-3xl mx-auto mt-12 p-6 text-center bg-muted/50">
            <p className="text-muted-foreground">
              Built by product and engineering leaders who've <strong className="text-foreground">interviewed hundreds of candidates</strong>, 
              sat on real hiring committees, led teams at top-tier tech companies, 
              and coached senior professionals into high-impact roles.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              This platform reflects how hiring actually works — not how prep tools pretend it does.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing / Value Proposition */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you're ready to compete at the next level</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="p-6 md:p-8 border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <Zap className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Free Trial</h3>
                  <p className="text-2xl font-bold text-foreground">$0</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleStartFree}
              >
                Start Free
              </Button>
            </Card>

            {/* Pro Tier */}
            <Card className="p-6 md:p-8 border-emerald-500/50 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-emerald-600 text-white">Most Popular</Badge>
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Pro Access</h3>
                  <p className="text-sm text-muted-foreground">Like a coach training you to craft the right answers</p>
                  <p className="text-2xl font-bold text-foreground mt-1">$249 <span className="text-sm font-normal text-muted-foreground">/ quarter</span></p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {proFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleStartFree}
              >
                Get Pro Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>

          {/* Value Framing */}
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <p className="text-muted-foreground mb-4">Think of this as:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="outline" className="px-4 py-2 border-emerald-500/30">
                <Users className="w-4 h-4 mr-2 inline" />
                A hiring committee in your corner
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-emerald-500/30">
                <Shield className="w-4 h-4 mr-2 inline" />
                A career risk reducer
              </Badge>
              <Badge variant="outline" className="px-4 py-2 border-emerald-500/30">
                <TrendingUp className="w-4 h-4 mr-2 inline" />
                A leveling & confidence accelerator
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              One strong interview outcome can change your career trajectory.<br />
              This tool exists to make that outcome repeatable.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-emerald-500/10 to-primary/5 border-emerald-500/30">
            <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to See How You're Really Being Evaluated?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Most candidates don't need more prep.<br />
              They need <strong className="text-foreground">better signals</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartFree}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Interview Intelligence Session
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleStartFree}
                className="border-emerald-500/30 hover:bg-emerald-500/5 px-8"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Build Your Story Portfolio
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              No credit card required • 3 free questions • Pro access when you're ready
            </p>
          </Card>

          {/* Tagline */}
          <p className="text-center text-muted-foreground mt-10 italic">
            "Interview like a leader. Get hired like one."
          </p>
        </div>
      </section>
    </Layout>
  );
}
