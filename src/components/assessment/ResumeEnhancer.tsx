import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Upload, Loader2, Sparkles, FileText, 
  CheckCircle, Download, RefreshCw, Palette, Type, Layout, Wand2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface ResumeEnhancerProps {
  onBack: () => void;
  onComplete: () => void;
}

interface EnhancedResume {
  suggestions: string[];
  enhancedContent: string;
  formatting: {
    sections: string[];
    colorScheme: string;
    fontRecommendation: string;
  };
}

export function ResumeEnhancer({ onBack, onComplete }: ResumeEnhancerProps) {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [enhancedResume, setEnhancedResume] = useState<EnhancedResume | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      });
      return;
    }

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", crypto.randomUUID());

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.resumeText) {
        setResumeText(data.resumeText);
        toast({
          title: "Resume uploaded",
          description: "Your resume has been parsed successfully",
        });
      } else {
        throw new Error("Failed to parse resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to process your resume. Please try pasting the text instead.",
        variant: "destructive",
      });
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleEnhance = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "No resume content",
        description: "Please paste your resume or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-resume", {
        body: { resumeText },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limit") || data.error.includes("429")) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment and try again.",
            variant: "destructive",
          });
        } else if (data.error.includes("Payment") || data.error.includes("402")) {
          toast({
            title: "Service unavailable",
            description: "AI service is temporarily unavailable. Please try again later.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setEnhancedResume(data);
      toast({
        title: "Resume enhanced!",
        description: "Your resume has been analyzed and improved",
      });
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeText("");
    setEnhancedResume(null);
    setResumeFileName(null);
  };

  const handleCopyEnhanced = async () => {
    if (enhancedResume?.enhancedContent) {
      await navigator.clipboard.writeText(enhancedResume.enhancedContent);
      toast({
        title: "Copied!",
        description: "Enhanced resume copied to clipboard",
      });
    }
  };

  if (enhancedResume) {
    return (
      <div className="min-h-[80vh] animate-fade-up px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Enhanced Resume</h1>
              <p className="text-muted-foreground">AI-powered improvements and suggestions</p>
            </div>
          </div>

          {/* Formatting Recommendations */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Color Scheme</span>
              </div>
              <p className="text-sm text-muted-foreground">{enhancedResume.formatting.colorScheme}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Font</span>
              </div>
              <p className="text-sm text-muted-foreground">{enhancedResume.formatting.fontRecommendation}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Layout className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Sections</span>
              </div>
              <p className="text-sm text-muted-foreground">{enhancedResume.formatting.sections.length} optimized sections</p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Key Improvements Made
            </h2>
            <ul className="space-y-3">
              {enhancedResume.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Sections */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Recommended Section Order
            </h2>
            <div className="flex flex-wrap gap-2">
              {enhancedResume.formatting.sections.map((section, index) => (
                <span 
                  key={index}
                  className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  {index + 1}. {section}
                </span>
              ))}
            </div>
          </div>

          {/* Enhanced Content */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Enhanced Resume Content
              </h2>
              <Button variant="outline" size="sm" onClick={handleCopyEnhanced}>
                <Download className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <ReactMarkdown>{enhancedResume.enhancedContent}</ReactMarkdown>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Enhance Another Resume
            </Button>
            <Button variant="gold" onClick={onComplete}>
              Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">AI Resume Enhancer</h1>
            <p className="text-muted-foreground">Transform your resume with AI-powered improvements</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Wand2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Smart Formatting</h3>
              <p className="text-sm text-muted-foreground">Optimal section structure and layout</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Enhanced Text</h3>
              <p className="text-sm text-muted-foreground">Stronger action verbs and impact statements</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Color Coding</h3>
              <p className="text-sm text-muted-foreground">Professional color scheme recommendations</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Better Sections</h3>
              <p className="text-sm text-muted-foreground">Industry-standard section organization</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingResume}
              className="w-full sm:w-auto"
            >
              {isUploadingResume ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume (PDF/Word)
                </>
              )}
            </Button>
            {resumeFileName && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {resumeFileName}
              </p>
            )}
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1 border-t border-border" />
              <span className="text-sm text-muted-foreground">or paste your resume</span>
              <div className="flex-1 border-t border-border" />
            </div>
          </div>

          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here...

Include your:
• Contact information
• Summary or objective
• Work experience
• Education
• Skills
• Certifications (if any)"
            className="min-h-[300px] resize-none"
          />
        </div>

        {/* Enhance Button */}
        <div className="flex justify-center">
          <Button
            variant="gold"
            size="lg"
            onClick={handleEnhance}
            disabled={isAnalyzing || !resumeText.trim()}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enhancing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Enhance My Resume
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your resume content is processed securely and not stored permanently.
        </p>
      </div>
    </div>
  );
}