import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Users, Clock, CheckCircle, Zap, X, Video, MessageSquare, Target, TrendingUp } from "lucide-react";

const livePrograms = [
  {
    title: "200K Method",
    subtitle: "8-Week Career Accelerator",
    description: "An intensive program designed to help you break through career plateaus and reach your next level. Perfect for ambitious professionals ready to make a significant leap.",
    duration: "8 weeks",
    format: "Live cohort-based",
    href: "/200k-method",
    highlights: [
      "Weekly live coaching sessions",
      "Personalized career strategy",
      "Interview preparation",
      "Salary negotiation tactics",
      "Exclusive community access",
    ],
    featured: true,
  },
  {
    title: "Weekly Edge",
    subtitle: "Ongoing Group Coaching",
    description: "Stay sharp with continuous learning and accountability. Join weekly sessions focused on real-time career challenges and growth opportunities.",
    duration: "Ongoing",
    format: "Weekly live sessions",
    href: "/weekly-edge",
    highlights: [
      "Weekly group coaching calls",
      "Real-time Q&A sessions",
      "Peer networking",
      "Latest industry insights",
      "Continuous support",
    ],
    featured: false,
  },
];

const LivePrograms = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Live Programs
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Transform Your Career Through Live, Interactive Learning
            </h1>
            <p className="text-lg text-muted-foreground">
              Our live programs combine expert-led sessions, real-time feedback, and peer accountability 
              to create breakthrough moments that self-study simply cannot match. Learn alongside ambitious 
              professionals, get your questions answered on the spot, and build lasting connections.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                Why Live Programs Beat Self-Paced Learning
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                While self-paced courses have their place, live programs deliver results that 
                asynchronous learning simply cannot match.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Live Programs Column */}
              <div className="bg-card border-2 border-secondary rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -top-3 left-6 bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Live Programs
                </div>
                <div className="space-y-5 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Video className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Real-Time Interaction</h4>
                      <p className="text-sm text-muted-foreground">Get immediate answers to your specific questions and situations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Built-In Accountability</h4>
                      <p className="text-sm text-muted-foreground">Scheduled sessions and cohort pressure keep you on track</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Personalized Feedback</h4>
                      <p className="text-sm text-muted-foreground">Tailored advice based on your unique career context</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Peer Network</h4>
                      <p className="text-sm text-muted-foreground">Connect with ambitious professionals on the same journey</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Higher Completion Rates</h4>
                      <p className="text-sm text-muted-foreground">85%+ completion vs. 5-15% for self-paced courses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Self-Paced Column */}
              <div className="bg-muted/50 border border-border rounded-2xl p-6 md:p-8 relative">
                <div className="absolute -top-3 left-6 bg-muted-foreground/20 text-muted-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Self-Paced Courses
                </div>
                <div className="space-y-5 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">One-Way Content</h4>
                      <p className="text-sm text-muted-foreground/70">Generic videos without interaction or Q&A</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">Easy to Abandon</h4>
                      <p className="text-sm text-muted-foreground/70">No deadlines or external motivation to finish</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">No Personalization</h4>
                      <p className="text-sm text-muted-foreground/70">Same content regardless of your experience level</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">Isolated Learning</h4>
                      <p className="text-sm text-muted-foreground/70">No community or networking opportunities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-muted-foreground">Low Completion</h4>
                      <p className="text-sm text-muted-foreground/70">Most courses sit unfinished in your library</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-8">
            {livePrograms.map((program) => (
              <div 
                key={program.title}
                className={`bg-card border rounded-2xl p-6 md:p-8 ${
                  program.featured ? "border-secondary shadow-elevated" : "border-border"
                }`}
              >
                {program.featured && (
                  <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium mb-4">
                    Most Popular
                  </div>
                )}
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                      {program.title}
                    </h2>
                    <p className="text-secondary font-medium mb-4">
                      {program.subtitle}
                    </p>
                    <p className="text-muted-foreground mb-6">
                      {program.description}
                    </p>
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {program.duration}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {program.format}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {program.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 lg:self-center">
                    <Button variant={program.featured ? "gold" : "outline"} size="lg" asChild>
                      <Link to={program.href} className="flex items-center gap-2">
                        Learn More
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Not Sure Which Program Is Right for You?
            </h2>
            <p className="text-muted-foreground mb-8">
              Book a free strategy call and let's discuss your goals and find the best path forward.
            </p>
            <Button variant="gold" size="lg" asChild>
              <Link to="/book-call" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book a Strategy Call
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LivePrograms;
