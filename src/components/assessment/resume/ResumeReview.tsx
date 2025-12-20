import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Check, X, Edit3, Save, RotateCcw,
  ChevronDown, ChevronUp, Sparkles, FileText, Briefcase,
  Copy, Eye, EyeOff, ArrowRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FormattedResumeDisplay } from "./FormattedResumeDisplay";
import { RoleOptimizationModal, RoleData, AISuggestion, RoleStatus } from "./RoleOptimizationModal";
import { SectionOptimizationModal } from "./SectionOptimizationModal";
import { RealTimeATSScore } from "./RealTimeATSScore";
import { toast } from "sonner";

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
  onFinalize: (finalResume: string, acceptedSections: string[], calculatedATSScore: number) => void;
  isGenerating?: boolean;
  originalATSScore?: number; // Backend-calculated ATS score to use as baseline
}

// Role title patterns that indicate a new role is starting
const ROLE_TITLE_PATTERNS = [
  /^(Head of|Director of|VP of|Vice President|Chief|President|Principal|Senior|Staff|Lead|Manager|Engineer|Designer|Analyst|Consultant|Architect|Specialist|Coordinator|Administrator|Executive|Officer)\s/i,
  /\s(Manager|Director|Lead|Engineer|Designer|Analyst|Specialist|Consultant|VP|President|Officer|Head|Chief|Architect|Coordinator|Administrator)$/i,
  /^(CEO|CTO|CFO|COO|CMO|CIO|CISO|CDO|CPO)\b/i,
  /Product\s+(Manager|Lead|Director|Owner)/i,
  /Engineering\s+(Manager|Lead|Director)/i,
  /\bManager\s*,/i,
];

// Patterns that indicate a line is a company name
const COMPANY_PATTERNS = [
  /\b(Inc\.|LLC|Corp\.|Ltd\.|Company|Corporation|Technologies|Solutions|Group|Partners|Consulting|Services|Labs|Studio|Media|Software|Systems|Enterprises|Holdings|Ventures|Capital|Bank|Insurance|Healthcare|Pharma|Biotech|University|College|Institute)\b/i,
];

// Known major companies (expand as needed)
const KNOWN_COMPANIES = [
  'Apple', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Tesla', 'Nvidia',
  'RBC', 'TD Bank', 'Charles Schwab', 'Morgan Stanley', 'Goldman Sachs', 'JPMorgan',
  'Salesforce', 'Oracle', 'IBM', 'Cisco', 'Intel', 'Adobe', 'Uber', 'Lyft', 'Airbnb',
  'Stripe', 'Square', 'PayPal', 'Visa', 'Mastercard', 'American Express',
  'Deloitte', 'McKinsey', 'BCG', 'Bain', 'Accenture', 'PwC', 'EY', 'KPMG',
  'Apex', 'AKG', 'Finnovation Labs',
];

// Date patterns
const DATE_PATTERN = /(\d{1,2}\/\d{4}|[A-Z][a-z]{2,8}\s+\d{4}|\d{4})\s*[–\-—to]+\s*(Present|Current|\d{1,2}\/\d{4}|[A-Z][a-z]{2,8}\s+\d{4}|\d{4})/i;

// Location patterns (City, ST or City, State or Remote)
const LOCATION_PATTERN = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2}|Remote|Hybrid)/;

/**
 * Determines if a line is likely a role/job title
 */
function isRoleTitle(line: string): boolean {
  const cleaned = line.replace(/^\*\*|\*\*$/g, '').trim();
  if (!cleaned || cleaned.length < 5 || cleaned.length > 120) return false;
  
  // Definitely not a title if it's a bullet
  if (/^[•\-\*]\s/.test(cleaned)) return false;
  
  // Definitely not a title if it contains dates (that's a metadata line)
  if (DATE_PATTERN.test(cleaned)) return false;
  
  // Check against role patterns
  return ROLE_TITLE_PATTERNS.some(p => p.test(cleaned));
}

/**
 * Determines if a line is likely a company name
 */
