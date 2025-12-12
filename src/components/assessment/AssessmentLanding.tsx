import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Target, BarChart3, Briefcase, Brain, Compass, 
  ArrowRight, Clock, FileText, Zap, CheckCircle, Sparkles 
} from "lucide-react";

interface AssessmentLandingProps {
  onStart: (withATS: boolean) => void;
}

export function AssessmentLanding({ onStart }: AssessmentLandingProps) {
  const [showInterviewPrepDialog, setShowInterviewPrepDialog] = useState(false);

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

      {/* Interview Prep Card */}
      <button
        onClick={() => setShowInterviewPrepDialog(true)}
        className="w-full max-w-md bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-card/80 transition-all group text-left mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">AI Interview Prep</span>
              <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Practice mock interviews with AI feedback and coaching
            </p>
          </div>
        </div>
      </button>

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

      {/* Interview Prep Coming Soon Dialog */}
      <Dialog open={showInterviewPrepDialog} onOpenChange={setShowInterviewPrepDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Interview Prep
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p>
                Our AI-powered Interview Prep tool will help you practice and prepare for real interviews with personalized mock sessions, feedback, and coaching.
              </p>
              <div className="bg-secondary/20 rounded-lg p-4 text-center">
                <p className="text-lg font-semibold text-foreground">Coming Soon!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This premium feature will be launching in a few months. Stay tuned!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowInterviewPrepDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
