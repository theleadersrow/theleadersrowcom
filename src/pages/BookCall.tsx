import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Calendar, Clock, Video } from "lucide-react";

const BookCall = () => {
  // Replace with your actual Calendly link
  const calendlyUrl = "https://calendly.com/theleadersrow/30min";

  useEffect(() => {
    document.title = "Book a Strategic Discovery Call | The Leader's Row";
  }, []);

  return (
    <Layout>
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Strategic Discovery Call
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Let's discuss your career goals and find the right path to accelerate your growth as a Product Leader.
            </p>
          </div>

          {/* What to expect */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-2xl border border-border text-center">
              <Clock className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">30 Minutes</h3>
              <p className="text-sm text-muted-foreground">
                A focused session to understand your needs
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border text-center">
              <Video className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Via Zoom</h3>
              <p className="text-sm text-muted-foreground">
                You'll receive a Zoom link upon booking
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border text-center">
              <Calendar className="w-10 h-10 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Your Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Pick a time that works best for you
              </p>
            </div>
          </div>

          {/* Calendly Embed */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <iframe
              src={`${calendlyUrl}?embed_domain=${window.location.host}&embed_type=Inline`}
              width="100%"
              height="700"
              frameBorder="0"
              title="Schedule a Discovery Call"
              className="min-h-[700px]"
            />
          </div>

          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            After booking, you'll receive a confirmation email with the Zoom meeting link.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default BookCall;
