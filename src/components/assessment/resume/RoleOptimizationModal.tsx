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
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Role-level status model
export type RoleStatus = "draft" | "ai_reviewed" | "optimized" | "locked";

// AI Recommendation types with enhanced structure
export interface AISuggestion {
  id: string;
  type: "impact_gap" | "language_seniority" | "keyword_optimization" | "clarity_redundancy";
  bulletIndex?: number;
  suggestion: string;
  reason?: string;
  accepted: boolean;
}

// Structured role data model - each role is an atomic unit
export interface RoleData {
  roleId: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  optimizedResponsibilities?: string[];
  aiSuggestions: AISuggestion[];
  appliedSuggestions?: string[];
  roleSummary?: string;
}

interface RoleOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleData: RoleData;
  originalContent: string;
  improvedContent: string;
  status: "pending" | "accepted" | "declined" | "edited";
  onAccept: () => void;
  onDecline: () => void;
  onSaveEdit: (content: string) => void;
  onMarkOptimized: () => void;
  onUpdateSuggestions: (suggestions: AISuggestion[]) => void;
  onUpdateOptimizedContent?: (content: string) => void;
  targetRoles?: string[];
  targetIndustries?: string[];
  careerGoals?: string;
  jobDescription?: string;
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

// Get suggestion type label and icon
function getSuggestionTypeInfo(type: AISuggestion["type"]) {
  switch (type) {
    case "impact_gap":
      return { label: "Impact & Metrics", color: "text-orange-600 dark:text-orange-400" };
    case "language_seniority":
      return { label: "Seniority & Leadership", color: "text-purple-600 dark:text-purple-400" };
    case "keyword_optimization":
      return { label: "Keywords / ATS", color: "text-blue-600 dark:text-blue-400" };
    case "clarity_redundancy":
      return { label: "Clarity / Redundancy", color: "text-emerald-600 dark:text-emerald-400" };
    default:
      return { label: "General", color: "text-muted-foreground" };
  }
}

