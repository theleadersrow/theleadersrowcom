import { Separator } from "@/components/ui/separator";

interface FormattedResumeDisplayProps {
  content: string;
  className?: string;
}

interface ParsedResume {
  name: string;
  title: string;
  specialization: string;
  contact: string[];
  sections: {
    type: "summary" | "achievements" | "experience" | "education" | "skills" | "other";
    title: string;
    content: string | RoleBlock[] | Achievement[] | string[];
  }[];
}

interface RoleBlock {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string[];
}

interface Achievement {
  headline: string;
  description: string;
}

function parseResumeContent(content: string): ParsedResume {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const result: ParsedResume = {
    name: "",
    title: "",
    specialization: "",
    contact: [],
    sections: []
  };

  // Parse header (first few lines before SUMMARY)
  let headerEndIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];
    if (/^(SUMMARY|PROFESSIONAL SUMMARY|EXECUTIVE SUMMARY)$/i.test(line)) {
      headerEndIndex = i;
      break;
    }
    headerEndIndex = i + 1;
  }

  // Extract header info
  const headerLines = lines.slice(0, headerEndIndex);
  if (headerLines.length > 0) {
    // First non-empty line is usually the name
    result.name = headerLines[0]?.replace(/^#*\s*/, '') || "";
    
    // Second line often has title | specialization
    if (headerLines[1]) {
      const titleParts = headerLines[1].split('|').map(p => p.trim());
      result.title = titleParts[0] || "";
      if (titleParts.length > 1) {
        result.specialization = titleParts.slice(1).join(' | ');
      }
    }
    
    // Look for contact info (lines with email, linkedin, location)
    for (let i = 2; i < headerLines.length; i++) {
      const line = headerLines[i];
      if (line.includes('@') || line.includes('linkedin') || 
          /📍|📧|🔗|\|/.test(line) ||
          /[A-Z][a-z]+,\s*[A-Z]{2}/.test(line)) {
        // Parse contact items
        const contactItems = line.split(/\s*[\|•]\s*/).filter(c => c.trim());
        result.contact.push(...contactItems);
      } else if (!result.specialization && line.length < 100) {
        result.specialization = line;
      }
    }
  }

  // Parse sections
  const sectionPatterns = [
    { pattern: /^(SUMMARY|PROFESSIONAL SUMMARY|EXECUTIVE SUMMARY)$/i, type: "summary" as const },
    { pattern: /^(KEY ACHIEVEMENTS|ACHIEVEMENTS|ACCOMPLISHMENTS|ACHIEVEMENTS \(HIGHLIGHTS\))$/i, type: "achievements" as const },
    { pattern: /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)$/i, type: "experience" as const },
    { pattern: /^(EDUCATION|EDUCATION & CREDENTIALS|ACADEMIC)$/i, type: "education" as const },
    { pattern: /^(SKILLS|SKILLS & COMPETENCIES|CORE COMPETENCIES|INDUSTRY EXPERTISE|TECHNICAL SKILLS|KEY SKILLS)$/i, type: "skills" as const },
  ];

  let currentSection: { type: string; title: string; lines: string[] } | null = null;
  
  for (let i = headerEndIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a section header
    let matchedType: string | null = null;
    for (const { pattern, type } of sectionPatterns) {
      if (pattern.test(line)) {
        matchedType = type;
        break;
      }
    }
    
    // Also detect other section headers (ALL CAPS, short lines)
    if (!matchedType && line === line.toUpperCase() && line.length < 50 && line.length > 2 && !line.startsWith('•')) {
      matchedType = "other";
    }
    
    if (matchedType) {
      // Save previous section
      if (currentSection && currentSection.lines.length > 0) {
        result.sections.push(parseSection(currentSection));
      }
      currentSection = { type: matchedType, title: line, lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  }
  
  // Don't forget last section
  if (currentSection && currentSection.lines.length > 0) {
    result.sections.push(parseSection(currentSection));
  }

  return result;
}

function parseSection(section: { type: string; title: string; lines: string[] }): ParsedResume["sections"][0] {
  switch (section.type) {
    case "experience":
      return {
        type: "experience",
        title: section.title,
        content: parseExperienceRoles(section.lines)
      };
    case "achievements":
      return {
        type: "achievements",
        title: section.title,
        content: parseAchievements(section.lines)
      };
    case "skills":
      return {
        type: "skills",
        title: section.title,
        content: section.lines.join(' ').split(/\s*[\|•]\s*/).filter(s => s.trim())
      };
    default:
      return {
        type: section.type as any,
        title: section.title,
        content: section.lines.join('\n')
      };
  }
}

function parseExperienceRoles(lines: string[]): RoleBlock[] {
  const roles: RoleBlock[] = [];
  let currentRole: RoleBlock | null = null;
  
  // Company indicators for better detection
  const companyIndicators = ['Apple', 'RBC', 'Charles Schwab', 'Morgan Stanley', 'TD Bank', 'Inc.', 'LLC', 'Corp', 'Ltd', 'Company', 'Bank', 'Technologies', 'Solutions', 'Group'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    const lineAfterNext = lines[i + 2] || '';
    
    const isBullet = /^[•\-\*]\s/.test(line);
    
    // Check for role title patterns - more comprehensive detection
    // Pattern 1: "Head of Product, Finance, Billing & Payments" followed by company
    // Pattern 2: "Senior Product Manager" followed by company  
    // Pattern 3: Line with bold markers **Title**
    const isRoleTitlePattern = !isBullet && line.length > 3 && line.length < 100 && (
      // Bold title pattern
      /^\*\*[^*]+\*\*$/.test(line) ||
      // Common role title keywords
      /^(Head|Director|Manager|Lead|Principal|Senior|Staff|VP|Chief|President|Engineer|Designer|Analyst|Consultant)\s/i.test(line) ||
      // Title followed by comma (like "Head of Product, Finance")
      /^[A-Z][a-zA-Z\s,&]+$/.test(line) && !line.includes('•')
    );
    
    // Check if next line looks like company info
    const isNextLineCompany = companyIndicators.some(c => nextLine.includes(c)) || 
                              /^[A-Z][a-zA-Z\s]+\s*[\|•]/.test(nextLine);
    
    // Check if we have date pattern nearby
    const hasDatePattern = (
      /(\d{1,2}\/\d{4}|[A-Z][a-z]{2}\s+\d{4}|\d{4})\s*[–\-]\s*(Present|Current|\d{4}|[A-Z][a-z]{2}\s+\d{4})/i.test(nextLine) ||
      /(\d{1,2}\/\d{4}|[A-Z][a-z]{2}\s+\d{4}|\d{4})\s*[–\-]\s*(Present|Current|\d{4}|[A-Z][a-z]{2}\s+\d{4})/i.test(lineAfterNext)
    );
    
    // Detect role start: title pattern + (company or date follows)
    const isRoleStart = isRoleTitlePattern && (isNextLineCompany || hasDatePattern);
    
    if (isRoleStart) {
      // Save previous role
      if (currentRole) {
        roles.push(currentRole);
      }
      
      // Parse role info
      const title = line.replace(/^\*\*|\*\*$/g, '').trim();
      let company = '';
      let location = '';
      let dates = '';
      
      // Look at following lines for company, location, dates
      let j = i + 1;
      while (j < lines.length && j <= i + 3) {
        const l = lines[j];
        if (l.startsWith('•') || l.startsWith('-') || l.startsWith('*')) break;
        
        // Extract date pattern
        const dateMatch = l.match(/([A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})\s*[–\-]\s*(Present|Current|[A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})/i);
        if (dateMatch) {
          dates = dateMatch[0];
        }
        
        // Extract location (City, ST format)
        const locMatch = l.match(/([A-Z][a-z]+,?\s*[A-Z]{2})\s*$/);
        if (locMatch && !location) {
          location = locMatch[1];
        }
        
        // Extract company (line after title, before or including dates)
        if (!company && j === i + 1 && l.length < 100) {
          // Get company before the pipe or bullet
          const companyMatch = l.match(/^([^|\n•]+)/);
          if (companyMatch) {
            company = companyMatch[1].replace(/^\*\*|\*\*$/g, '').trim();
          }
        }
        
        j++;
      }
      
      currentRole = {
        title,
        company,
        location,
        dates,
        bullets: []
      };
    } else if (isBullet && currentRole) {
      currentRole.bullets.push(line.replace(/^[•\-\*]\s*/, ''));
    } else if (currentRole && line && !isRoleStart) {
      // This might be company/dates continuation
      if (!currentRole.company && line.length < 80 && !line.startsWith('•')) {
        const companyMatch = line.match(/^([^|\n•]+)/);
        if (companyMatch) {
          currentRole.company = companyMatch[1].replace(/^\*\*|\*\*$/g, '').trim();
        }
      }
      if (!currentRole.dates) {
        const dateMatch = line.match(/([A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})\s*[–\-]\s*(Present|Current|[A-Z][a-z]{2}\s+\d{4}|\d{1,2}\/\d{4})/i);
        if (dateMatch) currentRole.dates = dateMatch[0];
      }
    } else if (!currentRole && line && !isBullet && line.length > 3) {
      // First line might be a role title - start parsing
      currentRole = {
        title: line.replace(/^\*\*|\*\*$/g, '').trim(),
        company: '',
        location: '',
        dates: '',
        bullets: []
      };
    }
  }
  
  if (currentRole) {
    roles.push(currentRole);
  }
  
  return roles;
}

function parseAchievements(lines: string[]): Achievement[] {
  const achievements: Achievement[] = [];
  
  for (const line of lines) {
    // Check for bullet with headline pattern
    const match = line.match(/^[•\-\*]?\s*\*?\*?([^:–—]+)[:\–—]\s*(.+)/);
    if (match) {
      achievements.push({
        headline: match[1].replace(/\*\*/g, '').trim(),
        description: match[2].replace(/\*\*/g, '').trim()
      });
    } else if (line.trim()) {
      // Simple bullet
      achievements.push({
        headline: line.replace(/^[•\-\*]\s*/, '').replace(/\*\*/g, ''),
        description: ""
      });
    }
  }
  
  return achievements;
}

interface EducationEntry {
  degree: string;
  institution: string;
  details: string;
}

function parseEducationEntries(content: string): EducationEntry[] {
  const entries: EducationEntry[] = [];
  const lines = content.split('\n').filter(l => l.trim());
  
  let currentEntry: EducationEntry | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect degree/certification lines
    const isDegree = /^(MBA|BSc|BA|BS|MS|PhD|Master|Bachelor|Leading|Product|Professional|Certificate|Certified)/i.test(line) ||
                     /^[A-Z][a-z]+\s+(in|of)\s+/i.test(line);
    
    // Detect institution lines (University, School, etc.)
    const isInstitution = /University|School|College|Institute|Academy|Education/i.test(line);
    
    // Detect year/date lines
    const isDateLine = /^\(?\d{4}\)?$/.test(line) || /\(\d{4}\)/.test(line);
    
    if (isDegree && !isInstitution) {
      // Save previous entry
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = { degree: line, institution: '', details: '' };
    } else if (isInstitution && currentEntry) {
      currentEntry.institution = line;
    } else if (isInstitution && !currentEntry) {
      // Institution without prior degree (just institution name)
      currentEntry = { degree: '', institution: line, details: '' };
    } else if (isDateLine && currentEntry) {
      currentEntry.details = line;
    } else if (currentEntry) {
      // Additional detail
      if (currentEntry.institution && !currentEntry.details) {
        currentEntry.details = line;
      } else if (!currentEntry.institution) {
        currentEntry.institution = line;
      }
    } else {
      // Start a new entry with this line
      currentEntry = { degree: line, institution: '', details: '' };
    }
  }
  
  // Don't forget last entry
  if (currentEntry) {
    entries.push(currentEntry);
  }
  
  return entries;
}

