import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Video, 
  Clock, 
  Target, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Calendar,
  MessageSquare,
  TrendingUp
} from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Tailored to Your Goals",
    description: "Every session is customized to address your specific challenges, career aspirations, and development needs."
  },
  {
    icon: MessageSquare,
    title: "Confidential Space",
    description: "A safe, judgment-free environment to discuss sensitive career topics, workplace dynamics, and leadership challenges."
  },
  {
    icon: TrendingUp,
    title: "Accelerated Growth",
    description: "Get personalized strategies and actionable feedback that fast-track your professional development."
  },
  {
    icon: Users,
    title: "Accountability Partner",
    description: "Stay on track with regular check-ins and someone invested in your success holding you accountable."
  }
];

const sessionIncludes = [
  "60-minute focused session via Zoom",
  "Pre-session questionnaire to maximize time",
  "Personalized action items and follow-up notes",
  "Access to relevant resources and frameworks",
  "Email support between sessions",
  "Progress tracking and goal alignment"
];

const Coaching = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-cream to-white">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Personalized Executive Coaching
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6">
              1:1 Results-Driven Coaching
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Unlock your full leadership potential with personalized coaching sessions 
              designed to accelerate your career growth and help you achieve breakthrough results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book-call">
                <Button variant="hero" size="xl" className="group">
                  Book a Strategy Call
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-4">
                How Coaching Works
              </h2>
              <p className="text-muted-foreground text-lg">
                Simple, flexible, and designed around your schedule
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center border-2 border-secondary/20">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">Via Zoom</h3>
                  <p className="text-muted-foreground text-sm">
                    All sessions conducted virtually for your convenience, no matter where you are
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-secondary/20">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">1 Hour Sessions</h3>
                  <p className="text-muted-foreground text-sm">
                    Focused, uninterrupted time dedicated entirely to your development
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-secondary/20">
                <CardContent className="pt-8 pb-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-navy text-lg mb-2">Tailored to You</h3>
                  <p className="text-muted-foreground text-sm">
                    Every session addresses your unique challenges and career goals
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why 1:1 Coaching */}
      <section className="section-padding bg-cream">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-4">
                Why 1:1 Coaching?
              </h2>
              <p className="text-muted-foreground text-lg">
                The fastest path to leadership transformation
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-navy" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy text-lg mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding bg-white">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-6">
                  What's Included in Each Session
                </h2>
                <ul className="space-y-4">
                  {sessionIncludes.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="bg-navy text-cream">
                <CardContent className="p-8">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-secondary" />
                    <h3 className="font-serif text-2xl font-bold mb-4">
                      Ready to Get Started?
                    </h3>
                    <p className="text-cream/80 mb-6">
                      Book a free 30-minute strategy call to discuss your goals 
                      and see if coaching is right for you.
                    </p>
                    <Link to="/book-call">
                      <Button variant="hero" size="lg" className="w-full group">
                        Schedule Your Strategy Call
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="section-padding bg-cream">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mb-6">
              Who Is This For?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              1:1 coaching is ideal for professionals who are:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {[
                "Preparing for a major career transition or promotion",
                "Stepping into a new leadership role",
                "Navigating complex workplace challenges",
                "Looking to accelerate their career trajectory",
                "Seeking to develop executive presence",
                "Wanting personalized, confidential guidance"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-navy">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-navy">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-6">
              Your Next Level Starts Here
            </h2>
            <p className="text-cream/80 text-lg mb-8">
              Take the first step toward transformative growth. Book your free strategy 
              call today and discover how personalized coaching can accelerate your career.
            </p>
            <Link to="/book-call">
              <Button variant="hero" size="xl" className="group">
                Book Your Free Strategy Call
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Coaching;
