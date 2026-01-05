import { 
  Compass, 
  Award, 
  MessageSquare, 
  Rocket, 
  TrendingUp, 
  Calendar, 
  Target, 
  Users, 
  Shield,
  LucideIcon
} from "lucide-react";

interface Offering {
  icon: LucideIcon;
  text: string;
}

const offerings: Offering[] = [
  { icon: Compass, text: "Clarity on where you stand and where you're going — including your level, positioning, and next career move" },
  { icon: Award, text: "A clear, confident professional brand that reflects your impact and leadership potential" },
  { icon: MessageSquare, text: "Practical tools to influence, inspire, and lead in high-stakes conversations" },
  { icon: Rocket, text: "Accelerated path into higher-visibility, higher-impact roles" },
  { icon: TrendingUp, text: "A mindset shift from \"performing well\" to operating at the next level" },
  { icon: Calendar, text: "Weekly skill development that strengthens decision-making, judgment, and leadership presence" },
  { icon: Target, text: "Personalized coaching that targets your specific gaps — not generic advice" },
  { icon: Users, text: "Access to a focused community of ambitious, high-caliber professionals" },
  { icon: Shield, text: "The confidence to speak, act, and negotiate as a trusted, high-impact leader" },
];

const WhatWeDo = () => {
  return (
    <section className="section-padding bg-muted/50">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Your Transformation</p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-3 sm:mb-4">
              Here's What Changes For You
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Clarity. Confidence. Momentum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
            {offerings.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-card rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-soft"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  </div>
                  <span className="text-sm sm:text-base text-foreground font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center px-2">
            <p className="text-base sm:text-lg text-muted-foreground mb-2">
              This isn't theoretical learning.
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-serif font-semibold text-foreground">
              This is career acceleration through repetition, practice, and mastery.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
