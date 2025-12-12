import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import LeadMagnet from "@/components/home/LeadMagnet";
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
 * 3. Mission - GUIDE (position as the trusted guide)
 * 4. WhatWeDo - GUIDE's capabilities
 * 5. HowItWorks - PLAN (simple 4-step roadmap)
 * 6. WhyItWorks - AUTHORITY (credibility & differentiation)
 * 7. ProgramsSection - CALL TO ACTION (specific offerings)
 * 8. SuccessStories - SUCCESS (transformation proof)
 * 9. LeadMagnet - Secondary CTA (lower commitment)
 * 10. CTASection - Final CALL TO ACTION
 */
const Index = () => {
  return (
    <Layout>
      {/* Hook & Promise */}
      <Hero />
      
      {/* PROBLEM - Why they're stuck */}
      <WhyStuck />
      
      {/* GUIDE - The Leader's Row as trusted guide */}
      <Mission />
      <WhatWeDo />
      
      {/* PLAN - Simple roadmap to success */}
      <HowItWorks />
      
      {/* AUTHORITY - Why this works */}
      <WhyItWorks />
      
      {/* CALL TO ACTION - Programs */}
      <ProgramsSection />
      
      {/* SUCCESS - Transformation stories */}
      <SuccessStories />
      
      {/* Secondary CTA - Starter Kit lead magnet */}
      <LeadMagnet />
      
      {/* Final CALL TO ACTION */}
      <CTASection />
    </Layout>
  );
};

export default Index;
