import { Lightbulb, Target, TrendingUp, Shield, Users } from "lucide-react";

const reasons = [
  { icon: Lightbulb, title: "Clarity > Confusion", description: "Proven frameworks replace guesswork." },
  { icon: Target, title: "Practice > Theory", description: "Learn through repetition and live feedback." },
  { icon: TrendingUp, title: "Momentum > Stagnation", description: "Weekly growth → confidence → promotions." },
  { icon: Shield, title: "Confidence > Anxiety", description: "Know what to say and how to lead." },
  { icon: Users, title: "Support > Solo", description: "A system, coach, and community behind you." },
];

const WhyItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container-wide mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Why It Works
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-card rounded-xl px-5 py-4 shadow-soft hover:shadow-card transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <reason.icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{reason.title}</h3>
                <p className="text-muted-foreground text-xs">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyItWorks;
