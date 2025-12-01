import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Calendar, Clock, Users } from "lucide-react";

const weeklyTopics = [
  "Communication",
  "Productivity & time mastery",
  "Stakeholder management",
  "Storytelling",
  "Leadership habits",
  "Cross-functional influence",
  "Problem-solving",
  "Decision-making",
  "Presentation skills",
];

const whatsIncluded = [
  "75–90 minute live session each week",
  "20–30 minutes of live Q&A",
  "Worksheets and practical examples",
  "Scripts and frameworks you can use immediately",
  "A new skill focus each week",
  "Continuous career growth momentum",
];

const SkillRiseWeekly = () => {
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
              SkillRise Weekly
            </h1>
            <p className="text-xl md:text-2xl text-cream/80 mb-8 leading-relaxed">
              Weekly live skill-building sessions for product professionals who want to stay 
              relevant and grow continuously.
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

      {/* Program Overview */}
      <section className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
              Program Overview
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              A weekly, live skill-building session for product professionals who want to stay 
              relevant, improve communication, strengthen execution, manage stakeholders, build 
              confidence, and learn a new skill each week.
            </p>

            {/* Quick Stats */}
            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <Clock className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="font-serif text-2xl font-semibold text-foreground mb-1">75-90 min</p>
                <p className="text-muted-foreground text-sm">Session Length</p>
              </div>
              <div className="bg-muted/50 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
                <p className="font-serif text-2xl font-semibold text-foreground mb-1">Weekly</p>
                <p className="text-muted-foreground text-sm">Live Sessions</p>
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

      {/* What You'll Learn */}
      <section className="section-padding bg-muted/50">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-6">
              What You'll Learn Weekly
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Each week covers a different topic to ensure well-rounded growth:
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {weeklyTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-5 shadow-soft flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary font-semibold text-sm">{index + 1}</span>
                  </div>
                  <span className="text-foreground font-medium">{topic}</span>
                </div>
              ))}
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

export default SkillRiseWeekly;
