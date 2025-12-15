import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BookOpen, Star, CheckCircle2, TrendingUp, Target, Award, Users, Lightbulb, BarChart3, Zap, Heart } from "lucide-react";
import { executiveCommunicationCourse } from "@/data/courses/executive-communication";

const Courses = () => {
  const course = executiveCommunicationCourse;

  const valueProps = [
    {
      icon: TrendingUp,
      title: "Accelerate Your Career",
      description: "Professionals who invest in continuous learning earn 25% more over their careers and get promoted 2x faster than those who don't."
    },
    {
      icon: Lightbulb,
      title: "Stay Relevant & Competitive",
      description: "In a rapidly evolving workplace, the skills that got you here won't get you there. Stay ahead of the curve with targeted skill development."
    },
    {
      icon: Users,
      title: "Lead With Confidence",
      description: "Transform from a doer to a leader. Learn the soft skills that distinguish senior professionals from everyone else."
    },
    {
      icon: Zap,
      title: "Immediate Application",
      description: "No theory-heavy lectures. Every course delivers frameworks and tools you can apply in your next meeting."
    }
  ];

  const whyItMatters = [
    {
      stat: "94%",
      label: "of employees say they'd stay longer at a company that invests in their development"
    },
    {
      stat: "70%",
      label: "of professionals feel unprepared for leadership roles due to skill gaps"
    },
    {
      stat: "3x",
      label: "more likely to be promoted when actively developing leadership skills"
    },
    {
      stat: "$46B",
      label: "spent annually by companies on leadership development globally"
    }
  ];

  const successMetrics = [
    {
      icon: Target,
      title: "Clarity of Communication",
      description: "Track how often your recommendations get approved, your updates drive action, and stakeholders seek your input.",
      measure: "Before/After: Approval rates, meeting outcomes, stakeholder feedback"
    },
    {
      icon: Award,
      title: "Career Advancement",
      description: "Monitor promotions, expanded responsibilities, and leadership opportunities that come your way.",
      measure: "Track: Title changes, scope expansion, leadership roles"
    },
    {
      icon: BarChart3,
      title: "Influence & Impact",
      description: "Measure your ability to drive decisions, build coalitions, and shape strategy at your organization.",
      measure: "Observe: Decision influence, cross-functional collaboration, strategic input"
    },
    {
      icon: Heart,
      title: "Confidence & Presence",
      description: "Self-assess your comfort in high-stakes situations, executive conversations, and visible moments.",
      measure: "Rate: Presentation confidence, stakeholder conversations, public speaking"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-navy-dark via-navy to-navy-light overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(45_80%_55%_/_0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(45_80%_55%_/_0.1)_0%,transparent_50%)]" />
        </div>
        
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-secondary font-medium mb-4 text-sm sm:text-base animate-fade-up tracking-wide uppercase">
              Professional Development
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-cream mb-6 animate-fade-up delay-100 leading-tight">
              The Skills That Got You Here Won't Get You <span className="text-secondary">There</span>
            </h1>
            <p className="text-cream/80 text-lg sm:text-xl leading-relaxed animate-fade-up delay-200 max-w-3xl mx-auto mb-8">
              High performers plateau when they stop growing. Our courses give you the practical frameworks, 
              communication skills, and leadership tools to break through to your next level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
              <a href="#courses">
                <Button variant="gold" size="lg" className="group w-full sm:w-auto">
                  Browse Courses
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <a href="#value">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-cream/30 text-cream hover:bg-cream/10">
                  Why It Matters
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section id="value" className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Why Invest in Professional Development?
            </h2>
            <p className="text-muted-foreground text-lg">
              Your technical skills opened doors. But to walk through them—and lead others—you need a different toolkit entirely.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {valueProps.map((prop, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-secondary/30 transition-all hover:shadow-elevated group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <prop.icon className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {prop.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters - Stats Section */}
      <section className="section-padding bg-navy-dark">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-cream mb-4">
              The Numbers Don't Lie
            </h2>
            <p className="text-cream/70 text-lg">
              Professional development isn't a luxury—it's a career necessity.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyItMatters.map((item, index) => (
              <div key={index} className="text-center">
                <div className="font-serif text-4xl sm:text-5xl font-bold text-secondary mb-2">
                  {item.stat}
                </div>
                <p className="text-cream/70 text-sm leading-relaxed">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Measure Success Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              How to Measure Your Growth
            </h2>
            <p className="text-muted-foreground text-lg">
              Professional development works when you can see the results. Here's how to track your progress.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {successMetrics.map((metric, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 sm:p-8 border border-border/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <metric.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      {metric.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {metric.description}
                    </p>
                    <div className="bg-muted/50 rounded-lg px-4 py-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">How to measure: </span>
                        {metric.measure}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Course */}
      <section id="courses" className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-secondary font-medium mb-2 text-sm tracking-wide uppercase">
              Start Here
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Our Flagship Course
            </h2>
            <p className="text-muted-foreground text-lg">
              Practical, action-oriented learning you can apply immediately.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-card shadow-elevated">
              {/* Badge */}
              {course.badge && (
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {course.badge}
                </div>
              )}

              <div className="p-6 sm:p-8 lg:p-12">
                {/* Course Header */}
                <div className="mb-8 lg:mb-10">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {course.modules} Modules
                    </span>
                  </div>
                  
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                    {course.title}
                  </h2>
                  <p className="text-lg sm:text-xl text-secondary font-medium mb-4">
                    {course.subtitle}
                  </p>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-3xl">
                    {course.description}
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Who It's For */}
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-4">
                        Who This Course Is For
                      </h3>
                      <ul className="space-y-3">
                        {course.targetAudience.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-sm sm:text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Outcomes */}
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-4">
                        After 60 Minutes, You'll Be Able To
                      </h3>
                      <ul className="space-y-3">
                        {course.outcomes.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-secondary text-xs font-bold">{index + 1}</span>
                            </div>
                            <span className="text-foreground font-medium text-sm sm:text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    {/* What's Included */}
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-4">
                        What's Included
                      </h3>
                      <ul className="space-y-3">
                        {course.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground text-sm sm:text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Why It Works */}
                    <div className="bg-muted/50 rounded-xl p-5 sm:p-6">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                        Why This Course Works
                      </h3>
                      <ul className="space-y-3">
                        {course.whyItWorks.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0 mt-2" />
                            <span className="text-muted-foreground text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Modules Preview */}
                <div className="mt-10 pt-8 border-t border-border">
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground mb-6">
                    Course Modules
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.modulesList.map((module) => (
                      <div 
                        key={module.id}
                        className="bg-muted/30 rounded-xl p-4 border border-border/50 hover:border-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                            <span className="text-secondary text-sm font-bold">{module.id}</span>
                          </div>
                          <span className="text-muted-foreground text-xs">{module.duration}</span>
                        </div>
                        <h4 className="font-medium text-foreground text-sm mb-1">{module.title}</h4>
                        <p className="text-muted-foreground text-xs">{module.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-serif text-3xl sm:text-4xl font-semibold text-foreground">
                        {course.price}
                      </span>
                      <span className="text-muted-foreground text-sm">one-time</span>
                    </div>
                    <p className="text-muted-foreground text-sm">Lifetime access • Instant download</p>
                  </div>
                  <Link to={`/courses/${course.id}`}>
                    <Button variant="gold" size="lg" className="group w-full sm:w-auto">
                      Start Learning
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Courses */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              More Courses Coming Soon
            </h2>
            <p className="text-muted-foreground">
              We're building more practical, action-oriented courses for ambitious professionals.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "Executive Level Storytelling",
                subtitle: "Steve Jobs Inspired",
                description: "Master the art of compelling narratives that move audiences and drive decisions."
              },
              {
                title: "How to Become a People Leader",
                subtitle: "Leadership Fundamentals",
                description: "Transition from individual contributor to effective people manager."
              },
              {
                title: "Be Adaptable & Build Resilience",
                subtitle: "Navigating Change",
                description: "Navigate change and bounce back stronger from setbacks."
              },
              {
                title: "Be a Decision Maker",
                subtitle: "Strategic Choices",
                description: "Build confidence in making high-stakes decisions with clarity."
              }
            ].map((placeholderCourse, index) => (
              <div 
                key={index}
                className="relative rounded-xl bg-card border border-border/50 p-6 opacity-75"
              >
                <div className="absolute top-4 right-4 bg-muted text-muted-foreground text-xs font-medium px-2 py-1 rounded-full">
                  Coming Soon
                </div>
                <div className="pt-4">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                    {placeholderCourse.title}
                  </h3>
                  <p className="text-secondary text-sm font-medium mb-3">
                    {placeholderCourse.subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {placeholderCourse.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-muted-foreground mb-4">
              Join our newsletter to be the first to know when new courses launch.
            </p>
            <Link to="/newsletter">
              <Button variant="outline" size="lg">
                Join the Newsletter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;