export function FormattedResumeDisplay({ content, className = "" }: FormattedResumeDisplayProps) {
  const resume = parseResumeContent(content);
  
  return (
    <div className={`font-sans text-foreground ${className}`} style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">
          {resume.name || "Professional Resume"}
        </h1>
        {resume.title && (
          <h2 className="text-base md:text-lg text-muted-foreground font-medium">
            {resume.title}
          </h2>
        )}
        {resume.specialization && (
          <p className="text-sm text-muted-foreground mt-1">
            {resume.specialization}
          </p>
        )}
        {resume.contact.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {resume.contact.join(' • ')}
          </p>
        )}
      </header>
      
      <Separator className="mb-4" />
      
      {/* Sections */}
      {resume.sections.map((section, idx) => (
        <section key={idx} className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3 border-b border-border pb-1">
            {section.title}
          </h3>
          
          {section.type === "summary" && typeof section.content === "string" && (
            <p className="text-sm leading-relaxed text-foreground/90">
              {formatTextWithMetrics(section.content)}
            </p>
          )}
          
          {section.type === "achievements" && Array.isArray(section.content) && (
            <div className="space-y-2">
              {(section.content as Achievement[]).map((achievement, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold">{achievement.headline}</span>
                  {achievement.description && (
                    <span className="text-foreground/80"> — {formatTextWithMetrics(achievement.description)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {section.type === "experience" && Array.isArray(section.content) && (
            <div className="space-y-5">
              {(section.content as RoleBlock[]).map((role, i) => (
                <div key={i} className="text-sm">
                  {/* Role Header - Combined format: Title - Company in Location */}
                  <div className="mb-2">
                    <div className="font-semibold text-foreground">
                      {role.title}
                      {role.company && (
                        <span className="font-normal text-foreground/80">
                          {' — '}{role.company}
                          {role.location && <span> in {role.location}</span>}
                        </span>
                      )}
                    </div>
                    {role.dates && (
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {role.dates}
                      </div>
                    )}
                  </div>
                  
                  {/* Bullets */}
                  {role.bullets.length > 0 && (
                    <ul className="space-y-1 ml-4">
                      {role.bullets.map((bullet, j) => (
                        <li key={j} className="text-foreground/90 relative before:content-['•'] before:absolute before:-left-3 before:text-muted-foreground">
                          {formatTextWithMetrics(bullet)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {section.type === "education" && typeof section.content === "string" && (
            <div className="text-sm space-y-3">
              {parseEducationEntries(section.content).map((entry, i) => (
                <div key={i} className="mb-2">
                  {entry.degree && (
                    <div className="font-semibold text-foreground">{entry.degree}</div>
                  )}
                  {entry.institution && (
                    <div className="text-foreground/80">{entry.institution}</div>
                  )}
                  {entry.details && (
                    <div className="text-muted-foreground text-xs">{entry.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {section.type === "skills" && Array.isArray(section.content) && (
            <p className="text-sm text-foreground/90">
              {(section.content as string[]).join(' • ')}
            </p>
          )}
          
          {section.type === "other" && typeof section.content === "string" && (
            <div className="text-sm text-foreground/90">
              {section.content.split('\n').map((line, i) => (
                <p key={i} className="mb-1">{formatTextWithMetrics(line)}</p>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

// Helper to bold metrics wrapped in **
function formatTextWithMetrics(text: string): React.ReactNode {
  if (!text.includes('**')) return text;
  
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
