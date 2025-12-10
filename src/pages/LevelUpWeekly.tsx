import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Calendar, Clock, Users, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  "60-minute live weekly session",
  "30-minute live Q&A + coaching",
  "Action-ready worksheets & examples",
  "Proven scripts, templates & frameworks",
  "One high-impact skill focus each week",
  "Career momentum that compounds over time",
  "Meet other ambitious professionals & learn from real experiences",
  "Network with a community that accelerates your growth",
];

const howItWorks = [
  {
    step: "1",
    title: "Join the Community",
    description: "Sign up for your membership and get instant access to our private community of ambitious professionals.",
  },
  {
    step: "2",
    title: "Attend Live Sessions",
    description: "Join us every Wednesday at 7pm CT for a 90-minute live session focused on one high-impact skill.",
  },
  {
    step: "3",
    title: "Apply & Practice",
    description: "Use the worksheets, templates, and frameworks to apply what you learn directly to your work.",
  },
  {
    step: "4",
    title: "Grow Weekly",
    description: "Watch your skills compound over time as you build career assets that make you impossible to overlook.",
  },
];

const faqs = [
  {
    question: "What exactly is Weekly Edge?",
    answer: "Weekly Edge is an ongoing membership program — not a course. Think of it as upskilling yourself on a weekly basis. Each week, you build a new career asset that compounds your growth over time. It's designed for professionals who are committed to continuous improvement and want to sharpen their skills consistently.",
  },
  {
    question: "When are the live sessions?",
    answer: "Live sessions are held every Wednesday from 7:00 PM to 8:30 PM CT. This includes a 60-minute training session followed by 30 minutes of live Q&A and coaching.",
  },
  {
    question: "What if I can't attend a live session?",
    answer: "All sessions are recorded and available to members. You'll have access to the replay, along with all worksheets and materials, so you can catch up at your own pace.",
  },
  {
    question: "How is this different from the 200K Method?",
    answer: "The 200K Method is an intensive 8-week accelerator focused on career repositioning and landing $200K+ roles. Weekly Edge is an ongoing membership for continuous skill building — perfect for professionals who want to grow steadily week over week.",
  },
  {
    question: "What is the cancellation and refund policy?",
    answer: "You can cancel your membership at any time — no questions asked. Once you cancel, your next billing cycle will not be charged, and you'll retain full access until the end of your current billing period. Please note: there are no refunds for any payments already made. This is a membership, not a one-time purchase.",
  },
  {
    question: "Who is Weekly Edge for?",
    answer: "Weekly Edge is designed for ambitious professionals — especially Product Managers, leaders, and high performers — who are committed to continuously sharpening their communication, leadership, and influence skills on a weekly basis.",
  },
  {
    question: "What skills will I learn?",
    answer: "Each week focuses on a different high-leverage skill: communication, stakeholder management, storytelling, decision-making, executive presence, and more. These are career assets that compound over time.",
  },
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
              Grow Every Week. Lead Every Day.
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

      {/* How It Works */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Your journey to continuous growth starts here.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                      <span className="font-serif text-xl font-bold text-secondary">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-secondary/50" />
                    </div>
                  )}
                </div>
              ))}
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
              Career Assets That Compound
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Weekly Edge isn't about learning "topics."
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              It's about building career assets that make you sharper, faster, more confident, and impossible to overlook.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Each week, you add one new high-leverage skill — a capability that compounds your growth and strengthens your leadership identity.
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

      {/* Why Continuous Skill Building */}
      <section className="section-padding bg-navy">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream mb-6">
              Why Continuous Skill Building Is Non-Negotiable
            </h2>
            <p className="text-cream/90 text-lg md:text-xl leading-relaxed mb-6">
              Your career moves at the speed of your skills — not your experience.
            </p>
            <p className="text-cream/80 text-lg leading-relaxed mb-6">
              Today's workplace rewards sharper thinkers, faster decision-makers, clear communicators, and leaders who influence without authority. These aren't "nice-to-haves." They're the currency of modern careers — and they fade if you don't actively strengthen them.
            </p>
            <p className="text-cream/80 text-lg leading-relaxed mb-6">
              If you're not leveling up weekly, you're falling behind weekly.
            </p>
            <p className="text-secondary text-xl font-semibold">
              Weekly Edge keeps you ahead of the curve — not catching up to it.
            </p>
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
                Examples of Skills You'll Master Each Week
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerAssets.map((asset, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-card transition-shadow duration-300"
                >
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

      {/* FAQ Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about Weekly Edge.
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
