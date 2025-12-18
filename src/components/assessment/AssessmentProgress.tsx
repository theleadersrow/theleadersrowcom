import { Module } from "@/hooks/useAssessment";
import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";

interface AssessmentProgressProps {
  modules: Module[];
  currentModuleIndex: number;
  progress: number;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

export function AssessmentProgress({ 
  modules, 
  currentModuleIndex, 
  progress, 
  isSaving = false,
  lastSaved 
}: AssessmentProgressProps) {
  return (
    <div className="bg-card border-b border-border sticky top-20 z-10">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <div className="flex items-center gap-3">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                {isSaving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
                  </>
                ) : null}
              </div>
              <span className="font-medium text-foreground">{progress}% Complete</span>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Module steps */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
          {modules.map((module, index) => {
            const isComplete = index < currentModuleIndex;
            const isCurrent = index === currentModuleIndex;
            
            // Get short name for mobile and fuller name for desktop
            const shortName = module.name.split(" ")[0].slice(0, 8);
            // Use first 3 words to avoid cutting off "&" words like "Experience & Exposure"
            const words = module.name.split(" ");
            const mediumName = words.length <= 3 ? module.name : words.slice(0, 3).join(" ");
            
            return (
              <div key={module.id} className="flex-1 min-w-[60px] sm:min-w-[80px]">
                <div 
                  className={`h-1.5 rounded-full transition-colors ${
                    isComplete ? "bg-primary" : isCurrent ? "bg-primary/60" : "bg-muted"
                  }`}
                />
                <div className="flex items-center gap-0.5 sm:gap-1 mt-2">
                  {isComplete && (
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                  )}
                  <span className={`text-[10px] sm:text-xs whitespace-nowrap ${
                    isCurrent ? "text-primary font-medium" : 
                    isComplete ? "text-primary" : "text-muted-foreground"
                  }`}>
                    <span className="sm:hidden">{index + 1}. {shortName}</span>
                    <span className="hidden sm:inline">{mediumName}</span>
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
