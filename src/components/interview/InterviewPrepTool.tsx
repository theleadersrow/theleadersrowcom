import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, Send, Bot, User, Loader2, Play, 
  Target, Building2, MapPin, Briefcase, MessageSquare,
  CheckCircle, ChevronRight, Sparkles, RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface InterviewPrepToolProps {
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InterviewContext {
  roleType: "product" | "software";
  level: string;
  company: string;
  location: string;
  interviewType: string;
}

type OnboardingStep = "role" | "level" | "company" | "interview_type" | "ready";

const LEVELS = {
  product: [
    { value: "associate", label: "Associate PM", description: "0-2 years experience" },
    { value: "pm", label: "Product Manager", description: "2-5 years experience" },
    { value: "senior", label: "Senior PM", description: "5-8 years experience" },
    { value: "principal", label: "Principal PM", description: "8+ years experience" },
    { value: "director", label: "Director / GPM", description: "Team leadership" },
  ],
  software: [
    { value: "junior", label: "Junior Engineer", description: "0-2 years experience" },
    { value: "mid", label: "Software Engineer", description: "2-5 years experience" },
    { value: "senior", label: "Senior Engineer", description: "5-8 years experience" },
    { value: "staff", label: "Staff Engineer", description: "8+ years experience" },
    { value: "principal", label: "Principal / Architect", description: "Technical leadership" },
  ],
};

const INTERVIEW_TYPES = {
  product: [
    { value: "product_sense", label: "Product Sense", description: "Design and improve products", icon: Sparkles },
    { value: "metrics", label: "Metrics & Analytics", description: "Data-driven decisions", icon: Target },
    { value: "strategy", label: "Product Strategy", description: "Vision and market analysis", icon: Briefcase },
    { value: "behavioral", label: "Behavioral", description: "Past experiences (STAR)", icon: MessageSquare },
    { value: "mixed", label: "Full Interview", description: "All question types", icon: CheckCircle },
  ],
  software: [
    { value: "system_design", label: "System Design", description: "Architecture and scalability", icon: Building2 },
    { value: "technical", label: "Technical Discussion", description: "Problem-solving approach", icon: Target },
    { value: "behavioral", label: "Behavioral", description: "Past experiences (STAR)", icon: MessageSquare },
    { value: "mixed", label: "Full Interview", description: "All question types", icon: CheckCircle },
  ],
};

const TOP_COMPANIES = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft", 
  "Netflix", "Stripe", "Airbnb", "Uber", "Spotify",
  "Salesforce", "Adobe", "Twitter/X", "LinkedIn", "Other"
];

