import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAssessment } from "@/hooks/useAssessment";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ModuleIntro } from "@/components/assessment/ModuleIntro";
import { ModuleComplete } from "@/components/assessment/ModuleComplete";
import { EmailGate } from "@/components/assessment/EmailGate";
import { GeneratingReport } from "@/components/assessment/GeneratingReport";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";
import { ResumeIntelligenceFlow } from "@/components/assessment/ResumeIntelligenceFlow";
import { LinkedInSignalScore } from "@/components/assessment/LinkedInSignalScore";
import { AssessmentLanding } from "@/components/assessment/AssessmentLanding";
import { RimoLanding } from "@/components/assessment/RimoLanding";
import { CareerAdvisorChat } from "@/components/assessment/CareerAdvisorChat";
import { InterviewPrepTool } from "@/components/interview/InterviewPrepTool";
import { EngagementIndicator, EncouragementBanner } from "@/components/assessment/EngagementIndicator";
import { Loader2 } from "lucide-react";

type AssessmentView = "hub" | "assessment_landing" | "resume_suite" | "linkedin" | "career_advisor" | "interview_prep" | "intro" | "questions" | "module_complete" | "email_gate" | "generating" | "complete";

const moduleInsights = [
  "Your strategic calibration is taking shape. We're identifying your current level and growth potential.",
  "Your skill profile is emerging. We can see your unique strengths and areas for development.",
  "Your experience landscape is clear. We've identified key gaps and opportunities.",
  "Your blocker patterns are revealed. These insights will guide your growth plan.",
  "Your market fit is calculated. You'll see exactly where you stand and where to aim.",
];

