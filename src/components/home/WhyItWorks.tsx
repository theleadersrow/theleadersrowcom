import { Lightbulb, Target, TrendingUp, Shield, ArrowDown } from "lucide-react";

const reasons = [
  { icon: Lightbulb, title: "Clarity > Confusion", description: "Proven frameworks replace guesswork." },
  { icon: Target, title: "Practice > Theory", description: "Learn through repetition and live feedback." },
  { icon: TrendingUp, title: "Momentum > Stagnation", description: "Weekly growth → confidence → promotions." },
  { icon: Shield, title: "Confidence > Anxiety", description: "Know what to say and how to lead." },
];

const WhyItWorks = () => {
  return (
    <section className="py-20 bg-navy">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-cream">
            Why It Works
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-cream/5 border border-cream/10 hover:bg-cream/10 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <reason.icon className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-2">{reason.title}</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>

        {/* Transition to Programs */}
        <div className="text-center mt-16 pt-12 border-t border-cream/10">
          <p className="text-secondary font-medium mb-3">Ready to Transform?</p>
          <h3 className="font-serif text-2xl md:text-3xl text-cream mb-4">
            Choose the Path That Fits Your Journey
          </h3>
          <p className="text-cream/70 max-w-2xl mx-auto mb-6">
            Whether you want intensive career acceleration or steady weekly growth, 
            we have a program designed for where you are and where you want to go.
          </p>
          <ArrowDown className="w-6 h-6 text-secondary mx-auto animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default WhyItWorks;
