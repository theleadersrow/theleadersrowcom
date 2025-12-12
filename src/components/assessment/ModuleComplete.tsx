import { Module } from "@/hooks/useAssessment";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface ModuleCompleteProps {
  module: Module;
  moduleNumber: number;
  totalModules: number;
  quickInsight: string;
  onContinue: () => void;
}

const celebrationMessages = [
  "Excellent work! 🎯",
  "You're on fire! 🔥",
  "Great progress! ⚡",
  "Crushing it! 💪",
  "Outstanding! ✨",
];

export function ModuleComplete({
  module,
  moduleNumber,
  totalModules,
  quickInsight,
  onContinue,
}: ModuleCompleteProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const celebrationMessage = celebrationMessages[moduleNumber % celebrationMessages.length];

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const progressPercent = Math.round((moduleNumber / totalModules) * 100);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-scale-in">
        {/* Celebration animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-fade-in"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-primary/40" />
              </div>
            ))}
          </div>
        )}

        {/* Trophy icon */}
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto border-2 border-primary/30 animate-pulse">
            <Trophy className="w-12 h-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Celebration message */}
        <p className="text-primary font-semibold text-lg mb-2 animate-fade-in">
          {celebrationMessage}
        </p>

        {/* Module complete */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
          Module {moduleNumber} Complete
        </h2>

        <p className="text-muted-foreground mb-6">
          {module.name}
        </p>

        {/* Progress milestone */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick insight preview */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Quick Insight</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {quickInsight}
              </p>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <Button size="lg" onClick={onContinue} className="px-8">
          {moduleNumber < totalModules ? (
            <>
              Continue to Module {moduleNumber + 1}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              See Your Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}