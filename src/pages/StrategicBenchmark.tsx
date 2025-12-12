import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAssessment } from "@/hooks/useAssessment";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { ModuleIntro } from "@/components/assessment/ModuleIntro";
import { EmailGate } from "@/components/assessment/EmailGate";
import { GeneratingReport } from "@/components/assessment/GeneratingReport";
import { AssessmentComplete } from "@/components/assessment/AssessmentComplete";
import { ATSScoring } from "@/components/assessment/ATSScoring";
import { AssessmentLanding } from "@/components/assessment/AssessmentLanding";
import { RimoLanding } from "@/components/assessment/RimoLanding";
import { Loader2 } from "lucide-react";

type AssessmentView = "hub" | "assessment_landing" | "ats" | "intro" | "questions" | "email_gate" | "generating" | "complete";

const StrategicBenchmark = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    getProgress,
    shouldShowSignupGate,
  } = useAssessment();

  const [currentView, setCurrentView] = useState<AssessmentView>("hub");
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [hasSeenEmailGate, setHasSeenEmailGate] = useState(false);

  // Reset to hub when navigating to this page (e.g., clicking header link)
  useEffect(() => {
    setCurrentView("hub");
  }, [location.key]);

  const currentModule = modules[currentModuleIndex];
  const moduleQuestions = currentModule ? getQuestionsForModule(currentModule.id) : [];
  const currentQuestion = moduleQuestions[currentQuestionIndex];
  const totalQuestionsAnswered = responses.size;

  const handleGoToAssessmentLanding = () => {
    setCurrentView("assessment_landing");
  };

  const handleGoToATS = () => {
    setCurrentView("ats");
  };

  const handleBackToHub = () => {
    setCurrentView("hub");
  };

  const handleStartAssessment = () => {
    setCurrentView("intro");
  };

  const handleATSComplete = () => {
    // After ATS, go back to hub so user can choose next action
    setCurrentView("hub");
  };

  const handleStartModule = () => {
    setCurrentView("questions");
  };

  const handleAnswer = async (response: { question_id: string; selected_option_id?: string; numeric_value?: number; text_value?: string }) => {
    saveResponse(response);
    
    // Check if this is the calibration question and extract level
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

  const handleNext = async () => {
    // Check email gate (after 6 questions)
    if (!hasSeenEmailGate && totalQuestionsAnswered >= 6 && shouldShowSignupGate()) {
      setCurrentView("email_gate");
      return;
    }

    // Move to next question
    if (currentQuestionIndex < moduleQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      await updateProgress(currentModuleIndex, nextIndex);
    } else {
      // End of module
      if (currentModuleIndex < modules.length - 1) {
        // Move to next module
        const nextModuleIndex = currentModuleIndex + 1;
        setCurrentModuleIndex(nextModuleIndex);
        setCurrentQuestionIndex(0);
        setCurrentView("intro");
        await updateProgress(nextModuleIndex, 0);
      } else {
        // Assessment complete
        await submitAssessment();
        setCurrentView("generating");
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentModuleIndex > 0) {
      // Go back to previous module's last question
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
        {/* Progress bar - hide during hub, assessment_landing, ats, email gate, generating, and complete */}
        {!["hub", "assessment_landing", "ats", "email_gate", "generating", "complete"].includes(currentView) && (
          <AssessmentProgress
            modules={modules}
            currentModuleIndex={currentModuleIndex}
            progress={getProgress()}
          />
        )}

        <div className="container max-w-3xl mx-auto px-4 py-8">
          {currentView === "hub" && (
            <RimoLanding 
              onStartAssessment={handleGoToAssessmentLanding} 
              onStartATS={handleGoToATS}
            />
          )}

          {currentView === "assessment_landing" && (
            <AssessmentLanding 
              onStart={handleStartAssessment} 
              onBack={handleBackToHub}
            />
          )}

          {currentView === "ats" && (
            <ATSScoring
              onComplete={handleATSComplete}
              onSkip={handleATSComplete}
              onBack={handleBackToHub}
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

          {currentView === "questions" && currentQuestion && (
            <div>
              {/* Question counter */}
              <div className="text-center mb-6">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {moduleQuestions.length}
                </span>
              </div>

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
