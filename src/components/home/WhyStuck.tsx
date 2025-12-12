import { Target, Users, TrendingUp, Award, Briefcase, Lightbulb, Eye, MessageSquare } from "lucide-react";
import journeyBefore from "@/assets/journey-before.jpg";

const stuckReasons = [
  { icon: Award, text: "No one teaches you how to build a personal brand" },
  { icon: Target, text: "You were never shown how to position yourself as a leader" },
  { icon: Users, text: "You don't learn how to communicate or build connections strategically" },
  { icon: MessageSquare, text: "You've never built your relational brand" },
  { icon: Eye, text: "Executive presence is expected, but never taught" },
  { icon: Lightbulb, text: "Perception becomes more important than performance" },
  { icon: TrendingUp, text: "Opportunities don't flow your way" },
  { icon: Briefcase, text: "Interviewing and delivering outcomes require frameworks" },
];

const WhyStuck = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Before State Image */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-8 sm:mb-12 max-w-3xl mx-auto shadow-elevated">
            <img 
              src={journeyBefore} 
              alt="Professional feeling overlooked and stuck in their career" 
              className="w-full h-48 sm:h-64 lg:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <p className="text-xs sm:text-sm font-medium text-secondary mb-1 sm:mb-2">Sound familiar?</p>
              <p className="text-base sm:text-lg lg:text-xl font-serif text-foreground">
                Talented. Hardworking. Yet somehow... overlooked.
              </p>
            </div>
          </div>

          <div className="text-center mb-8 sm:mb-12 px-2">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
              Why Professionals Get Stuck{" "}
              <span className="text-secondary block sm:inline">(And Why It's Not Your Fault)</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed mb-2">
              Most professionals don't struggle because they lack ability.
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-foreground font-medium mb-3 sm:mb-4">
              They struggle because the game was never explained:
            </p>
            <p className="text-sm sm:text-base text-muted-foreground italic">
              It's not fair that hard work isn't enough — and no one shows you how to play the leadership game.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {stuckReasons.map((reason, index) => (
              <div
                key={index}
                className="flex items-start sm:items-center gap-3 sm:gap-4 bg-muted/50 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <reason.icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                </div>
                <span className="text-sm sm:text-base text-foreground font-medium">{reason.text}</span>
              </div>
            ))}
          </div>

          {/* Stakes / Consequences */}
          <div className="text-center mb-8 sm:mb-12 p-4 sm:p-6 border border-destructive/20 rounded-lg sm:rounded-xl bg-destructive/5">
            <p className="text-sm sm:text-base lg:text-lg text-foreground font-medium">
              Without these skills, you stay stuck — watching peers get promoted, earning less than you deserve, and wondering why opportunities keep passing you by.
            </p>
          </div>

          <div className="text-center bg-navy rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12">
            <p className="text-lg sm:text-xl lg:text-2xl text-cream/80 mb-3 sm:mb-4">
              You're not behind — you're simply missing the tools.
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-cream">
              Now you can get them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyStuck;
