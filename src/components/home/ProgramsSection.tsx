import ProgramCard from "./ProgramCard";

const ProgramsSection = () => {
  return (
    <section id="programs" className="section-padding bg-background">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Path to Leadership</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
            The Strategic Career Mastery Program
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed px-2">
            Build the Career System that Takes You to the Next Level.
          </p>
        </div>

        {/* Program Card */}
        <div className="max-w-lg mx-auto">
          <ProgramCard
            title="The Strategic Career Mastery Program"
            subtitle="8-Week Career Operating System"
            description="High-touch coaching with accountability triads, role plays, asset reviews, and a private community. Build the system that takes you to your next level."
            features={[
              "The Strategic Benchmark",
              "Narrative Control",
              "High-Value Profile & Network Activation",
              "Interview Mastery",
              "Product Judgment",
              "Executive Presence",
              "The Influence Engine",
              "Future-Proofing",
            ]}
            price="$2,000"
            href="/200k-method"
            ctaText="Build My Career System"
          />
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;
