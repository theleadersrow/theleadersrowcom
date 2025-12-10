import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Target, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);

const questions = [
  {
    id: 1,
    question: "What's your biggest career challenge right now?",
    options: [
      "Getting noticed for leadership roles",
      "Not getting promoted",
      "Managing up, down, and laterally",
      "I'm not valued at work",
      "Building my personal brand",
      "Communicating with executives",
      "Negotiating compensation",
      "All of the above",
    ],
  },
  {
    id: 2,
    question: "Which skills do you most want to develop?",
    options: [
      "Executive presence & confidence",
      "Strategic communication & storytelling",
      "Interview & negotiation mastery",
      "Leadership identity & influence",
      "All of the above",
    ],
  },
  {
    id: 3,
    question: "How long have you been in your current role?",
    options: [
      "Less than 1 year",
      "1-2 years",
      "3-5 years",
      "5+ years",
    ],
  },
  {
    id: 4,
    question: "What's holding you back from your next promotion?",
    options: [
      "Lack of visibility & recognition",
      "Interview skills & self-presentation",
      "Not sure what's missing",
      "Limited network & opportunities",
      "All of the above",
    ],
  },
  {
    id: 5,
    question: "What kind of help are you looking for?",
    options: [
      "Self-paced learning & resources",
      "Live coaching & feedback",
      "Community & accountability",
      "One-on-one mentorship",
      "All of the above",
    ],
  },
  {
    id: 6,
    question: "How committed are you to accelerating your career?",
    options: [
      "Just exploring options",
      "Ready to invest time weekly",
      "Fully committed - ready to go all in",
      "Looking for quick wins first",
    ],
  },
  {
    id: 7,
    question: "What type of growth are you looking for?",
    options: [
      "Intensive transformation (8-week program)",
      "Steady weekly skill-building",
      "Both - I want it all",
    ],
  },
];

const totalQuestions = questions.length;

const QuizLeadMagnet = () => {
  const [step, setStep] = useState(0); // 0 = intro, 1-3 = questions, 4 = email, 5 = results
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (step > 0 && step <= totalQuestions && !answers[step]) {
      toast.error("Please select an answer to continue");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save lead to database
      const { error } = await supabase.from("email_leads").insert({
        email: validation.data,
        lead_magnet: "career-readiness-quiz",
      });

      if (error && error.code !== "23505") {
        throw error;
      }

      // Get results to send in email
      const result = getResultsMessage();

      // Send results email via edge function
      const { error: emailError } = await supabase.functions.invoke("send-quiz-results", {
        body: {
          email: validation.data,
          answers,
          result,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Still show results even if email fails
      }

      setStep(totalQuestions + 2);
      toast.success("Your results have been sent to your email!");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultsMessage = () => {
    const challenge = answers[1];
    const helpType = answers[5];
    const commitment = answers[6];
    const growthType = answers[7];
    
    // Fully committed + wants intensive or all-in
    if (commitment === "Fully committed - ready to go all in" || 
        growthType === "Intensive transformation (8-week program)" || 
        challenge === "All of the above" ||
        growthType === "Both - I want it all") {
      return {
        title: "The 200K Method is Perfect for You",
        message: "You're ready for a complete career transformation. Our 8-week accelerator will rebuild your brand, sharpen your skills, and position you for senior roles.",
        cta: "Explore 200K Method",
        link: "/200k-method",
      };
    }
    
    // Wants steady growth or coaching/community
    if (growthType === "Steady weekly skill-building" || 
        helpType === "Live coaching & feedback" ||
        helpType === "Community & accountability" ||
        commitment === "Ready to invest time weekly") {
      return {
        title: "Weekly Edge is Your Path Forward",
        message: "Build your leadership skills week by week. Our ongoing program will help you grow consistently and confidently.",
        cta: "Join Weekly Edge",
        link: "/weekly-edge",
      };
    }
    
    // Just exploring or wants quick wins
    return {
      title: "Let's Find Your Perfect Fit",
      message: "Based on your responses, a quick conversation will help us identify exactly what you need. Let's create your personalized plan together.",
      cta: "Book a Strategy Call",
      link: "/contact",
    };
  };

  const results = getResultsMessage();
  const progress = step === 0 ? 0 : Math.min((step / (totalQuestions + 1)) * 100, 100);

  return (
    <section className="section-padding bg-secondary/5" data-quiz-section>
      <div className="container-narrow mx-auto">
        <div className="bg-card rounded-2xl shadow-elevated p-8 md:p-12 border border-border/50 max-w-2xl mx-auto">
          {/* Progress bar */}
          {step > 0 && step < totalQuestions + 2 && (
            <div className="mb-8">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-secondary/70 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Step {Math.min(step, totalQuestions + 1)} of {totalQuestions + 1}
              </p>
            </div>
          )}

          {/* Intro */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Career Readiness Assessment
              </h2>
              <p className="text-muted-foreground mb-2">
                Discover what's holding you back from being the top 10%
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Take this 2-minute quiz to get personalized recommendations for accelerating your career.
              </p>
              <Button onClick={handleNext} className="btn-primary gap-2">
                Start the Quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Questions */}
          {step >= 1 && step <= totalQuestions && (
            <div>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-6">
                {questions[step - 1].question}
              </h3>
              <RadioGroup
                value={answers[step] || ""}
                onValueChange={(value) => handleAnswer(step, value)}
                className="space-y-3"
              >
                {questions[step - 1].options.map((option, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      answers[step] === option
                        ? "border-secondary bg-secondary/5"
                        : "border-border hover:border-secondary/50"
                    } ${option.includes("All of") ? "bg-secondary/5" : ""}`}
                    onClick={() => handleAnswer(step, option)}
                  >
                    <RadioGroupItem value={option} id={`q${step}-${idx}`} />
                    <Label htmlFor={`q${step}-${idx}`} className={`flex-1 cursor-pointer text-foreground ${option.includes("All of") || option.includes("Both") ? "font-medium" : ""}`}>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between mt-8">
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={handleNext} className="btn-primary gap-2">
                  {step === totalQuestions ? "See Results" : "Next"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Email capture */}
          {step === totalQuestions + 1 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
                Where Should We Send Your Results?
              </h3>
              <p className="text-muted-foreground mb-6">
                Enter your email and we'll send your personalized career acceleration plan directly to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Loading..." : "Get My Results"}
                </Button>
              </div>
              <button
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground mt-4 underline"
              >
                Go back and change answers
              </button>
            </div>
          )}

          {/* Results */}
          {step === totalQuestions + 2 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Results sent to {email}</p>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                {results.title}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {results.message}
              </p>
              <Button asChild className="btn-primary">
                <a href={results.link}>{results.cta}</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default QuizLeadMagnet;
