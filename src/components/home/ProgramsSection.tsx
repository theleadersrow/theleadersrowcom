import ProgramCard from "./ProgramCard";

const ProgramsSection = () => {
  return (
    <section id="programs" className="section-padding bg-background">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Two Paths. One Destination.</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
            Choose Your Path to Leadership
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-3 sm:mb-4 px-2">
            Both programs get you to the same place: confident, visible, and leading at the top.
          </p>
          <p className="text-foreground font-medium text-sm sm:text-base">
            Intensive transformation or steady weekly growth — pick the pace that fits your life.
          </p>
        </div>

        {/* Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
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
            price="$2,000"
            href="/200k-method"
            ctaText="Join The 200K Method"
            featured
            badge="High Demand"
          />

          <ProgramCard
            title="Weekly Edge"
            subtitle="Ongoing Skill Building"
            description="Weekly Edge is your weekly upgrade engine — sharpening how you speak, lead, influence, and show up at work, supported by a community that pushes you to rise."
            features={[
              "60-minute live weekly session",
              "30-minute live Q&A + coaching",
              "Action-ready worksheets & examples",
              "Proven scripts, templates & frameworks",
              "One high-impact skill focus each week",
              "Career momentum that compounds over time",
              "Network with ambitious professionals",
            ]}
            price="$100"
            priceNote="/month"
            href="/weekly-edge"
            ctaText="Join Weekly Edge"
          />
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
