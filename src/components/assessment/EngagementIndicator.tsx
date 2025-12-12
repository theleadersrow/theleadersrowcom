import { Flame, Clock, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface EngagementIndicatorProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  moduleNumber: number;
  streak?: number;
}

const encouragingMessages = [
  { min: 0, max: 2, message: "Great start! Keep going." },
  { min: 3, max: 5, message: "You're building momentum!" },
  { min: 6, max: 8, message: "Excellent focus!" },
  { min: 9, max: 11, message: "Almost there!" },
  { min: 12, max: 100, message: "Final stretch!" },
];

const moduleColors = [
  "from-primary to-primary/70",
  "from-blue-500 to-blue-400",
  "from-emerald-500 to-emerald-400", 
  "from-amber-500 to-amber-400",
  "from-purple-500 to-purple-400",
];

export function EngagementIndicator({
  currentQuestionIndex,
  totalQuestions,
  moduleNumber,
  streak = 0,
}: EngagementIndicatorProps) {
  const questionsRemaining = totalQuestions - currentQuestionIndex - 1;
  const estimatedMinutes = Math.max(1, Math.ceil(questionsRemaining * 0.5));
  
  const encouragement = encouragingMessages.find(
    m => currentQuestionIndex >= m.min && currentQuestionIndex <= m.max
  )?.message || "Keep going!";

  const gradientClass = moduleColors[(moduleNumber - 1) % moduleColors.length];
  const showStreak = streak >= 3;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
      {/* Time remaining */}
      <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          ~{estimatedMinutes} min left in module
        </span>
      </div>

      {/* Streak indicator */}
      {showStreak && (
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
          "bg-gradient-to-r", gradientClass, "text-white"
        )}>
          <Flame className="w-3.5 h-3.5" />
          <span className="font-medium">{streak} streak!</span>
        </div>
      )}

      {/* Question progress in module */}
      <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full text-xs">
        <Target className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-muted-foreground">
          {currentQuestionIndex + 1}/{totalQuestions}
        </span>
      </div>
    </div>
  );
}

interface EncouragementBannerProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  moduleNumber: number;
}

export function EncouragementBanner({
  currentQuestionIndex,
  totalQuestions,
  moduleNumber,
}: EncouragementBannerProps) {
  // Show encouragement at key milestones
  const isHalfway = currentQuestionIndex === Math.floor(totalQuestions / 2);
  const isAlmostDone = currentQuestionIndex === totalQuestions - 2;
  const isFirstQuestion = currentQuestionIndex === 0;

  if (!isHalfway && !isAlmostDone && !isFirstQuestion) return null;

  let message = "";
  let icon = TrendingUp;

  if (isFirstQuestion) {
    message = "Let's dive in! Answer honestly for the best insights.";
    icon = Target;
  } else if (isHalfway) {
    message = "Halfway through this module! You're doing great.";
    icon = TrendingUp;
  } else if (isAlmostDone) {
    message = "Almost finished with this module!";
    icon = Flame;
  }

  const Icon = icon;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 justify-center text-sm">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-primary font-medium">{message}</span>
      </div>
    </div>
  );
}