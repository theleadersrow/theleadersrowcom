import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import ValueProp from "@/components/home/ValueProp";
import ProgramsSection from "@/components/home/ProgramsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <ValueProp />
      <ProgramsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
