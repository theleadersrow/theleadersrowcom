import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Check, X, Edit3, Save, RotateCcw,
  ChevronDown, ChevronUp, Sparkles, FileText, Briefcase,
  Copy, Eye, EyeOff
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormattedResumeDisplay } from "./FormattedResumeDisplay";
import { toast } from "sonner";
// Role-level status model
type RoleStatus = "draft" | "ai_reviewed" | "optimized" | "locked";

interface ResumeSection {
  id: string;
  title: string;
  originalContent: string;
  improvedContent: string;
  status: "pending" | "accepted" | "declined" | "edited";
  editedContent?: string;
  isRole?: boolean;
  parentSection?: string;
  roleData?: RoleData;
  roleStatus?: RoleStatus;
}

// AI Recommendation types
interface AISuggestion {
  id: string;
  type: "impact_gap" | "language_seniority" | "keyword_optimization" | "clarity_redundancy";
  bulletIndex?: number;
  suggestion: string;
  accepted: boolean;
}

// Structured role data model - each role is an atomic unit
interface RoleData {
  roleId: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  aiSuggestions: AISuggestion[];
  roleSummary?: string;
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

// Parse individual roles from experience content into structured RoleData
function parseRolesFromExperience(experienceContent: string): { title: string; content: string; roleData: RoleData }[] {
  const roles: { title: string; content: string; roleData: RoleData }[] = [];
  const lines = experienceContent.split('\n');
  
  const companyIndicators = ['Apple', 'RBC', 'Charles Schwab', 'Morgan Stanley', 'TD Bank', 'Apex', 'AKG', 'Inc.', 'LLC', 'Corp', 'Ltd', 'Company', 'Bank', 'Technologies', 'Solutions', 'Group'];
  const roleTitlePatterns = [
    /^(Head of|Director of|VP of|Chief|President|Principal|Senior|Staff|Lead|Manager|Engineer|Designer|Analyst|Consultant)\s/i,
    /\s(Manager|Director|Lead|Engineer|Designer|Analyst|Specialist|Consultant|VP|President|Officer|Head|Chief)$/i,
  ];
  
  let currentRole: { 
    title: string; 
    company: string; 
    location: string;
    dates: string;
    lines: string[];
    bullets: string[];
  } | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const rawLine = lines[i];
    const nextLine = lines[i + 1]?.trim() || '';
    const nextNextLine = lines[i + 2]?.trim() || '';
    
    if (!line && !currentRole) continue;
    
    const isBullet = /^[•\-\*]\s/.test(line);
    
    const isLikelyRoleTitle = !isBullet && line.length > 3 && line.length < 100 && (
      roleTitlePatterns.some(p => p.test(line)) ||
      /^\*\*[^*]+\*\*$/.test(line) ||
      (/^[A-Z][a-zA-Z\s,&]+$/.test(line) && (
        companyIndicators.some(c => nextLine.includes(c)) ||
        /\d{1,2}\/\d{4}|Present|Current|\d{4}\s*[–\-]/.test(nextLine) ||
        /\d{1,2}\/\d{4}|Present|Current|\d{4}\s*[–\-]/.test(nextNextLine)
      ))
    );
    
    const hasFollowingMetadata = (
      !nextLine.startsWith('•') && !nextLine.startsWith('-') && !nextLine.startsWith('*') &&
      (companyIndicators.some(c => nextLine.includes(c)) ||
       /\d{1,2}\/\d{4}|Present|Current|[A-Z][a-z]{2}\s+\d{4}/.test(nextLine) ||
       /\|/.test(nextLine))
    );
    
    if (isLikelyRoleTitle && (hasFollowingMetadata || !currentRole || currentRole.bullets.length > 0)) {
      // Save previous role
      if (currentRole && (currentRole.lines.length > 0 || currentRole.bullets.length > 0)) {
        roles.push(buildRoleObject(currentRole, roles.length));
      }
      
      // Extract company, location, dates from next lines
      let company = '', location = '', dates = '';
      if (hasFollowingMetadata) {
        const parsed = parseMetadataLine(nextLine);
        company = parsed.company;
        location = parsed.location;
        dates = parsed.dates;
      }
      
      currentRole = {
        title: line.replace(/^\*\*|\*\*$/g, '').trim(),
        company, location, dates,
        lines: [rawLine],
        bullets: []
      };
    } else if (currentRole) {
      currentRole.lines.push(rawLine);
      
      if (isBullet) {
        currentRole.bullets.push(line.replace(/^[•\-\*]\s*/, ''));
      } else if (!currentRole.company && line.length < 80) {
        const parsed = parseMetadataLine(line);
        if (parsed.company) currentRole.company = parsed.company;
        if (parsed.location && !currentRole.location) currentRole.location = parsed.location;
        if (parsed.dates && !currentRole.dates) currentRole.dates = parsed.dates;
      }
    } else {
      currentRole = {
        title: line.replace(/^\*\*|\*\*$/g, '').trim() || 'Role',
        company: '', location: '', dates: '',
        lines: [rawLine],
        bullets: []
      };
    }
  }
  
