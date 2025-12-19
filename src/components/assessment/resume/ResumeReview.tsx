import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Check, X, Edit3, Save, RotateCcw,
  ChevronDown, ChevronUp, Sparkles, FileText
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ResumeSection {
  id: string;
  title: string;
  originalContent: string;
  improvedContent: string;
  status: "pending" | "accepted" | "declined" | "edited";
  editedContent?: string;
}

interface ContentImprovement {
  section: string;
  original: string;
  improved: string;
  reason: string;
}

interface ResumeReviewProps {
  originalResume: string;
  enhancedContent: string;
  contentImprovements: ContentImprovement[];
  onBack: () => void;
  onFinalize: (finalResume: string, acceptedSections: string[]) => void;
  isGenerating?: boolean;
}

function parseResumeIntoSections(resumeText: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  
  // Section header patterns - must match EXACT section headers (typically all caps or title case at start of line)
  const sectionPatterns = [
    { pattern: /^(SUMMARY|PROFESSIONAL SUMMARY|EXECUTIVE SUMMARY|PROFILE)\s*$/im, name: "SUMMARY" },
    { pattern: /^(KEY ACHIEVEMENTS|ACHIEVEMENTS|ACCOMPLISHMENTS)\s*$/im, name: "ACHIEVEMENTS" },
    { pattern: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)\s*$/im, name: "EXPERIENCE" },
    { pattern: /^(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND)\s*$/im, name: "EDUCATION" },
    { pattern: /^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|KEY SKILLS)\s*$/im, name: "SKILLS" },
    { pattern: /^(INDUSTRY EXPERTISE|AREAS OF EXPERTISE|EXPERTISE)\s*$/im, name: "EXPERTISE" },
    { pattern: /^(CERTIFICATIONS|LICENSES|CREDENTIALS|CERTIFICATES)\s*$/im, name: "CERTIFICATIONS" },
    { pattern: /^(PROJECTS|KEY PROJECTS|NOTABLE PROJECTS)\s*$/im, name: "PROJECTS" },
    { pattern: /^(LANGUAGES)\s*$/im, name: "LANGUAGES" },
    { pattern: /^(AWARDS|HONORS)\s*$/im, name: "AWARDS" },
    { pattern: /^(PUBLICATIONS)\s*$/im, name: "PUBLICATIONS" },
    { pattern: /^(VOLUNTEER|VOLUNTEERING|VOLUNTEER EXPERIENCE)\s*$/im, name: "VOLUNTEER" },
  ];

  const lines = resumeText.split('\n');
  
  // First, find all section boundaries
  const sectionBoundaries: { lineIndex: number; title: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines
    if (!line) continue;
    
    for (const { pattern, name } of sectionPatterns) {
      if (pattern.test(line)) {
        sectionBoundaries.push({ lineIndex: i, title: name });
        break;
      }
    }
  }
  
  // If no sections found, treat everything as header
  if (sectionBoundaries.length === 0) {
    return [{ title: "HEADER", content: resumeText }];
  }
  
  // Extract header (everything before first section)
  if (sectionBoundaries[0].lineIndex > 0) {
    const headerContent = lines.slice(0, sectionBoundaries[0].lineIndex).join('\n').trim();
    if (headerContent) {
      sections.push({ title: "HEADER", content: headerContent });
    }
  }
  
  // Extract each section's content
  for (let i = 0; i < sectionBoundaries.length; i++) {
    const startLine = sectionBoundaries[i].lineIndex + 1; // Skip the header line itself
    const endLine = i < sectionBoundaries.length - 1 
      ? sectionBoundaries[i + 1].lineIndex 
      : lines.length;
    
    const sectionContent = lines.slice(startLine, endLine).join('\n').trim();
    sections.push({ 
      title: sectionBoundaries[i].title, 
      content: sectionContent 
    });
  }
  
  return sections;
}

