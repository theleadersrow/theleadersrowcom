import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  X,
  Edit3,
  Sparkles,
  RotateCcw,
  Eye,
  Save,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Wrench,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Section suggestion types
export type SectionSuggestionType = 
  | "content_improvement" 
  | "keyword_optimization" 
  | "formatting" 
  | "impact_enhancement"
  | "clarity";

export interface SectionSuggestion {
  id: string;
  type: SectionSuggestionType;
  suggestion: string;
  reason?: string;
  accepted: boolean;
}

interface SectionOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  sectionType: "header" | "summary" | "education" | "skills" | "achievements" | "other";
  originalContent: string;
  improvedContent: string;
  status: "pending" | "accepted" | "declined" | "edited";
  onAccept: () => void;
  onDecline: () => void;
  onSaveEdit: (content: string) => void;
  onMarkOptimized: () => void;
  targetRoles?: string[];
  targetIndustries?: string[];
  careerGoals?: string;
  jobDescription?: string;
}

// Get section icon
function getSectionIcon(sectionType: string) {
  switch (sectionType) {
    case "header":
      return <User className="w-5 h-5" />;
    case "summary":
      return <FileText className="w-5 h-5" />;
    case "education":
      return <GraduationCap className="w-5 h-5" />;
    case "skills":
      return <Wrench className="w-5 h-5" />;
    case "achievements":
      return <Award className="w-5 h-5" />;
    default:
      return <Briefcase className="w-5 h-5" />;
  }
}

// Get suggestion type label
function getSuggestionTypeInfo(type: SectionSuggestionType) {
  switch (type) {
    case "content_improvement":
      return { label: "Content Improvement", color: "text-orange-600 dark:text-orange-400" };
    case "keyword_optimization":
      return { label: "Keywords / ATS", color: "text-blue-600 dark:text-blue-400" };
    case "formatting":
      return { label: "Formatting", color: "text-purple-600 dark:text-purple-400" };
    case "impact_enhancement":
      return { label: "Impact Enhancement", color: "text-emerald-600 dark:text-emerald-400" };
    case "clarity":
      return { label: "Clarity", color: "text-amber-600 dark:text-amber-400" };
    default:
      return { label: "General", color: "text-muted-foreground" };
  }
}