  if (currentRole && (currentRole.lines.length > 0 || currentRole.bullets.length > 0)) {
    roles.push(buildRoleObject(currentRole, roles.length));
  }
  
  if (roles.length === 0) {
    return [{
      title: 'All Experience',
      content: experienceContent.trim(),
      roleData: {
        roleId: 'role-0',
        title: 'Experience',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: experienceContent.split('\n').filter(l => /^[•\-\*]\s/.test(l.trim())).map(l => l.replace(/^[•\-\*]\s*/, '')),
        aiSuggestions: []
      }
    }];
  }
  
  return roles;
}

// Parse company | location | dates from a metadata line
function parseMetadataLine(line: string): { company: string; location: string; dates: string } {
  const result = { company: '', location: '', dates: '' };
  const cleaned = line.replace(/^\*\*|\*\*$/g, '').trim();
  
  // Extract dates first
  const dateMatch = cleaned.match(/([A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})\s*[–\-]\s*(Present|Current|[A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})/i);
  if (dateMatch) {
    result.dates = dateMatch[0];
  }
  
  // Extract location (City, ST format)
  const locMatch = cleaned.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?,?\s*[A-Z]{2})\s*(?:\||$)/);
  if (locMatch) {
    result.location = locMatch[1].trim();
  }
  
  // Company is everything before the pipe/location/dates
  const parts = cleaned.split(/\s*\|\s*/);
  if (parts[0]) {
    result.company = parts[0].replace(result.dates, '').replace(result.location, '').replace(/[,\s]+$/, '').trim();
  }
  
  return result;
}

// Build structured role object
function buildRoleObject(role: { 
  title: string; 
  company: string; 
  location: string; 
  dates: string; 
  lines: string[]; 
  bullets: string[] 
}, index: number): { title: string; content: string; roleData: RoleData } {
  // Parse start/end dates
  let startDate = '', endDate = '';
  const dateMatch = role.dates.match(/([A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})\s*[–\-]\s*(Present|Current|[A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})/i);
  if (dateMatch) {
    startDate = dateMatch[1];
    endDate = dateMatch[2];
  }
  
  // Generate AI suggestions based on role-level analysis
  const aiSuggestions = generateRoleSuggestions(role.title, role.company, role.bullets);
  const roleSummary = generateRoleSummary(role.title, role.bullets);
  
  const displayTitle = role.title;
  
  return {
    title: displayTitle,
    content: role.lines.join('\n').trim(),
    roleData: {
      roleId: `role-${index}`,
      title: role.title,
      company: role.company,
      location: role.location,
      startDate,
      endDate,
      responsibilities: role.bullets,
      aiSuggestions,
      roleSummary
    }
  };
}

// Generate role-level summary based on analysis
function generateRoleSummary(title: string, bullets: string[]): string {
  const isLeadership = /head|director|vp|chief|lead|manager/i.test(title);
  const bulletCount = bullets.length;
  const metricsCount = bullets.filter(b => /\d+%|\$\d+|\d+x|\d+\s*(million|billion|k|M|B)/i.test(b)).length;
  
  if (isLeadership && metricsCount < bulletCount * 0.5) {
    return `This ${title} role is missing scope metrics expected for a leadership position`;
  }
  if (bulletCount > 5 && metricsCount < 2) {
    return "Consider adding quantifiable impact to strengthen this role's presentation";
  }
  return "";
}

