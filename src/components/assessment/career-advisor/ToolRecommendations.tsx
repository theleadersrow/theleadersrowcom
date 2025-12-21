import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, Linkedin, MessageSquare, Briefcase, 
  Sparkles, X, ArrowRight, Zap
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
  action: string;
  color: string;
}

const RIMO_TOOLS: Tool[] = [
  {
    id: "resume_suite",
    name: "Resume Intelligence Suite",
    description: "AI-powered resume optimization with ATS scoring",
    icon: FileText,
    keywords: ["resume", "cv", "ats", "job application", "applying", "applications", "document", "format", "bullet points", "experience section", "skills section"],
    action: "resume",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    id: "linkedin",
    name: "LinkedIn Signal Score",
    description: "Optimize your LinkedIn profile for visibility",
    icon: Linkedin,
    keywords: ["linkedin", "profile", "networking", "connections", "recruiter", "headhunter", "online presence", "personal brand", "headline"],
    action: "linkedin",
    color: "text-sky-600 bg-sky-50 border-sky-200",
  },
  {
    id: "interview_prep",
    name: "Interview Preparation",
    description: "Practice behavioral and technical interviews",
    icon: MessageSquare,
    keywords: ["interview", "behavioral", "star method", "tell me about", "questions", "prepare", "practice", "mock", "technical interview", "case study"],
    action: "interview",
    color: "text-violet-600 bg-violet-50 border-violet-200",
  },
  {
    id: "cover_letter",
    name: "Cover Letter Generator",
    description: "Create tailored cover letters for any role",
    icon: Briefcase,
    keywords: ["cover letter", "application letter", "introduction", "hiring manager", "why i want", "motivation letter"],
    action: "cover_letter",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
];

interface ToolRecommendationsProps {
  messages: Message[];
  onNavigateToTool: (toolAction: string) => void;
}

export function ToolRecommendations({ messages, onNavigateToTool }: ToolRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Tool[]>([]);
  const [dismissedTools, setDismissedTools] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (messages.length < 2) {
      setRecommendations([]);
      return;
    }

    // Analyze conversation for tool keywords
    const conversationText = messages
      .map(m => m.content.toLowerCase())
      .join(" ");

    const matchedTools = RIMO_TOOLS.filter(tool => {
      if (dismissedTools.has(tool.id)) return false;
      
      return tool.keywords.some(keyword => 
        conversationText.includes(keyword.toLowerCase())
      );
    });

    // Prioritize by number of keyword matches
    const scoredTools = matchedTools.map(tool => {
      const score = tool.keywords.reduce((count, keyword) => {
        return count + (conversationText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      return { tool, score };
    });

    scoredTools.sort((a, b) => b.score - a.score);
    setRecommendations(scoredTools.map(s => s.tool));
  }, [messages, dismissedTools]);

  const dismissTool = (toolId: string) => {
    setDismissedTools(prev => new Set([...prev, toolId]));
  };

  if (recommendations.length === 0) return null;

  const displayedTools = showAll ? recommendations : recommendations.slice(0, 2);

  return (
    <div className="border rounded-lg bg-gradient-to-r from-violet-50/50 to-blue-50/50 dark:from-violet-950/20 dark:to-blue-950/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Recommended Tools</span>
        </div>
        {recommendations.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            {showAll ? "Show less" : `+${recommendations.length - 2} more`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedTools.map((tool) => (
          <div
            key={tool.id}
            className={`flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-background ${tool.color} transition-all hover:shadow-sm`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-1.5 rounded-md ${tool.color}`}>
                <tool.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{tool.name}</p>
                <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigateToTool(tool.action)}
                className="h-7 px-2 text-xs gap-1"
              >
                Try it
                <ArrowRight className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissTool(tool.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
