import Layout from "@/components/layout/Layout";
import LeadMagnet from "@/components/home/LeadMagnet";

const Guide = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-12 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-secondary font-medium mb-4">Free Resource</p>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-cream mb-6">
              200K Method Starter Kit
            </h1>
            <p className="text-lg text-cream/80 leading-relaxed">
              Get the foundational strategies and frameworks that have helped ambitious Product Managers 
              accelerate their careers and land senior roles.
            </p>
          </div>
        </div>
      </section>

      {/* Lead Magnet Form */}
      <section className="section-padding bg-background">
        <LeadMagnet />
      </section>
    </Layout>
  );
};

export default Guide;