// Generate AI suggestions for a role based on role-level analysis
function generateRoleSuggestions(title: string, company: string, bullets: string[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  let suggestionId = 0;
  
  const isLeadership = /head|director|vp|chief|president/i.test(title);
  const isManager = /manager|lead/i.test(title);
  
  // Analyze each bullet for specific issues
  bullets.forEach((bullet, index) => {
    // Impact Gaps - Check for missing metrics
    const hasMetric = /\d+%|\$\d+|\d+x|\d+\s*(million|billion|k|M|B)/i.test(bullet);
    if (!hasMetric && bullet.length > 40) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: "impact_gap",
        bulletIndex: index,
        suggestion: `Bullet #${index + 1}: Add quantifiable impact (e.g., %, $, team size)`,
        accepted: false
      });
    }
    
    // Language & Seniority - Check for weak verbs
    const weakVerbs = ['helped', 'worked on', 'was responsible for', 'assisted', 'supported'];
    if (weakVerbs.some(v => bullet.toLowerCase().startsWith(v))) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: "language_seniority",
        bulletIndex: index,
        suggestion: `Bullet #${index + 1}: Replace weak verb with action verb (Led, Drove, Spearheaded)`,
        accepted: false
      });
    }
    
    // Clarity / Redundancy - Check for overly long bullets
    if (bullet.length > 200) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: "clarity_redundancy",
        bulletIndex: index,
        suggestion: `Bullet #${index + 1}: Consider splitting into focused statements`,
        accepted: false
      });
    }
  });
  
  // Role-level suggestions
  if (isLeadership) {
    const hasPeopleMetrics = bullets.some(b => /team|direct report|managed \d+|led \d+/i.test(b));
    if (!hasPeopleMetrics) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: "impact_gap",
        suggestion: "Add people leadership scale (team size, direct reports)",
        accepted: false
      });
    }
    
    const hasStrategyLanguage = bullets.some(b => /strategy|roadmap|vision|architecture/i.test(b));
    if (!hasStrategyLanguage) {
      suggestions.push({
        id: `sug-${suggestionId++}`,
        type: "language_seniority",
        suggestion: "Elevate tactical bullets with strategy framing",
        accepted: false
      });
    }
  }
  
  // Keyword Optimization
  const industryKeywords = ['payment', 'billing', 'revenue', 'monetization', 'fintech', 'saas', 'b2b', 'enterprise'];
  const hasIndustryKeywords = bullets.some(b => industryKeywords.some(k => b.toLowerCase().includes(k)));
  if (!hasIndustryKeywords && bullets.length > 0) {
    suggestions.push({
      id: `sug-${suggestionId++}`,
      type: "keyword_optimization",
      suggestion: "Add industry-specific keywords for ATS optimization",
      accepted: false
    });
  }
  
  return suggestions;
}

