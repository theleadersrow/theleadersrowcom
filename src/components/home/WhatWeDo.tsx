import { CheckCircle2 } from "lucide-react";

const offerings = [
  "Clarity on your brand identity",
  "Tools to influence, inspire and lead",
  "Acceleration towards high visibility roles",
  "Mindset transformation for long term success",
  "Weekly skill building that elevates your leadership identity",
  "A supportive community of ambitious professionals",
  "Personalized coaching to unlock your next level",
  "A path to become a more confident, respected, high impact leader",
];

const WhatWeDo = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-wide mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-secondary font-medium mb-3">What We Do</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              We help ambitious professionals grow faster
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {offerings.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-card rounded-xl p-5 shadow-soft"
              >
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-2">
              This isn't theoretical learning.
            </p>
            <p className="text-xl md:text-2xl font-serif font-semibold text-foreground">
              This is career acceleration through repetition, practice, and mastery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
