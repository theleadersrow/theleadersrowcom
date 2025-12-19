import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface ClarificationAnswers {
  // Section 1: Targeting & Intent
  targetRoles: string[];
  targetIndustry: string;
  companyTypes: string[];
  primaryOutcome: string;
  
  // Section 2: Role Scope & Seniority
  roleScope: string;
  strategyOrExecution: string;
  stakeholders: string[];
  crossFunctionalLead: string;
  seniorityDescription: string;
  
  // Section 3: Impact & Metrics
  strongestImpact: string[];
  measurableOutcomes: string[];
  metricsMissingReason: string;
  bestImpactProject: string;
  underrepresentedAchievement: string;
  
  // Section 4: Professional Brand (Optional)
  recruiterPerception: string[];
  professionalSkills: string[];
  stretchingLevel: string;
  overstatingCaution: string;
  
  // Section 5: Practical Constraints (Optional)
  deemphasizeCompanies: string;
  gapsOrTransitions: string;
  complianceConstraints: string;
}

interface ClarificationQuestionsProps {
  onBack: () => void;
  onSubmit: (answers: ClarificationAnswers) => void;
  isGenerating: boolean;
}

const TARGET_ROLES = [
  { value: "ic", label: "IC (e.g., Product Manager, Engineer, Designer)" },
  { value: "senior_ic", label: "Senior IC" },
  { value: "principal", label: "Principal / Staff" },
  { value: "manager", label: "Manager / Director" },
  { value: "executive", label: "Executive" },
];

const INDUSTRIES = [
  "Tech / SaaS",
  "Fintech",
  "AI / ML",
  "Consumer",
  "Marketplace",
  "Enterprise / B2B",
  "Healthcare",
  "Other",
];

const COMPANY_TYPES = [
  { value: "startups", label: "Startups" },
  { value: "midsize", label: "Mid-size companies" },
  { value: "bigtech", label: "Big Tech / FAANG" },
  { value: "enterprise", label: "Regulated / Enterprise" },
  { value: "consulting", label: "Consulting" },
];

const PRIMARY_OUTCOMES = [
  { value: "execution", label: "Execution excellence" },
  { value: "strategy", label: "Strategic ownership" },
  { value: "leadership", label: "Leadership & influence" },
  { value: "technical", label: "Technical depth" },
  { value: "business", label: "Business / revenue impact" },
];

const ROLE_SCOPES = [
  { value: "ic", label: "Individual contributor" },
  { value: "lead_ic", label: "Lead IC" },
  { value: "manager", label: "People manager" },
  { value: "hybrid", label: "Hybrid (IC + manager)" },
];

const STRATEGY_EXECUTION = [
  { value: "strategy", label: "Strategy only" },
  { value: "execution", label: "Execution only" },
  { value: "both", label: "Both strategy and execution" },
];

const STAKEHOLDERS = [
  { value: "engineers", label: "Engineers" },
  { value: "designers", label: "Designers" },
  { value: "data", label: "Data / Analytics" },
  { value: "sales", label: "Sales / Marketing" },
  { value: "legal", label: "Legal / Finance" },
  { value: "executives", label: "VP / C-suite stakeholders" },
];

const CROSS_FUNCTIONAL = [
  { value: "yes_major", label: "Yes (major initiatives)" },
  { value: "yes_limited", label: "Yes (limited)" },
  { value: "no", label: "No" },
];

const IMPACT_TYPES = [
  { value: "revenue", label: "Revenue growth" },
  { value: "cost", label: "Cost reduction" },
  { value: "user_growth", label: "User growth / engagement" },
  { value: "efficiency", label: "Operational efficiency" },
  { value: "risk", label: "Risk / compliance / reliability" },
  { value: "scale", label: "Platform / infrastructure scale" },
];

const METRIC_TYPES = [
  { value: "percent", label: "% growth" },
  { value: "revenue", label: "Revenue ($)" },
  { value: "cost_savings", label: "Cost savings" },
  { value: "time_saved", label: "Time saved" },
  { value: "scale", label: "Scale (users, teams, regions)" },
  { value: "none", label: "No metrics available" },
];

const METRICS_MISSING_REASONS = [
  { value: "not_shared", label: "Data not shared" },
  { value: "qualitative", label: "Work was qualitative" },
  { value: "not_tracked", label: "Not tracked" },
  { value: "confidential", label: "Confidential" },
];

