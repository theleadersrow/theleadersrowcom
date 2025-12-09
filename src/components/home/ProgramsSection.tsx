import ProgramCard from "./ProgramCard";

const ProgramsSection = () => {
  return (
    <section id="programs" className="section-padding bg-background">
      <div className="container-wide mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary font-medium mb-3">Our Programs</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
            Choose Your Path to Leadership
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you're ready for a complete transformation or want to grow 
            consistently week by week, we have a program designed for your journey.
          </p>
        </div>

        {/* Program Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ProgramCard
            title="200K Method"
            subtitle="8-Week Accelerator"
            description="The definitive strategic playbook for experienced Product Managers aiming for high-impact, $200K+ roles. We provide the precise framework to define your next level, engineer an executive-ready personal brand, and negotiate like a CEO."
            features={[
              "The Strategic Benchmark",
              "Narrative Control: Engineering Your PM Brand",
              "High-Value Profile and Network Activation",
              "Interview Mastery: Advanced Framework Toolkit",
              "Product Judgment: High-Stakes Decisions",
              "Executive Presence: Communication for Impact",
              "The Influence Engine: Managing Power Dynamics",
              "Future-Proofing and The Leader's Playbook",
            ]}
            price="$2,000"
            href="/200k-method"
            ctaText="Learn More"
            featured
            badge="High Demand"
          />

          <ProgramCard
            title="Weekly Edge"
            subtitle="Ongoing Skill Building"
            description="Weekly 75–90 minute sessions to stay sharp, grow consistently, and learn new skills every week. Build confidence, storytelling, influence, leadership communication, productivity, and more — with live Q&A."
            features={[
              "Weekly live skill-building sessions",
              "20–30 minutes of live Q&A",
              "Communication & storytelling",
              "Stakeholder management",
              "Leadership & execution skills",
              "Worksheets & practical examples",
              "Continuous career growth",
            ]}
            price="$100"
            priceNote="/month"
            href="/weekly-edge"
            ctaText="Learn More"
          />
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