function parseResumeIntoSections(resumeText: string, splitExperience: boolean = false): { 
  title: string; 
  content: string; 
  isRole?: boolean; 
  parentSection?: string;
  roleData?: RoleData;
}[] {
  const sections: { title: string; content: string; isRole?: boolean; parentSection?: string; roleData?: RoleData }[] = [];
  
  const sectionPatterns = [
    { pattern: /^(SUMMARY|PROFESSIONAL SUMMARY|EXECUTIVE SUMMARY|PROFILE)\s*$/im, name: "SUMMARY" },
    { pattern: /^(KEY ACHIEVEMENTS|ACHIEVEMENTS|ACCOMPLISHMENTS)\s*$/im, name: "KEY ACHIEVEMENTS" },
    { pattern: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)\s*$/im, name: "EXPERIENCE" },
    { pattern: /^(EDUCATION|ACADEMIC BACKGROUND|EDUCATIONAL BACKGROUND)\s*$/im, name: "EDUCATION" },
    { pattern: /^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|KEY SKILLS)\s*$/im, name: "SKILLS" },
    { pattern: /^(INDUSTRY EXPERTISE|AREAS OF EXPERTISE|EXPERTISE)\s*$/im, name: "INDUSTRY EXPERTISE" },
    { pattern: /^(CERTIFICATIONS|LICENSES|CREDENTIALS|CERTIFICATES)\s*$/im, name: "CERTIFICATIONS" },
    { pattern: /^(PROJECTS|KEY PROJECTS|NOTABLE PROJECTS)\s*$/im, name: "PROJECTS" },
    { pattern: /^(LANGUAGES)\s*$/im, name: "LANGUAGES" },
    { pattern: /^(AWARDS|HONORS)\s*$/im, name: "AWARDS" },
    { pattern: /^(PUBLICATIONS)\s*$/im, name: "PUBLICATIONS" },
    { pattern: /^(VOLUNTEER|VOLUNTEERING|VOLUNTEER EXPERIENCE)\s*$/im, name: "VOLUNTEER" },
  ];

  const lines = resumeText.split('\n');
  const sectionBoundaries: { lineIndex: number; title: string }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    for (const { pattern, name } of sectionPatterns) {
      if (pattern.test(line)) {
        sectionBoundaries.push({ lineIndex: i, title: name });
        break;
      }
    }
  }
  
  if (sectionBoundaries.length === 0) {
    return [{ title: "HEADER", content: resumeText }];
  }
  
  if (sectionBoundaries[0].lineIndex > 0) {
    const headerContent = lines.slice(0, sectionBoundaries[0].lineIndex).join('\n').trim();
    if (headerContent) {
      sections.push({ title: "HEADER", content: headerContent });
    }
  }
  
  for (let i = 0; i < sectionBoundaries.length; i++) {
    const startLine = sectionBoundaries[i].lineIndex + 1;
    const endLine = i < sectionBoundaries.length - 1 
      ? sectionBoundaries[i + 1].lineIndex 
      : lines.length;
    
    const sectionContent = lines.slice(startLine, endLine).join('\n').trim();
    const sectionTitle = sectionBoundaries[i].title;
    
    if (splitExperience && sectionTitle === "EXPERIENCE") {
      sections.push({ 
        title: "EXPERIENCE", 
        content: "",
        isRole: false
      });
      
      const roles = parseRolesFromExperience(sectionContent);
      roles.forEach((role) => {
        sections.push({
          title: role.title,
          content: role.content,
          isRole: true,
          parentSection: "EXPERIENCE",
          roleData: role.roleData
        });
      });
    } else {
      sections.push({ title: sectionTitle, content: sectionContent });
    }
  }
  
  return sections;
}

// Helper component to format individual section content
function FormattedSectionContent({ 
  title, 
  content, 
  isRole 
}: { 
  title: string; 
  content: string; 
  isRole?: boolean;
}) {
  if (!content.trim()) return <span className="text-muted-foreground">(No content)</span>;
  
  // For experience roles, format as role block
  if (isRole) {
    return <RoleBlockDisplay content={content} />;
  }
  
  // For achievements section
  if (title.includes("ACHIEVEMENT")) {
    return <AchievementsDisplay content={content} />;
  }
  
  // For skills section
  if (title.includes("SKILL") || title.includes("EXPERTISE") || title.includes("COMPETENC")) {
    const skills = content.split(/\s*[\|•]\s*/).filter(s => s.trim());
    return (
      <p className="text-sm text-foreground/90">
        {skills.join(' • ')}
      </p>
    );
  }
  
  // Default: format with metrics bolded
  return (
    <div className="text-sm leading-relaxed">
      {formatContentWithMetrics(content)}
    </div>
  );
}

// Format role block content - complete atomic unit
function RoleBlockDisplay({ content }: { content: string }) {
  const lines = content.split('\n').filter(l => l.trim());
  const bullets: string[] = [];
  const headerLines: string[] = [];
  
  // Separate header metadata from bullets
  let foundBullets = false;
  lines.forEach(line => {
    const trimmed = line.trim();
    if (/^[•\-\*]\s/.test(trimmed)) {
      foundBullets = true;
      bullets.push(trimmed.replace(/^[•\-\*]\s*/, ''));
    } else if (!foundBullets) {
      headerLines.push(trimmed);
    }
  });
  
  // Parse header info: title, company, location, dates
  const roleInfo = parseRoleHeader(headerLines);
  
  return (
    <div className="text-sm space-y-3">
      {/* Role Header - Combined format */}
      <div className="border-b border-border/50 pb-2">
        <div className="font-bold text-foreground text-base">
          {roleInfo.title}
          {roleInfo.company && (
            <span className="font-normal text-foreground/80">
              {' — '}{roleInfo.company}
              {roleInfo.location && <span> in {roleInfo.location}</span>}
            </span>
          )}
        </div>
        {roleInfo.dates && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {roleInfo.dates}
          </div>
        )}
      </div>
      
      {/* Bullets - Key responsibilities/achievements */}
      {bullets.length > 0 && (
        <ul className="space-y-2">
          {bullets.map((bullet, i) => (
            <li 
              key={i} 
              className="text-foreground/90 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary"
            >
              {formatContentWithMetrics(bullet)}
            </li>
          ))}
        </ul>
      )}
      
      {bullets.length === 0 && headerLines.length <= 3 && (
        <p className="text-muted-foreground text-xs italic">No bullet points in this role</p>
      )}
    </div>
  );
}

