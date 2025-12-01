import { Lightbulb, Target, TrendingUp, Shield, Users } from "lucide-react";

const reasons = [
  {
    icon: Lightbulb,
    title: "Clarity > Confusion",
    description: "We give you simple, proven frameworks that replace guesswork with structure.",
  },
  {
    icon: Target,
    title: "Practice > Theory",
    description: "You learn skills the way professionals master them — with repetition and live feedback.",
  },
  {
    icon: TrendingUp,
    title: "Momentum > Stagnation",
    description: "Weekly growth → confidence → opportunities → promotions.",
  },
  {
    icon: Shield,
    title: "Confidence > Anxiety",
    description: "You'll know exactly what to say, how to say it, and how to lead.",
  },
  {
    icon: Users,
    title: "Support > Going Alone",
    description: "You're not doing this alone anymore. You have a system, a coach, and a community behind you.",
  },
];

const WhyItWorks = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary font-medium mb-3">The Difference</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
            Why It Works
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className={`bg-card rounded-2xl p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 ${
                index === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <reason.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {reason.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyItWorks;
