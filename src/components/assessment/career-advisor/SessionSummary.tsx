import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, Lightbulb, ListChecks, Loader2, ChevronDown, 
  ChevronUp, Download, Sparkles, Check 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ActionItem {
  task: string;
  priority: "high" | "medium" | "low";
}

interface Summary {
  summary: string;
  key_insights: string[];
  action_items: ActionItem[];
}

interface SessionSummaryProps {
  messages: Message[];
  sessionId: string;
  email?: string;
}

export function SessionSummary({ messages, sessionId, email }: SessionSummaryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

  const generateSummary = async () => {
    if (messages.length < 2) {
      toast.error("Have a longer conversation first to generate a summary");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-session-summary', {
        body: { messages, sessionId }
      });

      if (error) throw error;

      setSummary(data);
      setIsExpanded(true);
      setCompletedItems(new Set());

      // Save to database
      await supabase.from('career_advisor_summaries').insert([{
        session_id: sessionId,
        email: email || null,
        summary: data.summary,
        key_insights: data.key_insights,
        action_items: data.action_items
      }]);

      toast.success("Session summary generated!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleActionItem = (index: number) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const downloadSummary = () => {
    if (!summary) return;

    const content = `
CAREER ADVISOR SESSION SUMMARY
==============================

SUMMARY
${summary.summary}

KEY INSIGHTS
${summary.key_insights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

ACTION ITEMS
${summary.action_items.map((item, i) => `${i + 1}. [${item.priority.toUpperCase()}] ${item.task}`).join('\n')}

---
Generated on ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-advisor-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Summary downloaded!");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Don't show anything if no messages
  if (messages.length < 2) return null;

  return (
    <div className="border rounded-lg bg-gradient-to-br from-violet-50/50 to-background overflow-hidden">
      {!summary ? (
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={generateSummary}
            disabled={isGenerating}
            className="w-full gap-2 bg-white hover:bg-violet-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing conversation...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-500" />
                Generate Session Summary
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium">Session Summary</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSummary();
                }}
                className="h-7 px-2"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Content */}
          {isExpanded && (
            <div className="p-3 pt-0 space-y-4">
              {/* Summary */}
              <div>
                <p className="text-sm text-foreground leading-relaxed">
                  {summary.summary}
                </p>
              </div>

              {/* Key Insights */}
              {summary.key_insights.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Key Insights
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {summary.key_insights.map((insight, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-violet-500 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {summary.action_items.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ListChecks className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Action Items
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {summary.action_items.map((item, idx) => (
                      <li 
                        key={idx} 
                        className={`flex items-start gap-2 text-sm cursor-pointer group ${
                          completedItems.has(idx) ? 'opacity-60' : ''
                        }`}
                        onClick={() => toggleActionItem(idx)}
                      >
                        <button
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            completedItems.has(idx) 
                              ? 'bg-violet-500 border-violet-500' 
                              : 'border-muted-foreground/40 group-hover:border-violet-500'
                          }`}
                        >
                          {completedItems.has(idx) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <span className={completedItems.has(idx) ? 'line-through' : ''}>
                          {item.task}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate */}
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSummary}
                disabled={isGenerating}
                className="w-full text-xs h-7"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                Regenerate Summary
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
