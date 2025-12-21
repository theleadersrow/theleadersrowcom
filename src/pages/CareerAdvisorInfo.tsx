import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Clock, 
  Brain, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Users,
  Zap,
  Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CareerAdvisorInfo = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Brain,
      title: "AI-Powered Coaching",
      description: "Get personalized career advice powered by advanced AI that understands your unique situation and goals."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Access expert career guidance anytime, anywhere. No scheduling, no waiting rooms."
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set, track, and achieve your career milestones with built-in progress monitoring."
    },
    {
      icon: Sparkles,
      title: "Personalized Insights",
      description: "Receive tailored recommendations based on your experience, skills, and aspirations."
    },
    {
      icon: MessageSquare,
      title: "Conversational Interface",
      description: "Natural, human-like conversations that feel like talking to a trusted mentor."
    },
    {
      icon: TrendingUp,
      title: "Career Progression",
      description: "Strategic guidance to accelerate your path to senior roles and higher compensation."
    }
  ];

  const roiPoints = [
    {
      metric: "$15K-50K+",
      label: "Average salary increase",
      description: "Users report significant salary jumps after implementing our career strategies"
    },
    {
      metric: "3-6 months",
      label: "Faster promotions",
      description: "Structured guidance helps you get promoted faster than peers"
    },
    {
      metric: "10+ hours",
      label: "Saved per month",
      description: "No more endless research - get answers instantly"
    },
    {
      metric: "90%",
      label: "User satisfaction",
      description: "Users rate the advisor as highly valuable for their career growth"
    }
  ];

  const features = [
    "Unlimited AI-powered career conversations",
    "Personalized action plans and strategies",
    "Goal setting and progress tracking",
    "Session summaries and key insights",
    "Integration with Resume & LinkedIn tools",
    "Proactive reminder nudges",
    "Voice response option for hands-free coaching"
  ];

  const useCases = [
    {
      title: "Salary Negotiation",
      description: "Get scripts, strategies, and confidence to negotiate $10K-50K+ more"
    },
    {
      title: "Interview Preparation",
      description: "Practice with AI-powered mock interviews and get feedback"
    },
    {
      title: "Career Pivots",
      description: "Navigate industry changes with expert guidance on transferable skills"
    },
    {
      title: "Leadership Development",
      description: "Develop executive presence and management skills"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/30">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI-Powered Career Coaching
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Personal{" "}
              <span className="text-primary">Career Advisor</span>
              <br />Available 24/7
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get personalized career guidance, strategic advice, and actionable plans 
              from an AI coach trained on thousands of successful career transitions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/strategic-benchmark")}
                className="text-lg px-8 py-6"
              >
                Start Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>3 free chats included</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Career Advisor?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Traditional career coaching costs $200-500/hour. Get the same quality 
              guidance at a fraction of the cost, whenever you need it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <DollarSign className="w-4 h-4 mr-1 inline" />
              Return on Investment
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Numbers Speak for Themselves
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Career Advisor pays for itself many times over through better opportunities, 
              higher salaries, and faster career progression.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {roiPoints.map((point, index) => (
              <Card key={index} className="text-center border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">{point.metric}</div>
                  <div className="font-semibold mb-2">{point.label}</div>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Professionals Use Career Advisor
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From salary negotiations to career pivots, get expert guidance for every situation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{useCase.title}</h3>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Everything You Need to Accelerate Your Career
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  A comprehensive toolkit designed to help you achieve your career goals faster 
                  and with more confidence.
                </p>
                
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <Card className="border-primary/20 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">Career Advisor Pro</div>
                        <div className="text-sm text-muted-foreground">Unlimited access</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-bold">$29<span className="text-lg text-muted-foreground">/month</span></div>
                      <div className="text-sm text-muted-foreground">Less than a coffee per day</div>
                    </div>

                    <Button 
                      className="w-full mb-4" 
                      size="lg"
                      onClick={() => navigate("/strategic-benchmark")}
                    >
                      Start Free Trial
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Trusted by 5,000+ professionals</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Ambitious Professionals Like You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                quote: "The Career Advisor helped me negotiate a $30K raise. Best investment I've ever made.",
                author: "Sarah M.",
                role: "Senior Product Manager"
              },
              {
                quote: "I went from individual contributor to Director in 18 months with this guidance.",
                author: "Michael T.",
                role: "Engineering Director"
              },
              {
                quote: "Finally, career advice that's personalized to my situation, not generic tips.",
                author: "Jennifer L.",
                role: "Marketing Lead"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with 3 free conversations. No credit card required. 
              See why thousands of professionals trust Career Advisor for their growth.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/strategic-benchmark")}
              className="text-lg px-10 py-6"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CareerAdvisorInfo;
