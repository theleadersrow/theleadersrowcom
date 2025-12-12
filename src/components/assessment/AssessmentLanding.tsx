import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Target, BarChart3, Briefcase, Brain, Compass, 
  ArrowRight, Clock, FileText, Zap, CheckCircle 
} from "lucide-react";

interface AssessmentLandingProps {
  onStart: (withATS: boolean) => void;
}

export function AssessmentLanding({ onStart }: AssessmentLandingProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-up">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Stop Guessing Your Level.
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Get a clear, honest assessment of where you operate today — and what's blocking your next leap.
        </p>
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Clock className="w-4 h-4" />
          8-10 minutes • 5 modules • Personalized report
        </p>
      </div>

      {/* What You'll Learn */}
      <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto mb-12">
        {[
          { icon: Target, label: "Your Operating Level", desc: "Where you actually stand" },
          { icon: BarChart3, label: "Skill Leverage Map", desc: "Strengths & gaps" },
          { icon: Briefcase, label: "Experience Gaps", desc: "What's missing" },
          { icon: Brain, label: "Blocker Pattern", desc: "What's holding you back" },
          { icon: Compass, label: "Role Fit", desc: "Where you belong" },
        ].map((item, i) => (
          <Card key={i} className="p-4 text-center hover:border-primary/50 transition-colors">
            <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium text-foreground">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.desc}</div>
          </Card>
        ))}
      </div>

      {/* CTA Options */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button size="lg" onClick={() => onStart(false)} className="px-8">
          Start Free Assessment
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button size="lg" variant="outline" onClick={() => onStart(true)} className="px-8">
          <FileText className="w-4 h-4 mr-2" />
          Check Resume First (ATS Score)
        </Button>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          No login required
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          100% free
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          AI-powered report
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          90-day action plan
        </span>
      </div>

      {/* Differentiator */}
      <div className="mt-12 max-w-lg mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          <Zap className="w-4 h-4 inline mr-1 text-primary" />
          <strong className="text-foreground">Not a personality quiz.</strong> This is a strategic diagnostic used by Product Managers 
          to calibrate their career positioning, identify high-ROI skill gaps, and build a concrete path to their next level.
        </p>
      </div>
    </div>
  );
}
