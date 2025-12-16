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
  AlertCircle, ChevronRight, Copy, Mail, FileSignature, ScrollText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

interface ResumeIntelligenceSuiteProps {
  onBack: () => void;
  onComplete: () => void;
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
  recommended_additions: string[];
  role_fit_assessment: string;
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
}

interface CoverLetterDetails {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  companyName: string;
  hiringManagerName: string;
}

type Step = "input" | "initial_score" | "enhancing" | "improvements" | "final_score";
type CoverLetterLength = "short" | "medium" | "detailed";

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
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
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
  
  // Fresh resume email state
  const [showFreshResumeDialog, setShowFreshResumeDialog] = useState(false);
  const [freshResumeEmail, setFreshResumeEmail] = useState("");
  const [isSendingFreshResume, setIsSendingFreshResume] = useState(false);
  
  // Change acceptance state
  const [acceptedContentChanges, setAcceptedContentChanges] = useState<Set<number>>(new Set());
  const [acceptedKeywords, setAcceptedKeywords] = useState<Set<number>>(new Set());
  const [acceptedVerbUpgrades, setAcceptedVerbUpgrades] = useState<Set<number>>(new Set());
  const [acceptedAchievements, setAcceptedAchievements] = useState<Set<number>>(new Set());
  const [finalResumeContent, setFinalResumeContent] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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
          body: JSON.stringify({ resumeText: finalContent, jobDescription }),
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
      // Parse the content to create a properly formatted Word doc
      const lines = content.split('\n').filter(line => line.trim());
      const children: Paragraph[] = [];
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Check if it's a header (all caps or starts with #)
        const isHeader = trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3 && !trimmedLine.startsWith('•') && !trimmedLine.startsWith('-');
        const isMarkdownHeader = trimmedLine.startsWith('#');
        
        if (isMarkdownHeader) {
          const headerLevel = trimmedLine.match(/^#+/)?.[0].length || 1;
          const text = trimmedLine.replace(/^#+\s*/, '');
          children.push(
            new Paragraph({
              text: text,
              heading: headerLevel === 1 ? HeadingLevel.HEADING_1 : headerLevel === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (isHeader) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: trimmedLine, bold: true, size: 24 })],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: "999999", style: BorderStyle.SINGLE, size: 6 } },
            })
          );
        } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
          // Bullet point
          const bulletText = trimmedLine.replace(/^[•\-\*]\s*/, '');
          children.push(
            new Paragraph({
              children: [new TextRun({ text: bulletText, size: 22 })],
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
            })
          );
        } else if (trimmedLine.match(/^\d+\./)) {
          // Numbered list
          children.push(
            new Paragraph({
              children: [new TextRun({ text: trimmedLine, size: 22 })],
              spacing: { before: 60, after: 60 },
            })
          );
        } else {
          // Regular paragraph
          children.push(
            new Paragraph({
              children: [new TextRun({ text: trimmedLine, size: 22 })],
              spacing: { before: 60, after: 60 },
            })
          );
        }
      });
      
      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "optimized-resume.docx");
      toast({ title: "Downloaded!", description: "Resume saved as Word document" });
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to text download
      const content = finalResumeContent || enhancedResume?.enhancedContent || "";
      const blob = new Blob([content], { type: "text/plain" });
      saveAs(blob, "optimized-resume.txt");
      toast({ title: "Downloaded!", description: "Resume saved as text file" });
    }
  };

  const handleEmailResume = async () => {
    if (!emailAddress.trim()) {
      toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (!content) return;

    setIsSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-enhanced-resume", {
        body: {
          email: emailAddress,
          resumeContent: content,
          improvements: {
            keywordsAdded: enhancedResume.addedKeywords.length,
            achievementsQuantified: enhancedResume.quantifiedAchievements.length,
            actionVerbsUpgraded: enhancedResume.actionVerbUpgrades.length,
          },
          scores: {
            before: initialScore?.ats_score || 0,
            after: finalScore?.ats_score || 0,
          },
        },
      });

      if (error) throw error;

      toast({ title: "Email sent!", description: `Your enhanced resume has been sent to ${emailAddress}` });
      setShowEmailDialog(false);
      setEmailAddress("");
    } catch (error) {
      console.error("Email error:", error);
      toast({ title: "Failed to send", description: "Please try again or download the resume instead", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
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
  };

  // Download report function
  const handleDownloadReport = () => {
    if (!initialScore) return;
    
    const reportContent = `
RESUME INTELLIGENCE REPORT
Generated by The Leader's Row - Rimo AI Coach
=====================================

OVERALL ATS SCORE: ${initialScore.ats_score}/100
${initialScore.summary}

SCORE BREAKDOWN:
- Keywords Match: ${initialScore.keyword_match_score}%
- Experience Match: ${initialScore.experience_match_score}%
- Skills Match: ${initialScore.skills_match_score}%
- Format Score: ${initialScore.format_score}%

${finalScore ? `
AFTER OPTIMIZATION:
- Overall Score: ${finalScore.ats_score}/100 (+${finalScore.ats_score - initialScore.ats_score} points)
- Keywords: ${finalScore.keyword_match_score}%
- Experience: ${finalScore.experience_match_score}%
- Skills: ${finalScore.skills_match_score}%
- Format: ${finalScore.format_score}%
` : ''}

STRENGTHS:
${initialScore.strengths.map(s => `• ${s}`).join('\n')}

MATCHED KEYWORDS:
${initialScore.matched_keywords.join(', ')}

MISSING KEYWORDS (Add these to your resume):
${initialScore.missing_keywords.join(', ')}

TOP IMPROVEMENTS NEEDED:
${initialScore.improvements.map(imp => `
[${imp.priority.toUpperCase()}] ${imp.issue}
→ ${imp.fix}
`).join('\n')}

EXPERIENCE GAPS:
${initialScore.experience_gaps.map(gap => `• ${gap}`).join('\n')}

RECOMMENDED ADDITIONS:
${initialScore.recommended_additions.map(add => `• ${add}`).join('\n')}

ROLE FIT ASSESSMENT:
${initialScore.role_fit_assessment}

${enhancedResume ? `
=====================================
IMPROVEMENTS MADE BY AI:
- Keywords Added: ${enhancedResume.addedKeywords.length}
- Achievements Quantified: ${enhancedResume.quantifiedAchievements.length}
- Action Verbs Upgraded: ${enhancedResume.actionVerbUpgrades.length}

KEYWORDS ADDED:
${enhancedResume.addedKeywords.join(', ')}

ACTION VERB UPGRADES:
${enhancedResume.actionVerbUpgrades.map(v => `"${v.original}" → "${v.improved}"`).join('\n')}
` : ''}

=====================================
Report generated by The Leader's Row
https://theleadersrow.com
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-analysis-report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Report saved successfully" });
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

  // Fresh resume email/download
  const handleSendFreshResume = async () => {
    if (!freshResumeEmail.trim()) {
      toast({ title: "Email required", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    const content = finalResumeContent || enhancedResume?.enhancedContent;
    if (!content) return;

    setIsSendingFreshResume(true);
    try {
      const { error } = await supabase.functions.invoke("send-enhanced-resume", {
        body: {
          email: freshResumeEmail,
          resumeContent: content,
          improvements: {
            keywordsAdded: enhancedResume.addedKeywords.length,
            achievementsQuantified: enhancedResume.quantifiedAchievements.length,
            actionVerbsUpgraded: enhancedResume.actionVerbUpgrades.length,
          },
          scores: {
            before: initialScore?.ats_score || 0,
            after: finalScore?.ats_score || 0,
          },
          coverLetter: generatedCoverLetter || undefined,
        },
      });

      if (error) throw error;

      toast({ title: "Sent!", description: `Your optimized resume has been sent to ${freshResumeEmail}` });
      setShowFreshResumeDialog(false);
      setFreshResumeEmail("");
    } catch (error) {
      console.error("Email error:", error);
      toast({ title: "Failed to send", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSendingFreshResume(false);
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
              <Sparkles className="w-4 h-4 text-primary" /> How Do You Want to Be Perceived?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Tell us about your professional identity, strengths, and how you want hiring managers to see you. 
              This helps our AI craft content that authentically represents YOU while maximizing ATS scores.
            </p>
            <Textarea
              placeholder="Example: I'm a strategic product manager who thrives at turning ambiguous problems into clear roadmaps. I'm known for building strong cross-functional relationships and driving measurable outcomes. I want to be seen as a leader who combines data-driven decision making with strong customer empathy..."
              value={selfProjection}
              onChange={(e) => setSelfProjection(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2 italic">
              The more specific you are, the more personalized and authentic your enhanced resume will feel.
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

          {initialScore.missing_keywords.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Missing Keywords ({initialScore.missing_keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {initialScore.missing_keywords.slice(0, 12).map((kw, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full dark:bg-orange-900/30 dark:text-orange-300">
                    {kw}
                  </span>
                ))}
                {initialScore.missing_keywords.length > 12 && (
                  <span className="text-xs text-muted-foreground">+{initialScore.missing_keywords.length - 12} more</span>
                )}
              </div>
            </Card>
          )}

          {initialScore.improvements.length > 0 && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Top Improvements Needed
              </h3>
              <div className="space-y-3">
                {initialScore.improvements.slice(0, 3).map((imp, i) => (
                  <div key={i} className="border-l-2 border-primary/50 pl-3">
                    <div className="font-medium text-foreground text-sm">{imp.issue}</div>
                    <div className="text-sm text-muted-foreground">{imp.fix}</div>
                  </div>
                ))}
              </div>
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

    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setStep("initial_score")} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Review Your Changes</h1>
              <p className="text-muted-foreground">Accept or decline each suggestion to customize your resume</p>
            </div>
          </div>

          {stepIndicator}

          {/* Quick Actions */}
          <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
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

          {/* Content Improvements - Before/After with Accept/Decline */}
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
                <Target className="w-4 h-4 text-primary" /> Keywords to Add ({acceptedKeywords.size}/{enhancedResume.addedKeywords.length} selected)
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Click keywords to include them in your final resume</p>
              <div className="flex flex-wrap gap-2">
                {enhancedResume.addedKeywords.map((kw, index) => {
                  const isAccepted = acceptedKeywords.has(index);
                  return (
                    <button
                      key={index}
                      onClick={() => toggleKeyword(index)}
                      className={`px-3 py-1.5 text-xs rounded-full transition-all border ${
                        isAccepted
                          ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                          : 'bg-muted/50 text-muted-foreground border-muted hover:border-primary/50'
                      }`}
                    >
                      {isAccepted && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {kw}
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Summary */}
          <Card className="p-4 mb-6 bg-muted/30">
            <h3 className="font-semibold text-foreground mb-2">Your Customized Resume Summary</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {acceptedContentChanges.size} content improvements accepted</li>
              <li>• {acceptedVerbUpgrades.size} action verb upgrades accepted</li>
              <li>• {acceptedKeywords.size} keywords will be added</li>
            </ul>
          </Card>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" onClick={() => setStep("initial_score")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
            <Button 
              size="lg" 
              onClick={handleFinalAnalysis} 
              disabled={isAnalyzing || acceptedCount === 0}
            >
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building Resume...</>
              ) : (
                <>Apply Changes & Score <ArrowRight className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
          {acceptedCount === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please accept at least one change to continue
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
                  {initialScore.ats_score}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Improvement</div>
                <div className={`text-4xl font-bold ${improvement > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                  +{improvement}
                </div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">After</div>
                <div className={`text-5xl font-bold ${getScoreColor(finalScore.ats_score)}`}>
                  {finalScore.ats_score}
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

          {/* Cover Letter Result */}
          {showCoverLetterResult && generatedCoverLetter && (
            <Card className="p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <FileSignature className="w-4 h-4 text-primary" /> Your Cover Letter
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyCoverLetter}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadCoverLetter}>
                    <Download className="w-4 h-4 mr-1" /> DOCX
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4 max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {generatedCoverLetter}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-6">
            <Button variant="outline" onClick={handleDownloadReport}>
              <ScrollText className="w-4 h-4 mr-2" /> Download Report
            </Button>
            <Button variant="outline" onClick={handleCopyEnhanced}>
              <Copy className="w-4 h-4 mr-2" /> Copy Resume
            </Button>
            <Button variant="outline" onClick={handleDownloadResume}>
              <Download className="w-4 h-4 mr-2" /> Download DOCX
            </Button>
          </div>

          {/* Fresh Resume Section */}
          <Card className="p-4 mb-6 border-primary/30 bg-primary/5">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Get Your Optimized Resume
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Download your fresh, optimized resume or have it emailed directly to you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleDownloadResume}>
                <Download className="w-4 h-4 mr-2" /> Download as DOCX
              </Button>
              <Button onClick={() => setShowFreshResumeDialog(true)}>
                <Mail className="w-4 h-4 mr-2" /> Email My Resume Package
              </Button>
            </div>
          </Card>

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

          {/* Fresh Resume Email Dialog */}
          <Dialog open={showFreshResumeDialog} onOpenChange={setShowFreshResumeDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Your Resume Package
                </DialogTitle>
                <DialogDescription>
                  We'll send your optimized resume{generatedCoverLetter ? " and cover letter" : ""} to your inbox.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={freshResumeEmail}
                  onChange={(e) => setFreshResumeEmail(e.target.value)}
                />
                {generatedCoverLetter && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Cover letter will be included
                  </p>
                )}
                <Button 
                  className="w-full" 
                  onClick={handleSendFreshResume}
                  disabled={isSendingFreshResume}
                >
                  {isSendingFreshResume ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" /> Send Package</>
                  )}
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
