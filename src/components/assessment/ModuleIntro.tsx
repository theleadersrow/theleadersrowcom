import { Module } from "@/hooks/useAssessment";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, BarChart3, Briefcase, Brain, Compass } from "lucide-react";

interface ModuleIntroProps {
  module: Module;
  moduleNumber: number;
  totalModules: number;
  questionCount: number;
  onStart: () => void;
}

const moduleIcons: Record<number, React.ReactNode> = {
  1: <Target className="w-8 h-8" />,
  2: <BarChart3 className="w-8 h-8" />,
  3: <Briefcase className="w-8 h-8" />,
  4: <Brain className="w-8 h-8" />,
  5: <Compass className="w-8 h-8" />,
};

export function ModuleIntro({ module, moduleNumber, totalModules, questionCount, onStart }: ModuleIntroProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-fade-up">
        {/* Module indicator */}
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Module {moduleNumber} of {totalModules}
        </div>

        {/* Icon */}
        <div className="w-20 h-20 bg-card border border-border rounded-2xl shadow-card flex items-center justify-center mx-auto mb-6 text-primary">
          {moduleIcons[moduleNumber] || <Target className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          {module.name}
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {module.description}
        </p>

        {/* Question count */}
        <p className="text-sm text-muted-foreground mb-8">
          {questionCount} questions • Approximately {Math.ceil(questionCount * 0.5)} minutes
        </p>

        {/* Start button */}
        <Button size="lg" onClick={onStart} className="px-8">
          Begin Module
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Coaching tip */}
        <p className="text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
          💡 Answer like you're in the room with a hiring committee. Choose what you'd actually do, not what sounds good.
        </p>
      </div>
    </div>
  );
}