function isCompanyLine(line: string): boolean {
  const cleaned = line.replace(/^\*\*|\*\*$/g, '').trim();
  if (!cleaned || cleaned.length < 2 || cleaned.length > 80) return false;
  
  // Not a company if it's a bullet
  if (/^[•\-\*]\s/.test(cleaned)) return false;
  
  // Check if it's a known company
  if (KNOWN_COMPANIES.some(c => cleaned.toLowerCase().includes(c.toLowerCase()))) return true;
  
  // Check against company patterns
  if (COMPANY_PATTERNS.some(p => p.test(cleaned))) return true;
  
  // Short single-word or two-word names that don't look like roles
  if (/^[A-Z][a-zA-Z]+(\s+[A-Z][a-zA-Z]+)?$/.test(cleaned) && !isRoleTitle(cleaned)) {
    return true;
  }
  
  return false;
}

/**
 * Determines if a line contains location and/or date information
 */
function isMetadataLine(line: string): { isMetadata: boolean; location: string; dates: string } {
  const cleaned = line.replace(/^\*\*|\*\*$/g, '').trim();
  const result = { isMetadata: false, location: '', dates: '' };
  
  // Extract dates
  const dateMatch = cleaned.match(DATE_PATTERN);
  if (dateMatch) {
    result.dates = dateMatch[0];
    result.isMetadata = true;
  }
  
  // Extract location
  const locMatch = cleaned.match(LOCATION_PATTERN);
  if (locMatch) {
    result.location = locMatch[0].trim();
    result.isMetadata = true;
  }
  
  // Also check for pipe-separated format (Company | Location | Dates)
  if (/\|/.test(cleaned)) {
    result.isMetadata = true;
  }
  
  return result;
}

/**
 * Parse individual roles from experience content into structured RoleData
 * Uses a sequential "Role Builder" approach:
 * 1. Title line (role/job title)
 * 2. Company line (company name)
 * 3. Metadata line (location | dates)
 * 4. Bullet points (responsibilities)
 */
