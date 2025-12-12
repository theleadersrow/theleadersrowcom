import { useEffect, useState } from "react";
import { Loader2, Brain, BarChart3, FileText, Sparkles } from "lucide-react";

interface GeneratingReportProps {
  onComplete: () => void;
}

const stages = [
  { icon: Brain, label: "Analyzing your responses..." },
  { icon: BarChart3, label: "Calculating skill dimensions..." },
  { icon: FileText, label: "Generating insights..." },
  { icon: Sparkles, label: "Building your 90-day plan..." },
];

export function GeneratingReport({ onComplete }: GeneratingReportProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= stages.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 1500);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const CurrentIcon = stages[currentStage].icon;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-card border border-border rounded-full flex items-center justify-center shadow-card">
            <CurrentIcon className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
          Creating Your Career Intelligence Report
        </h2>

        {/* Current stage */}
        <p className="text-lg text-muted-foreground mb-8">
          {stages[currentStage].label}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {stages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStage ? "bg-primary w-6" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Please wait, this may take a moment...</span>
        </div>
      </div>
    </div>
  );
}
