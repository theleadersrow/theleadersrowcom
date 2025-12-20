import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, Lock, Sparkles, ArrowRight, 
  Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tip?: string;
}

interface QuestionCategory {
  name: string;
  description: string;
  questions: InterviewQuestion[];
}

interface InterviewQuestionsPreviewProps {
  resumeContent: string;
  targetRole: string;
  jobDescription?: string;
  onContinue: () => void;
  onUnlockInterviewPrep?: () => void;
}

export function InterviewQuestionsPreview({
  resumeContent,
  targetRole,
  jobDescription,
  onContinue,
  onUnlockInterviewPrep
}: InterviewQuestionsPreviewProps) {
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    generateInterviewQuestions();
  }, [resumeContent, targetRole]);

  const generateInterviewQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-interview-prep", {
        body: {
          resumeText: resumeContent,
          targetRole: targetRole,
          jobDescription: jobDescription,
          previewOnly: true,
        },
      });

      if (error) throw error;
      
      if (data?.questionCategories) {
        setCategories(data.questionCategories);
        if (data.questionCategories.length > 0) {
          setExpandedCategory(data.questionCategories[0].name);
        }
      } else {
        const defaultCategories = getDefaultCategories(targetRole);
        setCategories(defaultCategories);
        if (defaultCategories.length > 0) {
          setExpandedCategory(defaultCategories[0].name);
        }
      }
    } catch (error) {
      console.error("Error generating interview questions:", error);
      const defaultCategories = getDefaultCategories(targetRole);
      setCategories(defaultCategories);
      if (defaultCategories.length > 0) {
        setExpandedCategory(defaultCategories[0].name);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultCategories = (role: string): QuestionCategory[] => {
    const roleKeywords = role.toLowerCase();
    
    if (roleKeywords.includes("product") || roleKeywords.includes("pm")) {
      return [
        {
          name: "Product Sense & Problem Framing",
          description: "How you think, not what you know — customer empathy, structured thinking, tradeoffs, clarity under ambiguity",
          questions: [
            { question: "How would you identify the biggest problem to solve for [product/company] right now?", category: "Product Sense", difficulty: "Hard" },
            { question: "Tell me about a time you worked on a problem that was poorly defined. How did you bring clarity?", category: "Product Sense", difficulty: "Hard" },
            { question: "How do you decide what not to build?", category: "Product Sense", difficulty: "Medium" },
            { question: "If usage is flat but revenue is growing, what questions would you ask first?", category: "Product Sense", difficulty: "Hard" },
          ]
        },
        {
          name: "Product Strategy & Vision",
          description: "Your ability to think long-term and at the right altitude — strategic judgment, prioritization, business alignment",
          questions: [
            { question: "How do you define product strategy, and how is it different from a roadmap?", category: "Product Strategy", difficulty: "Medium" },
            { question: "Walk me through how you would set a 12–18 month vision for this product.", category: "Product Strategy", difficulty: "Hard" },
            { question: "Tell me about a strategic bet you made that didn't pay off. What did you learn?", category: "Product Strategy", difficulty: "Hard" },
            { question: "How do you align product strategy with company goals when there's conflict?", category: "Product Strategy", difficulty: "Hard" },
          ]
        },
        {
          name: "Execution & Decision-Making",
          description: "Can you ship and deliver impact consistently? — ownership, prioritization under constraints, bias to action",
          questions: [
            { question: "Describe a complex product you shipped end-to-end. What were the hardest decisions?", category: "Execution", difficulty: "Hard" },
            { question: "How do you prioritize when everything feels urgent?", category: "Execution", difficulty: "Medium" },
            { question: "Tell me about a time you had to make a decision with incomplete data.", category: "Execution", difficulty: "Hard" },
            { question: "How do you balance speed vs quality?", category: "Execution", difficulty: "Medium" },
          ]
        },
        {
          name: "Data, Metrics & Business Impact",
          description: "Do you understand what actually moves the business? — metric thinking, outcome focus, analytical rigor",
          questions: [
            { question: "What metrics do you use to measure success for your product?", category: "Metrics", difficulty: "Medium" },
            { question: "How do you choose a North Star metric?", category: "Metrics", difficulty: "Hard" },
            { question: "Tell me about a time data changed your original product direction.", category: "Metrics", difficulty: "Hard" },
            { question: "If a key metric drops suddenly, how do you investigate?", category: "Metrics", difficulty: "Hard" },
          ]
        },
        {
          name: "Stakeholder Management & Influence",
          description: "How you lead without authority — communication, alignment, conflict resolution, leadership maturity",
          questions: [
            { question: "Tell me about a time you disagreed with engineering or leadership. How did you handle it?", category: "Stakeholder", difficulty: "Hard" },
            { question: "How do you influence decisions when you don't have direct authority?", category: "Stakeholder", difficulty: "Medium" },
            { question: "Describe a difficult stakeholder and how you built alignment.", category: "Stakeholder", difficulty: "Hard" },
            { question: "How do you communicate tradeoffs to executives?", category: "Stakeholder", difficulty: "Medium" },
          ]
        },
        {
          name: "Leadership, Growth & Product Judgment",
          description: "What makes you trusted at the next level (Senior+ roles) — people leadership, judgment, mentorship",
          questions: [
            { question: "How do you develop and coach other PMs?", category: "Leadership", difficulty: "Hard" },
            { question: "What distinguishes a Senior PM from a Principal or Director?", category: "Leadership", difficulty: "Medium" },
            { question: "Tell me about a time you raised the quality bar for your team.", category: "Leadership", difficulty: "Hard" },
            { question: "How do you scale yourself as product scope increases?", category: "Leadership", difficulty: "Hard" },
          ]
        }
      ];
    } else if (roleKeywords.includes("engineer") || roleKeywords.includes("developer")) {
      return [
        {
          name: "Behavioral",
          description: "Questions about your past experiences and teamwork",
          questions: [
            { question: "Tell me about a time you had to learn a new technology quickly.", category: "Behavioral", difficulty: "Medium" },
            { question: "Describe a situation where you disagreed with a technical decision.", category: "Behavioral", difficulty: "Medium" },
            { question: "How do you handle tight deadlines with competing priorities?", category: "Behavioral", difficulty: "Medium" },
          ]
        },
        {
          name: "Technical Problem Solving",
          description: "Questions about your approach to solving complex problems",
          questions: [
            { question: "Describe a complex bug you debugged. What was your approach?", category: "Technical", difficulty: "Hard" },
            { question: "How do you approach breaking down a large technical problem?", category: "Technical", difficulty: "Medium" },
            { question: "Walk me through optimizing a slow database query.", category: "Technical", difficulty: "Hard" },
          ]
        },
        {
          name: "System Design",
          description: "Questions about designing scalable systems",
          questions: [
            { question: "Design a URL shortener service.", category: "System Design", difficulty: "Hard" },
            { question: "How would you design a real-time notification system?", category: "System Design", difficulty: "Hard" },
            { question: "What factors do you consider when choosing between SQL and NoSQL?", category: "System Design", difficulty: "Medium" },
          ]
        },
        {
          name: "Code Quality & Best Practices",
          description: "Questions about maintainability and engineering practices",
          questions: [
            { question: "How do you ensure code quality in your team?", category: "Best Practices", difficulty: "Medium" },
            { question: "What's your approach to technical debt?", category: "Best Practices", difficulty: "Medium" },
            { question: "How do you decide when to refactor vs. rewrite?", category: "Best Practices", difficulty: "Hard" },
          ]
        }
      ];
    } else if (roleKeywords.includes("manager") || roleKeywords.includes("director") || roleKeywords.includes("lead")) {
      return [
        {
          name: "Behavioral",
          description: "Questions about your leadership experiences",
          questions: [
            { question: "Tell me about a time you had to deliver difficult feedback.", category: "Behavioral", difficulty: "Hard" },
            { question: "Describe a situation where you had to make an unpopular decision.", category: "Behavioral", difficulty: "Hard" },
            { question: "How do you build trust with a new team?", category: "Behavioral", difficulty: "Medium" },
          ]
        },
        {
          name: "Team Leadership",
          description: "Questions about managing and developing teams",
          questions: [
            { question: "How do you handle underperforming team members?", category: "Leadership", difficulty: "Hard" },
            { question: "What's your approach to hiring and building a team?", category: "Leadership", difficulty: "Medium" },
            { question: "How do you create an environment of psychological safety?", category: "Leadership", difficulty: "Hard" },
          ]
        },
        {
          name: "Strategy & Vision",
          description: "Questions about strategic thinking and planning",
          questions: [
            { question: "How do you balance strategic planning with day-to-day execution?", category: "Strategy", difficulty: "Medium" },
            { question: "How do you align your team's work with company objectives?", category: "Strategy", difficulty: "Medium" },
            { question: "Describe how you've driven organizational change.", category: "Strategy", difficulty: "Hard" },
          ]
        },
        {
          name: "Stakeholder Management",
          description: "Questions about working with cross-functional partners",
          questions: [
            { question: "Tell me about a time you had to influence without authority.", category: "Influence", difficulty: "Hard" },
            { question: "How do you manage conflicting priorities from different stakeholders?", category: "Influence", difficulty: "Hard" },
            { question: "How do you communicate bad news to executives?", category: "Influence", difficulty: "Medium" },
          ]
        }
      ];
    } else {
      return [
        {
          name: "Behavioral",
          description: "Questions about your past experiences and work style",
          questions: [
            { question: "Tell me about yourself and your career journey.", category: "Behavioral", difficulty: "Easy" },
            { question: "Describe a challenge you faced and how you overcame it.", category: "Behavioral", difficulty: "Medium" },
            { question: "What's your biggest professional achievement?", category: "Behavioral", difficulty: "Medium" },
          ]
        },
        {
          name: "Motivation & Goals",
          description: "Questions about your career aspirations",
          questions: [
            { question: "Why are you interested in this role?", category: "Motivation", difficulty: "Medium" },
            { question: "Where do you see yourself in 5 years?", category: "Goals", difficulty: "Easy" },
            { question: "What motivates you in your work?", category: "Motivation", difficulty: "Easy" },
          ]
        },
        {
          name: "Problem Solving",
          description: "Questions about how you approach challenges",
          questions: [
            { question: "How do you handle multiple competing priorities?", category: "Problem Solving", difficulty: "Medium" },
            { question: "Describe a time you had to learn something new quickly.", category: "Problem Solving", difficulty: "Medium" },
            { question: "How do you approach unfamiliar problems?", category: "Problem Solving", difficulty: "Medium" },
          ]
        },
        {
          name: "Teamwork",
          description: "Questions about collaboration and communication",
          questions: [
            { question: "How do you handle disagreements with colleagues?", category: "Teamwork", difficulty: "Medium" },
            { question: "Describe your ideal work environment.", category: "Teamwork", difficulty: "Easy" },
            { question: "How do you prefer to communicate with your team?", category: "Teamwork", difficulty: "Easy" },
          ]
        }
      ];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Hard": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    return <MessageSquare className="w-5 h-5" />;
  };

  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <div className="space-y-6">
      <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Prepare for Your Interviews
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Based on your optimized resume and target role as <span className="font-medium text-foreground">{targetRole}</span>, 
              here are {totalQuestions} commonly asked questions organized by category:
            </p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your profile for relevant interview questions...</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Collapsible 
              key={category.name}
              open={expandedCategory === category.name}
              onOpenChange={(open) => setExpandedCategory(open ? category.name : null)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getCategoryIcon(category.name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {category.questions.length} questions
                      </Badge>
                      {expandedCategory === category.name ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 space-y-3">
                    {category.questions.map((q, qIndex) => (
                      <div key={qIndex} className="pt-3 first:pt-3">
                        <div className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-primary w-5 pt-0.5">{qIndex + 1}.</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{q.question}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                    <div className="bg-muted/30 rounded-lg p-3 mt-4">
                      <p className="text-xs text-muted-foreground italic flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        Unlock to get tailored answers, STAR-format examples, and practice exercises
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}

      {/* CTA to unlock full interview prep */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/30">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-semibold text-foreground flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="w-5 h-5 text-primary" />
              Want personalized answers for these questions?
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Get AI-generated answers tailored to your experience, practice exercises, and expert tips.
            </p>
          </div>
          {onUnlockInterviewPrep && (
            <Button onClick={onUnlockInterviewPrep} className="shrink-0">
              Unlock Interview Prep
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>

      {/* Back Button */}
      <div className="flex justify-between items-center">
        <Button onClick={onContinue} variant="outline" size="lg">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Resume
        </Button>
        {onUnlockInterviewPrep && (
          <Button onClick={onUnlockInterviewPrep} size="lg">
            Unlock Full Interview Prep
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}