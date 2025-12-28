import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { RimoLanding } from "@/components/assessment/RimoLanding";

const RimoHub = () => {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    navigate("/strategic-benchmark");
  };

  const handleStartResumeSuite = () => {
    navigate("/resume-suite");
  };

  const handleStartLinkedIn = () => {
    navigate("/linkedin-signal");
  };

  const handleStartCareerAdvisor = () => {
    navigate("/career-advisor");
  };

  const handleStartInterviewPrep = () => {
    navigate("/interview-prep");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <RimoLanding
            onStartAssessment={handleStartAssessment}
            onStartResumeSuite={handleStartResumeSuite}
            onStartLinkedIn={handleStartLinkedIn}
            onStartCareerAdvisor={handleStartCareerAdvisor}
            onStartInterviewPrep={handleStartInterviewPrep}
          />
        </div>
      </div>
    </Layout>
  );
};

export default RimoHub;
