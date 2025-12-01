import Layout from "@/components/layout/Layout";

const Privacy = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-lg text-muted-foreground">
              <p className="mb-6">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                1. Information We Collect
              </h2>
              <p className="mb-6">
                We collect information you provide directly to us, including your name, email 
                address, phone number, address, and occupation when you register for our programs 
                or contact us.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="mb-6">
                We use the information we collect to provide, maintain, and improve our services, 
                communicate with you about programs and updates, and process registrations and payments.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                3. Information Sharing
              </h2>
              <p className="mb-6">
                We do not sell, trade, or otherwise transfer your personal information to outside 
                parties except as necessary to provide our services (such as payment processing) 
                or as required by law.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                4. Data Security
              </h2>
              <p className="mb-6">
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                5. Your Rights
              </h2>
              <p className="mb-6">
                You have the right to access, correct, or delete your personal information. 
                Contact us to exercise these rights.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-10 mb-4">
                6. Contact
              </h2>
              <p className="mb-6">
                For questions about this privacy policy, please contact us at{" "}
                <a href="mailto:hello@theleadersrow.com" className="text-secondary hover:underline">
                  hello@theleadersrow.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;