// Parse role header lines into structured info
function parseRoleHeader(lines: string[]): { title: string; company: string; location: string; dates: string } {
  const result = { title: '', company: '', location: '', dates: '' };
  
  if (lines.length === 0) return result;
  
  // First line is usually the title
  result.title = lines[0].replace(/^\*\*|\*\*$/g, '').trim();
  
  // Look through remaining lines for company, location, dates
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/^\*\*|\*\*$/g, '').trim();
    
    // Extract dates
    const dateMatch = line.match(/([A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})\s*[–\-]\s*(Present|Current|[A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})/i);
    if (dateMatch && !result.dates) {
      result.dates = dateMatch[0];
    }
    
    // Extract location (City, ST format)
    const locMatch = line.match(/([A-Z][a-z]+,?\s*[A-Z]{2})\s*$/);
    if (locMatch && !result.location) {
      result.location = locMatch[1];
    }
    
    // Company is typically line 2 (before any pipe separator)
    if (i === 1 && !result.company) {
      const companyPart = line.split('|')[0].trim();
      // Don't use date-only lines as company
      if (!dateMatch || companyPart !== dateMatch[0]) {
        result.company = companyPart.replace(result.location, '').replace(/,\s*$/, '').trim();
      }
    }
  }
  
  return result;
}

// Format achievements section
function AchievementsDisplay({ content }: { content: string }) {
  const lines = content.split('\n').filter(l => l.trim());
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const cleaned = line.replace(/^[•\-\*]\s*/, '');
        // Look for headline: description pattern
        const match = cleaned.match(/^([^:–—]+)[:\–—]\s*(.+)/);
        
        if (match) {
          return (
            <div key={i} className="text-sm">
              <span className="font-semibold">{match[1].replace(/\*\*/g, '')}</span>
              <span className="text-foreground/80"> — {formatContentWithMetrics(match[2])}</span>
            </div>
          );
        }
        
        return (
          <div key={i} className="text-sm text-foreground/90">
            {formatContentWithMetrics(cleaned)}
          </div>
        );
      })}
    </div>
  );
}

