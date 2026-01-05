import { CheckCircle2 } from "lucide-react";

const offerings = [
  "Clarity on where you stand and where you're going — including your level, positioning, and next career move",
  "A clear, confident professional brand that reflects your impact and leadership potential",
  "Practical tools to influence, inspire, and lead in high-stakes conversations",
  "Accelerated path into higher-visibility, higher-impact roles",
  "A mindset shift from \"performing well\" to operating at the next level",
  "Weekly skill development that strengthens decision-making, judgment, and leadership presence",
  "Personalized coaching that targets your specific gaps — not generic advice",
  "Access to a focused community of ambitious, high-caliber professionals",
  "The confidence to speak, act, and negotiate as a trusted, high-impact leader",
];

const WhatWeDo = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Transformation</p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-3 sm:mb-4">
              Here's What Changes For You
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Clarity. Confidence. Momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {offerings.map((item, index) => (
              <div
                key={index}
                className="flex items-start sm:items-center gap-3 bg-card rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-soft"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5 sm:mt-0" />
                <span className="text-sm sm:text-base text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center px-2">
            <p className="text-base sm:text-lg text-muted-foreground mb-2">
              This isn't theoretical learning.
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold text-foreground">
              This is career acceleration through repetition, practice, and mastery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
