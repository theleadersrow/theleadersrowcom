import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ATSMetrics {
  overallScore: number;
  keywordMatch: number;
  impactMetrics: number;
  actionVerbs: number;
  sectionsOptimized: number;
  totalSections: number;
}

interface RealTimeATSScoreProps {
  originalResume: string;
  currentContent: string;
  sectionsOptimized: number;
  totalSections: number;
  jobDescription?: string;
  originalATSScore?: number; // Backend-calculated score to use as baseline
}

// Keywords that boost ATS scores
const ATS_KEYWORDS = [
  // Leadership
  "led", "managed", "directed", "oversaw", "spearheaded", "orchestrated", "drove", "championed",
  // Impact
  "increased", "decreased", "reduced", "improved", "grew", "expanded", "achieved", "delivered",
  // Strategy
  "strategy", "roadmap", "vision", "initiative", "transformation", "optimization",
  // Technical
  "implemented", "developed", "designed", "architected", "built", "launched", "deployed",
  // Results
  "revenue", "growth", "savings", "efficiency", "performance", "productivity",
  // Collaboration
  "cross-functional", "stakeholder", "partnership", "collaboration", "team"
];

// Strong action verbs
const STRONG_ACTION_VERBS = [
  "accelerated", "achieved", "amplified", "architected", "automated",
  "championed", "consolidated", "cultivated", "delivered", "designed",
  "drove", "elevated", "enabled", "engineered", "established",
  "exceeded", "executed", "expanded", "facilitated", "generated",
  "implemented", "increased", "influenced", "initiated", "innovated",
  "launched", "led", "leveraged", "managed", "maximized",
  "negotiated", "optimized", "orchestrated", "overhauled", "partnered",
  "pioneered", "produced", "reduced", "redesigned", "revamped",
  "scaled", "spearheaded", "streamlined", "strengthened", "transformed"
];

// Calculate ATS metrics from content
function calculateATSMetrics(
  originalContent: string,
  currentContent: string,
  sectionsOptimized: number,
  totalSections: number,
  jobDescription?: string
): ATSMetrics {
  const currentLower = currentContent.toLowerCase();
  const originalLower = originalContent.toLowerCase();
  
  // Keyword match score
  const matchedKeywords = ATS_KEYWORDS.filter(kw => currentLower.includes(kw));
  const originalMatchedKeywords = ATS_KEYWORDS.filter(kw => originalLower.includes(kw));
  const keywordScore = Math.min(100, (matchedKeywords.length / 15) * 100);
  
  // Impact metrics (numbers, percentages, dollar amounts)
  const metricPatterns = [
    /\d+%/g,
    /\$\d+[\d,]*[KMB]?/gi,
    /\d+[KMB]\+?/gi,
    /\d+\s*(million|billion|thousand)/gi,
    /\d+x/gi,
  ];
  
  let currentMetricsCount = 0;
  let originalMetricsCount = 0;
  metricPatterns.forEach(pattern => {
    currentMetricsCount += (currentContent.match(pattern) || []).length;
    originalMetricsCount += (originalContent.match(pattern) || []).length;
  });
  const impactScore = Math.min(100, (currentMetricsCount / 10) * 100);
  
  // Action verbs score
  const matchedVerbs = STRONG_ACTION_VERBS.filter(verb => 
    new RegExp(`\\b${verb}\\w*\\b`, 'i').test(currentContent)
  );
  const actionVerbScore = Math.min(100, (matchedVerbs.length / 12) * 100);
  
  // Calculate overall score (weighted average)
  const sectionScore = (sectionsOptimized / Math.max(totalSections, 1)) * 100;
  const overallScore = Math.round(
    (keywordScore * 0.30) + 
    (impactScore * 0.30) + 
    (actionVerbScore * 0.20) + 
    (sectionScore * 0.20)
  );
  
  return {
    overallScore,
    keywordMatch: Math.round(keywordScore),
    impactMetrics: Math.round(impactScore),
    actionVerbs: Math.round(actionVerbScore),
    sectionsOptimized,
    totalSections
  };
}

// Calculate score change
function getScoreChange(current: number, baseline: number): { value: number; trend: "up" | "down" | "neutral" } {
  const change = current - baseline;
  if (change > 2) return { value: change, trend: "up" };
  if (change < -2) return { value: Math.abs(change), trend: "down" };
  return { value: 0, trend: "neutral" };
}

