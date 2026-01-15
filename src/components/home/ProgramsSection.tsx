import ProgramCard from "./ProgramCard";

const ProgramsSection = () => {
  return (
    <section id="programs" className="section-padding bg-background">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Path to Leadership</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
            The 200K Method
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-2">
            An intensive transformation program for senior product leaders ready to make a step-change leap.
          </p>
        </div>

        {/* Program Card */}
        <div className="max-w-lg mx-auto">
          <ProgramCard
            title="The 200K Method"
            subtitle="Career Recalibration for Senior Product Leaders"
            description="An intensive 8-week, cohort-based coaching program for experienced Product Leaders ready to make a step-change leap into Senior PM, Principal, GPM, or Director roles. Stop guessing your value — start operating at the level you're already capable of."
            features={[
              "Decision & Identity Calibration",
              "Narrative Control: Engineering Your PM Brand",
              "High-Value Profile & Network Activation",
              "Interview Mastery: Executive-Level Performance",
              "Product Judgment: High-Stakes Decision Making",
              "Executive Presence & Influence",
              "Value Capture & Negotiation Strategy",
              "Future-Proofing: The Leader's Playbook",
            ]}
            price="$1,800"
            originalPrice="$2,000"
            href="/200k-method"
            ctaText="Join The 200K Method"
            featured
            badge="10% Off"
          />
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
