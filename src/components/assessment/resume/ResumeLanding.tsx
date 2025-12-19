import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, ArrowRight, FileText, BarChart3, Sparkles, 
  CheckCircle, Download, Zap, Target, Eye, Lock
} from "lucide-react";

interface ResumeLandingProps {
  onBack: () => void;
  onProceed: () => void;
}

export function ResumeLanding({ onBack, onProceed }: ResumeLandingProps) {
  const freeFeatures = [
    "ATS Readiness Score",
    "Role-level signal analysis",
    "What's working in your resume",
    "What's holding you back",
    "Preview of AI-optimized resume"
  ];

  const paidFeatures = [
    "Fully rewritten, ATS-optimized resume",
    "PDF & Word downloads",
    "Unlimited cover letter generation",
    "Detailed improvement breakdown",
    "Interview prep questions based on your resume"
  ];

  const steps = [
    {
      number: 1,
      icon: FileText,
      title: "Upload Your Resume",
      description: "Upload your current resume (PDF or Word) or paste the text."
    },
    {
      number: 2,
      icon: BarChart3,
      title: "Get Your Free Resume Scan",
      description: "See your ATS score, strengths, gaps, and role-level signals."
    },
    {
      number: 3,
      icon: Sparkles,
      title: "Unlock Your Career Toolkit",
      description: "Get a fully optimized resume, unlimited cover letters, ATS insights, and AI guidance — ready to apply with confidence."
    }
  ];

  return (
    <div className="min-h-[80vh] animate-fade-up px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Resume Intelligence
            </h1>
            <p className="text-muted-foreground mt-1">
              Know exactly where your resume stands — and how to fix it
            </p>
          </div>
        </div>

        {/* Hero Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Start with a Free Scan
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                See how ATS systems evaluate your resume
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Upload your resume and get an instant analysis. You'll see your ATS readiness score, 
                what's working, what's not, and exactly what's holding you back — all for free.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button size="lg" onClick={onProceed} className="min-w-[180px]">
                Start Free Scan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-foreground text-center mb-6">
            How it works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 relative">
                  <step.icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Free vs Paid Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Free Column */}
          <Card className="p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-foreground">Free Scan Includes</h4>
              <span className="text-xs bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                Free
              </span>
            </div>
            <ul className="space-y-3">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Paid Column */}
          <Card className="p-6 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-foreground">Unlock Full Suite</h4>
              <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                $99 / quarter
              </span>
            </div>
            <ul className="space-y-3">
              {paidFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Instant results
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Your data stays private
          </span>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Button size="lg" onClick={onProceed} className="min-w-[220px]">
            <Target className="w-4 h-4 mr-2" />
            Start My Free Resume Scan
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Takes about 2 minutes • No login required
          </p>
        </div>
      </div>
    </div>
  );
}
