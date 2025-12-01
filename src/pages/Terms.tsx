import Layout from "@/components/layout/Layout";

const Terms = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-8">
              Terms & Conditions
            </h1>

            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-6">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                1. Agreement to Terms
              </h2>
              <p className="mb-6">
                By accessing or using The Leader's Row services, you agree to be bound by these 
                Terms and Conditions. If you disagree with any part of these terms, you may not 
                access our services.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                2. Services
              </h2>
              <p className="mb-6">
                The Leader's Row provides career coaching and professional development programs. 
                Our programs include the 200K Method (8-week accelerator) and Weekly Edge 
                (ongoing membership).
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                3. Payments and Refunds
              </h2>
              <p className="mb-6">
                Payment is required prior to program enrollment. Refund policies vary by program 
                and will be communicated during the registration process. For Weekly Edge, 
                you may cancel your monthly membership at any time. However, if you have already 
                been billed, you will have access until the end of your current billing cycle.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                4. Intellectual Property
              </h2>
              <p className="mb-6">
                All content, materials, and resources provided through our programs are the 
                intellectual property of The Leader's Row and may not be reproduced or distributed 
                without permission.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                5. Limitation of Liability
              </h2>
              <p className="mb-6">
                The Leader's Row provides coaching and educational services. Career outcomes depend 
                on individual effort and market conditions. We do not guarantee specific job offers, 
                promotions, or salary increases.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                6. Contact
              </h2>
              <p className="mb-6">
                For questions about these terms, please contact us at{" "}
                <a href="mailto:connect@theleadersrow.com" className="text-secondary hover:underline">
                  connect@theleadersrow.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
