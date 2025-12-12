import { Lightbulb, Target, TrendingUp, Shield, ArrowDown } from "lucide-react";

const reasons = [
  { icon: Lightbulb, title: "Clarity > Confusion", description: "Proven frameworks replace guesswork." },
  { icon: Target, title: "Practice > Theory", description: "Learn through repetition and live feedback." },
  { icon: TrendingUp, title: "Momentum > Stagnation", description: "Weekly growth → confidence → promotions." },
  { icon: Shield, title: "Confidence > Anxiety", description: "Know what to say and how to lead." },
];

const WhyItWorks = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-navy">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream">
            Why It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="text-center p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-cream/5 border border-cream/10 hover:bg-cream/10 transition-all duration-300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <reason.icon className="w-6 h-6 sm:w-7 sm:h-7 text-secondary" />
              </div>
              <h3 className="font-semibold text-cream mb-1.5 sm:mb-2 text-sm sm:text-base">{reason.title}</h3>
              <p className="text-cream/70 text-xs sm:text-sm leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>

        {/* Transition to Programs */}
        <div className="text-center mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-cream/10">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Ready to Transform?</p>
          <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl text-cream mb-3 sm:mb-4">
            Choose the Path That Fits Your Journey
          </h3>
          <p className="text-cream/70 max-w-2xl mx-auto mb-4 sm:mb-6 text-sm sm:text-base px-2">
            Whether you want intensive career acceleration or steady weekly growth, 
            we have a program designed for where you are and where you want to go.
          </p>
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-secondary mx-auto animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default WhyItWorks;
