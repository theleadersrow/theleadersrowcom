import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { CareerAdvisorChat } from "@/components/assessment/CareerAdvisorChat";

const CareerAdvisor = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/career-coach");
  };

  const handleNavigateToTool = (tool: string) => {
    if (tool === "resume" || tool === "cover_letter" || tool === "interview") {
      navigate("/resume-suite");
    } else if (tool === "linkedin") {
      navigate("/linkedin-signal");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-20">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <CareerAdvisorChat 
            onBack={handleBack} 
            onNavigateToTool={handleNavigateToTool}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CareerAdvisor;
