import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { LinkedInSignalScore } from "@/components/assessment/LinkedInSignalScore";

const LinkedInSignal = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/career-coach");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <LinkedInSignalScore onBack={handleBack} />
        </div>
      </div>
    </Layout>
  );
};

export default LinkedInSignal;
