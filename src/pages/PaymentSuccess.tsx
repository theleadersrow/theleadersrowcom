import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Calendar, Mail } from "lucide-react";

const PaymentSuccess = () => {
  return (
    <Layout>
      <section className="pt-32 pb-20 bg-background min-h-screen">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Welcome to The Leader's Row! Your enrollment has been confirmed.
            </p>

            {/* Next Steps */}
            <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-soft text-left mb-8">
              <h2 className="font-semibold text-foreground text-xl mb-6">What Happens Next?</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Check Your Email</h3>
                    <p className="text-muted-foreground text-sm">
                      You'll receive a confirmation email with your receipt and program details within the next few minutes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Mark Your Calendar</h3>
                    <p className="text-muted-foreground text-sm">
                      Our team will reach out within 24-48 hours to get you set up with your cohort and provide access to all program resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="gold" size="lg" className="group w-full sm:w-auto">
                  Return to Home
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>

            {/* Support Note */}
            <p className="text-sm text-muted-foreground mt-8">
              Questions? Email us at{" "}
              <a href="mailto:theleadersrow@gmail.com" className="text-secondary hover:underline">
                theleadersrow@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentSuccess;
