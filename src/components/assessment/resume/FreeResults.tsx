import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Lock, 
  TrendingUp, Target, Zap, Eye, Download, Mail,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface ATSResult {
  ats_score: number;
  keyword_match_score: number;
  experience_match_score: number;
  skills_match_score: number;
  format_score: number;
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: Array<{ priority: string; issue: string; fix: string }>;
  role_fit_assessment: string;
  quick_wins?: string[];
  job_title_match?: {
    target_title: string;
    resume_title: string;
    match_level: string;
    recommendation: string;
  };
  [key: string]: any;
}

interface FreeResultsProps {
  score: ATSResult;
  onBack: () => void;
  onUpgrade: () => void;
  onSaveReport: (email: string) => void;
  resumePreviewHtml?: string;
}

export function FreeResults({ score, onBack, onUpgrade, onSaveReport, resumePreviewHtml }: FreeResultsProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");

  const getScoreLabel = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "text-green-600" };
    if (score >= 60) return { label: "Strong", color: "text-yellow-600" };
    return { label: "Needs Optimization", color: "text-red-600" };
  };

  const scoreInfo = getScoreLabel(score.ats_score);

  // Infer role level signal
  const roleLevelSignal = score.job_title_match?.resume_title || "Mid-Level";
  const targetRole = score.job_title_match?.target_title || "Senior";

  const handleSaveReport = () => {
    if (saveEmail) {
      onSaveReport(saveEmail);
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-foreground">Your Free Resume Scan</h1>
            <p className="text-muted-foreground">Step 3 of 4</p>
          </div>
        </div>

        {/* ATS Score - Big Display */}
        <Card className="p-8 mb-6 text-center bg-gradient-to-br from-card to-muted/50">
          <div className="mb-4">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              ATS Readiness Score
            </span>
          </div>
          <div className={`text-7xl font-bold ${scoreInfo.color}`}>
            {score.ats_score}
            <span className="text-3xl text-muted-foreground">/100</span>
          </div>
          <div className={`text-xl font-medium mt-2 ${scoreInfo.color}`}>
            {scoreInfo.label}
          </div>
        </Card>

        {/* Role-Level Signal */}
        <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Role-Level Signal</h3>
              <p className="text-sm text-muted-foreground">
                This resume currently reads like: <span className="font-semibold text-foreground">{roleLevelSignal}</span>
                {targetRole !== roleLevelSignal && (
                  <span> (not {targetRole} yet)</span>
                )}
              </p>
              {score.job_title_match?.recommendation && (
                <p className="text-sm text-muted-foreground mt-1">
                  → {score.job_title_match.recommendation}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Keywords", score: score.keyword_match_score },
            { label: "Experience", score: score.experience_match_score },
            { label: "Skills", score: score.skills_match_score },
            { label: "Format", score: score.format_score },
          ].map((item) => (
            <Card key={item.label} className="p-3 text-center">
              <div className={`text-xl font-bold ${
                item.score >= 75 ? "text-green-600" : item.score >= 50 ? "text-yellow-600" : "text-red-600"
              }`}>
                {item.score}%
              </div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </Card>
          ))}
        </div>

        {/* What's Working */}
        {score.strengths && score.strengths.length > 0 && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              What's Working
            </h3>
            <ul className="space-y-2">
              {score.strengths.slice(0, 3).map((strength, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* What's Holding You Back */}
        <Card className="p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            What's Holding You Back
          </h3>
          <ul className="space-y-2">
            {score.improvements.slice(0, 6).map((imp, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <div>
                  <span className="font-medium">{imp.issue}</span>
                  {imp.fix && <span className="text-muted-foreground"> → {imp.fix}</span>}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Teaser: Optimized Resume Preview (Blurred) */}
        <Card className="p-6 mb-4 relative overflow-hidden">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Your AI-Optimized Resume Preview
          </h3>
          
          {/* Preview content - blurred */}
          <div className="relative">
            <div className="bg-white dark:bg-gray-900 border rounded-lg p-6 max-h-[200px] overflow-hidden">
              {resumePreviewHtml ? (
                <div 
                  className="text-sm text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: resumePreviewHtml }}
                />
              ) : (
                <div className="space-y-3">
                  <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Blur overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background flex items-end justify-center pb-4">
              <div className="text-center">
                <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">
                  Unlock full resume + formatting + PDF download
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Primary CTA */}
        <div className="flex flex-col items-center gap-4 py-6">
          <Button 
            size="lg" 
            onClick={() => setShowUpgradeModal(true)}
            className="min-w-[250px] h-12 text-base"
          >
            <Zap className="w-5 h-5 mr-2" />
            Unlock Resume Intelligence
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setShowSaveDialog(true)}
            className="text-muted-foreground"
          >
            <Mail className="w-4 h-4 mr-2" />
            Save my report
          </Button>
        </div>

        {/* Upgrade Modal */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Unlock Your AI-Optimized Resume</DialogTitle>
              <DialogDescription>
                Get a fully rewritten, ATS-optimized resume ready to submit
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              {[
                "AI-optimized, fully rewritten resume",
                "Executive formatting & structure",
                "PDF & Word download",
                "Unlimited Q&A refinement loop",
                "Regeneration credits",
                "Unlimited cover letters",
                "ATS report copy"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t text-center">
              <div className="text-3xl font-bold text-foreground">$99</div>
              <p className="text-sm text-muted-foreground mb-4">per quarter (~$33/month)</p>
              
              <Button 
                size="lg" 
                onClick={() => {
                  setShowUpgradeModal(false);
                  onUpgrade();
                }}
                className="w-full"
              >
                Choose Plan & Pay
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full mt-2 text-muted-foreground"
              >
                Continue free
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Save Report Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Save Your Scan Report</DialogTitle>
              <DialogDescription>
                We'll email you a copy of your ATS scan results
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={saveEmail}
                onChange={(e) => setSaveEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveReport} disabled={!saveEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Send Report
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
