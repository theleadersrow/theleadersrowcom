import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import LeadMagnet from "@/components/home/LeadMagnet";
import QuizLeadMagnet from "@/components/home/QuizLeadMagnet";
import WhyStuck from "@/components/home/WhyStuck";
import WhatWeDo from "@/components/home/WhatWeDo";
import Mission from "@/components/home/Mission";
import ProgramsSection from "@/components/home/ProgramsSection";
import HowItWorks from "@/components/home/HowItWorks";
import WhyItWorks from "@/components/home/WhyItWorks";
import SuccessStories from "@/components/home/SuccessStories";
import CTASection from "@/components/home/CTASection";

/**
 * StoryBrand Flow:
 * 1. Hero - Hook & Promise
 * 2. WhyStuck - PROBLEM (identify pain points)
 * 3. QuizLeadMagnet - Lead capture after problem awareness
 * 4. Mission - GUIDE (position as the trusted guide)
 * 5. WhatWeDo - GUIDE's capabilities
 * 6. HowItWorks - PLAN (simple 4-step roadmap)
 * 7. ProgramsSection - CALL TO ACTION (specific offerings)
 * 8. LeadMagnet - Secondary CTA (lower commitment)
 * 9. WhyItWorks - AUTHORITY (credibility & differentiation)
 * 10. SuccessStories - SUCCESS (transformation proof)
 * 11. CTASection - Final CALL TO ACTION
 */
const Index = () => {
  return (
    <Layout>
      {/* Hook & Promise */}
      <Hero />
      
      {/* PROBLEM - Why they're stuck */}
      <WhyStuck />
      
      {/* Lead Capture - Quiz after problem awareness */}
      <QuizLeadMagnet />
      
      {/* GUIDE - The Leader's Row as trusted guide */}
      <Mission />
      <WhatWeDo />
      
      {/* PLAN - Simple roadmap to success */}
      <HowItWorks />
      
      {/* CALL TO ACTION - Programs */}
      <ProgramsSection />
      
      {/* Secondary CTA - Lower commitment lead magnet */}
      <LeadMagnet />
      
      {/* AUTHORITY - Why this works */}
      <WhyItWorks />
      
      {/* SUCCESS - Transformation stories */}
      <SuccessStories />
      
      {/* Final CALL TO ACTION */}
      <CTASection />
    </Layout>
  );
};

export default Index;
