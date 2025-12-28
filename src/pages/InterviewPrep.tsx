import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, ArrowRight, CheckCircle, Star, Target, Brain, 
  Building2, MessageSquare, Trophy, Zap, Clock, Users,
  Play, BarChart3, Sparkles, Shield, TrendingUp, Code, Briefcase
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
  { metric: "2.3x", label: "More likely to get offers", sublabel: "PM & SWE candidates" },
  { metric: "85%", label: "Interview confidence boost", sublabel: "after 5 sessions" },
  { metric: "40+", label: "Hours saved", sublabel: "vs. self-study prep" },
];

const testimonials = [
  {
    quote: "Landed Staff PM at Google after 3 weeks of practice. The company-specific questions were spot-on.",
    name: "Sarah K.",
    role: "Staff PM at Google",
    previousRole: "Senior PM at Series B startup",
    type: "pm" as const,
  },
  {
    quote: "The system design practice was exactly like my actual Meta interview. Got L5 SWE offer.",
    name: "James L.",
    role: "Senior SWE at Meta",
    previousRole: "SWE at Mid-size Tech",
    type: "swe" as const,
  },
  {
    quote: "Best mock interview prep I've used. The behavioral coaching helped me articulate my leadership experience.",
    name: "Priya T.",
    role: "PM at Stripe",
    previousRole: "APM at Big Tech",
    type: "pm" as const,
  },
  {
    quote: "Practiced 20+ coding problems with real-time feedback. Amazon L5 offer in hand!",
    name: "David C.",
    role: "SDE II at Amazon",
    previousRole: "SWE at Startup",
    type: "swe" as const,
  },
];

const howItWorks = [
  {
    step: 1,
    icon: Target,
    title: "Choose Your Target",
    description: "Select your target company and role (PM or SWE). We customize everything to match their actual interview format.",
  },
  {
    step: 2,
    icon: Mic,
    title: "Practice Live Interviews",
    description: "Engage in realistic mock interviews. PMs practice product sense & execution. Engineers practice system design & coding.",
  },
  {
    step: 3,
    icon: BarChart3,
    title: "Get Instant Feedback",
    description: "Receive detailed scoring on structure, depth, and communication. See exactly where to improve.",
  },
];

const interviewTypes = [
  { name: "Product Sense", icon: Brain, description: "Design products that solve real problems", forRole: "PM" },
  { name: "Execution", icon: Target, description: "Prioritize, scope, and drive results", forRole: "PM" },
  { name: "System Design", icon: Zap, description: "Architect scalable distributed systems", forRole: "SWE" },
  { name: "Coding", icon: Code, description: "Solve algorithms & data structures", forRole: "SWE" },
  { name: "Behavioral", icon: MessageSquare, description: "Tell your story with impact", forRole: "Both" },
];

const freeFeatures = [
  "3 free mock interview questions",
  "Basic feedback on answers",
  "Company-specific question bank preview",
  "PM & SWE interview formats",
];

const proFeatures = [
  "Unlimited mock interviews",
  "Detailed scoring & feedback per answer",
  "PM: Product Sense, Execution, Strategy",
  "SWE: System Design, Coding, Technical Deep-dives",
  "Company-specific prep for FAANG & top startups",
  "Role-level calibration (IC to Staff+)",
  "Quarterly access (auto-renews)",
];

