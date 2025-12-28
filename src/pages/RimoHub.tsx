import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { RimoLanding } from "@/components/assessment/RimoLanding";

const RimoHub = () => {
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    navigate("/strategic-benchmark");
  };

  const handleStartResumeSuite = () => {
    navigate("/strategic-benchmark?tool=resume_suite");
  };

  const handleStartLinkedIn = () => {
    navigate("/strategic-benchmark?tool=linkedin");
  };

  const handleStartCareerAdvisor = () => {
    navigate("/strategic-benchmark?tool=career_advisor");
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
