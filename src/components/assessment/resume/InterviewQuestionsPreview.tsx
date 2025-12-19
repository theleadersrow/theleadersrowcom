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
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

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
          previewOnly: true, // Only get common questions, not full prep
        },
      });

      if (error) throw error;
      
      // Parse the response for preview questions
      if (data?.previewQuestions) {
        setQuestions(data.previewQuestions);
      } else {
        // Fallback to common questions if the function doesn't return preview
        setQuestions(getDefaultQuestions(targetRole));
      }
    } catch (error) {
      console.error("Error generating interview questions:", error);
      // Use default questions on error
      setQuestions(getDefaultQuestions(targetRole));
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultQuestions = (role: string): InterviewQuestion[] => {
    const roleKeywords = role.toLowerCase();
    
    if (roleKeywords.includes("product") || roleKeywords.includes("pm")) {
      return [
        { question: "Tell me about a product you've launched from concept to market. What was your role?", category: "Experience", difficulty: "Medium" },
        { question: "How do you prioritize features when you have limited resources?", category: "Product Sense", difficulty: "Hard" },
        { question: "Describe a time when you had to make a data-driven decision that went against stakeholder opinions.", category: "Decision Making", difficulty: "Hard" },
        { question: "How do you measure the success of a product feature?", category: "Metrics", difficulty: "Medium" },
        { question: "Walk me through how you would improve [Company's Product].", category: "Product Sense", difficulty: "Hard" },
      ];
    } else if (roleKeywords.includes("engineer") || roleKeywords.includes("developer")) {
      return [
        { question: "Describe a complex technical challenge you solved. What was your approach?", category: "Technical", difficulty: "Hard" },
        { question: "How do you balance technical debt with feature development?", category: "Decision Making", difficulty: "Medium" },
        { question: "Tell me about a time you had to learn a new technology quickly.", category: "Growth", difficulty: "Medium" },
        { question: "How do you ensure code quality in your team?", category: "Leadership", difficulty: "Medium" },
        { question: "Describe your approach to system design for a high-traffic application.", category: "System Design", difficulty: "Hard" },
      ];
    } else if (roleKeywords.includes("manager") || roleKeywords.includes("director") || roleKeywords.includes("lead")) {
      return [
        { question: "How do you handle underperforming team members?", category: "Leadership", difficulty: "Hard" },
        { question: "Describe a time you had to make a difficult decision that impacted your team.", category: "Decision Making", difficulty: "Hard" },
        { question: "How do you build and maintain team culture?", category: "Leadership", difficulty: "Medium" },
        { question: "Tell me about a time you had to influence without authority.", category: "Influence", difficulty: "Hard" },
        { question: "How do you balance strategic planning with day-to-day execution?", category: "Strategy", difficulty: "Medium" },
      ];
    } else {
      return [
        { question: "Tell me about yourself and your career journey.", category: "Background", difficulty: "Easy" },
        { question: "What's your biggest professional achievement?", category: "Experience", difficulty: "Medium" },
        { question: "Describe a challenge you faced and how you overcame it.", category: "Problem Solving", difficulty: "Medium" },
        { question: "Where do you see yourself in 5 years?", category: "Goals", difficulty: "Easy" },
        { question: "Why are you interested in this role?", category: "Motivation", difficulty: "Medium" },
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
            <p className="text-sm text-muted-foreground mb-4">
              Based on your optimized resume and target role, here are the most commonly asked questions you should prepare for:
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
        <div className="space-y-3">
          {questions.slice(0, 5).map((q, index) => (
            <Collapsible 
              key={index}
              open={expandedQuestion === index}
              onOpenChange={(open) => setExpandedQuestion(open ? index : null)}
            >
              <Card className="overflow-hidden">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg font-semibold text-primary w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{q.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">{q.category}</Badge>
                          <Badge className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {expandedQuestion === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0 border-t">
                    <div className="bg-muted/50 rounded-lg p-4 mt-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">Sample Answer & Tips</span>
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        Unlock Interview Prep to get tailored answers, STAR-format examples, and practice questions based on your experience.
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

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button onClick={onContinue} variant="outline" size="lg">
          Continue to Final Resume
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
