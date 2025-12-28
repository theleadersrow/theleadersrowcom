import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { ResumeIntelligenceFlow } from "@/components/assessment/ResumeIntelligenceFlow";

const ResumeSuite = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/career-coach");
  };

  const handleComplete = () => {
    navigate("/career-coach");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <ResumeIntelligenceFlow onBack={handleBack} onComplete={handleComplete} />
        </div>
      </div>
    </Layout>
  );
};

export default ResumeSuite;
