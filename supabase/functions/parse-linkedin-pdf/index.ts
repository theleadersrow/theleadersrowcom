import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LinkedInSection {
  type: string;
  title: string;
  content: string;
  items?: Array<{
    title?: string;
    subtitle?: string;
    dateRange?: string;
    description?: string;
  }>;
}

interface ParsedLinkedInProfile {
  name?: string;
  headline?: string;
  location?: string;
  about?: string;
  sections: LinkedInSection[];
  rawText: string;
}

// Helper to identify section types
function identifySectionType(title: string): string {
  const titleLower = title.toLowerCase().trim();
  
  if (titleLower.includes('experience') || titleLower.includes('work')) return 'experience';
  if (titleLower.includes('education')) return 'education';
  if (titleLower.includes('skill')) return 'skills';
  if (titleLower.includes('certification') || titleLower.includes('license')) return 'certifications';
  if (titleLower.includes('project')) return 'projects';
  if (titleLower.includes('volunteer')) return 'volunteer';
  if (titleLower.includes('publication')) return 'publications';
  if (titleLower.includes('honor') || titleLower.includes('award')) return 'honors';
  if (titleLower.includes('language')) return 'languages';
  if (titleLower.includes('recommendation')) return 'recommendations';
  if (titleLower.includes('course')) return 'courses';
  if (titleLower.includes('organization')) return 'organizations';
  if (titleLower.includes('patent')) return 'patents';
  if (titleLower.includes('about') || titleLower.includes('summary')) return 'about';
  if (titleLower.includes('contact')) return 'contact';
  
  return 'other';
}

