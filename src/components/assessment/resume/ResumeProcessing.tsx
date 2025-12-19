import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, BarChart3, Sparkles, CheckCircle } from "lucide-react";

interface ResumeProcessingProps {
  onComplete?: () => void;
}

const processingSteps = [
  {
    icon: FileText,
    label: "Extracting structure (roles, dates, scope)…",
    duration: 2000
  },
  {
    icon: Search,
    label: "Checking ATS readability & keyword alignment…",
    duration: 2500
  },
  {
    icon: BarChart3,
    label: "Evaluating seniority signals…",
    duration: 2000
  },
  {
    icon: Sparkles,
    label: "Generating improvement insights…",
    duration: 2500
  }
];

export function ResumeProcessing({ onComplete }: ResumeProcessingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = processingSteps.reduce((acc, s) => acc + s.duration, 0);
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += 100;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Calculate which step we're on
      let stepElapsed = 0;
      for (let i = 0; i < processingSteps.length; i++) {
        stepElapsed += processingSteps[i].duration;
        if (elapsed < stepElapsed) {
          setCurrentStep(i);
          break;
        }
        if (i === processingSteps.length - 1) {
          setCurrentStep(processingSteps.length - 1);
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Analyzing Your Resume
          </h2>
          <p className="text-muted-foreground">
            Step 2 of 4
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 text-left">
          {processingSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div 
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isComplete 
                    ? "bg-green-500/10 text-green-700 dark:text-green-300" 
                    : isCurrent 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <StepIcon className={`w-5 h-5 flex-shrink-0 ${isCurrent ? "animate-pulse" : ""}`} />
                )}
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
