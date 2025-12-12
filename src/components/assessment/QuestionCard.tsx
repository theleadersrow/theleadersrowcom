import { useState, useEffect } from "react";
import { Question, QuestionOption, Response } from "@/hooks/useAssessment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  currentResponse?: Response;
  onAnswer: (response: Response) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSaving: boolean;
}

export function QuestionCard({
  question,
  currentResponse,
  onAnswer,
  onNext,
  onBack,
  isFirst,
  isLast,
  isSaving,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>(
    currentResponse?.selected_option_id || ""
  );
  const [numericValue, setNumericValue] = useState<number>(
    currentResponse?.numeric_value || 3
  );
  const [textValue, setTextValue] = useState<string>(
    currentResponse?.text_value || ""
  );
  const [showHelp, setShowHelp] = useState(false);

  // Update local state when response changes
  useEffect(() => {
    setSelectedOption(currentResponse?.selected_option_id || "");
    setNumericValue(currentResponse?.numeric_value || 3);
    setTextValue(currentResponse?.text_value || "");
  }, [currentResponse, question.id]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    onAnswer({
      question_id: question.id,
      selected_option_id: optionId,
    });
  };

  const handleNumericChange = (value: number[]) => {
    setNumericValue(value[0]);
    onAnswer({
      question_id: question.id,
      numeric_value: value[0],
    });
  };

  const handleTextChange = (value: string) => {
    setTextValue(value);
  };

  const handleTextBlur = () => {
    if (textValue.trim()) {
      onAnswer({
        question_id: question.id,
        text_value: textValue,
      });
    }
  };

  const isAnswered = () => {
    switch (question.question_type) {
      case "multiple_choice":
      case "scenario":
      case "forced_choice":
        return !!selectedOption;
      case "scale_1_5":
        return true; // Always has a value
      case "short_text":
        return !!textValue.trim();
      case "confidence":
        return true;
      default:
        return false;
    }
  };

  const renderQuestionInput = () => {
    switch (question.question_type) {
      case "multiple_choice":
      case "scenario":
      case "forced_choice":
        return (
          <RadioGroup
            value={selectedOption}
            onValueChange={handleOptionSelect}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <label
                key={option.id}
                htmlFor={option.id}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                  selectedOption === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-semibold text-primary mr-2">
                    {option.option_label}.
                  </span>
                  <span className="text-foreground">{option.option_text}</span>
                </div>
              </label>
            ))}
          </RadioGroup>
        );

      case "scale_1_5":
      case "confidence":
        // Dynamic labels based on question content
        const getScaleLabels = () => {
          const prompt = question.prompt.toLowerCase();
          
          if (prompt.includes("comfortable") || prompt.includes("comfort")) {
            return ["Very Uncomfortable", "Uncomfortable", "Neutral", "Comfortable", "Very Comfortable"];
          }
          if (prompt.includes("how often") || prompt.includes("frequency")) {
            return ["Never", "Rarely", "Sometimes", "Often", "Always"];
          }
          if (prompt.includes("how much experience") || prompt.includes("experience with")) {
            return ["None", "Limited", "Moderate", "Significant", "Extensive"];
          }
          if (prompt.includes("rate your") || prompt.includes("ability")) {
            return ["Poor", "Below Average", "Average", "Good", "Excellent"];
          }
          if (prompt.includes("confident") || question.question_type === "confidence") {
            return ["Not confident", "Somewhat", "Confident", "Very confident", "Extremely confident"];
          }
          // Default to agree/disagree for statement-based questions
          return ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
        };
        
        const labels = getScaleLabels();
        
        return (
          <div className="space-y-6 py-4">
            <Slider
              value={[numericValue]}
              onValueChange={handleNumericChange}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              {labels.map((label, i) => (
                <span 
                  key={i} 
                  className={cn(
                    "text-center max-w-[80px]",
                    numericValue === i + 1 
                      ? "text-primary font-medium" 
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        );

      case "short_text":
        return (
          <Textarea
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={handleTextBlur}
            placeholder="Share your thoughts..."
            className="min-h-[120px] resize-none"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 animate-fade-up">
      {/* Question header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-xl md:text-2xl font-serif font-semibold text-foreground leading-tight">
            {question.prompt}
          </h2>
          {question.help_text && (
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Help text */}
        {showHelp && question.help_text && (
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground mb-4 animate-fade-in">
            💡 {question.help_text}
          </div>
        )}
      </div>

      {/* Question input */}
      <div className="mb-8">
        {renderQuestionInput()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isFirst}
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isAnswered() || isSaving}
        >
          {isSaving ? "Saving..." : isLast ? "Continue" : "Next"}
        </Button>
      </div>
    </div>
  );
}