export default function InterviewPrep() {
  const navigate = useNavigate();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const handleStartFree = () => {
    navigate("/career-coach?tool=interview_prep");
  };

  const filteredTestimonials = roleFilter === "all" 
    ? testimonials 
    : testimonials.filter(t => t.type === roleFilter);

  const getInterviewTypeHighlight = (forRole: string) => {
    if (roleFilter === "all") return false;
    if (forRole === "Both") return true;
    return forRole.toLowerCase() === roleFilter;
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-background to-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Trust Badge */}
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-emerald-500/30 bg-emerald-500/5">
              <Trophy className="w-4 h-4 mr-2 inline text-emerald-600" />
              Trusted by 500+ PMs & Engineers who landed at top tech companies
            </Badge>
            
            {/* Main Headline - Outcome Focused */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Land Your Dream Role at
              <span className="block text-emerald-600 mt-2">Google, Meta, or Any Top Company</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Practice with an AI interviewer trained on real FAANG interview patterns. 
              Whether you're a <strong className="text-foreground">PM</strong> or <strong className="text-foreground">Software Engineer</strong> — get instant feedback that actually helps you improve.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={handleStartFree}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Practice
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleStartFree}
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

      {/* Problem Statement + Role Toggle */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stop Winging Your Tech Interviews
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              You've got the skills. You've done the work. But without realistic practice 
              and expert-level feedback, you're leaving your dream job to chance.
            </p>
            
            {/* Role Toggle */}
            <div className="inline-flex items-center gap-2 p-1.5 bg-muted/50 rounded-xl border border-border">
              <button
                onClick={() => setRoleFilter("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  roleFilter === "all" 
                    ? "bg-emerald-600 text-white shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setRoleFilter("pm")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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

          {/* Interview Types Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {interviewTypes.map((type) => {
              const isHighlighted = getInterviewTypeHighlight(type.forRole);
              const isRelevant = roleFilter === "all" || type.forRole === "Both" || type.forRole.toLowerCase() === roleFilter;
              
              return (
                <Card 
                  key={type.name} 
                  className={`p-5 text-center transition-all ${
                    isHighlighted 
                      ? "border-emerald-500/60 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10 bg-emerald-500/5" 
                      : isRelevant
                        ? "hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5"
                        : "opacity-40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                    isHighlighted ? "bg-emerald-500/20" : "bg-emerald-500/10"
                  }`}>
                    <type.icon className={`w-6 h-6 ${isHighlighted ? "text-emerald-500" : "text-emerald-600"}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  <Badge 
                    variant="outline" 
                    className={`mt-2 text-xs ${
                      type.forRole === "PM" 
                        ? "border-amber-500/30 text-amber-600" 
                        : type.forRole === "SWE"
                          ? "border-blue-500/30 text-blue-600"
                          : "border-emerald-500/30 text-emerald-600"
                    }`}
                  >
                    {type.forRole}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">From zero to interview-ready in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 mb-4 relative">
                  <step.icon className="w-8 h-8 text-emerald-600" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Practice to Offer Letter
            </h2>
            <p className="text-muted-foreground text-lg">
              See what {roleFilter === "pm" ? "Product Managers" : roleFilter === "swe" ? "Engineers" : "PMs & Engineers"} are saying after landing their dream roles
            </p>
          </div>

          <div className={`grid grid-cols-1 gap-6 max-w-6xl mx-auto ${
            filteredTestimonials.length === 2 
              ? "md:grid-cols-2 max-w-4xl" 
              : filteredTestimonials.length >= 4 
                ? "md:grid-cols-2 lg:grid-cols-4" 
                : "md:grid-cols-2 lg:grid-cols-4"
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
                <p className="text-foreground mb-6 leading-relaxed text-sm">
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
        </div>
      </section>

      {/* Free vs Pro Comparison */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you're ready to go all-in</p>
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
                  <p className="text-2xl font-bold text-foreground">$249 <span className="text-sm font-normal text-muted-foreground">/ quarter</span></p>
                  <p className="text-xs text-muted-foreground">Billed every 3 months. Cancel anytime.</p>
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
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center bg-gradient-to-br from-emerald-500/10 to-primary/5 border-emerald-500/30">
            <Sparkles className="w-10 h-10 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Next Interview Could Be Your Last
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Stop practicing alone. Start practicing with AI that knows exactly 
              what Google, Meta, and Amazon are looking for — whether you're a PM or Engineer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleStartFree}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Practice Now
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              No credit card required • 3 free questions • $249/quarter if you upgrade
            </p>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
