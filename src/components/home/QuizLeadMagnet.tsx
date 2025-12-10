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
      "Communicating with executives",
      "Building my personal brand",
      "Negotiating compensation",
    ],
  },
  {
    id: 2,
    question: "How long have you been in your current role?",
    options: [
      "Less than 1 year",
      "1-2 years",
      "3-5 years",
      "5+ years",
    ],
  },
  {
    id: 3,
    question: "What's holding you back from your next promotion?",
    options: [
      "Lack of visibility",
      "Interview skills",
      "Not sure what's missing",
      "Limited network",
    ],
  },
];

const QuizLeadMagnet = () => {
  const [step, setStep] = useState(0); // 0 = intro, 1-3 = questions, 4 = email, 5 = results
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (step > 0 && step <= 3 && !answers[step]) {
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
      const { error } = await supabase.from("email_leads").insert({
        email: validation.data,
        lead_magnet: "career-readiness-quiz",
      });

      if (error) {
        if (error.code === "23505") {
          setStep(5); // Show results anyway
          return;
        }
        throw error;
      }

      setStep(5);
      toast.success("Your personalized results are ready!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultsMessage = () => {
    const challenge = answers[1];
    if (challenge === "Getting noticed for leadership roles") {
      return {
        title: "You're Ready for Visibility Coaching",
        message: "Your skills are there, but your brand isn't broadcasting them. The 200K Method will help you engineer executive-ready positioning.",
        cta: "Explore 200K Method",
        link: "/200k-method",
      };
    }
    if (challenge === "Communicating with executives") {
      return {
        title: "Executive Presence is Your Next Level",
        message: "Weekly Edge will sharpen your communication and help you command every room you enter.",
        cta: "Join Weekly Edge",
        link: "/weekly-edge",
      };
    }
    return {
      title: "You're Closer Than You Think",
      message: "A few strategic shifts can unlock your next role. Let's identify exactly what's holding you back.",
      cta: "Book a Strategy Call",
      link: "/contact",
    };
  };

  const results = getResultsMessage();
  const progress = step === 0 ? 0 : Math.min((step / 4) * 100, 100);

  return (
    <section className="section-padding bg-secondary/5" data-quiz-section>
      <div className="container-narrow mx-auto">
        <div className="bg-card rounded-2xl shadow-elevated p-8 md:p-12 border border-border/50 max-w-2xl mx-auto">
          {/* Progress bar */}
          {step > 0 && step < 5 && (
            <div className="mb-8">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-secondary/70 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Step {step} of 4
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
                Discover what's blocking your next promotion
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Take this 60-second quiz to get personalized recommendations for accelerating your career.
              </p>
              <Button onClick={handleNext} className="btn-primary gap-2">
                Start the Quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Questions */}
          {step >= 1 && step <= 3 && (
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
                    }`}
                    onClick={() => handleAnswer(step, option)}
                  >
                    <RadioGroupItem value={option} id={`q${step}-${idx}`} />
                    <Label htmlFor={`q${step}-${idx}`} className="flex-1 cursor-pointer text-foreground">
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
                  {step === 3 ? "See Results" : "Next"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Email capture */}
          {step === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-4">
                Your Results Are Ready!
              </h3>
              <p className="text-muted-foreground mb-6">
                Enter your email to see your personalized career acceleration plan.
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
          {step === 5 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
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
