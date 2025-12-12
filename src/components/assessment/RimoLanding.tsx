import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Target, BarChart3, Briefcase, Brain, Compass, 
  ArrowRight, Clock, FileText, Zap, CheckCircle, Sparkles,
  Linkedin, Eye, MessageSquare
} from "lucide-react";

interface RimoLandingProps {
  onStartAssessment: () => void;
  onStartATS: () => void;
}

export function RimoLanding({ onStartAssessment, onStartATS }: RimoLandingProps) {
  const [showInterviewPrepDialog, setShowInterviewPrepDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-up">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-serif font-bold text-foreground">Rimo</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
          Your AI Career Coach
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          AI-powered tools to help you understand where you stand, optimize your resume, and prepare for what's next.
        </p>
        <p className="text-sm text-muted-foreground">
          Powered by advanced AI • Built for Product Managers
        </p>
      </div>

      {/* AI Tools Suite */}
      <div className="w-full max-w-3xl mx-auto mb-10">
        <h2 className="text-center text-sm font-medium text-muted-foreground mb-4">AI-POWERED TOOLS</h2>
        
        <div className="grid gap-4">
          {/* Strategic Assessment Tool */}
          <button
            onClick={onStartAssessment}
            className="w-full bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg text-foreground">Strategic Level Assessment</span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-muted-foreground mb-3">
                  Get a clear, honest assessment of where you operate today and what's blocking your next leap.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 8-10 min</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Skill analysis</span>
                  <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Blocker diagnosis</span>
                  <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> Role fit</span>
                </div>
              </div>
            </div>
          </button>

          {/* ATS Resume Score Tool */}
          <button
            onClick={onStartATS}
            className="w-full bg-card border border-border rounded-xl p-5 hover:border-primary hover:shadow-lg transition-all group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg text-foreground">ATS Resume Score</span>
                  <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-muted-foreground mb-3">
                  Upload your resume and job description to see how well you match and get actionable improvements.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Keyword match</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Experience fit</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant feedback</span>
                </div>
              </div>
            </div>
          </button>

          {/* LinkedIn Profile Signal Score - Coming Soon */}
          <button
            onClick={() => setShowLinkedInDialog(true)}
            className="w-full bg-card border border-border rounded-xl p-5 hover:border-secondary/50 transition-all group text-left opacity-80"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                <Linkedin className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg text-foreground">LinkedIn Profile Signal Score</span>
                  <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <p className="text-muted-foreground mb-3">
                  Get your profile scored on headline clarity, role positioning, impact language, and leadership signal — optimized for what recruiters actually see.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Recruiter view</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Headline rewrites</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Leadership signals</span>
                </div>
              </div>
            </div>
          </button>

          {/* Interview Prep Tool - Coming Soon */}
          <button
            onClick={() => setShowInterviewPrepDialog(true)}
            className="w-full bg-card border border-border rounded-xl p-5 hover:border-secondary/50 transition-all group text-left opacity-80"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                <Sparkles className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg text-foreground">AI Interview Prep</span>
                  <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
                </div>
                <p className="text-muted-foreground mb-3">
                  Practice mock interviews with personalized AI feedback, coaching, and real-time guidance.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Brain className="w-3 h-3" /> Mock interviews</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Personalized coaching</span>
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Performance insights</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
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
          AI-powered insights
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Actionable results
        </span>
      </div>

      {/* Differentiator */}
      <div className="max-w-lg mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          <Zap className="w-4 h-4 inline mr-1 text-primary" />
          <strong className="text-foreground">Rimo is your AI career companion.</strong> Built specifically for Product Managers 
          to calibrate career positioning, optimize resumes, and prepare for high-stakes opportunities.
        </p>
      </div>

      {/* LinkedIn Profile Coming Soon Dialog */}
      <Dialog open={showLinkedInDialog} onOpenChange={setShowLinkedInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-primary" />
              LinkedIn Profile Signal Score
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p>
                LinkedIn is the #1 inbound channel for career opportunities, yet most tools ignore it. Rimo will analyze your profile the way human recruiters do.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Profile Score</strong> — Headline clarity, role positioning, impact language & leadership signal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">3 Headline Rewrites</strong> — AI-generated alternatives optimized for visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">"What Recruiters Actually See"</strong> — First-impression breakdown</span>
                </li>
              </ul>
              <div className="bg-secondary/20 rounded-lg p-4 text-center">
                <p className="text-lg font-semibold text-foreground">Coming Soon!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This feature is in development. Stay tuned!
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowLinkedInDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                Rimo's AI Interview Prep will help you practice and prepare for real interviews with personalized mock sessions, feedback, and coaching.
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