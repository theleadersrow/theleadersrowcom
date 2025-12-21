import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  FileText, Sparkles, BarChart3, MessageSquare, 
  ArrowRight, Target, Zap, CheckCircle, Lock,
  TrendingUp, Linkedin
} from "lucide-react";

interface CareerIntelligenceSuiteProps {
  onStartResumeSuite: () => void;
  onStartLinkedIn: () => void;
  resumeHasAccess?: boolean;
  linkedInHasAccess?: boolean;
}

export function CareerIntelligenceSuite({ 
  onStartResumeSuite, 
  onStartLinkedIn,
  resumeHasAccess = false,
  linkedInHasAccess = false
}: CareerIntelligenceSuiteProps) {
  const tools = [
    {
      id: "resume",
      icon: FileText,
      title: "Resume Intelligence",
      tag: "Free scan → Paid optimization",
      description: "Get an ATS scan + unlock a fully optimized resume + downloads.",
      cta: resumeHasAccess ? "Continue" : "Start Free",
      featured: true,
      onClick: onStartResumeSuite,
      hasAccess: resumeHasAccess
    },
    {
      id: "linkedin",
      icon: Linkedin,
      title: "LinkedIn Signal Score",
      tag: linkedInHasAccess ? "Active" : "Paid Tool",
      description: "Optimize your LinkedIn profile for recruiter visibility.",
      cta: linkedInHasAccess ? "Open Tool" : "Get Access",
      featured: false,
      onClick: onStartLinkedIn,
      hasAccess: linkedInHasAccess
    },
    {
      id: "interview",
      icon: MessageSquare,
      title: "Interview Prep",
      tag: "Coming Soon",
      description: "Targeted preparation for specific interviews with mock sessions, STAR answers, and role-tailored questions.",
      cta: "Coming Soon",
      featured: false,
      disabled: true,
      onClick: () => {},
      hasAccess: false
    }
  ];

  const steps = [
    {
      icon: Target,
      title: "Upload",
      description: "Upload your resume and target job description"
    },
    {
      icon: BarChart3,
      title: "See Gaps",
      description: "Get instant ATS score and identify improvement areas"
    },
    {
      icon: Sparkles,
      title: "Unlock Optimized Resume",
      description: "Get a fully rewritten, ATS-optimized resume ready to submit"
    }
  ];

  return (
    <div className="min-h-[80vh] animate-fade-up px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Career Intelligence Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Know where you stand. Fix what's holding you back.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tools.map((tool) => (
            <Card 
              key={tool.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                tool.featured 
                  ? "border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 md:col-span-1" 
                  : "border-border"
              } ${tool.disabled ? "opacity-60" : "cursor-pointer hover:border-primary/30"}`}
            >
              {tool.featured && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                  Featured
                </div>
              )}
              
              <div className="p-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  tool.featured 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {tool.title}
                </h3>
                
                <span className={`inline-block text-xs px-2 py-1 rounded-full mb-3 ${
                  tool.hasAccess 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : tool.disabled
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary/20 text-secondary-foreground"
                }`}>
                  {tool.tag}
                </span>
                
                <p className="text-sm text-muted-foreground mb-6">
                  {tool.description}
                </p>
                
                <Button 
                  className="w-full"
                  variant={tool.featured ? "default" : "outline"}
                  disabled={tool.disabled}
                  onClick={tool.onClick}
                >
                  {tool.cta}
                  {!tool.disabled && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-8">
            How it works in 3 steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Value Props */}
        <div className="mt-12 grid md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Zap, label: "Instant Analysis" },
            { icon: CheckCircle, label: "ATS-Optimized" },
            { icon: TrendingUp, label: "Higher Response Rate" },
            { icon: Lock, label: "Secure & Private" }
          ].map((prop, i) => (
            <div key={i} className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <prop.icon className="w-4 h-4 text-primary" />
              <span>{prop.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