export function RoleOptimizationModal({
  isOpen,
  onClose,
  roleData,
  originalContent,
  improvedContent,
  status,
  onAccept,
  onDecline,
  onSaveEdit,
  onMarkOptimized,
  onUpdateSuggestions,
  onUpdateOptimizedContent,
  targetRoles,
  targetIndustries,
  careerGoals,
  jobDescription,
}: RoleOptimizationModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(improvedContent);
  const [localSuggestions, setLocalSuggestions] = useState<AISuggestion[]>(roleData.aiSuggestions || []);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiOptimizedBullets, setAiOptimizedBullets] = useState<string[]>(roleData.optimizedResponsibilities || []);
  const [hasGeneratedSuggestions, setHasGeneratedSuggestions] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    impact_gap: true,
    language_seniority: true,
    keyword_optimization: true,
    clarity_redundancy: true,
  });

  // Fetch AI suggestions when modal opens
  useEffect(() => {
    if (isOpen && !hasGeneratedSuggestions && roleData.responsibilities?.length > 0) {
      generateAISuggestions();
    }
  }, [isOpen, roleData.roleId]);

  const generateAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-role-suggestions', {
        body: {
          roleTitle: roleData.title,
          company: roleData.company,
          location: roleData.location,
          dates: `${roleData.startDate || ''} - ${roleData.endDate || ''}`,
          responsibilities: roleData.responsibilities,
          targetRoles,
          targetIndustries,
          careerGoals,
          jobDescription,
        }
      });

      if (error) {
        console.error("Error generating suggestions:", error);
        toast.error("Failed to generate AI suggestions. Using fallback analysis.");
        return;
      }

      if (data?.suggestions) {
        setLocalSuggestions(data.suggestions);
        onUpdateSuggestions(data.suggestions);
      }

      if (data?.optimizedResponsibilities) {
        setAiOptimizedBullets(data.optimizedResponsibilities);
        if (onUpdateOptimizedContent) {
          const optimizedContent = data.optimizedResponsibilities.map((r: string) => `• ${r}`).join('\n');
          onUpdateOptimizedContent(optimizedContent);
        }
      }

      setHasGeneratedSuggestions(true);
      toast.success("AI analysis complete!");
    } catch (err) {
      console.error("Failed to generate AI suggestions:", err);
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const dateRange =
    roleData.startDate && roleData.endDate
      ? `${roleData.startDate} – ${roleData.endDate}`
      : roleData.startDate || "";

  const metaLine = [roleData.company, roleData.location, dateRange].filter(Boolean).join(" • ");

  // Get role status badge
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
    const updated = localSuggestions.map((s) =>
      s.id === suggestionId ? { ...s, accepted: !s.accepted } : s
    );
    setLocalSuggestions(updated);
    onUpdateSuggestions(updated);
  };

  // Accept all suggestions
  const handleAcceptAll = () => {
    const updated = localSuggestions.map((s) => ({ ...s, accepted: true }));
    setLocalSuggestions(updated);
    onUpdateSuggestions(updated);
  };

  // Accept selected suggestions
  const handleAcceptSelected = () => {
    // Just keep current state - suggestions are already toggled
    onUpdateSuggestions(localSuggestions);
  };

  // Revert all suggestions
  const handleRevert = () => {
    const updated = localSuggestions.map((s) => ({ ...s, accepted: false }));
    setLocalSuggestions(updated);
    onUpdateSuggestions(updated);
    setEditedContent(improvedContent);
    setIsEditing(false);
  };

  // Save draft edits
  const handleSaveDraft = () => {
    onSaveEdit(editedContent);
    setIsEditing(false);
  };

  // Mark as AI Optimized and close
  const handleMarkOptimized = () => {
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
    {} as Record<string, AISuggestion[]>
  );

  const acceptedCount = localSuggestions.filter((s) => s.accepted).length;
  const hasChanges = acceptedCount > 0 || isEditing;

  // Extract bullets from content - more flexible matching
  const extractBullets = (content: string): string[] => {
    const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
    // Try to find bullet lines first
    const bulletLines = lines.filter((line) => /^[•\-*▪▸►◦○]\s/.test(line));
    if (bulletLines.length > 0) {
      return bulletLines.map((line) => line.replace(/^[•\-*▪▸►◦○]\s*/, ""));
    }
    // If no bullets found, return non-header lines (skip title, company, dates)
    return lines.filter((line) => 
      line.length > 20 && // Skip short metadata lines
      !/^\d{1,2}\/\d{4}/.test(line) && // Skip date lines
      !line.includes(" – ") && // Skip date range lines
      !line.includes(" | ") // Skip metadata separator lines
    );
  };

  // Use roleData.responsibilities if available (full parsed data), otherwise extract from content
  const originalBullets = roleData.responsibilities && roleData.responsibilities.length > 0 
    ? roleData.responsibilities 
    : extractBullets(originalContent);
  // Use AI-optimized bullets if generated, otherwise fall back to improved content
  const optimizedBullets = aiOptimizedBullets.length > 0
    ? aiOptimizedBullets
    : roleData.optimizedResponsibilities && roleData.optimizedResponsibilities.length > 0
      ? roleData.optimizedResponsibilities
      : extractBullets(improvedContent);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Modal Header - Sticky */}
        <DialogHeader className="p-6 pb-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                {roleData.title}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{metaLine}</p>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Two-column layout on desktop */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* LEFT: Current Role / Original */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Current Role
                </h3>
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
              </div>

              <div className="bg-muted/30 rounded-lg p-4 min-h-[300px]">
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[280px] font-mono text-sm resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
                    placeholder="Edit your content here..."
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Responsibilities & Impact (Original)
                    </p>
                    {originalBullets.length > 0 ? (
                      <ul className="space-y-2.5">
                        {originalBullets.map((bullet, i) => (
                          <li
                            key={i}
                            className="text-sm text-foreground/90 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-muted-foreground"
                          >
                            {formatContentWithMetrics(bullet)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No bullet points found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: AI Optimized Version */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Optimized Version
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(improvedContent);
                  }}
                >
                  Copy
                </Button>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[300px]">
                <p className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-2">
                  Suggested Rewrite
                </p>
                {optimizedBullets.length > 0 ? (
                  <ul className="space-y-2.5">
                    {optimizedBullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground/90 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary"
                      >
                        {formatContentWithMetrics(bullet)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No optimized bullets available
                  </p>
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
                  AI Recommendations (for this role)
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
                    Analyzing your experience with AI...
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Generating personalized suggestions for keywords, impact, and positioning
                  </p>
                </div>
              ) : (
                <>
                  {roleData.roleSummary && (
                    <p className="text-sm text-amber-900 dark:text-amber-200 italic border-l-2 border-amber-400 pl-3">
                      {roleData.roleSummary}
                    </p>
                  )}

              {/* Grouped Suggestions */}
              <div className="space-y-4">
                {(["impact_gap", "language_seniority", "keyword_optimization", "clarity_redundancy"] as const).map(
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
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center gap-2 py-1.5 hover:opacity-80 transition-opacity">
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
                          <ul className="space-y-2 mt-2 ml-6">
                            {suggestions.map((sug) => (
                              <li
                                key={sug.id}
                                className="flex items-start gap-3 text-sm group"
                              >
                                {/* Apply checkbox */}
                                <button
                                  onClick={() => handleToggleSuggestion(sug.id)}
                                  className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                                    sug.accepted
                                      ? "bg-green-500 border-green-500 text-white"
                                      : "border-amber-400 hover:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                                  }`}
                                  title={sug.accepted ? "Applied" : "Apply this suggestion"}
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
                                    <button className="ml-2 text-xs text-amber-600 hover:text-amber-800 dark:hover:text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Eye className="w-3 h-3 inline mr-0.5" />
                                      See why
                                    </button>
                                  )}
                                </div>

                                {/* Quick actions */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    className="p-1 hover:bg-amber-200 dark:hover:bg-amber-800 rounded text-amber-700 dark:text-amber-300"
                                    title="Edit suggestion"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
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
              {acceptedCount > 0 && acceptedCount < localSuggestions.length && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAcceptSelected}
                  className="border-primary text-primary"
                >
                  Accept Selected ({acceptedCount})
                </Button>
              )}
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