const PERCEPTION_TRAITS = [
  { value: "strategic", label: "Strategic thinker" },
  { value: "executor", label: "Strong executor" },
  { value: "technical_leader", label: "Technical leader" },
  { value: "business_driven", label: "Business-driven" },
  { value: "people_leader", label: "People leader" },
  { value: "problem_solver", label: "Problem solver" },
];

const PROFESSIONAL_SKILLS = [
  { value: "strategy", label: "Strategy" },
  { value: "execution", label: "Execution" },
  { value: "analytics", label: "Analytics" },
  { value: "leadership", label: "Leadership" },
  { value: "communication", label: "Communication" },
  { value: "technical", label: "Technical depth" },
  { value: "stakeholder", label: "Stakeholder management" },
];

export function ClarificationQuestions({ onBack, onSubmit, isGenerating }: ClarificationQuestionsProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [showOptionalSections, setShowOptionalSections] = useState(false);
  
  const [answers, setAnswers] = useState<ClarificationAnswers>({
    targetRoles: [],
    targetIndustry: "",
    companyTypes: [],
    primaryOutcome: "",
    roleScope: "",
    strategyOrExecution: "",
    stakeholders: [],
    crossFunctionalLead: "",
    seniorityDescription: "",
    strongestImpact: [],
    measurableOutcomes: [],
    metricsMissingReason: "",
    bestImpactProject: "",
    underrepresentedAchievement: "",
    recruiterPerception: [],
    professionalSkills: [],
    stretchingLevel: "",
    overstatingCaution: "",
    deemphasizeCompanies: "",
    gapsOrTransitions: "",
    complianceConstraints: "",
  });

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const toggleArrayValue = (field: keyof ClarificationAnswers, value: string, maxItems?: number) => {
    setAnswers(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      if (maxItems && current.length >= maxItems) {
        return prev;
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const updateAnswer = (field: keyof ClarificationAnswers, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  // Validation for each section
  const isSection1Complete = answers.targetRoles.length > 0 && answers.targetIndustry && answers.primaryOutcome;
  const isSection2Complete = answers.roleScope && answers.strategyOrExecution;
  const isSection3Complete = answers.strongestImpact.length > 0;
  
  const canSubmit = isSection1Complete && isSection2Complete && isSection3Complete;
  
  const totalSections = showOptionalSections ? 5 : 3;
  const progress = (currentSection / totalSections) * 100;

  const renderCheckboxGroup = (
    options: { value: string; label: string }[],
    field: keyof ClarificationAnswers,
    maxItems?: number
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${field}-${option.value}`}
            checked={(answers[field] as string[]).includes(option.value)}
            onCheckedChange={() => toggleArrayValue(field, option.value, maxItems)}
          />
          <Label htmlFor={`${field}-${option.value}`} className="text-sm font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-[80vh] animate-fade-up px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-serif font-bold text-foreground">Resume Optimization Questions</h1>
            <p className="text-muted-foreground text-sm">Help us tailor your resume perfectly</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Section {currentSection} of {totalSections}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Section 1: Targeting & Intent */}
        {currentSection === 1 && (
          <div className="space-y-6 animate-fade-up">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h2 className="font-semibold text-lg mb-1">Section 1: Targeting & Intent</h2>
              <p className="text-sm text-muted-foreground">Ensure your resume is optimized for the right role and level</p>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                1. What role(s) are you targeting? <span className="text-muted-foreground font-normal">(Select up to 2)</span>
              </Label>
              {renderCheckboxGroup(TARGET_ROLES, "targetRoles", 2)}
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                2. Which industry or domain are you primarily targeting?
              </Label>
              <RadioGroup
                value={answers.targetIndustry}
                onValueChange={(val) => updateAnswer("targetIndustry", val)}
                className="grid grid-cols-2 gap-2"
              >
                {INDUSTRIES.map(industry => (
                  <div key={industry} className="flex items-center space-x-2">
                    <RadioGroupItem value={industry} id={`industry-${industry}`} />
                    <Label htmlFor={`industry-${industry}`} className="text-sm font-normal">{industry}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                3. What type of companies are you applying to? <span className="text-muted-foreground font-normal">(Select all that apply)</span>
              </Label>
              {renderCheckboxGroup(COMPANY_TYPES, "companyTypes")}
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                4. What is the single most important outcome you want this resume to communicate?
              </Label>
              <RadioGroup
                value={answers.primaryOutcome}
                onValueChange={(val) => updateAnswer("primaryOutcome", val)}
                className="space-y-2"
              >
                {PRIMARY_OUTCOMES.map(outcome => (
                  <div key={outcome.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={outcome.value} id={`outcome-${outcome.value}`} />
                    <Label htmlFor={`outcome-${outcome.value}`} className="text-sm font-normal">{outcome.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>
          </div>
        )}

        {/* Section 2: Role Scope & Seniority */}
        {currentSection === 2 && (
          <div className="space-y-6 animate-fade-up">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h2 className="font-semibold text-lg mb-1">Section 2: Role Scope & Seniority</h2>
              <p className="text-sm text-muted-foreground">Prevent under- or over-leveling your experience</p>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                1. In your most recent role, which best describes your scope?
              </Label>
              <RadioGroup
                value={answers.roleScope}
                onValueChange={(val) => updateAnswer("roleScope", val)}
                className="space-y-2"
              >
                {ROLE_SCOPES.map(scope => (
                  <div key={scope.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={scope.value} id={`scope-${scope.value}`} />
                    <Label htmlFor={`scope-${scope.value}`} className="text-sm font-normal">{scope.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                2. Did you own strategy, execution, or both?
              </Label>
              <RadioGroup
                value={answers.strategyOrExecution}
                onValueChange={(val) => updateAnswer("strategyOrExecution", val)}
                className="space-y-2"
              >
                {STRATEGY_EXECUTION.map(item => (
                  <div key={item.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.value} id={`strat-${item.value}`} />
                    <Label htmlFor={`strat-${item.value}`} className="text-sm font-normal">{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                3. Who did you regularly influence or work with? <span className="text-muted-foreground font-normal">(Select all)</span>
              </Label>
              {renderCheckboxGroup(STAKEHOLDERS, "stakeholders")}
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                4. Did you lead or influence cross-functional initiatives?
              </Label>
              <RadioGroup
                value={answers.crossFunctionalLead}
                onValueChange={(val) => updateAnswer("crossFunctionalLead", val)}
                className="space-y-2"
              >
                {CROSS_FUNCTIONAL.map(item => (
                  <div key={item.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={item.value} id={`cross-${item.value}`} />
                    <Label htmlFor={`cross-${item.value}`} className="text-sm font-normal">{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-2 block">
                5. Describe your seniority in one sentence <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Example: "Senior IC owning end-to-end delivery for high-impact initiatives."
              </p>
              <Input
                placeholder="How would you describe your seniority level?"
                value={answers.seniorityDescription}
                onChange={(e) => updateAnswer("seniorityDescription", e.target.value)}
              />
            </Card>
          </div>
        )}

        {/* Section 3: Impact & Metrics */}
        {currentSection === 3 && (
          <div className="space-y-6 animate-fade-up">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h2 className="font-semibold text-lg mb-1">Section 3: Impact & Metrics</h2>
              <p className="text-sm text-muted-foreground">Turn your responsibilities into measurable outcomes</p>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                1. Which best reflects your strongest impact? <span className="text-muted-foreground font-normal">(Pick up to 3)</span>
              </Label>
              {renderCheckboxGroup(IMPACT_TYPES, "strongestImpact", 3)}
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                2. Do you have measurable outcomes you can share? <span className="text-muted-foreground font-normal">(Select all that apply)</span>
              </Label>
              {renderCheckboxGroup(METRIC_TYPES, "measurableOutcomes")}
            </Card>

            {(answers.measurableOutcomes.includes("none") || answers.measurableOutcomes.length === 0) && (
              <Card className="p-5">
                <Label className="text-base font-semibold text-foreground mb-3 block">
                  3. If metrics are missing, why? <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <RadioGroup
                  value={answers.metricsMissingReason}
                  onValueChange={(val) => updateAnswer("metricsMissingReason", val)}
                  className="space-y-2"
                >
                  {METRICS_MISSING_REASONS.map(reason => (
                    <div key={reason.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason.value} id={`missing-${reason.value}`} />
                      <Label htmlFor={`missing-${reason.value}`} className="text-sm font-normal">{reason.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </Card>
            )}

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-2 block">
                4. Which role or project best represents your strongest impact?
              </Label>
              <Textarea
                placeholder="Describe the project, your role, and the outcome..."
                value={answers.bestImpactProject}
                onChange={(e) => updateAnswer("bestImpactProject", e.target.value)}
                className="min-h-[80px]"
              />
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-2 block">
                5. Is there any achievement you feel is underrepresented? <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                placeholder="Describe an achievement that deserves more visibility..."
                value={answers.underrepresentedAchievement}
                onChange={(e) => updateAnswer("underrepresentedAchievement", e.target.value)}
                className="min-h-[60px]"
              />
            </Card>
          </div>
        )}

        {/* Section 4: Professional Brand (Optional) */}
        {currentSection === 4 && showOptionalSections && (
          <div className="space-y-6 animate-fade-up">
            <Card className="p-4 bg-secondary/50 border-secondary">
              <h2 className="font-semibold text-lg mb-1">Section 4: Professional Brand</h2>
              <p className="text-sm text-muted-foreground">Shape your summary and positioning (Optional)</p>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                1. How do you want to be perceived by recruiters? <span className="text-muted-foreground font-normal">(Pick up to 3)</span>
              </Label>
              {renderCheckboxGroup(PERCEPTION_TRAITS, "recruiterPerception", 3)}
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                2. Which skills best define your professional brand? <span className="text-muted-foreground font-normal">(Select up to 6)</span>
              </Label>
              {renderCheckboxGroup(PROFESSIONAL_SKILLS, "professionalSkills", 6)}
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                3. Are you aiming to stretch into a higher level than your current title?
              </Label>
              <RadioGroup
                value={answers.stretchingLevel}
                onValueChange={(val) => updateAnswer("stretchingLevel", val)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="stretch-yes" />
                  <Label htmlFor="stretch-yes" className="text-sm font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="stretch-no" />
                  <Label htmlFor="stretch-no" className="text-sm font-normal">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="stretch-unsure" />
                  <Label htmlFor="stretch-unsure" className="text-sm font-normal">Not sure</Label>
                </div>
              </RadioGroup>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-2 block">
                4. Anything you want the AI to be careful about not overstating? <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                placeholder="e.g., Don't overstate my technical depth, I'm more strategy-focused"
                value={answers.overstatingCaution}
                onChange={(e) => updateAnswer("overstatingCaution", e.target.value)}
              />
            </Card>
          </div>
        )}

        {/* Section 5: Practical Constraints (Optional) */}
        {currentSection === 5 && showOptionalSections && (
          <div className="space-y-6 animate-fade-up">
            <Card className="p-4 bg-secondary/50 border-secondary">
              <h2 className="font-semibold text-lg mb-1">Section 5: Practical Constraints</h2>
              <p className="text-sm text-muted-foreground">Avoid resume risks (Optional)</p>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-2 block">
                1. Are there companies or experiences you want de-emphasized? <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                placeholder="e.g., Short stint at Company X, early career roles"
                value={answers.deemphasizeCompanies}
                onChange={(e) => updateAnswer("deemphasizeCompanies", e.target.value)}
              />
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                2. Are there gaps or transitions you want handled carefully?
              </Label>
              <RadioGroup
                value={answers.gapsOrTransitions}
                onValueChange={(val) => updateAnswer("gapsOrTransitions", val)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="career_gap" id="gap-career" />
                  <Label htmlFor="gap-career" className="text-sm font-normal">Yes (career gap)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="role_change" id="gap-role" />
                  <Label htmlFor="gap-role" className="text-sm font-normal">Yes (role change)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="gap-no" />
                  <Label htmlFor="gap-no" className="text-sm font-normal">No</Label>
                </div>
              </RadioGroup>
            </Card>

            <Card className="p-5">
              <Label className="text-base font-semibold text-foreground mb-3 block">
                3. Any compliance or confidentiality constraints?
              </Label>
              <RadioGroup
                value={answers.complianceConstraints}
                onValueChange={(val) => updateAnswer("complianceConstraints", val)}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="compliance-yes" />
                  <Label htmlFor="compliance-yes" className="text-sm font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="compliance-no" />
                  <Label htmlFor="compliance-no" className="text-sm font-normal">No</Label>
                </div>
              </RadioGroup>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col gap-4 py-8">
          {/* Optional sections toggle (show after section 3) */}
          {currentSection === 3 && !showOptionalSections && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setShowOptionalSections(true)}
                >
                  <span>Add optional branding & constraints sections</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(prev => Math.max(1, prev - 1))}
              disabled={currentSection === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentSection < totalSections ? (
              <Button
                onClick={() => setCurrentSection(prev => prev + 1)}
                disabled={
                  (currentSection === 1 && !isSection1Complete) ||
                  (currentSection === 2 && !isSection2Complete) ||
                  (currentSection === 3 && !isSection3Complete)
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isGenerating}
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Resume
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Section dots */}
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: totalSections }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSection(i + 1)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSection === i + 1 
                    ? "bg-primary" 
                    : i < currentSection 
                      ? "bg-primary/50" 
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