const StrategicBenchmark = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    modules,
    questions,
    session,
    responses,
    isLoading,
    isSaving,
    saveResponse,
    updateProgress,
    saveEmail,
    saveInferredLevel,
    submitAssessment,
    getQuestionsForModule,
    progress,
    shouldShowSignupGate,
  } = useAssessment();

  const [currentView, setCurrentView] = useState<AssessmentView>("hub");
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSeenEmailGate, setHasSeenEmailGate] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [completedModuleIndex, setCompletedModuleIndex] = useState<number | null>(null);

  useEffect(() => {
    // Check if a tool is specified in the URL
    const toolParam = searchParams.get("tool");
    if (toolParam === "interview_prep") {
      setCurrentView("interview_prep");
      setSearchParams({}, { replace: true });
    } else if (toolParam === "resume_suite") {
      setCurrentView("resume_suite");
      setSearchParams({}, { replace: true });
    } else if (toolParam === "linkedin") {
      setCurrentView("linkedin");
      setSearchParams({}, { replace: true });
    } else if (toolParam === "career_advisor") {
      setCurrentView("career_advisor");
      setSearchParams({}, { replace: true });
    } else {
      // Default to assessment landing when visiting /strategic-benchmark directly
      setCurrentView("assessment_landing");
    }
  }, [location.key, searchParams, setSearchParams]);

  const currentModule = modules[currentModuleIndex];
  const moduleQuestions = currentModule ? getQuestionsForModule(currentModule.id) : [];
  const currentQuestion = moduleQuestions[currentQuestionIndex];
  const totalQuestionsAnswered = responses.size;

  const handleGoToAssessmentLanding = () => {
    setCurrentView("assessment_landing");
  };

  const handleGoToResumeSuite = () => {
    setCurrentView("resume_suite");
  };

  const handleGoToLinkedIn = () => {
    setCurrentView("linkedin");
  };

  const handleGoToCareerAdvisor = () => {
    setCurrentView("career_advisor");
  };

  const handleGoToInterviewPrep = () => {
    setCurrentView("interview_prep");
  };

  const handleBackToHub = () => {
    setCurrentView("hub");
  };

  const handleStartAssessment = () => {
    setCurrentView("intro");
  };

  const handleResumeSuiteComplete = () => {
    setCurrentView("hub");
  };

  const handleStartModule = () => {
    setCurrentView("questions");
  };

  const handleAnswer = async (response: { question_id: string; selected_option_id?: string; numeric_value?: number; text_value?: string }) => {
    await saveResponse(response);
    setLastSaved(new Date());
    setAnswerStreak(prev => prev + 1);
    
    const question = questions.find(q => q.id === response.question_id);
    if (question?.is_calibration && response.selected_option_id) {
      const option = question.options?.find(o => o.id === response.selected_option_id);
      if (option?.level_map) {
        const levelMap = option.level_map as { level?: string };
        if (levelMap.level) {
          await saveInferredLevel(levelMap.level);
        }
      }
    }
  };

  const handleModuleCompleteContinue = () => {
    if (completedModuleIndex !== null && completedModuleIndex < modules.length - 1) {
      const nextModuleIndex = completedModuleIndex + 1;
      setCurrentModuleIndex(nextModuleIndex);
      setCurrentQuestionIndex(0);
      setCurrentView("intro");
      setCompletedModuleIndex(null);
      updateProgress(nextModuleIndex, 0);
    } else {
      submitAssessment();
      setCurrentView("generating");
      setCompletedModuleIndex(null);
    }
  };

  const handleNext = async () => {
    if (!hasSeenEmailGate && totalQuestionsAnswered >= 6 && shouldShowSignupGate()) {
      setCurrentView("email_gate");
      return;
    }

    if (currentQuestionIndex < moduleQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      await updateProgress(currentModuleIndex, nextIndex);
    } else {
      setCompletedModuleIndex(currentModuleIndex);
      setCurrentView("module_complete");
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModuleIndex = currentModuleIndex - 1;
      const prevModuleQuestions = getQuestionsForModule(modules[prevModuleIndex]?.id || "");
      setCurrentModuleIndex(prevModuleIndex);
      setCurrentQuestionIndex(prevModuleQuestions.length - 1);
      setCurrentView("questions");
    }
  };

  const handleEmailSubmit = async (email: string, _subscribeNewsletter: boolean) => {
    const success = await saveEmail(email);
    if (success) {
      setHasSeenEmailGate(true);
      setCurrentView("questions");
    }
    return success;
  };

  const handleReportComplete = () => {
    setCurrentView("complete");
  };

  const handleViewReport = () => {
    navigate("/career-report");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading assessment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (modules.length === 0 || questions.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              Assessment Coming Soon
            </h2>
            <p className="text-muted-foreground">
              We're finalizing the assessment questions. Check back soon!
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20">
        {!["hub", "assessment_landing", "resume_suite", "linkedin", "career_advisor", "interview_prep", "module_complete", "email_gate", "generating", "complete"].includes(currentView) && (
          <AssessmentProgress
            modules={modules}
            currentModuleIndex={currentModuleIndex}
            progress={progress}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        )}

        <div className="container max-w-3xl mx-auto px-4 py-8">
          {currentView === "hub" && (
            <RimoLanding 
              onStartAssessment={handleGoToAssessmentLanding} 
              onStartResumeSuite={handleGoToResumeSuite}
              onStartLinkedIn={handleGoToLinkedIn}
              onStartCareerAdvisor={handleGoToCareerAdvisor}
              onStartInterviewPrep={handleGoToInterviewPrep}
            />
          )}

          {currentView === "interview_prep" && (
            <InterviewPrepTool onBack={handleBackToHub} />
          )}

          {currentView === "career_advisor" && (
            <CareerAdvisorChat 
              onBack={handleBackToHub} 
              onNavigateToTool={(tool) => {
                if (tool === "resume" || tool === "cover_letter" || tool === "interview") {
                  setCurrentView("resume_suite");
                } else if (tool === "linkedin") {
                  setCurrentView("linkedin");
                }
              }}
            />
          )}

          {currentView === "linkedin" && (
            <LinkedInSignalScore onBack={handleBackToHub} />
          )}

          {currentView === "assessment_landing" && (
            <AssessmentLanding 
              onStart={handleStartAssessment} 
              onBack={handleBackToHub}
            />
          )}

          {currentView === "resume_suite" && (
            <ResumeIntelligenceFlow
              onBack={handleBackToHub}
              onComplete={handleResumeSuiteComplete}
            />
          )}

          {currentView === "intro" && currentModule && (
            <ModuleIntro
              module={currentModule}
              moduleNumber={currentModuleIndex + 1}
              totalModules={modules.length}
              questionCount={moduleQuestions.length}
              onStart={handleStartModule}
              onBack={handleBackToHub}
            />
          )}

          {currentView === "module_complete" && completedModuleIndex !== null && modules[completedModuleIndex] && (
            <ModuleComplete
              module={modules[completedModuleIndex]}
              moduleNumber={completedModuleIndex + 1}
              totalModules={modules.length}
              quickInsight={moduleInsights[completedModuleIndex % moduleInsights.length]}
              onContinue={handleModuleCompleteContinue}
            />
          )}

          {currentView === "questions" && currentQuestion && (
            <div>
              <EngagementIndicator
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={moduleQuestions.length}
                moduleNumber={currentModuleIndex + 1}
                streak={answerStreak}
              />

              <EncouragementBanner
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={moduleQuestions.length}
                moduleNumber={currentModuleIndex + 1}
              />

              <QuestionCard
                question={currentQuestion}
                currentResponse={responses.get(currentQuestion.id)}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onBack={handleBack}
                isFirst={currentModuleIndex === 0 && currentQuestionIndex === 0}
                isLast={currentModuleIndex === modules.length - 1 && currentQuestionIndex === moduleQuestions.length - 1}
                isSaving={isSaving}
              />
            </div>
          )}

          {currentView === "email_gate" && (
            <EmailGate
              onSubmit={handleEmailSubmit}
              isLoading={isSaving}
            />
          )}

          {currentView === "generating" && (
            <GeneratingReport onComplete={handleReportComplete} />
          )}

          {currentView === "complete" && (
            <AssessmentComplete onViewReport={handleViewReport} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StrategicBenchmark;
