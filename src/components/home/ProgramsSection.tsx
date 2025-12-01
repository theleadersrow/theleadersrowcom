import ProgramCard from "./ProgramCard";

const ProgramsSection = () => {
  return (
    <section className="section-padding bg-background">
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
            title="Entry to FAANG"
            subtitle="8-Week Accelerator"
            description="A transformational 8-week program to accelerate your career, build your brand, and position yourself as a high-impact product leader."
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
            href="/entry-to-faang"
            ctaText="Learn More"
            featured
          />

          <ProgramCard
            title="Level-Up Weekly"
            subtitle="Ongoing Skill Building"
            description="Weekly 75–90 minute sessions to help you stay relevant, improve communication, strengthen execution, and build confidence."
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
            href="/level-up-weekly"
            ctaText="Learn More"
          />
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