function parseRolesFromExperience(experienceContent: string): { title: string; content: string; roleData: RoleData }[] {
  const roles: { title: string; content: string; roleData: RoleData }[] = [];
  const lines = experienceContent.split('\n');
  
  interface RoleBuilder {
    title: string;
    company: string;
    location: string;
    dates: string;
    rawLines: string[];
    bullets: string[];
    phase: 'title' | 'company' | 'metadata' | 'bullets';
  }
  
  let currentRole: RoleBuilder | null = null;
  
  function finalizeRole() {
    if (!currentRole || (!currentRole.title && currentRole.bullets.length === 0)) return;
    
    // Parse start/end dates from the dates string
    let startDate = '', endDate = '';
    const dateMatch = currentRole.dates.match(DATE_PATTERN);
    if (dateMatch) {
      startDate = dateMatch[1] || '';
      endDate = dateMatch[2] || '';
    }
    
    // Generate AI suggestions based on role-level analysis
    const aiSuggestions = generateRoleSuggestions(currentRole.title, currentRole.company, currentRole.bullets);
    const roleSummary = generateRoleSummary(currentRole.title, currentRole.bullets);
    
    roles.push({
      title: currentRole.title,
      content: currentRole.rawLines.join('\n').trim(),
      roleData: {
        roleId: `role-${roles.length}`,
        title: currentRole.title,
        company: currentRole.company,
        location: currentRole.location,
        startDate,
        endDate,
        responsibilities: currentRole.bullets,
        aiSuggestions,
        roleSummary
      }
    });
    
    currentRole = null;
  }
  
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    
    // Skip empty lines when not in a role
    if (!line && !currentRole) continue;
    
    // Check if this is a bullet point
    const isBullet = /^[•\-\*]\s/.test(line);
    
    // Check if this looks like a new role title
    if (isRoleTitle(line)) {
      // Finalize any previous role before starting a new one
      finalizeRole();
      
      currentRole = {
        title: line.replace(/^\*\*|\*\*$/g, '').trim(),
        company: '',
        location: '',
        dates: '',
        rawLines: [rawLine],
        bullets: [],
        phase: 'company' // Next we expect company
      };
      continue;
    }
    
    // If we're building a role, process subsequent lines
    if (currentRole) {
      currentRole.rawLines.push(rawLine);
      
      if (isBullet) {
        // Once we hit bullets, we're in bullet phase
        currentRole.phase = 'bullets';
        currentRole.bullets.push(line.replace(/^[•\-\*]\s*/, ''));
        continue;
      }
      
      // Skip empty lines but keep them in rawLines
      if (!line) continue;
      
      // In company phase, look for company name
      if (currentRole.phase === 'company') {
        // Check if this line has dates - might be a combined metadata line
        const metaCheck = isMetadataLine(line);
        
        if (isCompanyLine(line) && !metaCheck.isMetadata) {
          // Pure company line
          currentRole.company = line.replace(/^\*\*|\*\*$/g, '').trim();
          currentRole.phase = 'metadata';
        } else if (metaCheck.isMetadata) {
          // This line has metadata (dates/location)
          // It might also have company in a pipe-separated format
          const parts = line.split(/\s*\|\s*/);
          if (parts.length >= 1) {
            // First part before pipe could be company
            const firstPart = parts[0].replace(/^\*\*|\*\*$/g, '').trim();
            if (firstPart && !DATE_PATTERN.test(firstPart) && !LOCATION_PATTERN.test(firstPart)) {
              currentRole.company = firstPart;
            }
          }
          currentRole.location = metaCheck.location;
          currentRole.dates = metaCheck.dates;
          currentRole.phase = 'bullets';
        } else {
          // Might be company on same line with metadata
          currentRole.company = line.replace(/^\*\*|\*\*$/g, '').trim();
          currentRole.phase = 'metadata';
        }
        continue;
      }
      
      // In metadata phase, look for location/dates
      if (currentRole.phase === 'metadata') {
        const metaCheck = isMetadataLine(line);
        if (metaCheck.isMetadata) {
          if (metaCheck.location) currentRole.location = metaCheck.location;
          if (metaCheck.dates) currentRole.dates = metaCheck.dates;
          
          // Also check for pipe-separated format with company
          const parts = line.split(/\s*\|\s*/);
          if (parts.length >= 1 && !currentRole.company) {
            const firstPart = parts[0].replace(/^\*\*|\*\*$/g, '').trim();
            if (firstPart && !DATE_PATTERN.test(firstPart) && !LOCATION_PATTERN.test(firstPart)) {
              currentRole.company = firstPart;
            }
          }
        }
        currentRole.phase = 'bullets';
        continue;
      }
      
      // If we're in bullets phase but get a non-bullet line, it might be a sub-header or continuation
      // Just add to rawLines but don't treat as bullet
    } else {
      // No current role and this isn't a role title
      // This might be content before any role, or the format is unexpected
      // Try to start a role if the next line has metadata
      const nextLine = lines[i + 1]?.trim() || '';
      const nextNextLine = lines[i + 2]?.trim() || '';
      
      // Check if following lines suggest this is a role start
      const nextIsMeta = isMetadataLine(nextLine).isMetadata || isCompanyLine(nextLine);
      const hasUpcomingBullets = nextLine.startsWith('•') || nextNextLine.startsWith('•');
      
      if ((nextIsMeta || hasUpcomingBullets) && line.length > 5 && line.length < 100 && !isBullet) {
        currentRole = {
          title: line.replace(/^\*\*|\*\*$/g, '').trim(),
          company: '',
          location: '',
          dates: '',
          rawLines: [rawLine],
          bullets: [],
          phase: 'company'
        };
      }
    }
  }
  
  // Finalize any remaining role
  finalizeRole();
  
  // Fallback if no roles were parsed
  if (roles.length === 0) {
    const allBullets = experienceContent
      .split('\n')
      .filter(l => /^[•\-\*]\s/.test(l.trim()))
      .map(l => l.replace(/^[•\-\*]\s*/, '').trim());
    
    return [{
      title: 'Experience',
      content: experienceContent.trim(),
      roleData: {
        roleId: 'role-0',
        title: 'Experience',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        responsibilities: allBullets,
        aiSuggestions: []
      }
    }];
  }
  
  return roles;
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
  isGenerating = false,
  originalATSScore
}: ResumeReviewProps) {
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [openRoleModal, setOpenRoleModal] = useState<string | null>(null);
  const [openSectionModal, setOpenSectionModal] = useState<string | null>(null);

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
        roleData: enhanced.roleData,
        roleStatus: enhanced.roleData ? 'draft' as RoleStatus : undefined,
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
    
    // Calculate the current ATS score based on optimizations
    // This mirrors the logic from RealTimeATSScore to ensure consistency
    const sectionsOptimized = editableSections.filter(s => s.status !== "declined").length;
    const totalSections = editableSections.length;
    
    let calculatedATSScore = originalATSScore || 70; // Default baseline
    if (originalATSScore !== undefined && totalSections > 0) {
      const optimizationProgress = sectionsOptimized / totalSections;
      const maxImprovement = 25; // Max possible improvement from optimizations
      const improvement = Math.round(optimizationProgress * maxImprovement);
      calculatedATSScore = Math.min(100, originalATSScore + improvement);
    }
    
    onFinalize(finalParts.join('\n\n'), acceptedSectionTitles, calculatedATSScore);
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
  
  // Get icon for section type
  const getSectionIcon = (title: string) => {
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes("SUMMARY") || upperTitle.includes("PROFILE")) return <FileText className="w-5 h-5 text-primary" />;
    if (upperTitle.includes("ACHIEVEMENT") || upperTitle.includes("ACCOMPLISHMENT")) return <Sparkles className="w-5 h-5 text-primary" />;
    if (upperTitle.includes("EDUCATION") || upperTitle.includes("ACADEMIC")) return <FileText className="w-5 h-5 text-primary" />;
    if (upperTitle.includes("SKILL") || upperTitle.includes("EXPERTISE") || upperTitle.includes("COMPETENC")) return <FileText className="w-5 h-5 text-primary" />;
    if (upperTitle.includes("CERTIFICATION")) return <FileText className="w-5 h-5 text-primary" />;
    if (upperTitle.includes("PROJECT")) return <FileText className="w-5 h-5 text-primary" />;
    if (upperTitle.includes("HEADER") || upperTitle === "CONTACT") return <FileText className="w-5 h-5 text-primary" />;
    return <FileText className="w-5 h-5 text-primary" />;
  };

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
        // Regular section (not a role) - render with group header
        result.push(
          <div key={section.id} className="space-y-3">
            {/* Section Group Header */}
            <div className="flex items-center gap-2 px-2 pt-4">
              {getSectionIcon(section.title)}
              <h3 className="font-semibold text-lg text-foreground">{section.title}</h3>
            </div>
            
            {/* Section Card */}
            {renderSectionCard(section, false)}
          </div>
        );
        i++;
      } else {
        // Orphan role (shouldn't happen, but handle gracefully)
        result.push(renderSectionCard(section, true));
        i++;
      }
    }
    
    return result;
  };
  
  // Helper to determine section type for the modal
  const getSectionType = (title: string): "header" | "summary" | "education" | "skills" | "achievements" | "other" => {
    const upperTitle = title.toUpperCase();
    if (upperTitle.includes("HEADER") || upperTitle === "CONTACT") return "header";
    if (upperTitle.includes("SUMMARY") || upperTitle.includes("PROFILE") || upperTitle.includes("OBJECTIVE")) return "summary";
    if (upperTitle.includes("EDUCATION") || upperTitle.includes("ACADEMIC")) return "education";
    if (upperTitle.includes("SKILL") || upperTitle.includes("EXPERTISE") || upperTitle.includes("COMPETENC") || upperTitle.includes("TECHNICAL")) return "skills";
    if (upperTitle.includes("ACHIEVEMENT") || upperTitle.includes("AWARD") || upperTitle.includes("ACCOMPLISHMENT")) return "achievements";
    return "other";
  };

  const renderSectionCard = (section: ResumeSection, isRole: boolean) => {
    const roleData = section.roleData;
    
    // For roles, render special role card
    if (isRole && roleData) {
      return renderRoleCard(section, roleData);
    }
    
    // For non-role sections, render collapsed card with Review & Optimize CTA (like roles)
    const sectionType = getSectionType(section.title);
    
    return (
      <Card 
        key={section.id}
        className={`overflow-hidden transition-all hover:shadow-md ${
          section.status === "accepted" ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10" :
          section.status === "declined" ? "border-red-500/30" :
          section.status === "edited" ? "border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/10" : ""
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                {section.title.includes("SUMMARY") ? <FileText className="w-4 h-4 text-muted-foreground" /> :
                 section.title.includes("EDUCATION") ? <FileText className="w-4 h-4 text-muted-foreground" /> :
                 <FileText className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {section.originalContent.slice(0, 60).trim()}...
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(section.status)}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpenSectionModal(section.id)}
                className="flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Review & Optimize
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Section Optimization Modal */}
        {openSectionModal === section.id && (
          <SectionOptimizationModal
            isOpen={true}
            onClose={() => setOpenSectionModal(null)}
            sectionTitle={section.title}
            sectionType={sectionType}
            originalContent={section.originalContent}
            improvedContent={section.editedContent || section.improvedContent}
            status={section.status}
            onAccept={() => {
              handleAccept(section.id);
              setOpenSectionModal(null);
            }}
            onDecline={() => {
              handleDecline(section.id);
              setOpenSectionModal(null);
            }}
            onSaveEdit={(content) => {
              handleEditChange(section.id, content);
              handleSaveEdit(section.id);
            }}
            onMarkOptimized={() => {
              handleAccept(section.id);
              toast.success(`${section.title} marked as AI Optimized`);
            }}
          />
        )}
      </Card>
    );
  };
  
  // Render role card - Collapsed view with Review & Optimize CTA
  const renderRoleCard = (section: ResumeSection, roleData: RoleData) => {
    const dateRange = roleData.startDate && roleData.endDate 
      ? `${roleData.startDate} – ${roleData.endDate}` 
      : roleData.startDate || '';
    
    const metaLine = [roleData.company, roleData.location, dateRange]
      .filter(Boolean)
      .join(' • ');
    
    const suggestionCount = roleData.aiSuggestions?.length || 0;
    const acceptedCount = roleData.aiSuggestions?.filter(s => s.accepted).length || 0;
    
    return (
      <Card 
        key={section.id}
        className={`overflow-hidden transition-all ${
          section.status === "accepted" || section.status === "edited" ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/20" :
          section.status === "declined" ? "border-slate-500/30 bg-slate-50/30 dark:bg-slate-950/20" : ""
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col items-start text-left min-w-0 flex-1">
              <span className="font-bold text-foreground truncate w-full">
                {roleData.title}
              </span>
              {metaLine && (
                <span className="text-xs text-muted-foreground mt-0.5 truncate w-full">
                  {metaLine}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Status Badge */}
            {getRoleStatusBadge(section)}
            
            {/* AI Suggestions indicator */}
            {suggestionCount > 0 && section.status === "pending" && (
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-700 dark:text-amber-400">
                <Sparkles className="w-3 h-3 mr-1" />
                {acceptedCount > 0 ? `${acceptedCount}/${suggestionCount}` : suggestionCount} suggestions
              </Badge>
            )}
            
            {/* Review & Optimize CTA */}
            <Button
              size="sm"
              variant={section.status === "pending" ? "default" : "outline"}
              onClick={() => setOpenRoleModal(section.id)}
              className={section.status === "pending" ? "bg-primary hover:bg-primary/90" : ""}
            >
              {section.status === "pending" ? (
                <>
                  Review & Optimize
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Role Optimization Modal */}
        {openRoleModal === section.id && (
          <RoleOptimizationModal
            isOpen={true}
            onClose={() => setOpenRoleModal(null)}
            roleData={roleData}
            originalContent={section.originalContent}
            improvedContent={section.improvedContent}
            status={section.status}
            onAccept={() => {
              handleAccept(section.id);
              setOpenRoleModal(null);
            }}
            onDecline={() => {
              handleDecline(section.id);
              setOpenRoleModal(null);
            }}
            onSaveEdit={(content) => {
              handleEditChange(section.id, content);
              handleSaveEdit(section.id);
            }}
            onMarkOptimized={() => {
              handleAccept(section.id);
              toast.success(`${roleData.title} marked as AI Optimized`);
            }}
            onUpdateSuggestions={(suggestions) => {
              setSections(prev => prev.map(s => {
                if (s.id === section.id && s.roleData) {
                  return {
                    ...s,
                    roleData: {
                      ...s.roleData,
                      aiSuggestions: suggestions
                    }
                  };
                }
                return s;
              }));
            }}
          />
        )}
      </Card>
    );
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

        {/* Real-Time ATS Score */}
        <div className="mb-6">
          <RealTimeATSScore
            originalResume={originalResume}
            currentContent={getPreviewContent()}
            sectionsOptimized={editableSections.filter(s => s.status === "accepted" || s.status === "edited").length}
            totalSections={totalCount}
            originalATSScore={originalATSScore}
          />
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

        {/* Instructions and Accept All */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start justify-between gap-4">
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
            {editableSections.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setSections(prev => 
                    prev.map(section => ({ ...section, status: "accepted" as const }))
                  );
                }}
                disabled={editableSections.every(s => s.status === "accepted")}
                className="flex-shrink-0"
              >
                <Check className="w-4 h-4 mr-1" />
                Accept All
              </Button>
            )}
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