// Helper to format text with **bold** metrics
function formatContentWithMetrics(text: string): React.ReactNode {
  if (!text.includes('**')) return text;
  
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-primary">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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
  const [showPreview, setShowPreview] = useState(false);

  const handleCopySection = (content: string, sectionTitle: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success(`${sectionTitle} copied to clipboard`);
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const getPreviewContent = () => {
    const finalParts: string[] = [];
    let inExperienceSection = false;
    
    sections.forEach(section => {
      if (section.title === "EXPERIENCE" && !section.isRole) {
        finalParts.push("EXPERIENCE");
        inExperienceSection = true;
        return;
      }
      
      let content = "";
      if (section.status === "accepted" || section.status === "edited") {
        content = section.editedContent || section.improvedContent;
      } else if (section.status === "declined") {
        content = section.originalContent;
      } else {
        content = section.improvedContent;
      }
      
      if (section.isRole) {
        finalParts.push(content.trim());
      } else {
        if (section.title !== "HEADER" && section.title !== "EXPERIENCE") {
          inExperienceSection = false;
          finalParts.push(section.title);
        }
        finalParts.push(content.trim());
      }
    });
    
    return finalParts.join('\n\n');
  };

  useEffect(() => {
    // Parse both resumes into sections - split experience into individual roles
    const originalSections = parseResumeIntoSections(originalResume, true);
    const enhancedSections = parseResumeIntoSections(enhancedContent, true);
    
    // Match sections between original and enhanced
    const reviewSections: ResumeSection[] = enhancedSections.map((enhanced, index) => {
      // Find matching original section (for roles, try to match by similar title)
      let matchingOriginal = originalSections.find(orig => {
        if (enhanced.isRole && orig.isRole) {
          // For roles, do a fuzzy match on company/title
          const enhancedWords = enhanced.title.toLowerCase().split(/\s+/);
          const origWords = orig.title.toLowerCase().split(/\s+/);
          return enhancedWords.some(w => w.length > 3 && origWords.includes(w));
        }
        return orig.title === enhanced.title || 
          orig.title.includes(enhanced.title.split(' ')[0]) ||
          enhanced.title.includes(orig.title.split(' ')[0]);
      });
      
      // Fallback to index-based matching for roles
      if (!matchingOriginal && enhanced.isRole) {
        const enhancedRoleIndex = enhancedSections.filter((s, i) => s.isRole && i <= index).length - 1;
        const originalRoles = originalSections.filter(s => s.isRole);
        matchingOriginal = originalRoles[enhancedRoleIndex];
      }
      
      if (!matchingOriginal) {
        matchingOriginal = originalSections[index];
      }
      
      return {
        id: `section-${index}`,
        title: enhanced.title || `Section ${index + 1}`,
        originalContent: matchingOriginal?.content || "",
        improvedContent: enhanced.content,
        status: "pending" as const,
        isRole: enhanced.isRole,
        parentSection: enhanced.parentSection,
      };
    });
    
    setSections(reviewSections);
    // Expand first non-header section by default
    const firstExpandable = reviewSections.find(s => s.title !== "HEADER" && !s.isRole);
    if (firstExpandable) {
      setExpandedSection(firstExpandable.id);
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
      s.id === sectionId ? { 
        ...s, 
        status: "edited" as const,
        // Update improvedContent to the edited content so it shows as the new AI version
        improvedContent: s.editedContent || s.improvedContent
      } : s
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
    
    // Track if we're inside an experience section to group roles properly
    let inExperienceSection = false;
    
    sections.forEach(section => {
      // Skip the EXPERIENCE group header (it has no content, just groups roles)
      if (section.title === "EXPERIENCE" && !section.isRole) {
        finalParts.push("EXPERIENCE");
        inExperienceSection = true;
        return;
      }
      
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
      
      // For roles, don't add the section title (it's already in content)
      if (section.isRole) {
        finalParts.push(content.trim());
      } else {
        if (section.title !== "HEADER" && section.title !== "EXPERIENCE") {
          inExperienceSection = false;
          finalParts.push(section.title);
        }
        finalParts.push(content.trim());
      }
    });
    
    onFinalize(finalParts.join('\n\n'), acceptedSectionTitles);
  };

  // Role status badge (new status model)
  const getRoleStatusBadge = (section: ResumeSection) => {
    if (section.status === "accepted") {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Optimized</Badge>;
    }
    if (section.status === "edited") {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Optimized</Badge>;
    }
    if (section.status === "declined") {
      return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">Locked</Badge>;
    }
    // For roles with AI suggestions, show "AI Reviewed"
    if (section.roleData?.aiSuggestions && section.roleData.aiSuggestions.length > 0) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">AI Reviewed</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  const getStatusBadge = (status: ResumeSection["status"]) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Optimized</Badge>;
      case "declined":
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300">Locked</Badge>;
      case "edited":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Optimized</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  // Count only sections that have content (exclude EXPERIENCE group header)
  const editableSections = sections.filter(s => s.title !== "EXPERIENCE" || s.isRole);
  const acceptedCount = editableSections.filter(s => s.status === "accepted" || s.status === "edited").length;
  const totalCount = editableSections.length;
  
  // Group sections for rendering
  const renderSections = () => {
    const result: JSX.Element[] = [];
    let i = 0;
    
    while (i < sections.length) {
      const section = sections[i];
      
      // Check if this is the EXPERIENCE group header
      if (section.title === "EXPERIENCE" && !section.isRole) {
        // Collect all roles that follow
        const roles: ResumeSection[] = [];
        let j = i + 1;
        while (j < sections.length && sections[j].isRole) {
          roles.push(sections[j]);
          j++;
        }
        
        // Render the experience group
        result.push(
          <div key={section.id} className="space-y-3">
            {/* Experience Group Header */}
            <div className="flex items-center gap-2 px-2 pt-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg text-foreground">EXPERIENCE</h3>
              <Badge variant="outline" className="ml-2">{roles.length} roles</Badge>
            </div>
            
            {/* Individual Roles */}
            <div className="space-y-3 pl-2 border-l-2 border-primary/20 ml-2">
              {roles.map((role) => renderSectionCard(role, true))}
            </div>
          </div>
        );
        
        i = j; // Skip past all the roles we just rendered
      } else if (!section.isRole) {
        // Regular section (not a role)
        result.push(renderSectionCard(section, false));
        i++;
      } else {
        // Orphan role (shouldn't happen, but handle gracefully)
        result.push(renderSectionCard(section, true));
        i++;
      }
    }
    
    return result;
  };
  
  const renderSectionCard = (section: ResumeSection, isRole: boolean) => {
    const roleData = section.roleData;
    
    // For roles, render special role card
    if (isRole && roleData) {
      return renderRoleCard(section, roleData);
    }
    
    // For non-role sections, render standard card
    return (
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
                <span className="font-semibold text-foreground text-left">
                  {section.title}
                </span>
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
              {editingSection !== section.id && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      Original
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-sm max-h-[300px] overflow-y-auto">
                      <div className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                        {section.originalContent.trim() || "(No content)"}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Optimized
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleCopySection(section.improvedContent, section.title)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                      {section.title === "HEADER" ? (
                        <FormattedResumeDisplay content={section.improvedContent} />
                      ) : (
                        <FormattedSectionContent 
                          title={section.title} 
                          content={section.improvedContent} 
                          isRole={section.isRole}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {editingSection === section.id && renderEditMode(section)}
              {renderActionButtons(section)}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };
  
  // Render role card with structured data
  const renderRoleCard = (section: ResumeSection, roleData: RoleData) => {
    const isExpanded = expandedSection === section.id;
    const dateRange = roleData.startDate && roleData.endDate 
      ? `${roleData.startDate} – ${roleData.endDate}` 
      : roleData.startDate || '';
    
    const metaLine = [roleData.company, roleData.location, dateRange]
      .filter(Boolean)
      .join(' • ');
    
    return (
      <Collapsible 
        key={section.id}
        open={isExpanded}
        onOpenChange={(open) => setExpandedSection(open ? section.id : null)}
      >
        <Card className={`overflow-hidden transition-all ${
          section.status === "accepted" ? "border-green-500/50" :
          section.status === "declined" ? "border-red-500/30" :
          section.status === "edited" ? "border-blue-500/50" : ""
        }`}>
          {/* Collapsed View - Role Header */}
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-primary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-foreground">
                    {roleData.title}
                  </span>
                  {metaLine && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {metaLine}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getRoleStatusBadge(section)}
                {section.status !== "pending" && section.status !== "declined" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetSection(section.id);
                    }}
                    className="text-muted-foreground"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleTrigger>
          
          {/* Expanded View - Full Role Details */}
          <CollapsibleContent>
            <div className="border-t p-4 space-y-4">
              {editingSection !== section.id ? (
                <>
                  {/* Responsibilities & Impact */}
                  <div>
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Responsibilities & Impact
                    </h4>
                    {roleData.responsibilities.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                        {roleData.responsibilities.map((resp, i) => (
                          <li key={i} className="text-foreground/90 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary">
                            {formatContentWithMetrics(resp)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No bullet points found</p>
                    )}
                  </div>
                  
                  {/* AI Suggestions for This Role - Grouped by Type */}
                  {roleData.aiSuggestions.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          AI Suggestions for This Role
                        </h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs text-amber-700 hover:text-amber-900"
                          onClick={() => handleAcceptAllSuggestions(section.id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Accept All
                        </Button>
                      </div>
                      
                      {roleData.roleSummary && (
                        <p className="text-sm text-amber-900 dark:text-amber-200 italic border-l-2 border-amber-400 pl-3">
                          {roleData.roleSummary}
                        </p>
                      )}
                      
                      {/* Impact Gaps */}
                      {renderSuggestionGroup(roleData.aiSuggestions, "impact_gap", "Impact Gaps", section.id)}
                      
                      {/* Language & Seniority */}
                      {renderSuggestionGroup(roleData.aiSuggestions, "language_seniority", "Language & Seniority", section.id)}
                      
                      {/* Keyword Optimization */}
                      {renderSuggestionGroup(roleData.aiSuggestions, "keyword_optimization", "Keyword Optimization", section.id)}
                      
                      {/* Clarity / Redundancy */}
                      {renderSuggestionGroup(roleData.aiSuggestions, "clarity_redundancy", "Clarity / Redundancy", section.id)}
                    </div>
                  )}
                  
                  {/* Compare Original vs Improved */}
                  <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Original
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3 text-sm max-h-[200px] overflow-y-auto">
                        <div className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                          {section.originalContent.trim() || "(No content)"}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-primary mb-2 uppercase tracking-wider flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Optimized
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleCopySection(section.improvedContent, section.title)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm max-h-[200px] overflow-y-auto">
                        <FormattedSectionContent 
                          title={section.title} 
                          content={section.improvedContent} 
                          isRole={true}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                renderEditMode(section)
              )}
              
              {renderActionButtons(section)}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };
  
  // Render suggestion group by type
  const renderSuggestionGroup = (
    suggestions: AISuggestion[], 
    type: AISuggestion['type'], 
    label: string,
    sectionId: string
  ) => {
    const filtered = suggestions.filter(s => s.type === type);
    if (filtered.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-amber-700 dark:text-amber-400">{label}</h5>
        <ul className="space-y-1.5">
          {filtered.map((sug) => (
            <li key={sug.id} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200">
              <button
                onClick={() => handleToggleSuggestion(sectionId, sug.id)}
                className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                  sug.accepted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-amber-400 hover:border-amber-600'
                }`}
              >
                {sug.accepted && <Check className="w-3 h-3" />}
              </button>
              <span className={sug.accepted ? 'line-through opacity-60' : ''}>
                {sug.suggestion}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Handle accepting all suggestions for a role
  const handleAcceptAllSuggestions = (sectionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId && s.roleData) {
        return {
          ...s,
          roleData: {
            ...s.roleData,
            aiSuggestions: s.roleData.aiSuggestions.map(sug => ({ ...sug, accepted: true }))
          }
        };
      }
      return s;
    }));
  };
  
  // Handle toggling individual suggestion
  const handleToggleSuggestion = (sectionId: string, suggestionId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId && s.roleData) {
        return {
          ...s,
          roleData: {
            ...s.roleData,
            aiSuggestions: s.roleData.aiSuggestions.map(sug => 
              sug.id === suggestionId ? { ...sug, accepted: !sug.accepted } : sug
            )
          }
        };
      }
      return s;
    }));
  };
  
  // Edit mode component
  const renderEditMode = (section: ResumeSection) => (
    <div>
      <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider flex items-center gap-1">
        <Edit3 className="w-3 h-3" />
        Edit Content
      </div>
      <Textarea
        value={section.editedContent || section.improvedContent}
        onChange={(e) => handleEditChange(section.id, e.target.value)}
        className="min-h-[200px] font-mono text-sm"
        placeholder="Edit the content here."
      />
      <p className="text-xs text-muted-foreground mt-2">
        Changes will be saved as your custom version.
      </p>
    </div>
  );
  
  // Action buttons component
  const renderActionButtons = (section: ResumeSection) => (
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
  );

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
              style={{ width: `${(editableSections.filter(s => s.status !== "pending").length / Math.max(totalCount, 1)) * 100}%` }}
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

        {/* Preview Toggle */}
        <div className="mb-6">
          <Button
            variant={showPreview ? "default" : "outline"}
            onClick={() => setShowPreview(!showPreview)}
            className="w-full"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Full Resume Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Full Resume Preview
              </>
            )}
          </Button>
        </div>

        {/* Full Preview Mode */}
        {showPreview && (
          <Card className="p-6 mb-6 bg-background border-2 border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Complete Resume Preview
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopySection(getPreviewContent(), "Full Resume")}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy All
              </Button>
            </div>
            <div className="border rounded-lg p-6 bg-white dark:bg-slate-900 max-h-[600px] overflow-y-auto">
              <FormattedResumeDisplay content={getPreviewContent()} />
            </div>
          </Card>
        )}

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {renderSections()}
        </div>

        {/* Finalize Button */}
        <div className="sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {editableSections.filter(s => s.status === "pending").length > 0 ? (
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

        {/* Coaching CTA */}
        <Card className="p-6 mt-8 mb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Ready to Take Your Career to the Next Level?
            </h3>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              If you're looking for further coaching on getting to the next level and bringing the best out of you — let's talk.
            </p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.open('/book-call', '_blank')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Setup a Discovery Call
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
