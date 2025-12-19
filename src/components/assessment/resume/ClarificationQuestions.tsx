import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";

interface ClarificationAnswers {
  targetRole: string;
  managerOrIC: string;
  proudAchievement: string;
  professionalBrand: string;
  targetCompanies: string;
}

interface ClarificationQuestionsProps {
  onBack: () => void;
  onSubmit: (answers: ClarificationAnswers) => void;
  isGenerating: boolean;
}

export function ClarificationQuestions({ onBack, onSubmit, isGenerating }: ClarificationQuestionsProps) {
  const [answers, setAnswers] = useState<ClarificationAnswers>({
    targetRole: "",
    managerOrIC: "",
    proudAchievement: "",
    professionalBrand: "",
    targetCompanies: ""
  });

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const updateAnswer = (field: keyof ClarificationAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const isComplete = answers.targetRole && answers.managerOrIC;

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-foreground">Quick Questions</h1>
            <p className="text-muted-foreground">2 minutes — so your resume is accurate</p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">
                These questions help us create a resume that's accurate and tailored to your goals. 
                The more specific you are, the better your optimized resume will be.
              </p>
            </div>
          </div>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {/* Q1: Target Role */}
          <Card className="p-5">
            <Label className="text-base font-semibold text-foreground mb-3 block">
              1. What's your target role for this resume?
            </Label>
            <Input
              placeholder="e.g., Senior Product Manager at a growth-stage startup"
              value={answers.targetRole}
              onChange={(e) => updateAnswer("targetRole", e.target.value)}
            />
          </Card>

          {/* Q2: Manager or IC */}
          <Card className="p-5">
            <Label className="text-base font-semibold text-foreground mb-3 block">
              2. In your most recent role, were you an IC or people manager?
            </Label>
            <RadioGroup
              value={answers.managerOrIC}
              onValueChange={(val) => updateAnswer("managerOrIC", val)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="ic" id="ic" />
                <Label htmlFor="ic" className="font-normal">Individual Contributor (IC)</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="manager" id="manager" />
                <Label htmlFor="manager" className="font-normal">People Manager (with direct reports)</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="font-normal">Both / Hybrid</Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Q3: Proudest Achievement */}
          <Card className="p-5">
            <Label className="text-base font-semibold text-foreground mb-2 block">
              3. What is something you are very proud of in your career?
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Think about a project, launch, turnaround, or outcome that made you feel accomplished. 
              Be specific — include the challenge, what you did, and the result.
            </p>
            <Textarea
              placeholder="e.g., I'm most proud of leading the payment platform migration at Apple Ads. We moved 10+ markets to a new PSP in 6 months, reduced failed transactions by 40%, and unlocked $120M in incremental ad spend. I personally drove alignment across 5 teams and navigated complex regulatory requirements."
              value={answers.proudAchievement}
              onChange={(e) => updateAnswer("proudAchievement", e.target.value)}
              className="min-h-[120px]"
            />
          </Card>

          {/* Q4: Professional Brand */}
          <Card className="p-5">
            <Label className="text-base font-semibold text-foreground mb-2 block">
              4. How would you like to be perceived professionally?
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Describe your professional brand in 1-2 sentences. What do you want hiring managers 
              and recruiters to remember about you? What makes you uniquely valuable?
            </p>
            <Textarea
              placeholder="e.g., I want to be seen as a strategic product leader who combines deep payments expertise with the ability to drive cross-functional execution at scale. I'm known for turning ambiguous, complex problems into clear roadmaps that deliver measurable business impact."
              value={answers.professionalBrand}
              onChange={(e) => updateAnswer("professionalBrand", e.target.value)}
              className="min-h-[100px]"
            />
          </Card>

          {/* Q5: Target Companies */}
          <Card className="p-5">
            <Label className="text-base font-semibold text-foreground mb-3 block">
              5. Which industries or companies are you targeting?
              <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span>
            </Label>
            <Input
              placeholder="e.g., FAANG, FinTech startups, Enterprise SaaS"
              value={answers.targetCompanies}
              onChange={(e) => updateAnswer("targetCompanies", e.target.value)}
            />
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center py-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!isComplete || isGenerating}
            className="min-w-[250px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Your Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate My AI-Optimized Resume
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
