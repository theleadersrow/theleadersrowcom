import { Target, TrendingUp, Users, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Remove Every Blocker",
    description: "Identify and eliminate the barriers holding you back from reaching your full potential.",
  },
  {
    icon: TrendingUp,
    title: "Accelerate Your Growth",
    description: "Gain the skills, frameworks, and mindset to advance faster than your peers.",
  },
  {
    icon: Users,
    title: "Build Executive Presence",
    description: "Develop the confidence and communication skills that make leaders stand out.",
  },
  {
    icon: Zap,
    title: "Get Results That Matter",
    description: "Our programs deliver measurable outcomes: better roles, higher pay, stronger impact.",
  },
];

const ValueProp = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-wide mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary font-medium mb-3">Why Choose Us</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
            Your Career Partner for Real Results
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            We don't just teach theory. We provide the practical tools, personalized 
            feedback, and proven strategies to transform your career trajectory.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                <value.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProp;
