import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import WhyStuck from "@/components/home/WhyStuck";
import WhatWeDo from "@/components/home/WhatWeDo";
import Mission from "@/components/home/Mission";
import ProgramsSection from "@/components/home/ProgramsSection";
import HowItWorks from "@/components/home/HowItWorks";
import WhyItWorks from "@/components/home/WhyItWorks";
import SuccessStories from "@/components/home/SuccessStories";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <WhyStuck />
      <WhatWeDo />
      <Mission />
      <ProgramsSection />
      <HowItWorks />
      <WhyItWorks />
      <SuccessStories />
      <CTASection />
    </Layout>
  );
};

export default Index;
