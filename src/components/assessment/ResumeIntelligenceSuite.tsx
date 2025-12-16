import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  ArrowLeft, ArrowRight, Upload, Loader2, Sparkles, FileText, 
  CheckCircle, Download, RefreshCw, Target, Zap, TrendingUp,
  AlertCircle, ChevronRight, Copy, FileSignature, ScrollText,
  FileDown, Layout
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign, ShadingType } from "docx";
import { saveAs } from "file-saver";
import html2pdf from "html2pdf.js";

interface ResumeIntelligenceSuiteProps {
  onBack: () => void;
  onComplete: () => void;
}

interface SkillGap {
  skill: string;
  importance: string;
  context: string;
}

interface YearsExperienceAnalysis {
  job_requires: string;
  resume_shows: string;
  gap: string;
}

interface LeadershipAnalysis {
  job_requires: string;
  resume_shows: string;
  gap: string;
}

interface ATSResult {
  ats_score: number;
  keyword_match_score: number;
  experience_match_score: number;
  skills_match_score: number;
  format_score: number;
  summary: string;
  matched_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  improvements: Array<{ priority: string; issue: string; fix: string }>;
  experience_gaps: string[];
  skills_gaps?: SkillGap[];
  years_experience_analysis?: YearsExperienceAnalysis;
  leadership_analysis?: LeadershipAnalysis;
  tech_stack_gaps?: string[];
  recommended_additions: string[];
  role_fit_assessment: string;
  deal_breakers?: string[];
}

interface ContentImprovement {
  section: string;
  original: string;
  improved: string;
  reason: string;
}

interface ActionVerbUpgrade {
  original: string;
  improved: string;
}

interface EnhancedResume {
  enhancedContent: string;
  contentImprovements: ContentImprovement[];
  addedKeywords: string[];
  quantifiedAchievements: string[];
  actionVerbUpgrades: ActionVerbUpgrade[];
  summaryRewrite: string;
  bulletPointImprovements: string[];
  transformationNotes?: string;
}

interface CoverLetterDetails {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  companyName: string;
  hiringManagerName: string;
}

type Step = "input" | "initial_score" | "enhancing" | "improvements" | "format_selection" | "final_score";
type CoverLetterLength = "short" | "medium" | "detailed";
type ResumeFormat = "classic" | "modern";