// Get score color
function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 60) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function RealTimeATSScore({
  originalResume,
  currentContent,
  sectionsOptimized,
  totalSections,
  jobDescription,
  originalATSScore
}: RealTimeATSScoreProps) {
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [showChange, setShowChange] = useState(false);
  
  // Calculate baseline (original) metrics - use backend score if provided
  const calculatedBaselineMetrics = useMemo(() => 
    calculateATSMetrics(originalResume, originalResume, 0, totalSections, jobDescription),
    [originalResume, totalSections, jobDescription]
  );
  
  // Use backend score if provided, otherwise use calculated
  const baselineMetrics = useMemo(() => ({
    ...calculatedBaselineMetrics,
    overallScore: originalATSScore ?? calculatedBaselineMetrics.overallScore
  }), [calculatedBaselineMetrics, originalATSScore]);
  
  // Calculate current metrics
  const currentMetrics = useMemo(() => {
    const calculated = calculateATSMetrics(originalResume, currentContent, sectionsOptimized, totalSections, jobDescription);
    
    // If we have a backend baseline score, calculate improvement relative to that
    if (originalATSScore !== undefined) {
      // Calculate improvement percentage based on optimization progress
      const optimizationProgress = sectionsOptimized / Math.max(totalSections, 1);
      const maxImprovement = 25; // Max possible improvement from optimizations
      const improvement = Math.round(optimizationProgress * maxImprovement);
      
      return {
        ...calculated,
        overallScore: Math.min(100, originalATSScore + improvement)
      };
    }
    
    return calculated;
  }, [originalResume, currentContent, sectionsOptimized, totalSections, jobDescription, originalATSScore]);
  
  // Track score changes
  useEffect(() => {
    if (previousScore !== null && previousScore !== currentMetrics.overallScore) {
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 2000);
      return () => clearTimeout(timer);
    }
    setPreviousScore(currentMetrics.overallScore);
  }, [currentMetrics.overallScore, previousScore]);
  
  const scoreChange = getScoreChange(currentMetrics.overallScore, baselineMetrics.overallScore);
  const improvement = currentMetrics.overallScore - baselineMetrics.overallScore;
  
  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Real-Time ATS Score</h3>
            <p className="text-xs text-muted-foreground">Updates as you optimize</p>
          </div>
        </div>
        
        {/* Main Score */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-3xl font-bold transition-all duration-300",
              getScoreColor(currentMetrics.overallScore),
              showChange && "scale-110"
            )}>
              {currentMetrics.overallScore}
            </span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          
          {/* Change indicator */}
          {improvement !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              improvement > 0 ? "text-green-600" : "text-red-600"
            )}>
              {improvement > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>+{improvement} from original</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>{improvement} from original</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Score Progress</span>
          <span>{sectionsOptimized}/{totalSections} sections optimized</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              getProgressColor(currentMetrics.overallScore)
            )}
            style={{ width: `${currentMetrics.overallScore}%` }}
          />
        </div>
      </div>
      
      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard 
          label="Keywords"
          score={currentMetrics.keywordMatch}
          baseline={baselineMetrics.keywordMatch}
          icon={<Zap className="w-3 h-3" />}
        />
        <MetricCard 
          label="Impact Metrics"
          score={currentMetrics.impactMetrics}
          baseline={baselineMetrics.impactMetrics}
          icon={<TrendingUp className="w-3 h-3" />}
        />
        <MetricCard 
          label="Action Verbs"
          score={currentMetrics.actionVerbs}
          baseline={baselineMetrics.actionVerbs}
          icon={<Sparkles className="w-3 h-3" />}
        />
        <MetricCard 
          label="Optimization"
          score={Math.round((sectionsOptimized / Math.max(totalSections, 1)) * 100)}
          baseline={0}
          icon={<CheckCircle className="w-3 h-3" />}
        />
      </div>
      
      {/* Score Status */}
      <div className={cn(
        "mt-4 p-3 rounded-lg flex items-center gap-2",
        getScoreBgColor(currentMetrics.overallScore)
      )}>
        {currentMetrics.overallScore >= 80 ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Excellent! Your resume is highly optimized
            </span>
          </>
        ) : currentMetrics.overallScore >= 60 ? (
          <>
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Good progress! Keep optimizing sections
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Review & optimize more sections to improve score
            </span>
          </>
        )}
      </div>
    </Card>
  );
}

// Individual metric card
function MetricCard({ 
  label, 
  score, 
  baseline, 
  icon 
}: { 
  label: string; 
  score: number; 
  baseline: number;
  icon: React.ReactNode;
}) {
  const change = score - baseline;
  
  return (
    <div className="bg-background/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn("text-lg font-semibold", getScoreColor(score))}>
          {score}%
        </span>
        {change !== 0 && (
          <span className={cn(
            "text-xs flex items-center gap-0.5",
            change > 0 ? "text-green-600" : "text-red-600"
          )}>
            {change > 0 ? "+" : ""}{change}
          </span>
        )}
      </div>
    </div>
  );
}
