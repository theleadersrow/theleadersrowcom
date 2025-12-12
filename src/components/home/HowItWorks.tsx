import { ClipboardCheck, Target, Rocket, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardCheck,
    title: "Assess",
    subtitle: "Diagnose Your Gap",
    description: "Identify exactly where you are and what's holding you back from leadership roles.",
  },
  {
    number: "02",
    icon: Target,
    title: "Build",
    subtitle: "Craft Your Brand",
    description: "Engineer your personal brand, resume, and LinkedIn to attract senior opportunities.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Practice",
    subtitle: "Master the Skills",
    description: "Sharpen communication, executive presence, and interview skills through live coaching.",
  },
  {
    number: "04",
    icon: Trophy,
    title: "Accelerate",
    subtitle: "Land Your Role",
    description: "Negotiate confidently and step into your next leadership position.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Roadmap</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Four simple steps from where you are now to where you want to be.
          </p>
        </div>

        {/* Visual Roadmap Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal connector line - desktop/tablet */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-secondary/20 via-secondary/40 to-secondary/20 rounded-full" />
          
          {/* Vertical connector line - mobile */}
          <div className="md:hidden absolute left-[26px] sm:left-8 top-20 bottom-20 w-0.5 sm:w-1 bg-gradient-to-b from-secondary/20 via-secondary/40 to-secondary/20 rounded-full" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative flex md:flex-col items-start md:items-center gap-4 sm:gap-6 md:gap-0">
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-lg shadow-secondary/20">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  {/* Step number badge */}
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-background border-2 border-secondary text-[10px] sm:text-xs font-bold text-secondary flex items-center justify-center shadow-sm">
                    {index + 1}
                  </span>
                </div>
                
                {/* Content card */}
                <div className="flex-1 md:mt-6 bg-card rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-soft hover:shadow-elevated transition-all md:hover:-translate-y-1 border border-border/50">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-xs sm:text-sm font-medium text-secondary mb-1.5 sm:mb-2">{step.subtitle}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <p className="text-base sm:text-lg text-foreground font-medium">
            Simple. Structured. Proven to work.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
