import { MessageSquare, Target, Users, TrendingUp, Award, Briefcase, Lightbulb, Eye } from "lucide-react";

const stuckReasons = [
  { icon: MessageSquare, text: "How to communicate clearly" },
  { icon: Target, text: "How to position their value" },
  { icon: Lightbulb, text: "How to build product judgment" },
  { icon: Briefcase, text: "How to interview with structure" },
  { icon: TrendingUp, text: "How to negotiate" },
  { icon: Award, text: "How to build executive presence" },
  { icon: Users, text: "How to think like a leader" },
  { icon: Eye, text: "How to create visibility and opportunities" },
];

const WhyStuck = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              Why Professionals Get Stuck{" "}
              <span className="text-secondary">(And Why It's Not Your Fault)</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Most professionals don't struggle because they lack ability.
            </p>
            <p className="text-lg md:text-xl text-foreground font-medium mt-2">
              They struggle because no one has ever taught them the real career skills that drive growth:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {stuckReasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-muted/50 rounded-xl p-5 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <reason.icon className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-foreground font-medium">{reason.text}</span>
              </div>
            ))}
          </div>

          <div className="text-center bg-navy rounded-2xl p-8 md:p-12">
            <p className="text-xl md:text-2xl text-cream/80 mb-4">
              You're not behind — you're simply missing the tools.
            </p>
            <p className="text-2xl md:text-3xl font-serif font-semibold text-cream">
              We give you those tools.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyStuck;
