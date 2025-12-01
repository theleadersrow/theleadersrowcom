import { ArrowRight } from "lucide-react";

const beforeItems = [
  "Uncertainty",
  "Self-doubt",
  "Plateauing growth",
  "Low visibility",
  "Low interview traction",
  "No frameworks",
  "No clear plan",
];

const afterItems = [
  "Clarity",
  "Confidence",
  "Leadership identity",
  "Strong communication",
  "High product judgment",
  "An elite resume & LinkedIn",
  "Interview mastery",
  "A negotiation strategy",
  "A career system that compounds",
];

const Transformation = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-wide mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary font-medium mb-3">The Journey</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground">
            The Transformation
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* Before */}
            <div className="bg-card rounded-2xl p-8 shadow-soft border-l-4 border-muted-foreground/30">
              <h3 className="font-serif text-2xl font-semibold text-muted-foreground mb-6">
                You enter with:
              </h3>
              <ul className="space-y-3">
                {beforeItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Arrow for desktop */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-elevated">
                <ArrowRight className="w-6 h-6 text-secondary-foreground" />
              </div>
            </div>

            {/* Arrow for mobile */}
            <div className="flex md:hidden justify-center -my-4">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-elevated rotate-90">
                <ArrowRight className="w-5 h-5 text-secondary-foreground" />
              </div>
            </div>

            {/* After */}
            <div className="bg-navy rounded-2xl p-8 shadow-elevated border-l-4 border-secondary">
              <h3 className="font-serif text-2xl font-semibold text-cream mb-6">
                You leave with:
              </h3>
              <ul className="space-y-3">
                {afterItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-cream/90">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Transformation;