// Helper to format text with **bold** metrics
function formatContentWithMetrics(text: string): React.ReactNode {
  if (!text.includes("**")) return text;

  const parts = text.split(/(\*\*[^**]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function SectionOptimizationModal({
  isOpen,
  onClose,
  sectionTitle,
  sectionType,
  originalContent,
  improvedContent,
  status,
  onAccept,
  onDecline,
  onSaveEdit,
  onMarkOptimized,
  targetRoles,
  targetIndustries,
  careerGoals,
  jobDescription,
}: SectionOptimizationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(improvedContent);
  const [localSuggestions, setLocalSuggestions] = useState<SectionSuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState(improvedContent);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    content_improvement: true,
    keyword_optimization: true,
    formatting: true,
    impact_enhancement: true,
    clarity: true,
  });

  // Fetch AI suggestions when modal opens
  useEffect(() => {
    if (isOpen && !hasGeneratedSuggestions && originalContent.trim()) {
      generateAISuggestions();
    }
  }, [isOpen]);

  const generateAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-section-suggestions', {
        body: {
          sectionTitle,
          sectionType,
          originalContent,
          improvedContent,
          targetRoles,
          targetIndustries,
          careerGoals,
          jobDescription,
        }
      });

      if (error) {
        console.error("Error generating section suggestions:", error);
        toast.error("Failed to generate AI suggestions. Using default analysis.");
        return;
      }

      if (data?.suggestions) {
        setLocalSuggestions(data.suggestions);
      }

      if (data?.optimizedContent) {
        setOptimizedContent(data.optimizedContent);
        setEditedContent(data.optimizedContent);
      }

      setHasGeneratedSuggestions(true);
      toast.success("AI analysis complete!");
    } catch (err) {
      console.error("Failed to generate section suggestions:", err);
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    const acceptedCount = localSuggestions.filter((s) => s.accepted).length;
    if (status === "accepted" || status === "edited") {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">AI Optimized</Badge>;
    }
    if (status === "declined") {
      return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">Locked</Badge>;
    }
    if (acceptedCount > 0) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">AI Reviewed</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  // Toggle individual suggestion
  const handleToggleSuggestion = (suggestionId: string) => {
    setLocalSuggestions(prev => prev.map((s) =>
      s.id === suggestionId ? { ...s, accepted: !s.accepted } : s
    ));
  };

  // Accept all suggestions
  const handleAcceptAll = () => {
    setLocalSuggestions(prev => prev.map((s) => ({ ...s, accepted: true })));
  };

  // Revert all
  const handleRevert = () => {
    setLocalSuggestions(prev => prev.map((s) => ({ ...s, accepted: false })));
    setEditedContent(improvedContent);
    setOptimizedContent(improvedContent);
    setIsEditing(false);
  };

  // Save draft edits
  const handleSaveDraft = () => {
    onSaveEdit(editedContent);
    setIsEditing(false);
  };

  // Mark as optimized and close
  const handleMarkOptimized = () => {
    onSaveEdit(optimizedContent);
    onMarkOptimized();
    onClose();
  };

  // Group suggestions by type
  const groupedSuggestions = localSuggestions.reduce(
    (acc, sug) => {
      if (!acc[sug.type]) acc[sug.type] = [];
      acc[sug.type].push(sug);
      return acc;
    },
    {} as Record<string, SectionSuggestion[]>
  );

  const acceptedCount = localSuggestions.filter((s) => s.accepted).length;
  const hasChanges = acceptedCount > 0 || isEditing;

  // Format content based on section type
  const renderFormattedContent = (content: string) => {
    if (sectionType === "skills") {
      const skills = content.split(/\s*[\|•]\s*/).filter(s => s.trim());
      return (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-primary/10 rounded text-sm">
              {skill.trim()}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {formatContentWithMetrics(content)}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getSectionIcon(sectionType)}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {sectionTitle}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and optimize this section
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Two-column layout */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* LEFT: Original Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Original
                </h3>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 min-h-[200px]">
                <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {originalContent.trim() || "(No content)"}
                </div>
              </div>
            </div>

            {/* RIGHT: AI Optimized Version */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Optimized Version
                </h3>
                <div className="flex gap-2">
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                      className="h-7 text-xs"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(optimizedContent);
                      toast.success("Copied to clipboard!");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[200px]">
                {isLoadingAI ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Optimizing content...</p>
                  </div>
                ) : isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[180px] font-mono text-sm resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                    placeholder="Edit your content here..."
                  />
                ) : (
                  renderFormattedContent(optimizedContent)
                )}
              </div>
            </div>
          </div>

          {/* Recommendation Panel */}
          {(localSuggestions.length > 0 || isLoadingAI) && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Recommendations
                </h3>
                <div className="flex items-center gap-2">
                  {!isLoadingAI && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setHasGeneratedSuggestions(false);
                        generateAISuggestions();
                      }}
                      className="h-7 text-xs text-amber-700 hover:text-amber-900"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  )}
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    {acceptedCount}/{localSuggestions.length} applied
                  </span>
                </div>
              </div>

              {isLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Analyzing {sectionTitle.toLowerCase()} with AI...
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Generating personalized optimization suggestions
                  </p>
                </div>
              ) : (
                <>
                  {/* Grouped Suggestions */}
                  <div className="space-y-4">
                    {(["content_improvement", "keyword_optimization", "impact_enhancement", "clarity", "formatting"] as const).map(
                      (type) => {
                        const suggestions = groupedSuggestions[type];
                        if (!suggestions || suggestions.length === 0) return null;

                        const { label, color } = getSuggestionTypeInfo(type);
                        const isExpanded = expandedGroups[type];

                        return (
                          <Collapsible
                            key={type}
                            open={isExpanded}
                            onOpenChange={(open) =>
                              setExpandedGroups((prev) => ({ ...prev, [type]: open }))
                            }
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded px-2 -mx-2">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-amber-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-amber-600" />
                                )}
                                <span className={`text-sm font-medium ${color}`}>
                                  {label}
                                </span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {suggestions.length}
                                </Badge>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <ul className="mt-2 space-y-2 pl-6">
                                {suggestions.map((sug) => (
                                  <li
                                    key={sug.id}
                                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors group ${
                                      sug.accepted
                                        ? "bg-green-100/50 dark:bg-green-900/20"
                                        : "hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                                    }`}
                                  >
                                    {/* Toggle checkbox */}
                                    <button
                                      onClick={() => handleToggleSuggestion(sug.id)}
                                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                        sug.accepted
                                          ? "bg-green-500 border-green-500 text-white"
                                          : "border-amber-400 hover:border-amber-600"
                                      }`}
                                    >
                                      {sug.accepted && <Check className="w-3 h-3" />}
                                    </button>

                                    <div className="flex-1">
                                      <span
                                        className={`text-amber-900 dark:text-amber-200 ${
                                          sug.accepted ? "line-through opacity-60" : ""
                                        }`}
                                      >
                                        {sug.suggestion}
                                      </span>
                                      {sug.reason && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                          {sug.reason}
                                        </p>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      }
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer - Fixed at bottom */}
        <div className="p-4 border-t bg-background flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Left side actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRevert}
                className="text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Revert
              </Button>
              {isEditing && (
                <Button size="sm" variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-1" />
                  Save draft
                </Button>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onDecline}>
                <X className="w-4 h-4 mr-1" />
                Keep Original
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAcceptAll}
                className="border-primary text-primary"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept All
              </Button>
              <Button
                size="sm"
                onClick={handleMarkOptimized}
                disabled={!hasChanges && status === "pending"}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Mark as AI Optimized
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