export function ResumeIntelligenceSuite({ onBack, onComplete }: ResumeIntelligenceSuiteProps) {
  const [step, setStep] = useState<Step>("input");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selfProjection, setSelfProjection] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [initialScore, setInitialScore] = useState<ATSResult | null>(null);
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [finalScore, setFinalScore] = useState<ATSResult | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  // Cover letter state
  const [showCoverLetterPrompt, setShowCoverLetterPrompt] = useState(false);
  const [showCoverLetterDetailsDialog, setShowCoverLetterDetailsDialog] = useState(false);
  const [coverLetterDetails, setCoverLetterDetails] = useState<CoverLetterDetails>({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    companyName: "",
    hiringManagerName: "",
  });
  const [coverLetterLength, setCoverLetterLength] = useState<CoverLetterLength>("medium");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [showCoverLetterResult, setShowCoverLetterResult] = useState(false);
  
  // Change acceptance state
  const [acceptedContentChanges, setAcceptedContentChanges] = useState<Set<number>>(new Set());
  const [acceptedKeywords, setAcceptedKeywords] = useState<Set<number>>(new Set());
  const [acceptedVerbUpgrades, setAcceptedVerbUpgrades] = useState<Set<number>>(new Set());
  const [acceptedAchievements, setAcceptedAchievements] = useState<Set<number>>(new Set());
  const [finalResumeContent, setFinalResumeContent] = useState<string>("");
  
  // Improvements view state
  const [viewMode, setViewMode] = useState<"comparison" | "details">("comparison");
  const [useFullTransformation, setUseFullTransformation] = useState(true);
  
  // Format selection state
  const [selectedFormat, setSelectedFormat] = useState<ResumeFormat | null>(null);
  const [showFormatSelection, setShowFormatSelection] = useState(false);
  const [isGeneratingFormatted, setIsGeneratingFormatted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingResume(true);
    setResumeFileName(file.name);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
        toast({ title: "Resume loaded", description: "Your resume text has been extracted." });
        setIsUploadingResume(false);
        return;
      }

      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );

        const { data, error } = await supabase.functions.invoke('parse-resume', {
          body: { fileBase64: base64, fileName: file.name, fileType: file.type },
        });

        if (error) throw error;
        if (data?.resumeText) {
          setResumeText(data.resumeText);
          toast({ title: "Resume parsed", description: "Your resume has been extracted." });
        } else {
          throw new Error("No text extracted");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please paste your resume text manually.",
        variant: "destructive",
      });
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleInitialAnalysis = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both your resume and the job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ resumeText, jobDescription }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze resume");

      const data = await response.json();
      setInitialScore(data);
      setStep("initial_score");
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEnhanceResume = async () => {
    setStep("enhancing");
    setIsEnhancing(true);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-resume", {
        body: { 
          resumeText, 
          jobDescription,
          selfProjection,
          missingKeywords: initialScore?.missing_keywords || [],
          improvements: initialScore?.improvements || [],
          experienceGaps: initialScore?.experience_gaps || [],
          skillsGaps: initialScore?.skills_gaps || [],
          techStackGaps: initialScore?.tech_stack_gaps?.map((t: string) => ({ technology: t, gap: "Missing from resume" })) || [],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setEnhancedResume(data);
      // Initialize all changes as accepted by default
      setAcceptedContentChanges(new Set((data.contentImprovements || []).map((_: any, i: number) => i)));
      setAcceptedKeywords(new Set((data.addedKeywords || []).map((_: any, i: number) => i)));
      setAcceptedVerbUpgrades(new Set((data.actionVerbUpgrades || []).map((_: any, i: number) => i)));
      setAcceptedAchievements(new Set((data.quantifiedAchievements || []).map((_: any, i: number) => i)));
      setStep("improvements");
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: "Please try again.",
        variant: "destructive",
      });
      setStep("initial_score");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Build final resume with only accepted changes
  const buildFinalResume = () => {
    if (!enhancedResume) return resumeText;
    
    let finalContent = resumeText;
    
    // Apply accepted content improvements
    enhancedResume.contentImprovements.forEach((imp, index) => {
      if (acceptedContentChanges.has(index) && imp.original && imp.improved) {
        finalContent = finalContent.replace(imp.original, imp.improved);
      }
    });
    
    // Apply accepted action verb upgrades
    enhancedResume.actionVerbUpgrades.forEach((upgrade, index) => {
      if (acceptedVerbUpgrades.has(index) && upgrade.original && upgrade.improved) {
        const regex = new RegExp(`\\b${upgrade.original}\\b`, 'gi');
        finalContent = finalContent.replace(regex, upgrade.improved);
      }
    });
    
    return finalContent;
  };

  const toggleContentChange = (index: number) => {
    setAcceptedContentChanges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleKeyword = (index: number) => {
    setAcceptedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleVerbUpgrade = (index: number) => {
    setAcceptedVerbUpgrades(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleAchievement = (index: number) => {
    setAcceptedAchievements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const acceptAllChanges = () => {
    if (!enhancedResume) return;
    setAcceptedContentChanges(new Set(enhancedResume.contentImprovements.map((_, i) => i)));
    setAcceptedKeywords(new Set(enhancedResume.addedKeywords.map((_, i) => i)));
    setAcceptedVerbUpgrades(new Set(enhancedResume.actionVerbUpgrades.map((_, i) => i)));
    setAcceptedAchievements(new Set(enhancedResume.quantifiedAchievements.map((_, i) => i)));
  };

  const declineAllChanges = () => {
    setAcceptedContentChanges(new Set());
    setAcceptedKeywords(new Set());
    setAcceptedVerbUpgrades(new Set());
    setAcceptedAchievements(new Set());
  };

  const handleFinalAnalysis = async () => {
    if (!enhancedResume) return;

    // Build final resume with only accepted changes
    const finalContent = buildFinalResume();
    setFinalResumeContent(finalContent);
    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ resumeText: finalContent, jobDescription, isPostTransformation: true }),
        }
      );

      if (!response.ok) throw new Error("Failed to analyze");

      const data = await response.json();
      setFinalScore(data);
      setStep("final_score");
    } catch (error) {
      console.error("Final analysis error:", error);
      toast({
        title: "Analysis failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyEnhanced = async () => {
    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (content) {
      await navigator.clipboard.writeText(content);
      toast({ title: "Copied!", description: "Resume copied to clipboard" });
    }
  };

  const handleDownloadResume = async () => {
    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (!content) return;
    
    try {
      // Use the improved parseResumeContent function
      const { name, headline, contactInfo, summary, experiences, skills, education } = parseResumeContent(content);
      const lines = content.split('\n').filter(l => l.trim());
      
      // Check if we have structured data
      const hasGoodData = experiences.length > 0 || summary.length > 50;
      
      if (!hasGoodData) {
        // Fallback: create a clean single-column DOCX from raw content
        const children: Paragraph[] = [];
        let isFirstLine = true;
        let currentSection = "";
        
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return;
          
          // Name (first line)
          if (isFirstLine) {
            children.push(new Paragraph({
              children: [new TextRun({ text: trimmed.toUpperCase(), bold: true, size: 40, font: "Calibri" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 }
            }));
            isFirstLine = false;
            return;
          }
          
          // Contact info (early lines with email/phone)
          if (idx < 5 && (trimmed.includes('@') || trimmed.match(/\d{3}/))) {
            children.push(new Paragraph({
              children: [new TextRun({ text: trimmed, size: 20, font: "Calibri", color: "666666" })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 60 }
            }));
            return;
          }
          
          // Section headers (all caps, short)
          if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 40) {
            children.push(new Paragraph({
              children: [new TextRun({ text: trimmed, bold: true, size: 24, font: "Calibri", color: "1a365d" })],
              spacing: { before: 280, after: 80 },
              border: { bottom: { color: "1a365d", style: BorderStyle.SINGLE, size: 8 } }
            }));
            currentSection = trimmed;
            return;
          }
          
          // Bullet points
          if (/^[•\-\*▪]/.test(trimmed)) {
            children.push(new Paragraph({
              children: [new TextRun({ text: trimmed.replace(/^[•\-\*▪]\s*/, ''), size: 21, font: "Calibri" })],
              bullet: { level: 0 },
              spacing: { before: 30, after: 30 }
            }));
            return;
          }
          
          // Regular text
          children.push(new Paragraph({
            children: [new TextRun({ text: trimmed, size: 21, font: "Calibri" })],
            spacing: { before: 50, after: 50 }
          }));
        });
        
        const doc = new Document({
          sections: [{ 
            properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, 
            children 
          }]
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, "optimized-resume.docx");
        toast({ title: "Downloaded!", description: "Resume saved as Word document" });
        return;
      }
      
      // Build professional single-column resume with structured data
      const noBorder = { 
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, 
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, 
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, 
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } 
      };
      
      const createSectionHeader = (text: string) => new Paragraph({
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 24, font: "Calibri", color: "1a365d" })],
        spacing: { before: 280, after: 100 },
        border: { bottom: { color: "1a365d", style: BorderStyle.SINGLE, size: 8 } }
      });
      
      const documentChildren: Paragraph[] = [];
      
      // Header - Name
      documentChildren.push(new Paragraph({
        children: [new TextRun({ text: (name || "Your Name").toUpperCase(), bold: true, size: 44, font: "Calibri" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 }
      }));
      
      // Headline
      if (headline) {
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: headline, size: 24, font: "Calibri", color: "555555", italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 }
        }));
      }
      
      // Contact info
      if (contactInfo.length > 0) {
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: contactInfo.join('  |  '), size: 20, font: "Calibri", color: "666666" })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }));
      }
      
      // Summary
      if (summary) {
        documentChildren.push(createSectionHeader("Professional Summary"));
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: summary, size: 21, font: "Calibri" })],
          spacing: { before: 60, after: 120 }
        }));
      }
      
      // Experience
      if (experiences.length > 0) {
        documentChildren.push(createSectionHeader("Professional Experience"));
        
        experiences.forEach(exp => {
          // Job title
          documentChildren.push(new Paragraph({
            children: [
              new TextRun({ text: exp.title || "Position", bold: true, size: 23, font: "Calibri", color: "1a365d" }),
              exp.dates ? new TextRun({ text: `  |  ${exp.dates}`, size: 20, font: "Calibri", color: "666666", italics: true }) : new TextRun({ text: "" })
            ],
            spacing: { before: 160, after: 40 }
          }));
          
          // Company
          if (exp.company) {
            documentChildren.push(new Paragraph({
              children: [new TextRun({ text: exp.company, size: 21, font: "Calibri", color: "444444" })],
              spacing: { before: 0, after: 60 }
            }));
          }
          
          // Bullets - include ALL bullets
          if (exp.bullets && exp.bullets.length > 0) {
            exp.bullets.forEach((bullet: string) => {
              documentChildren.push(new Paragraph({
                children: [new TextRun({ text: bullet, size: 20, font: "Calibri" })],
                bullet: { level: 0 },
                spacing: { before: 30, after: 30 }
              }));
            });
          }
        });
      }
      
      // Skills - include ALL skills
      if (skills.length > 0) {
        documentChildren.push(createSectionHeader("Skills & Competencies"));
        documentChildren.push(new Paragraph({
          children: [new TextRun({ text: skills.join('  •  '), size: 20, font: "Calibri" })],
          spacing: { before: 60, after: 120 }
        }));
      }
      
      // Education - include ALL education
      if (education.length > 0) {
        documentChildren.push(createSectionHeader("Education"));
        education.forEach(edu => {
          documentChildren.push(new Paragraph({
            children: [new TextRun({ text: edu.degree, size: 21, font: "Calibri" })],
            spacing: { before: 40, after: 40 }
          }));
        });
      }
      
      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          children: documentChildren
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "optimized-resume.docx");
      toast({ title: "Downloaded!", description: "Resume saved as Word document" });
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to text download
      const blob = new Blob([content], { type: "text/plain" });
      saveAs(blob, "optimized-resume.txt");
      toast({ title: "Downloaded!", description: "Resume saved as text file" });
    }
  };

  const handleReset = () => {
    setStep("input");
    setResumeText("");
    setJobDescription("");
    setSelfProjection("");
    setInitialScore(null);
    setEnhancedResume(null);
    setFinalScore(null);
    setResumeFileName(null);
    setGeneratedCoverLetter(null);
    setShowCoverLetterPrompt(false);
    setShowCoverLetterResult(false);
    setCoverLetterDetails({
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      companyName: "",
      hiringManagerName: "",
    });
    // Reset change acceptance state
    setAcceptedContentChanges(new Set());
    setAcceptedKeywords(new Set());
    setAcceptedVerbUpgrades(new Set());
    setAcceptedAchievements(new Set());
    setFinalResumeContent("");
    // Reset view state
    setViewMode("comparison");
    setUseFullTransformation(true);
    // Reset format selection
    setSelectedFormat(null);
  };

  // Download report function - PDF
  const handleDownloadReport = async () => {
    if (!initialScore) return;
    
    const getScoreColorHex = (score: number) => {
      if (score >= 75) return "#16a34a";
      if (score >= 50) return "#ca8a04";
      return "#dc2626";
    };
    
    const reportHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #d4af37; padding-bottom: 20px;">
          <h1 style="font-size: 28px; margin: 0; color: #1a1a1a;">Resume Intelligence Report</h1>
          <p style="color: #666; margin-top: 8px; font-size: 14px;">Generated by The Leader's Row - Rimo AI Coach</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #f8f8f8, #fff); border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="font-size: 48px; font-weight: bold; color: ${getScoreColorHex(initialScore.ats_score || 0)};">${Math.round(initialScore.ats_score || 0)}<span style="font-size: 24px; color: #999;">/100</span></div>
            <div style="color: #666; font-size: 14px;">Overall ATS Score</div>
          </div>
        </div>
        
        <div style="background: #f9f9f9; padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
          <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.6;">${initialScore.summary}</p>
        </div>
        
        <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">Score Breakdown</h2>
        <div style="display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
          ${[
            { label: "Keywords", score: initialScore.keyword_match_score },
            { label: "Experience", score: initialScore.experience_match_score },
            { label: "Skills", score: initialScore.skills_match_score },
            { label: "Format", score: initialScore.format_score },
          ].map(item => `
            <div style="flex: 1; min-width: 100px; text-align: center; padding: 15px; background: #fff; border-radius: 8px; border: 1px solid #eee;">
              <div style="font-size: 24px; font-weight: bold; color: ${getScoreColorHex(item.score)};">${item.score}%</div>
              <div style="color: #666; font-size: 12px; margin-top: 4px;">${item.label}</div>
            </div>
          `).join('')}
        </div>
        
        ${finalScore ? `
        <h2 style="font-size: 18px; color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 8px; margin-bottom: 15px;">After Optimization</h2>
        <div style="display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
          <div style="flex: 1; text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${Math.round(finalScore.ats_score || 0)}/100</div>
            <div style="color: #666; font-size: 12px;">New Score (+${Math.round((finalScore.ats_score || 0) - (initialScore.ats_score || 0))})</div>
          </div>
        </div>
        ` : ''}
        
        <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">Strengths</h2>
        <ul style="margin: 0 0 25px 0; padding-left: 20px;">
          ${initialScore.strengths.map(s => `<li style="color: #444; margin-bottom: 8px; font-size: 14px;">${s}</li>`).join('')}
        </ul>
        
        <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">Matched Keywords</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 25px;">
          ${initialScore.matched_keywords.slice(0, 20).map(kw => `<span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${kw}</span>`).join('')}
        </div>
        
        <h2 style="font-size: 18px; color: #dc2626; border-bottom: 2px solid #fca5a5; padding-bottom: 8px; margin-bottom: 15px;">Missing Keywords</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 25px;">
          ${initialScore.missing_keywords.slice(0, 15).map(kw => `<span style="background: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${kw}</span>`).join('')}
        </div>
        
        <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">Priority Improvements</h2>
        ${initialScore.improvements.slice(0, 5).map(imp => `
          <div style="background: ${imp.priority === 'critical' ? '#fef2f2' : imp.priority === 'high' ? '#fffbeb' : '#f9fafb'}; padding: 12px 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${imp.priority === 'critical' ? '#dc2626' : imp.priority === 'high' ? '#f59e0b' : '#6b7280'};">
            <div style="font-weight: 600; color: #1a1a1a; font-size: 14px;">[${imp.priority.toUpperCase()}] ${imp.issue}</div>
            <div style="color: #666; font-size: 13px; margin-top: 4px;">→ ${imp.fix}</div>
          </div>
        `).join('')}
        
        <h2 style="font-size: 18px; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-top: 25px; margin-bottom: 15px;">Role Fit Assessment</h2>
        <p style="color: #444; font-size: 14px; line-height: 1.6; margin-bottom: 30px;">${initialScore.role_fit_assessment}</p>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
          <p>Report generated by The Leader's Row | theleadersrow.com</p>
        </div>
      </div>
    `;
    
    const element = document.createElement("div");
    element.innerHTML = reportHtml;
    document.body.appendChild(element);
    
    try {
      await html2pdf().set({
        margin: 10,
        filename: "resume-analysis-report.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(element).save();
      
      toast({ title: "Downloaded!", description: "ATS Report saved as PDF" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Download failed", description: "Please try again", variant: "destructive" });
    } finally {
      document.body.removeChild(element);
    }
  };

  // Download formatted resume as PDF
  const handleDownloadFormattedPDF = async () => {
    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (!content) return;
    
    const { name, headline, contactInfo, summary, experiences, skills, education } = parseResumeContent(content);
    
    const resumeHtml = selectedFormat === "modern" 
      ? generateModernResumeHTML(name, headline, contactInfo, summary, experiences, skills, education)
      : generateClassicResumeHTML(name, headline, contactInfo, summary, experiences, skills, education);
    
    const element = document.createElement("div");
    element.innerHTML = resumeHtml;
    document.body.appendChild(element);
    
    try {
      await html2pdf().set({
        margin: 10,
        filename: "optimized-resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(element).save();
      
      toast({ title: "Downloaded!", description: "Resume saved as PDF" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      document.body.removeChild(element);
    }
  };

  // Parse resume content into structured sections - improved parsing
  const parseResumeContent = (content: string) => {
    const lines = content.split('\n');
    let name = "";
    let headline = "";
    let contactInfo: string[] = [];
    let summary = "";
    let experiences: { title: string; company: string; dates: string; bullets: string[] }[] = [];
    let skills: string[] = [];
    let education: { degree: string; school: string; dates: string }[] = [];
    
    let currentSection = "";
    let currentExperience: { title: string; company: string; dates: string; bullets: string[] } | null = null;
    let summaryLines: string[] = [];
    
    const sectionHeaders = {
      summary: /^(PROFESSIONAL\s+)?SUMMARY|^PROFILE|^OBJECTIVE|^ABOUT(\s+ME)?$/i,
      experience: /^(PROFESSIONAL\s+|WORK\s+)?EXPERIENCE|^EMPLOYMENT(\s+HISTORY)?|^CAREER(\s+HISTORY)?$/i,
      skills: /^(TECHNICAL\s+|CORE\s+)?SKILLS|^COMPETENCIES|^EXPERTISE|^TECHNOLOGIES$/i,
      education: /^EDUCATION|^ACADEMIC|^QUALIFICATIONS$/i,
      achievements: /^(KEY\s+)?ACHIEVEMENTS|^ACCOMPLISHMENTS|^AWARDS$/i
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      const cleanLine = trimmed.replace(/^[#*_]+|[#*_]+$/g, '').trim();
      
      // First non-empty line is usually the name
      if (!name && index < 5 && cleanLine.length < 60 && !cleanLine.includes('@') && !cleanLine.match(/\d{3}/)) {
        name = cleanLine;
        return;
      }
      
      // Contact info detection (within first 8 lines)
      if (index < 8 && (cleanLine.includes('@') || cleanLine.match(/\(\d{3}\)|\d{3}[-.\s]\d{3}/) || cleanLine.toLowerCase().includes('linkedin.com'))) {
        // Split by common delimiters and add each part
        const parts = cleanLine.split(/[|•·]/).map(p => p.trim()).filter(p => p);
        contactInfo.push(...parts);
        return;
      }
      
      // Headline detection (line after name, before sections)
      if (!headline && index < 5 && !currentSection && cleanLine.length < 100 && !cleanLine.includes('@')) {
        if (cleanLine.match(/Manager|Engineer|Developer|Designer|Analyst|Director|Lead|Specialist|Consultant|Executive/i)) {
          headline = cleanLine;
          return;
        }
      }
      
      // Section header detection
      if (sectionHeaders.summary.test(cleanLine)) { currentSection = 'summary'; return; }
      if (sectionHeaders.experience.test(cleanLine)) { 
        if (currentExperience) experiences.push(currentExperience);
        currentExperience = null;
        currentSection = 'experience'; 
        return; 
      }
      if (sectionHeaders.skills.test(cleanLine)) { currentSection = 'skills'; return; }
      if (sectionHeaders.education.test(cleanLine)) { currentSection = 'education'; return; }
      if (sectionHeaders.achievements.test(cleanLine)) { currentSection = 'achievements'; return; }
      
      // Skip pure section headers
      if (cleanLine === cleanLine.toUpperCase() && cleanLine.length < 30) return;
      
      // Process based on current section
      switch (currentSection) {
        case 'summary':
          if (cleanLine && cleanLine.length > 5) {
            summaryLines.push(cleanLine);
          }
          break;
          
        case 'experience':
          const isBullet = /^[•\-\*▪◦‣→]/.test(cleanLine);
          const datePattern = /(\d{4}|\w+\.?\s+\d{4})\s*[-–—to]+\s*(\d{4}|Present|Current|Now)/i;
          const hasDate = datePattern.test(cleanLine);
          const isJobTitle = /^(Senior|Lead|Principal|Staff|Junior|Associate|Director|Manager|VP|Head|Chief|Product|Software|Data|UX|UI|Marketing|Sales|Engineering|Technical|Business|Project|Program|Operations)/i.test(cleanLine);
          
          if (isBullet && currentExperience) {
            currentExperience.bullets.push(cleanLine.replace(/^[•\-\*▪◦‣→]\s*/, ''));
          } else if (isJobTitle && !isBullet) {
            if (currentExperience && currentExperience.bullets.length > 0) {
              experiences.push(currentExperience);
            }
            const dateMatch = cleanLine.match(datePattern);
            currentExperience = {
              title: cleanLine.replace(datePattern, '').replace(/[|,].*$/, '').trim(),
              company: '',
              dates: dateMatch ? dateMatch[0] : '',
              bullets: []
            };
          } else if (currentExperience && !currentExperience.company && cleanLine.length > 3 && !isBullet) {
            // This might be company info
            const dateMatch = cleanLine.match(datePattern);
            if (dateMatch && !currentExperience.dates) {
              currentExperience.dates = dateMatch[0];
              currentExperience.company = cleanLine.replace(datePattern, '').replace(/[|,]\s*$/, '').trim();
            } else if (!hasDate) {
              currentExperience.company = cleanLine.split(/[|,]/)[0].trim();
            }
          }
          break;
          
        case 'skills':
          // Handle various skill formats
          const skillItems = cleanLine.split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50);
          if (skillItems.length > 0) {
            skills.push(...skillItems);
          } else if (cleanLine.length > 2 && cleanLine.length < 50) {
            skills.push(cleanLine);
          }
          break;
          
        case 'education':
          if (cleanLine.length > 5 && !cleanLine.match(/^[A-Z\s&]+$/)) {
            education.push({ 
              degree: cleanLine, 
              school: '', 
              dates: '' 
            });
          }
          break;
      }
    });
    
    // Don't forget the last experience
    if (currentExperience && currentExperience.title) {
      experiences.push(currentExperience);
    }
    
    // Combine summary lines
    summary = summaryLines.join(' ');
    
    // Remove duplicate skills
    skills = [...new Set(skills)];
    
    return { name, headline, contactInfo: [...new Set(contactInfo)], summary, experiences, skills, education };
  };

  // Generate Classic Resume HTML - clean professional single-column format
  const generateClassicResumeHTML = (name: string, headline: string, contactInfo: string[], summary: string, experiences: any[], skills: string[], education: any[]) => {
    const content = finalResumeContent || enhancedResume?.enhancedContent || "";
    
    // If parsing didn't yield good results, use a simple formatted version
    const hasGoodData = experiences.length > 0 || summary.length > 50;
    
    if (!hasGoodData) {
      // Fallback: format content directly as a clean resume
      const lines = content.split('\n').filter(l => l.trim());
      let formattedContent = '';
      let isFirstLine = true;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        if (isFirstLine) {
          formattedContent += `<h1 style="font-size: 26px; text-align: center; margin: 0 0 5px 0; letter-spacing: 1px;">${trimmed}</h1>`;
          isFirstLine = false;
        } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && trimmed.length > 3) {
          formattedContent += `<h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 4px; margin: 18px 0 10px 0; color: #333;">${trimmed}</h2>`;
        } else if (/^[•\-\*▪]/.test(trimmed)) {
          formattedContent += `<p style="font-size: 11px; margin: 3px 0 3px 15px; line-height: 1.5;">• ${trimmed.replace(/^[•\-\*▪]\s*/, '')}</p>`;
        } else {
          formattedContent += `<p style="font-size: 11px; margin: 4px 0; line-height: 1.5;">${trimmed}</p>`;
        }
      });
      
      return `<div style="font-family: 'Georgia', serif; padding: 40px 50px; max-width: 750px; margin: 0 auto; color: #333;">${formattedContent}</div>`;
    }
    
    // Use structured data if available
    return `
      <div style="font-family: 'Georgia', serif; padding: 40px 50px; max-width: 750px; margin: 0 auto; color: #333;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 12px;">
          <h1 style="font-size: 26px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">${name || "Your Name"}</h1>
          ${headline ? `<p style="font-size: 13px; color: #555; margin: 6px 0 0 0; font-style: italic;">${headline}</p>` : ""}
          ${contactInfo.length > 0 ? `<p style="font-size: 11px; color: #666; margin: 8px 0 0 0;">${contactInfo.join(" | ")}</p>` : ""}
        </div>
        
        ${summary ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 8px 0;">Professional Summary</h2>
          <p style="font-size: 11px; line-height: 1.6; color: #444; margin: 0;">${summary}</p>
        </div>
        ` : ""}
        
        ${experiences.length > 0 ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 10px 0;">Professional Experience</h2>
          ${experiences.map(exp => `
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                <strong style="font-size: 12px; color: #222;">${exp.title || "Position"}</strong>
                ${exp.dates ? `<span style="font-size: 10px; color: #666;">${exp.dates}</span>` : ""}
              </div>
              ${exp.company ? `<div style="font-size: 11px; color: #555; font-style: italic; margin-top: 2px;">${exp.company}</div>` : ""}
              ${exp.bullets && exp.bullets.length > 0 ? `
                <ul style="margin: 6px 0 0 0; padding-left: 16px;">
                  ${exp.bullets.map((b: string) => `<li style="font-size: 10px; line-height: 1.5; margin-bottom: 3px; color: #444;">${b}</li>`).join('')}
                </ul>
              ` : ""}
            </div>
          `).join('')}
        </div>
        ` : ""}
        
        ${skills.length > 0 ? `
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 8px 0;">Skills</h2>
          <p style="font-size: 10px; line-height: 1.6; color: #444; margin: 0;">${skills.join(" • ")}</p>
        </div>
        ` : ""}
        
        ${education.length > 0 ? `
        <div>
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #666; padding-bottom: 4px; margin: 0 0 8px 0;">Education</h2>
          ${education.map(edu => `<p style="font-size: 11px; margin: 4px 0; color: #444;">${edu.degree}</p>`).join('')}
        </div>
        ` : ""}
      </div>
    `;
  };

  // Generate Modern Resume HTML - two-column professional format
  const generateModernResumeHTML = (name: string, headline: string, contactInfo: string[], summary: string, experiences: any[], skills: string[], education: any[]) => {
    const content = finalResumeContent || enhancedResume?.enhancedContent || "";
    
    const hasGoodData = experiences.length > 0 || summary.length > 50;
    
    if (!hasGoodData) {
      // Fallback: create a modern single-column version with accent
      const lines = content.split('\n').filter(l => l.trim());
      let headerContent = '';
      let bodyContent = '';
      let lineIndex = 0;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        if (lineIndex === 0) {
          headerContent += `<h1 style="font-size: 24px; margin: 0; color: #1a365d;">${trimmed}</h1>`;
        } else if (lineIndex < 3 && (trimmed.includes('@') || trimmed.match(/\d{3}/))) {
          headerContent += `<p style="font-size: 10px; color: #666; margin: 4px 0;">${trimmed}</p>`;
        } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 40 && trimmed.length > 3) {
          bodyContent += `<h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 4px; margin: 16px 0 8px 0;">${trimmed}</h2>`;
        } else if (/^[•\-\*▪]/.test(trimmed)) {
          bodyContent += `<p style="font-size: 10px; margin: 3px 0 3px 12px; line-height: 1.5; color: #444;">• ${trimmed.replace(/^[•\-\*▪]\s*/, '')}</p>`;
        } else {
          bodyContent += `<p style="font-size: 10px; margin: 4px 0; line-height: 1.5; color: #444;">${trimmed}</p>`;
        }
        lineIndex++;
      });
      
      return `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a365d, #2c5282); color: white; padding: 25px 30px; margin-bottom: 0;">
            ${headerContent}
          </div>
          <div style="padding: 25px 30px;">
            ${bodyContent}
          </div>
        </div>
      `;
    }
    
    // Use structured two-column layout
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 750px; margin: 0 auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 35%; background: linear-gradient(180deg, #1a365d, #234876); color: white; padding: 25px 18px; vertical-align: top;">
              <h1 style="font-size: 20px; margin: 0 0 4px 0; word-wrap: break-word;">${name || "Your Name"}</h1>
              ${headline ? `<p style="font-size: 11px; color: #90cdf4; margin: 0 0 18px 0;">${headline}</p>` : ""}
              
              ${contactInfo.length > 0 ? `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #90cdf4; margin: 0 0 8px 0; border-bottom: 1px solid #3182ce; padding-bottom: 4px;">Contact</h3>
                ${contactInfo.map(c => `<p style="font-size: 9px; margin: 4px 0; word-break: break-all; color: #e2e8f0;">${c}</p>`).join('')}
              </div>
              ` : ""}
              
              ${skills.length > 0 ? `
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #90cdf4; margin: 0 0 8px 0; border-bottom: 1px solid #3182ce; padding-bottom: 4px;">Skills</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${skills.map(s => `<span style="font-size: 8px; padding: 3px 6px; background: #2c5282; border-radius: 2px; color: #e2e8f0; display: inline-block; margin: 2px;">${s}</span>`).join('')}
                </div>
              </div>
              ` : ""}
              
              ${education.length > 0 ? `
              <div>
                <h3 style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #90cdf4; margin: 0 0 8px 0; border-bottom: 1px solid #3182ce; padding-bottom: 4px;">Education</h3>
                ${education.map(edu => `<p style="font-size: 9px; margin: 4px 0; color: #e2e8f0;">${edu.degree}</p>`).join('')}
              </div>
              ` : ""}
            </td>
            
            <td style="width: 65%; padding: 25px 22px; vertical-align: top;">
              ${summary ? `
              <div style="margin-bottom: 16px;">
                <h2 style="font-size: 12px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin: 0 0 8px 0; border-bottom: 2px solid #1a365d; padding-bottom: 4px;">Summary</h2>
                <p style="font-size: 10px; line-height: 1.6; color: #444; margin: 0;">${summary}</p>
              </div>
              ` : ""}
              
              ${experiences.length > 0 ? `
              <div>
                <h2 style="font-size: 12px; text-transform: uppercase; color: #1a365d; letter-spacing: 1px; margin: 0 0 12px 0; border-bottom: 2px solid #1a365d; padding-bottom: 4px;">Experience</h2>
                ${experiences.map(exp => `
                  <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                      <strong style="font-size: 11px; color: #1a365d;">${exp.title || "Position"}</strong>
                      ${exp.dates ? `<span style="font-size: 9px; color: #666;">${exp.dates}</span>` : ""}
                    </div>
                    ${exp.company ? `<div style="font-size: 10px; color: #666; margin-top: 1px;">${exp.company}</div>` : ""}
                    ${exp.bullets && exp.bullets.length > 0 ? `
                      <ul style="margin: 5px 0 0 0; padding-left: 14px;">
                        ${exp.bullets.map((b: string) => `<li style="font-size: 9px; line-height: 1.5; margin-bottom: 2px; color: #444;">${b}</li>`).join('')}
                      </ul>
                    ` : ""}
                  </div>
                `).join('')}
              </div>
              ` : ""}
            </td>
          </tr>
        </table>
      </div>
    `;
  };

  // Cover letter generation
  const handleGenerateCoverLetter = async () => {
    if (!coverLetterDetails.candidateName.trim()) {
      toast({ title: "Name required", description: "Please enter your name", variant: "destructive" });
      return;
    }

    setIsGeneratingCoverLetter(true);
    setShowCoverLetterDetailsDialog(false);

    try {
      const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
        body: {
          resumeText: enhancedResume?.enhancedContent || resumeText,
          jobDescription,
          candidateName: coverLetterDetails.candidateName,
          candidateEmail: coverLetterDetails.candidateEmail,
          candidatePhone: coverLetterDetails.candidatePhone,
          companyName: coverLetterDetails.companyName,
          hiringManagerName: coverLetterDetails.hiringManagerName,
          selfProjection,
          coverLetterLength,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedCoverLetter(data.coverLetter);
      setShowCoverLetterResult(true);
      toast({ title: "Cover letter generated!", description: "Your personalized cover letter is ready" });
    } catch (error) {
      console.error("Cover letter error:", error);
      toast({ title: "Generation failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!generatedCoverLetter) return;
    
    try {
      const lines = generatedCoverLetter.split('\n');
      const children: Paragraph[] = [];
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          children.push(new Paragraph({ text: "", spacing: { before: 120 } }));
          return;
        }
        
        children.push(
          new Paragraph({
            children: [new TextRun({ text: trimmedLine, size: 24, font: "Calibri" })],
            spacing: { before: 60, after: 60 },
          })
        );
      });
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "cover-letter.docx");
      toast({ title: "Downloaded!", description: "Cover letter saved as Word document" });
    } catch (error) {
      console.error("Download error:", error);
      const blob = new Blob([generatedCoverLetter], { type: "text/plain" });
      saveAs(blob, "cover-letter.txt");
      toast({ title: "Downloaded!", description: "Cover letter saved" });
    }
  };

  const handleCopyCoverLetter = async () => {
    if (generatedCoverLetter) {
      await navigator.clipboard.writeText(generatedCoverLetter);
      toast({ title: "Copied!", description: "Cover letter copied to clipboard" });
    }
  };

  // Copy ATS report as text
  const handleCopyReport = async () => {
    if (!initialScore) return;
    const reportText = `ATS Resume Analysis Report
Overall Score: ${Math.round(initialScore.ats_score)}/100

Summary: ${initialScore.summary}

Score Breakdown:
- Keywords: ${initialScore.keyword_match_score}%
- Experience: ${initialScore.experience_match_score}%
- Skills: ${initialScore.skills_match_score}%
- Format: ${initialScore.format_score}%

Strengths:
${initialScore.strengths.map(s => `• ${s}`).join('\n')}

Missing Keywords:
${initialScore.missing_keywords.slice(0, 15).join(', ')}

Priority Improvements:
${initialScore.improvements.slice(0, 5).map(imp => `[${imp.priority.toUpperCase()}] ${imp.issue}\n  → ${imp.fix}`).join('\n\n')}

Role Fit Assessment: ${initialScore.role_fit_assessment}

Generated by The Leader's Row - Rimo AI Coach`;
    
    await navigator.clipboard.writeText(reportText);
    toast({ title: "Copied!", description: "ATS Report copied to clipboard" });
  };

  // Download cover letter as PDF
  const handleDownloadCoverLetterPDF = async () => {
    if (!generatedCoverLetter) return;
    
    const coverLetterHtml = `
      <div style="font-family: 'Georgia', serif; padding: 60px; max-width: 700px; margin: 0 auto; line-height: 1.7;">
        <div style="white-space: pre-wrap; font-size: 14px; color: #333;">
          ${generatedCoverLetter.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
    
    const element = document.createElement("div");
    element.innerHTML = coverLetterHtml;
    document.body.appendChild(element);
    
    try {
      await html2pdf().set({
        margin: 15,
        filename: "cover-letter.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(element).save();
      
      toast({ title: "Downloaded!", description: "Cover letter saved as PDF" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      document.body.removeChild(element);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[
        { key: "input", label: "Input" },
        { key: "initial_score", label: "Score" },
        { key: "improvements", label: "Improve" },
        { key: "final_score", label: "Result" },
      ].map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step === s.key || 
            (step === "enhancing" && s.key === "improvements") ||
            ["initial_score", "improvements", "final_score"].indexOf(step) >= ["initial_score", "improvements", "final_score"].indexOf(s.key as any)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}>
            {i + 1}
          </div>
          {i < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
        </div>
      ))}
    </div>
  );

  // Step 1: Input
  if (step === "input") {
    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Resume Intelligence Suite</h1>
              <p className="text-muted-foreground">Score, optimize, and transform your resume for your target role</p>
            </div>
          </div>

          {stepIndicator}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Your Resume
              </h3>
              <div className="mb-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingResume}
                >
                  {isUploadingResume ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload PDF</>
                  )}
                </Button>
                {resumeFileName && (
                  <span className="ml-2 text-sm text-muted-foreground">{resumeFileName}</span>
                )}
              </div>
              <Textarea
                placeholder="Or paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[250px] text-sm"
              />
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" /> Target Job Description
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste the job you're applying to. We'll optimize your resume specifically for this role.
              </p>
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] text-sm"
              />
            </Card>
          </div>

          {/* Self-Projection Field */}
          <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Define Your Professional Brand
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              To stand out in the marketplace, we need to know how you want to be positioned. Share your unique strengths, 
              leadership style, and the value you bring—this helps us craft a resume that authentically represents your brand 
              to hiring managers and recruiters.
            </p>
            <Textarea
              placeholder="Example: I'm a strategic product manager who turns ambiguous problems into clear, actionable roadmaps. My superpower is building trust across engineering, design, and business teams to drive outcomes that matter. I want to be known as a data-informed leader with deep customer empathy who consistently delivers impact..."
              value={selfProjection}
              onChange={(e) => setSelfProjection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2 italic">
              The more specific you are, the more powerfully your resume will position you in the marketplace.
            </p>
          </Card>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleInitialAnalysis}
              disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Get My ATS Score</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Initial Score
  if (step === "initial_score" && initialScore) {
    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("input")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Current ATS Score</h1>
              <p className="text-muted-foreground">Here's how your resume performs against this job</p>
            </div>
          </div>

          {stepIndicator}

          <div className="text-center mb-8">
            <div className={`text-7xl font-bold ${getScoreColor(initialScore.ats_score)}`}>
              {initialScore.ats_score}<span className="text-3xl text-muted-foreground">/100</span>
            </div>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">{initialScore.summary}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Keywords", score: initialScore.keyword_match_score },
              { label: "Experience", score: initialScore.experience_match_score },
              { label: "Skills", score: initialScore.skills_match_score },
              { label: "Format", score: initialScore.format_score },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </Card>
            ))}
          </div>

          {/* Deal Breakers - Show first if any */}
          {initialScore.deal_breakers && initialScore.deal_breakers.length > 0 && (
            <Card className="p-4 mb-6 border-red-500/50 bg-red-500/10">
              <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Deal Breakers
              </h3>
              <ul className="space-y-2">
                {initialScore.deal_breakers.map((db, i) => (
                  <li key={i} className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">✗</span> {db}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Experience & Leadership Analysis */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {initialScore.years_experience_analysis && (
              <Card className="p-5 overflow-hidden">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Years of Experience
                </h3>
                <div className="space-y-4">
                  {/* Job Requires */}
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Job Requires
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.years_experience_analysis.job_requires}
                    </p>
                  </div>
                  
                  {/* Resume Shows */}
                  <div className="rounded-lg bg-muted/50 border border-muted p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Your Resume Shows
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.years_experience_analysis.resume_shows}
                    </p>
                  </div>
                  
                  {/* Gap Analysis */}
                  <div className={`rounded-lg p-3 ${
                    initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-orange-500/10 border border-orange-500/30'
                  }`}>
                    <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                      initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      Gap Analysis
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${
                      initialScore.years_experience_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      {initialScore.years_experience_analysis.gap}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {initialScore.leadership_analysis && (
              <Card className="p-5 overflow-hidden">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Leadership & Management
                </h3>
                <div className="space-y-4">
                  {/* Job Requires */}
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                      Job Requires
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.leadership_analysis.job_requires}
                    </p>
                  </div>
                  
                  {/* Resume Shows */}
                  <div className="rounded-lg bg-muted/50 border border-muted p-3">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Your Resume Shows
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {initialScore.leadership_analysis.resume_shows}
                    </p>
                  </div>
                  
                  {/* Gap Analysis */}
                  <div className={`rounded-lg p-3 ${
                    initialScore.leadership_analysis.gap.toLowerCase().includes('meets') 
                      ? 'bg-green-500/10 border border-green-500/30' 
                      : 'bg-orange-500/10 border border-orange-500/30'
                  }`}>
                    <div className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                      initialScore.leadership_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      Gap Analysis
                    </div>
                    <p className={`text-sm font-medium leading-relaxed ${
                      initialScore.leadership_analysis.gap.toLowerCase().includes('meets') 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-orange-700 dark:text-orange-300'
                    }`}>
                      {initialScore.leadership_analysis.gap}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Skills Gaps */}
          {initialScore.skills_gaps && initialScore.skills_gaps.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Critical Skill Gaps
              </h3>
              <div className="space-y-3">
                {initialScore.skills_gaps.map((sg, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{sg.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        sg.importance === 'critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : sg.importance === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {sg.importance}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{sg.context}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tech Stack Gaps */}
          {initialScore.tech_stack_gaps && initialScore.tech_stack_gaps.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {initialScore.tech_stack_gaps.map((tech, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900/30 dark:text-red-300">
                    {tech}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Missing Keywords */}
          {initialScore.missing_keywords.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Keywords ({initialScore.missing_keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {initialScore.missing_keywords.slice(0, 15).map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                    {kw}
                  </span>
                ))}
                {initialScore.missing_keywords.length > 15 && (
                  <span className="text-xs text-muted-foreground">+{initialScore.missing_keywords.length - 15} more</span>
                )}
              </div>
            </Card>
          )}

          {/* Experience Gaps */}
          {initialScore.experience_gaps && initialScore.experience_gaps.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" /> Experience Gaps
              </h3>
              <ul className="space-y-2">
                {initialScore.experience_gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span> {gap}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Top Improvements Needed */}
          {initialScore.improvements.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Top Improvements Needed
              </h3>
              <div className="space-y-3">
                {initialScore.improvements.slice(0, 5).map((imp, i) => (
                  <div key={i} className={`border-l-2 pl-3 ${
                    imp.priority === 'critical' 
                      ? 'border-red-500' 
                      : imp.priority === 'high' 
                      ? 'border-orange-500' 
                      : 'border-yellow-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        imp.priority === 'critical' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                          : imp.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {imp.priority}
                      </span>
                    </div>
                    <div className="font-medium text-foreground text-sm">{imp.issue}</div>
                    <div className="text-sm text-muted-foreground">→ {imp.fix}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Role Fit Assessment */}
          {initialScore.role_fit_assessment && (
            <Card className="p-4 mb-6 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-2">Role Fit Assessment</h3>
              <p className="text-sm text-muted-foreground">{initialScore.role_fit_assessment}</p>
            </Card>
          )}

          <div className="bg-primary/10 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-lg text-foreground mb-2">Ready to Improve Your Score?</h3>
            <p className="text-muted-foreground mb-4">
              Our AI will rewrite your resume with the right keywords, stronger achievements, and optimized content for this specific role.
            </p>
            <Button size="lg" onClick={handleEnhanceResume}>
              <Sparkles className="w-4 h-4 mr-2" /> Transform My Resume
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Enhancing (loading state)
  if (step === "enhancing") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Transforming Your Resume</h2>
          <p className="text-muted-foreground mb-6">
            Our AI is rewriting your resume with targeted keywords, quantified achievements, and role-specific language...
          </p>
          <div className="space-y-2 text-left bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Adding missing keywords...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Quantifying achievements...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Strengthening action verbs...
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Optimizing for ATS...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Improvements - Review Changes
  if (step === "improvements" && enhancedResume) {
    const totalChanges = 
      enhancedResume.contentImprovements.length + 
      enhancedResume.actionVerbUpgrades.length;
    const acceptedCount = acceptedContentChanges.size + acceptedVerbUpgrades.size;

    const handleUseTransformed = () => {
      setUseFullTransformation(true);
      setFinalResumeContent(enhancedResume.enhancedContent);
    };

    const handleCustomize = () => {
      setUseFullTransformation(false);
      setViewMode("details");
    };

    const proceedToFinal = async () => {
      setIsAnalyzing(true);
      const content = useFullTransformation ? enhancedResume.enhancedContent : buildFinalResume();
      setFinalResumeContent(content);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ats-score-resume`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ resumeText: content, jobDescription, isPostTransformation: true }),
          }
        );

        if (!response.ok) throw new Error("Failed to analyze");

        const data = await response.json();
        setFinalScore(data);
        setStep("final_score");
      } catch (error) {
        console.error("Final analysis error:", error);
        toast({
          title: "Analysis failed",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    };

    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("initial_score")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Resume Has Been Transformed</h1>
              <p className="text-muted-foreground">Review the AI-optimized version and choose how to proceed</p>
            </div>
          </div>

          {stepIndicator}

          {/* Transformation Summary */}
          {enhancedResume.transformationNotes && (
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Transformation Strategy
              </h3>
              <p className="text-sm text-muted-foreground">{enhancedResume.transformationNotes}</p>
            </Card>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === "comparison" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("comparison")}
            >
              <FileText className="w-4 h-4 mr-2" /> Full Resume Comparison
            </Button>
            <Button
              variant={viewMode === "details" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("details")}
            >
              <TrendingUp className="w-4 h-4 mr-2" /> View Individual Changes ({totalChanges})
            </Button>
          </div>

          {viewMode === "comparison" ? (
            <>
              {/* Side-by-Side Full Resume Comparison */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* Original Resume */}
                <Card className="p-4 border-red-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <h3 className="font-semibold text-foreground">Original Resume</h3>
                    <span className="text-xs text-muted-foreground ml-auto">ATS Score: {initialScore?.ats_score || 0}</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto rounded-lg bg-muted/30 p-4">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {resumeText}
                    </pre>
                  </div>
                </Card>

                {/* Transformed Resume */}
                <Card className={`p-4 ${useFullTransformation ? 'border-green-500/50 ring-2 ring-green-500/20' : 'border-green-500/20'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <h3 className="font-semibold text-foreground">AI-Transformed Resume</h3>
                    {useFullTransformation && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full ml-2">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="max-h-[500px] overflow-y-auto rounded-lg bg-green-500/5 p-4">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                      {enhancedResume.enhancedContent}
                    </pre>
                  </div>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.addedKeywords.length}</div>
                  <div className="text-xs text-muted-foreground">Keywords Added</div>
                </Card>
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.quantifiedAchievements.length}</div>
                  <div className="text-xs text-muted-foreground">Achievements Quantified</div>
                </Card>
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.actionVerbUpgrades.length}</div>
                  <div className="text-xs text-muted-foreground">Verbs Upgraded</div>
                </Card>
                <Card className="p-3 text-center bg-green-500/5 border-green-500/20">
                  <div className="text-2xl font-bold text-green-600">{enhancedResume.contentImprovements.length}</div>
                  <div className="text-xs text-muted-foreground">Sections Improved</div>
                </Card>
              </div>

              {/* Action Buttons */}
              <Card className="p-6 mb-6">
                <h3 className="font-semibold text-foreground mb-4">How would you like to proceed?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={handleUseTransformed}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      useFullTransformation 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {useFullTransformation && <CheckCircle className="w-5 h-5 text-green-500" />}
                      <span className="font-medium text-foreground">Use AI-Transformed Resume</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accept the complete AI transformation. The resume has been fully rewritten to target your job description while preserving your authentic experience.
                    </p>
                  </button>
                  <button
                    onClick={handleCustomize}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      !useFullTransformation 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {!useFullTransformation && <CheckCircle className="w-5 h-5 text-primary" />}
                      <span className="font-medium text-foreground">Customize Individual Changes</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review and accept/decline each change individually. Build your final resume by selecting only the improvements you want.
                    </p>
                  </button>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Individual Changes View */}
              <Card className="p-4 mb-6 bg-muted/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {acceptedCount} of {totalChanges} changes accepted
                    </p>
                    <p className="text-xs text-muted-foreground">Toggle each change below or use quick actions</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={acceptAllChanges}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Accept All
                    </Button>
                    <Button variant="outline" size="sm" onClick={declineAllChanges}>
                      Decline All
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Content Improvements */}
              {enhancedResume.contentImprovements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Content Improvements ({enhancedResume.contentImprovements.length})
                  </h3>
                  <div className="space-y-4">
                    {enhancedResume.contentImprovements.map((imp, index) => {
                      const isAccepted = acceptedContentChanges.has(index);
                      return (
                        <Card 
                          key={index} 
                          className={`p-4 transition-all ${isAccepted ? 'border-green-500/50 bg-green-500/5' : 'border-muted opacity-60'}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                                {imp.section}
                              </span>
                              {isAccepted && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Accepted
                                </span>
                              )}
                            </div>
                            <Button
                              variant={isAccepted ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleContentChange(index)}
                              className={isAccepted ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {isAccepted ? (
                                <><CheckCircle className="w-4 h-4 mr-1" /> Accepted</>
                              ) : (
                                "Accept Change"
                              )}
                            </Button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-3">
                              <div className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> BEFORE
                              </div>
                              <p className="text-sm text-muted-foreground">{imp.original || "N/A"}</p>
                            </div>
                            <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
                              <div className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> AFTER
                              </div>
                              <p className="text-sm text-foreground">{imp.improved || "N/A"}</p>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-3 italic border-l-2 border-primary/30 pl-2">
                            💡 {imp.reason}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Verb Upgrades */}
              {enhancedResume.actionVerbUpgrades.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" /> Action Verb Upgrades ({enhancedResume.actionVerbUpgrades.length})
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {enhancedResume.actionVerbUpgrades.map((upgrade, index) => {
                      const isAccepted = acceptedVerbUpgrades.has(index);
                      return (
                        <div
                          key={index}
                          onClick={() => toggleVerbUpgrade(index)}
                          className={`p-3 rounded-lg cursor-pointer transition-all border ${
                            isAccepted 
                              ? 'border-green-500/50 bg-green-500/10' 
                              : 'border-muted bg-muted/20 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isAccepted ? 'border-green-500 bg-green-500' : 'border-muted-foreground'
                            }`}>
                              {isAccepted && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground line-through">{upgrade.original}</span>
                            <ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-foreground font-medium">{upgrade.improved}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Keywords to Add */}
              {enhancedResume.addedKeywords.length > 0 && (
                <Card className="p-4 mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" /> Keywords Added ({enhancedResume.addedKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {enhancedResume.addedKeywords.map((kw, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Summary */}
              <Card className="p-4 mb-6 bg-muted/30">
                <h3 className="font-semibold text-foreground mb-2">Your Customized Resume Summary</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {acceptedContentChanges.size} content improvements accepted</li>
                  <li>• {acceptedVerbUpgrades.size} action verb upgrades accepted</li>
                </ul>
              </Card>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => setStep("initial_score")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
            <Button 
              size="lg" 
              onClick={proceedToFinal} 
              disabled={isAnalyzing || (!useFullTransformation && acceptedCount === 0)}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scoring Resume...</>
              ) : (
                <>Get Final Score <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
          {!useFullTransformation && acceptedCount === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please accept at least one change or select the full transformation
            </p>
          )}
        </div>
      </div>
    );
  }

  // Step 5: Final Score
  if (step === "final_score" && finalScore && initialScore) {
    const improvement = finalScore.ats_score - initialScore.ats_score;

    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("improvements")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Your Transformation Complete!</h1>
              <p className="text-muted-foreground">See how much your resume improved</p>
            </div>
          </div>

          {stepIndicator}

          {/* Score Comparison */}
          <div className="bg-gradient-to-r from-primary/10 to-green-500/10 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 items-center text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Before</div>
                <div className={`text-4xl font-bold ${getScoreColor(initialScore.ats_score)}`}>
                  {Math.round(initialScore.ats_score)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Improvement</div>
                <div className={`text-4xl font-bold ${improvement > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  +{Math.round(improvement)}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">After</div>
                <div className={`text-5xl font-bold ${getScoreColor(finalScore.ats_score)}`}>
                  {Math.round(finalScore.ats_score)}
                </div>
              </div>
            </div>
          </div>

          {/* Category Improvements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Keywords", before: initialScore.keyword_match_score, after: finalScore.keyword_match_score },
              { label: "Experience", before: initialScore.experience_match_score, after: finalScore.experience_match_score },
              { label: "Skills", before: initialScore.skills_match_score, after: finalScore.skills_match_score },
              { label: "Format", before: initialScore.format_score, after: finalScore.format_score },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.before}%</span>
                  <ArrowRight className="w-3 h-3 text-green-500" />
                  <span className={`text-lg font-bold ${getScoreColor(item.after)}`}>{item.after}%</span>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 mb-6 bg-green-500/10 border-green-500/20">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> What Changed
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {enhancedResume && (
                <>
                  <li>• Added {enhancedResume.addedKeywords.length} missing keywords from the job description</li>
                  <li>• Quantified {enhancedResume.quantifiedAchievements.length} achievements with metrics</li>
                  <li>• Upgraded {enhancedResume.actionVerbUpgrades.length} action verbs for stronger impact</li>
                  <li>• Restructured content to match role requirements</li>
                </>
              )}
            </ul>
          </Card>

          {/* Cover Letter Prompt */}
          {!showCoverLetterResult && !isGeneratingCoverLetter && (
            <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-primary" /> Want a Matching Cover Letter?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our AI can create a personalized cover letter that complements your optimized resume.
                  </p>
                </div>
                <Button onClick={() => setShowCoverLetterDetailsDialog(true)}>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate Cover Letter
                </Button>
              </div>
            </Card>
          )}

          {/* Generating Cover Letter */}
          {isGeneratingCoverLetter && (
            <Card className="p-6 mb-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Generating your personalized cover letter...</p>
            </Card>
          )}

          {/* Downloads Section - Organized by Document Type */}
          <div className="space-y-4 mb-8">
            
            {/* ATS Report Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">ATS Report</h3>
                    <p className="text-xs text-muted-foreground">Your complete resume analysis</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyReport}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <FileDown className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </div>
              </div>
            </Card>

            {/* Cover Letter Section */}
            {showCoverLetterResult && generatedCoverLetter ? (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Cover Letter</h3>
                      <p className="text-xs text-muted-foreground">Personalized for this role</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyCoverLetter}>
                      <Copy className="w-4 h-4 mr-1" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCoverLetterPDF}>
                      <FileDown className="w-4 h-4 mr-1" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadCoverLetter}>
                      <Download className="w-4 h-4 mr-1" /> DOCX
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowCoverLetterDetailsDialog(true)}>
                      <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4 max-h-[200px] overflow-y-auto whitespace-pre-wrap text-sm">
                  {generatedCoverLetter}
                </div>
              </Card>
            ) : !isGeneratingCoverLetter && (
              <Card className="p-4 border-dashed border-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <FileSignature className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Cover Letter</h3>
                      <p className="text-xs text-muted-foreground">Generate a matching cover letter for this role</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowCoverLetterDetailsDialog(true)}>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate
                  </Button>
                </div>
              </Card>
            )}

            {isGeneratingCoverLetter && (
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">Generating your personalized cover letter...</span>
                </div>
              </Card>
            )}

            {/* Optimized Resume Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Optimized Resume</h3>
                    <p className="text-xs text-muted-foreground">Your ATS-optimized resume ready to use</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyEnhanced}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                </div>
              </div>
              
              {/* Format Selection */}
              {!selectedFormat ? (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-4">Select a format to download your resume:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div 
                      onClick={() => setSelectedFormat("classic")}
                      className="cursor-pointer border-2 border-muted rounded-lg p-3 hover:border-primary/50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-12 h-14 bg-white rounded border shadow-sm flex-shrink-0 p-1">
                        <div className="h-1.5 bg-gray-300 rounded w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-200 rounded w-full mb-0.5"></div>
                        <div className="h-0.5 bg-gray-200 rounded w-5/6 mb-0.5"></div>
                        <div className="h-0.5 bg-gray-200 rounded w-full"></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Professional Classic</h4>
                        <p className="text-xs text-muted-foreground">Traditional single-column</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => setSelectedFormat("modern")}
                      className="cursor-pointer border-2 border-muted rounded-lg p-3 hover:border-primary/50 transition-colors flex items-center gap-3"
                    >
                      <div className="w-12 h-14 bg-white rounded border shadow-sm flex-shrink-0 flex overflow-hidden">
                        <div className="w-1/3 bg-slate-700"></div>
                        <div className="w-2/3 p-1">
                          <div className="h-0.5 bg-gray-200 rounded w-full mb-0.5"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-5/6 mb-0.5"></div>
                          <div className="h-0.5 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm">Modern Two-Column</h4>
                        <p className="text-xs text-muted-foreground">Contemporary with sidebar</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Format: <strong>{selectedFormat === "classic" ? "Professional Classic" : "Modern Two-Column"}</strong>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFormat(null)}>
                      Change
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" onClick={handleDownloadFormattedPDF}>
                      <FileDown className="w-4 h-4 mr-1" /> PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadResume}>
                      <Download className="w-4 h-4 mr-1" /> DOCX
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Another
            </Button>
            <Button onClick={onComplete}>
              Done
            </Button>
          </div>

          {/* Cover Letter Details Dialog */}
          <Dialog open={showCoverLetterDetailsDialog} onOpenChange={setShowCoverLetterDetailsDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-primary" />
                  Cover Letter Details
                </DialogTitle>
                <DialogDescription>
                  Provide your details to create a personalized cover letter.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidateName">Your Name *</Label>
                    <Input
                      id="candidateName"
                      placeholder="John Smith"
                      value={coverLetterDetails.candidateName}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, candidateName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidateEmail">Email</Label>
                    <Input
                      id="candidateEmail"
                      type="email"
                      placeholder="john@example.com"
                      value={coverLetterDetails.candidateEmail}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, candidateEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="candidatePhone">Phone (optional)</Label>
                    <Input
                      id="candidatePhone"
                      placeholder="+1 (555) 123-4567"
                      value={coverLetterDetails.candidatePhone}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, candidatePhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name (optional)</Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Inc."
                      value={coverLetterDetails.companyName}
                      onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiringManager">Hiring Manager Name (optional)</Label>
                  <Input
                    id="hiringManager"
                    placeholder="Jane Doe"
                    value={coverLetterDetails.hiringManagerName}
                    onChange={(e) => setCoverLetterDetails(prev => ({ ...prev, hiringManagerName: e.target.value }))}
                  />
                </div>
                
                {/* Cover Letter Length Selection */}
                <div className="space-y-3 pt-2 border-t">
                  <Label>Cover Letter Length</Label>
                  <RadioGroup 
                    value={coverLetterLength} 
                    onValueChange={(value) => setCoverLetterLength(value as CoverLetterLength)}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="short" id="short" className="mt-1" />
                      <div>
                        <Label htmlFor="short" className="font-medium cursor-pointer">Short</Label>
                        <p className="text-xs text-muted-foreground">~200 words, concise</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="medium" id="medium" className="mt-1" />
                      <div>
                        <Label htmlFor="medium" className="font-medium cursor-pointer">Medium</Label>
                        <p className="text-xs text-muted-foreground">~350 words, balanced</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <RadioGroupItem value="detailed" id="detailed" className="mt-1" />
                      <div>
                        <Label htmlFor="detailed" className="font-medium cursor-pointer">Detailed</Label>
                        <p className="text-xs text-muted-foreground">~500 words, comprehensive</p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button className="w-full" onClick={handleGenerateCoverLetter}>
                  <Sparkles className="w-4 h-4 mr-2" /> Generate {coverLetterLength.charAt(0).toUpperCase() + coverLetterLength.slice(1)} Cover Letter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return null;
}
