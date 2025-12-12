import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

interface AssessmentCompleteProps {
  onViewReport: () => void;
}

export function AssessmentComplete({ onViewReport }: AssessmentCompleteProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-scale-in">
        {/* Success icon */}
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Assessment Complete!
        </h2>

        {/* Description */}
        <p className="text-lg text-muted-foreground mb-8">
          Your Career Intelligence Report is ready. Get personalized insights, your skill heatmap, and a 90-day growth plan.
        </p>

        {/* CTA */}
        <Button size="lg" onClick={onViewReport} className="px-8">
          View My Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