export function InterviewPrepTool({ onBack }: InterviewPrepToolProps) {
  const [step, setStep] = useState<OnboardingStep>("role");
  const [context, setContext] = useState<InterviewContext>({
    roleType: "product",
    level: "",
    company: "",
    location: "",
    interviewType: "",
  });
  const [customCompany, setCustomCompany] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRoleSelect = (role: "product" | "software") => {
    setContext(prev => ({ ...prev, roleType: role }));
    setStep("level");
  };

  const handleLevelSelect = (level: string) => {
    setContext(prev => ({ ...prev, level }));
    setStep("company");
  };

  const handleCompanySelect = (company: string) => {
    if (company === "Other") {
      // Show custom input
      return;
    }
    setContext(prev => ({ ...prev, company }));
    setStep("interview_type");
  };

  const handleCustomCompany = () => {
    if (customCompany.trim()) {
      setContext(prev => ({ ...prev, company: customCompany.trim() }));
      setStep("interview_type");
    }
  };

  const handleInterviewTypeSelect = (type: string) => {
    setContext(prev => ({ ...prev, interviewType: type }));
    setStep("ready");
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [],
            context,
            action: "start",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start interview");
      }

      await streamResponse(response);
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start interview. Please try again.");
      setInterviewStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const streamResponse = async (response: Response) => {
    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

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
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
              return newMessages;
            });
          }
        } catch {
          // Incomplete JSON, continue
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mock-interview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
            context,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      await streamResponse(response);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetInterview = () => {
    setMessages([]);
    setInterviewStarted(false);
    setStep("role");
    setContext({
      roleType: "product",
      level: "",
      company: "",
      location: "",
      interviewType: "",
    });
  };

  // Render onboarding steps
  if (!interviewStarted) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg">Interview Prep</h2>
            <p className="text-xs text-muted-foreground">Practice with AI-powered mock interviews</p>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto p-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {["role", "level", "company", "interview_type", "ready"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step === s ? "bg-primary text-primary-foreground" : 
                    ["role", "level", "company", "interview_type", "ready"].indexOf(step) > i 
                      ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  {i < 4 && <div className={`w-8 h-0.5 ${
                    ["role", "level", "company", "interview_type", "ready"].indexOf(step) > i 
                      ? "bg-primary/20" : "bg-muted"
                  }`} />}
                </div>
              ))}
            </div>

            {/* Step: Role Selection */}
            {step === "role" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">What role are you interviewing for?</h3>
                  <p className="text-muted-foreground">We'll tailor the interview experience to your target role</p>
                </div>
                <div className="grid gap-4">
                  <button
                    onClick={() => handleRoleSelect("product")}
                    className="p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                        <Target className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Product Manager</h4>
                        <p className="text-sm text-muted-foreground">Product sense, strategy, metrics, stakeholder management</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSelect("software")}
                    className="p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">Software Engineer</h4>
                        <p className="text-sm text-muted-foreground">System design, technical discussions, coding approach</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Step: Level Selection */}
            {step === "level" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">What level are you targeting?</h3>
                  <p className="text-muted-foreground">Questions will be calibrated to this level</p>
                </div>
                <div className="grid gap-3">
                  {LEVELS[context.roleType].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleLevelSelect(level.value)}
                      className="p-4 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{level.label}</h4>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={() => setStep("role")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step: Company Selection */}
            {step === "company" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Which company are you interviewing at?</h3>
                  <p className="text-muted-foreground">We'll reference their products and culture</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {TOP_COMPANIES.filter(c => c !== "Other").map((company) => (
                    <button
                      key={company}
                      onClick={() => handleCompanySelect(company)}
                      className="p-3 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center font-medium"
                    >
                      {company}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or enter company name..."
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg bg-background"
                    onKeyDown={(e) => e.key === "Enter" && handleCustomCompany()}
                  />
                  <Button onClick={handleCustomCompany} disabled={!customCompany.trim()}>
                    Continue
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => setStep("level")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step: Interview Type */}
            {step === "interview_type" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">What would you like to practice?</h3>
                  <p className="text-muted-foreground">Choose an interview focus area</p>
                </div>
                <div className="grid gap-3">
                  {INTERVIEW_TYPES[context.roleType].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleInterviewTypeSelect(type.value)}
                        className="p-4 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{type.label}</h4>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    );
                  })}
                </div>
                <Button variant="ghost" onClick={() => setStep("company")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}

            {/* Step: Ready */}
            {step === "ready" && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Ready to start!</h3>
                  <p className="text-muted-foreground">Your personalized interview is ready</p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Role:</strong> {context.roleType === "product" ? "Product Manager" : "Software Engineer"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Level:</strong> {LEVELS[context.roleType].find(l => l.value === context.level)?.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Company:</strong> {context.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm"><strong>Focus:</strong> {INTERVIEW_TYPES[context.roleType].find(t => t.value === context.interviewType)?.label}</span>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h4 className="font-medium text-amber-700 dark:text-amber-400 mb-2">Tips for best results:</h4>
                  <ul className="text-sm text-amber-700/80 dark:text-amber-400/80 space-y-1">
                    <li>• Answer as you would in a real interview</li>
                    <li>• Use the STAR format for behavioral questions</li>
                    <li>• Ask clarifying questions if needed</li>
                    <li>• The interviewer will give you feedback after each answer</li>
                  </ul>
                </div>

                <Button onClick={startInterview} size="lg" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Start Interview
                </Button>

                <Button variant="ghost" onClick={() => setStep("interview_type")} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Interview chat UI
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Mock Interview
            </h2>
            <p className="text-xs text-muted-foreground">
              {context.company} • {LEVELS[context.roleType].find(l => l.value === context.level)?.label} • {INTERVIEW_TYPES[context.roleType].find(t => t.value === context.interviewType)?.label}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetInterview}>
          <RotateCcw className="w-4 h-4 mr-2" />
          New Interview
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            className="min-h-[60px] max-h-[200px] resize-none"
            rows={2}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="h-auto">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