// Parse LinkedIn PDF text into structured sections
function parseLinkedInText(text: string): ParsedLinkedInProfile {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const sections: LinkedInSection[] = [];
  
  let name = '';
  let headline = '';
  let location = '';
  let about = '';
  
  // Common section headers in LinkedIn PDFs
  const sectionPatterns = [
    /^Experience$/i,
    /^Education$/i,
    /^Skills$/i,
    /^Certifications$/i,
    /^Licenses & [Cc]ertifications$/i,
    /^Projects$/i,
    /^Volunteer [Ee]xperience$/i,
    /^Publications$/i,
    /^Honors & [Aa]wards$/i,
    /^Languages$/i,
    /^Recommendations$/i,
    /^Courses$/i,
    /^Organizations$/i,
    /^Patents$/i,
    /^About$/i,
    /^Summary$/i,
    /^Contact$/i,
    /^Top Skills$/i,
  ];
  
  // Find all section boundaries
  const sectionIndices: Array<{ index: number; title: string; lineIndex: number }> = [];
  
  lines.forEach((line, index) => {
    for (const pattern of sectionPatterns) {
      if (pattern.test(line)) {
        sectionIndices.push({ index: sectionIndices.length, title: line, lineIndex: index });
        break;
      }
    }
  });
  
  // Extract name, headline, location from the beginning (before first section)
  const firstSectionLine = sectionIndices.length > 0 ? sectionIndices[0].lineIndex : lines.length;
  const headerLines = lines.slice(0, Math.min(firstSectionLine, 10));
  
  // Usually: Name is first non-empty substantial line, headline is second, location might be third
  if (headerLines.length > 0) {
    // Filter out common LinkedIn header noise
    const filteredHeader = headerLines.filter(line => 
      !line.match(/^(Contact|Page|LinkedIn)/i) &&
      line.length > 2 &&
      line.length < 200
    );
    
    if (filteredHeader.length >= 1) {
      name = filteredHeader[0];
    }
    if (filteredHeader.length >= 2) {
      headline = filteredHeader[1];
    }
    if (filteredHeader.length >= 3) {
      // Check if third line looks like a location
      const possibleLocation = filteredHeader[2];
      if (possibleLocation.length < 100 && !possibleLocation.includes('•')) {
        location = possibleLocation;
      }
    }
  }
  
  // Parse each section
  for (let i = 0; i < sectionIndices.length; i++) {
    const currentSection = sectionIndices[i];
    const nextSectionLineIndex = i < sectionIndices.length - 1 
      ? sectionIndices[i + 1].lineIndex 
      : lines.length;
    
    const sectionLines = lines.slice(currentSection.lineIndex + 1, nextSectionLineIndex);
    const sectionContent = sectionLines.join('\n');
    const sectionType = identifySectionType(currentSection.title);
    
    // Extract About section content specially
    if (sectionType === 'about') {
      about = sectionContent;
    }
    
    // Parse experience/education items
    let items: Array<{ title?: string; subtitle?: string; dateRange?: string; description?: string }> = [];
    
    if (sectionType === 'experience' || sectionType === 'education') {
      // Try to identify individual entries
      // Usually entries have a pattern like: Title, Company/School, Date Range, Description
      let currentItem: typeof items[0] = {};
      let itemLines: string[] = [];
      
      for (const line of sectionLines) {
        // Date patterns often indicate end of item or start of new one
        const datePattern = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)\s+\d{4}\s*[-–—]\s*(Present|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i;
        const yearOnlyPattern = /^\d{4}\s*[-–—]\s*(Present|\d{4})$/i;
        
        if (datePattern.test(line) || yearOnlyPattern.test(line)) {
          // This is likely a date range
          if (currentItem.title || itemLines.length > 0) {
            // Save previous item if exists
            if (!currentItem.title && itemLines.length > 0) {
              currentItem.title = itemLines[0];
              currentItem.subtitle = itemLines[1] || '';
              currentItem.description = itemLines.slice(2).join(' ');
            }
            currentItem.dateRange = line;
            items.push(currentItem);
            currentItem = {};
            itemLines = [];
          } else {
            currentItem.dateRange = line;
          }
        } else if (line.length > 0) {
          itemLines.push(line);
        }
      }
      
      // Don't forget the last item
      if (itemLines.length > 0 || currentItem.title) {
        if (!currentItem.title && itemLines.length > 0) {
          currentItem.title = itemLines[0];
          currentItem.subtitle = itemLines[1] || '';
          currentItem.description = itemLines.slice(2).join(' ');
        }
        items.push(currentItem);
      }
    } else if (sectionType === 'skills') {
      // Skills are usually a list
      items = sectionLines.map(line => ({ title: line }));
    }
    
    sections.push({
      type: sectionType,
      title: currentSection.title,
      content: sectionContent,
      items: items.length > 0 ? items : undefined,
    });
  }
  
  return {
    name,
    headline,
    location,
    about,
    sections,
    rawText: text,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Processing LinkedIn PDF: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File size must be less than 10MB" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let text = "";

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      // Use pdf-parse via external service or parse manually
      // For simplicity, we'll extract text using a simple PDF text extraction
      // Convert to base64 and use Google's document AI or similar
      
      // Simple PDF text extraction - look for text streams
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(uint8Array);
      
      // Extract text between stream markers (simplified PDF parsing)
      const streamMatches = rawText.matchAll(/stream\s*([\s\S]*?)\s*endstream/g);
      const textParts: string[] = [];
      
      for (const match of streamMatches) {
        const content = match[1];
        // Try to extract readable text
        const textMatches = content.matchAll(/\(([^)]+)\)/g);
        for (const textMatch of textMatches) {
          const extracted = textMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\t/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          if (extracted.length > 0 && !/^[\x00-\x1F\x7F-\x9F]+$/.test(extracted)) {
            textParts.push(extracted);
          }
        }
        
        // Also try Tj/TJ operators
        const tjMatches = content.matchAll(/\[(.*?)\]\s*TJ/g);
        for (const tjMatch of tjMatches) {
          const items = tjMatch[1].matchAll(/\(([^)]*)\)/g);
          for (const item of items) {
            if (item[1].length > 0) {
              textParts.push(item[1]);
            }
          }
        }
      }
      
      // If we got some text, use it
      if (textParts.length > 0) {
        text = textParts.join(' ')
          .replace(/\s+/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .trim();
      }
      
      // If simple parsing didn't work well, try to find plain text in the PDF
      if (text.length < 100) {
        // Look for BT...ET text blocks
        const btMatches = rawText.matchAll(/BT\s*([\s\S]*?)\s*ET/g);
        const btTextParts: string[] = [];
        for (const match of btMatches) {
          const textMatches = match[1].matchAll(/\(([^)]+)\)/g);
          for (const textMatch of textMatches) {
            btTextParts.push(textMatch[1]);
          }
        }
        if (btTextParts.length > 0) {
          text = btTextParts.join(' ').replace(/\s+/g, ' ').trim();
        }
      }
      
      // Last resort - just find any readable text sequences
      if (text.length < 100) {
        const readableMatches = rawText.matchAll(/[A-Za-z][A-Za-z0-9\s,.\-@&']+[A-Za-z0-9.]/g);
        const readable: string[] = [];
        for (const match of readableMatches) {
          if (match[0].length > 3 && match[0].length < 500) {
            readable.push(match[0]);
          }
        }
        text = readable.join('\n');
      }
      
    } else if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      text = new TextDecoder().decode(uint8Array);
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported file type. Please upload a PDF or TXT file." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!text || text.length < 50) {
      return new Response(
        JSON.stringify({ 
          error: "Could not extract enough text from the PDF. Please try copying and pasting your LinkedIn content manually.",
          rawLength: text?.length || 0
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Extracted ${text.length} characters from LinkedIn PDF`);
    
    // Parse the extracted text into structured sections
    const parsed = parseLinkedInText(text);
    
    console.log(`Parsed profile: ${parsed.name}, ${parsed.sections.length} sections`);

    return new Response(
      JSON.stringify({
        success: true,
        text: text,
        parsed: parsed,
        sectionsFound: parsed.sections.map(s => ({ type: s.type, title: s.title })),
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error parsing LinkedIn PDF:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to parse LinkedIn PDF" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
