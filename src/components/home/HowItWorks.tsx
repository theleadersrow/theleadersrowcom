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
      <div className="container-wide mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-secondary font-medium mb-3">Your Roadmap</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps from where you are now to where you want to be.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-secondary/50 to-secondary/20" />
              )}
              
              <div className="relative bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-elevated transition-shadow">
                {/* Step number */}
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  Step {step.number}
                </span>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="w-8 h-8 text-secondary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm font-medium text-secondary mb-3">{step.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-foreground font-medium">
            Simple. Structured. Proven to work.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
