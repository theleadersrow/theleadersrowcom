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
            description="8 weeks of deep skill-building and transformation. We rebuild your personal brand, strengthen your communication, sharpen your product thinking, master interviews with you, and help you negotiate your worth."
            features={[
              "Build a strong personal brand",
              "Create an elite resume & LinkedIn",
              "Master product judgment & thinking",
              "Learn all PM interview frameworks",
              "Develop executive presence",
              "Negotiate seniority & compensation",
              "Future-proof your career",
            ]}
            price="$2,000"
            href="/200k-method"
            ctaText="Learn More"
            featured
            badge="Perfect for $200K+ roles"
          />

          <ProgramCard
            title="SkillRise Weekly"
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
            href="/skillrise-weekly"
            ctaText="Learn More"
          />
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
