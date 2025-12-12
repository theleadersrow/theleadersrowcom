import { Module } from "@/hooks/useAssessment";
import { Check } from "lucide-react";

interface AssessmentProgressProps {
  modules: Module[];
  currentModuleIndex: number;
  progress: number;
}

export function AssessmentProgress({ modules, currentModuleIndex, progress }: AssessmentProgressProps) {
  return (
    <div className="bg-card border-b border-border sticky top-20 z-10">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Module steps */}
        <div className="flex gap-2">
          {modules.map((module, index) => {
            const isComplete = index < currentModuleIndex;
            const isCurrent = index === currentModuleIndex;
            
            return (
              <div key={module.id} className="flex-1">
                <div 
                  className={`h-1.5 rounded-full transition-colors ${
                    isComplete ? "bg-primary" : isCurrent ? "bg-primary/60" : "bg-muted"
                  }`}
                />
                <div className="flex items-center gap-1 mt-2">
                  {isComplete && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                  <span className={`text-xs truncate ${
                    isCurrent ? "text-primary font-medium" : 
                    isComplete ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {module.name.split(" ").slice(0, 2).join(" ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
