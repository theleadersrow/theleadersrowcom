import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Upload, Send, Bot, User, Loader2, FileText, MessageCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CareerCoach = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [showInterviewPrepDialog, setShowInterviewPrepDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Count conversation turns to estimate step
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === "user").length;
    if (userMessages <= 1) setStep(1);
    else if (userMessages <= 2) setStep(2);
    else if (userMessages <= 3) setStep(3);
    else if (userMessages <= 4) setStep(4);
    else if (userMessages <= 5) setStep(5);
    else setStep(6);
  }, [messages]);

  // Initialize session and get first message
  useEffect(() => {
    const initSession = async () => {
      await supabase.from("career_assessments").insert({
        session_id: sessionId,
      });
      sendMessage([], true);
    };
    initSession();
  }, [sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (currentMessages: Message[], isInit = false) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: currentMessages,
            resumeText: resumeText,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      await supabase
        .from("career_assessments")
        .update({
          conversation_history: [...currentMessages, { role: "assistant", content: assistantContent }],
        })
        .eq("session_id", sessionId);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    await sendMessage(newMessages);
  };

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

    setIsUploadingResume(true);
    setResumeFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sessionId", sessionId);

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
        
        const userMessage: Message = { 
          role: "user", 
          content: `I have uploaded my resume: ${file.name}` 
        };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        
        await sendMessage(newMessages);
        
        toast({
          title: "Resume uploaded",
          description: "Your resume has been analyzed",
        });
      } else {
        throw new Error("Failed to parse resume");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to process your resume. Please try again.",
        variant: "destructive",
      });
      setResumeFileName(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderLink = (href: string | undefined, children: React.ReactNode) => {
    if (href?.startsWith("/")) {
      return (
        <Link to={href} className="text-primary hover:underline font-medium">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
        {children}
      </a>
    );
  };

  const stepLabels = [
    "Current Role",
    "Background",
    "Goals",
    "Skills",
    "Challenges",
    "Assessment"
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20">
        {/* Top Bar with Progress */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-20 z-10 safe-area-inset-top">
          <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="font-semibold text-foreground text-sm sm:text-base">AI Career Coach</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Step {step} of 6
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="flex gap-0.5 sm:gap-1">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex-1">
                  <div 
                    className={`h-1 sm:h-1.5 rounded-full transition-colors ${
                      i + 1 <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  <span className={`text-[8px] sm:text-[10px] mt-0.5 sm:mt-1 block text-center ${
                    i + 1 <= step ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="container max-w-3xl mx-auto px-3 sm:px-4 pb-36 sm:pb-40">
          {/* Interview Prep Card - shown at the start */}
          {messages.length <= 2 && (
            <div className="py-4">
              <button
                onClick={() => setShowInterviewPrepDialog(true)}
                className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-card/80 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                    <Sparkles className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">AI Interview Prep</span>
                      <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full">Coming Soon</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Practice mock interviews with AI feedback and coaching
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}
          <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 sm:gap-4 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  message.role === "assistant" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-secondary text-secondary-foreground"
                }`}>
                  {message.role === "assistant" ? (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-[85%] sm:max-w-[85%] ${
                  message.role === "user" ? "text-right" : ""
                }`}>
                  <div className={`inline-block text-left rounded-2xl px-3 py-3 sm:px-5 sm:py-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border shadow-sm"
                  }`}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => renderLink(href, children),
                            h2: ({ children }) => (
                              <h2 className="text-base sm:text-lg font-bold mt-4 sm:mt-6 mb-2 sm:mb-3 first:mt-0 text-foreground">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm sm:text-base font-semibold mt-3 sm:mt-4 mb-1 sm:mb-2 text-foreground">{children}</h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 sm:mb-3 last:mb-0 leading-relaxed text-sm sm:text-base">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 sm:pl-5 mb-2 sm:mb-3 space-y-1 sm:space-y-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 sm:pl-5 mb-2 sm:mb-3 space-y-1 sm:space-y-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="leading-relaxed text-sm sm:text-base">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                            hr: () => (
                              <hr className="my-4 sm:my-6 border-border" />
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex gap-2 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-3 py-3 sm:px-5 sm:py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-inset-bottom">
          <div className="container max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            {/* Resume Status */}
            {resumeFileName && (
              <div className="mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">Resume uploaded: {resumeFileName}</span>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 items-end">
              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingResume || isLoading}
                title="Upload Resume (PDF or Word)"
                className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12"
              >
                {isUploadingResume ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your response..."
                  disabled={isLoading}
                  className="min-h-[40px] sm:min-h-[48px] max-h-32 resize-none pr-12 text-base"
                  rows={1}
                />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>

            <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
              100% free • Your data is private
            </p>
          </div>
        </div>

        {/* Interview Prep Coming Soon Dialog */}
        <Dialog open={showInterviewPrepDialog} onOpenChange={setShowInterviewPrepDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Interview Prep
              </DialogTitle>
              <DialogDescription className="pt-4 space-y-4">
                <p>
                  Our AI-powered Interview Prep tool will help you practice and prepare for real interviews with personalized mock sessions, feedback, and coaching.
                </p>
                <div className="bg-secondary/20 rounded-lg p-4 text-center">
                  <p className="text-lg font-semibold text-foreground">Coming Soon!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This premium feature will be launching in a few months. Stay tuned!
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button onClick={() => setShowInterviewPrepDialog(false)}>
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CareerCoach;
