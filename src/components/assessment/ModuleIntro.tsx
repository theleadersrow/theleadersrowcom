import { Module } from "@/hooks/useAssessment";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, Briefcase, Brain, Compass, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleIntroProps {
  module: Module;
  moduleNumber: number;
  totalModules: number;
  questionCount: number;
  onStart: () => void;
  onBack?: () => void;
}

const moduleIcons: Record<number, React.ReactNode> = {
  1: <Target className="w-8 h-8" />,
  2: <BarChart3 className="w-8 h-8" />,
  3: <Briefcase className="w-8 h-8" />,
  4: <Brain className="w-8 h-8" />,
  5: <Compass className="w-8 h-8" />,
};

const moduleColors = [
  "from-primary to-primary/70 border-primary/30",
  "from-blue-500 to-blue-400 border-blue-400/30",
  "from-emerald-500 to-emerald-400 border-emerald-400/30", 
  "from-amber-500 to-amber-400 border-amber-400/30",
  "from-purple-500 to-purple-400 border-purple-400/30",
];

const moduleInsights = [
  "Discover your current strategic level and where you stand among peers.",
  "Uncover your unique skill profile and competitive advantages.",
  "Identify experience gaps that may be holding you back.",
  "Reveal mindset patterns that shape your career trajectory.",
  "See how you match with different roles and opportunities.",
];

export function ModuleIntro({ module, moduleNumber, totalModules, questionCount, onStart, onBack }: ModuleIntroProps) {
  const colorClass = moduleColors[(moduleNumber - 1) % moduleColors.length];
  const insight = moduleInsights[(moduleNumber - 1) % moduleInsights.length];
  const estimatedMinutes = Math.ceil(questionCount * 0.5);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-fade-up">
        {/* Module indicator with color */}
        <div className={cn(
          "inline-flex items-center gap-2 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 bg-gradient-to-r",
          colorClass.split(' ')[0], colorClass.split(' ')[1]
        )}>
          <Sparkles className="w-3.5 h-3.5" />
          Module {moduleNumber} of {totalModules}
        </div>

        {/* Icon with module-specific styling */}
        <div className={cn(
          "w-20 h-20 bg-card rounded-2xl shadow-card flex items-center justify-center mx-auto mb-6 border-2",
          colorClass.split(' ')[2]
        )}>
          <div className={cn("bg-gradient-to-br bg-clip-text text-transparent", colorClass.split(' ')[0], colorClass.split(' ')[1])}>
            {moduleIcons[moduleNumber] || <Target className="w-8 h-8" />}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          {module.name}
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
          {module.description}
        </p>

        {/* What you'll discover */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">What you'll discover:</span>{" "}
            {insight}
          </p>
        </div>

        {/* Time estimate with icon */}
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>~{estimatedMinutes} minutes</span>
          </div>
          <span className="text-muted-foreground/50">•</span>
          <span>{questionCount} questions</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onBack && (
            <Button size="lg" variant="outline" onClick={onBack}>
              Back to Rimo
            </Button>
          )}
          <Button size="lg" onClick={onStart} className="px-8">
            Begin Module
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Coaching tip */}
        <p className="text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
          💡 Answer like you're in the room with a hiring committee. Choose what you'd actually do, not what sounds good.
        </p>
      </div>
    </div>
  );
}