export function ResumeReview({
  originalResume,
  enhancedContent,
  contentImprovements,
  onBack,
  onFinalize,
  isGenerating = false
}: ResumeReviewProps) {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    // Parse both resumes into sections
    const originalSections = parseResumeIntoSections(originalResume);
    const enhancedSections = parseResumeIntoSections(enhancedContent);
    
    // Match sections between original and enhanced
    const reviewSections: ResumeSection[] = enhancedSections.map((enhanced, index) => {
      // Find matching original section
      const matchingOriginal = originalSections.find(orig => 
        orig.title.includes(enhanced.title.split(' ')[0]) ||
        enhanced.title.includes(orig.title.split(' ')[0])
      ) || originalSections[index];
      
      return {
        id: `section-${index}`,
        title: enhanced.title || `Section ${index + 1}`,
        originalContent: matchingOriginal?.content || "",
        improvedContent: enhanced.content,
        status: "pending" as const,
      };
    });
    
    setSections(reviewSections);
    // Expand first section by default
    if (reviewSections.length > 0) {
      setExpandedSection(reviewSections[0].id);
    }
  }, [originalResume, enhancedContent]);

  const handleAccept = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, status: "accepted" as const } : s
    ));
  };

  const handleDecline = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, status: "declined" as const } : s
    ));
  };

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setSections(prev => prev.map(s => 
        s.id === sectionId ? { 
          ...s, 
          editedContent: s.editedContent || s.improvedContent 
        } : s
      ));
    }
  };

  const handleSaveEdit = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, status: "edited" as const } : s
    ));
    setEditingSection(null);
  };

  const handleEditChange = (sectionId: string, content: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, editedContent: content } : s
    ));
  };

  const handleResetSection = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { 
        ...s, 
        status: "pending" as const,
        editedContent: undefined 
      } : s
    ));
    setEditingSection(null);
  };

  const handleFinalize = () => {
    // Build final resume from accepted/edited sections
    const finalParts: string[] = [];
    const acceptedSectionTitles: string[] = [];
    
    sections.forEach(section => {
      let content = "";
      if (section.status === "accepted") {
        content = section.improvedContent;
        acceptedSectionTitles.push(section.title);
      } else if (section.status === "edited") {
        content = section.editedContent || section.improvedContent;
        acceptedSectionTitles.push(section.title + " (edited)");
      } else if (section.status === "declined") {
        content = section.originalContent;
      } else {
        // Pending - use improved version
        content = section.improvedContent;
        acceptedSectionTitles.push(section.title);
      }
      
      if (section.title !== "HEADER") {
        finalParts.push(section.title);
      }
      finalParts.push(content.trim());
    });
    
    onFinalize(finalParts.join('\n\n'), acceptedSectionTitles);
  };

  const getStatusBadge = (status: ResumeSection["status"]) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Accepted</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Using Original</Badge>;
      case "edited":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Custom Edit</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  const acceptedCount = sections.filter(s => s.status === "accepted" || s.status === "edited").length;
  const totalCount = sections.length;

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Review AI Improvements
            </h1>
            <p className="text-muted-foreground">
              Accept, decline, or edit each section • {acceptedCount}/{totalCount} reviewed
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-6">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(sections.filter(s => s.status !== "pending").length / Math.max(totalCount, 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">How this works:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Accept</strong> to use the AI-improved version</li>
                <li>• <strong>Decline</strong> to keep your original content</li>
                <li>• <strong>Edit</strong> to customize the improved version</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {sections.map((section) => (
            <Collapsible 
              key={section.id}
              open={expandedSection === section.id}
              onOpenChange={(open) => setExpandedSection(open ? section.id : null)}
            >
              <Card className={`overflow-hidden transition-all ${
                section.status === "accepted" ? "border-green-500/50" :
                section.status === "declined" ? "border-red-500/30" :
                section.status === "edited" ? "border-blue-500/50" : ""
              }`}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {expandedSection === section.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="font-semibold text-foreground">{section.title}</span>
                      {getStatusBadge(section.status)}
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {section.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetSection(section.id)}
                          className="text-muted-foreground"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="border-t p-4 space-y-4">
                    {/* Compare View */}
                    {editingSection !== section.id && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Original */}
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                            Original
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                            {section.originalContent.trim() || "(No content)"}
                          </div>
                        </div>
                        
                        {/* Improved */}
                        <div>
                          <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Improved
                          </div>
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                            {section.improvedContent.trim() || "(No improvements)"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Edit Mode */}
                    {editingSection === section.id && (
                      <div>
                        <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          Edit Content
                        </div>
                        <Textarea
                          value={section.editedContent || section.improvedContent}
                          onChange={(e) => handleEditChange(section.id, e.target.value)}
                          className="min-h-[200px] font-mono text-sm"
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {editingSection === section.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(section.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingSection(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(section.id)}
                            className={section.status === "accepted" ? "bg-green-600" : "bg-green-600 hover:bg-green-700"}
                            disabled={section.status === "accepted"}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept Improved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDecline(section.id)}
                            className={section.status === "declined" ? "border-red-500 text-red-600" : ""}
                            disabled={section.status === "declined"}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Keep Original
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(section.id)}
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {/* Finalize Button */}
        <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {sections.filter(s => s.status === "pending").length > 0 ? (
                <span>Pending sections will use AI improvements by default</span>
              ) : (
                <span className="text-green-600">✓ All sections reviewed</span>
              )}
            </div>
            <Button 
              onClick={handleFinalize}
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? "Finalizing..." : "Finalize Resume"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
