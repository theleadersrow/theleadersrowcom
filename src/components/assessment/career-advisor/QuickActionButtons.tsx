import { Button } from "@/components/ui/button";
import { 
  Lightbulb, ListChecks, Target, MessageSquarePlus, 
  Rocket, HandshakeIcon, Sparkles 
} from "lucide-react";

interface QuickActionButtonsProps {
  onAction: (prompt: string) => void;
  userProfileType?: "student" | "professional" | "other";
  hasMessages: boolean;
  disabled?: boolean;
}

const CONTEXTUAL_ACTIONS = {
  noMessages: [
    { label: "Career advice", icon: Lightbulb, prompt: "What should I focus on to advance my career?" },
    { label: "Set a goal", icon: Target, prompt: "Help me define a clear career goal for the next 3 months" },
    { label: "Skill assessment", icon: Sparkles, prompt: "What skills should I develop to become more competitive?" },
  ],
  hasMessages: [
    { label: "Tell me more", icon: MessageSquarePlus, prompt: "Can you elaborate on that point?" },
    { label: "Give examples", icon: Lightbulb, prompt: "Can you give me specific examples?" },
    { label: "Make it actionable", icon: ListChecks, prompt: "What specific steps should I take?" },
    { label: "Set a goal", icon: Target, prompt: "Help me turn this into a concrete goal I can track" },
  ],
  student: [
    { label: "Interview prep", icon: HandshakeIcon, prompt: "Help me prepare for entry-level interviews" },
    { label: "First job tips", icon: Rocket, prompt: "What should I know before starting my first job?" },
  ],
  professional: [
    { label: "Negotiate salary", icon: HandshakeIcon, prompt: "How do I negotiate a higher salary in my next review?" },
    { label: "Leadership growth", icon: Rocket, prompt: "How can I develop stronger leadership skills?" },
  ],
};

export function QuickActionButtons({ 
  onAction, 
  userProfileType, 
  hasMessages,
  disabled 
}: QuickActionButtonsProps) {
  const baseActions = hasMessages 
    ? CONTEXTUAL_ACTIONS.hasMessages 
    : CONTEXTUAL_ACTIONS.noMessages;
  
  const profileActions = userProfileType && userProfileType !== "other" 
    ? CONTEXTUAL_ACTIONS[userProfileType] 
    : [];

  // Combine and limit to prevent UI overflow
  const actions = hasMessages 
    ? baseActions 
    : [...baseActions, ...profileActions].slice(0, 4);

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          className="text-xs h-8 px-3 gap-1.5 bg-background hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300 transition-colors"
        >
          <action.icon className="w-3.5 h-3.5" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
