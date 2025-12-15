import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BookOpen, Star, CheckCircle2, TrendingUp, Target, Award, Zap } from "lucide-react";
import { executiveCommunicationCourse } from "@/data/courses/executive-communication";
import { emotionalIntelligenceCourse } from "@/data/courses/emotional-intelligence";

const Courses = () => {
  const featuredCourse = executiveCommunicationCourse;
  const courses = [executiveCommunicationCourse, emotionalIntelligenceCourse];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-gradient-to-b from-navy-dark via-navy to-navy-light overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(45_80%_55%_/_0.15)_0%,transparent_50%)]" />
        </div>
        
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream mb-4 animate-fade-up leading-tight">
              Professional Development <span className="text-secondary">That Works</span>
            </h1>
            <p className="text-cream/80 text-lg sm:text-xl leading-relaxed animate-fade-up delay-100 mb-8">
              Practical frameworks you can apply tomorrow. No fluff, no theory—just results.
            </p>
            <a href="#courses">
              <Button variant="gold" size="lg" className="group animate-fade-up delay-200">
                Browse Courses
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why It Matters - Compact */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: "25% Higher Earnings", desc: "For continuous learners" },
              { icon: Zap, title: "Immediate ROI", desc: "Apply skills same week" },
              { icon: Target, title: "2x Faster Promotion", desc: "With targeted skill growth" },
              { icon: Award, title: "Lifetime Access", desc: "Learn at your pace" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{item.title}</p>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Courses */}
      <section id="courses" className="section-padding bg-background">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3">
              Our Courses
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Skill-building courses designed for ambitious professionals ready to level up.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {courses.map((course) => {
              const isComingSoon = course.badge === "Coming Soon";
              
              return (
                <div 
                  key={course.id} 
                  className={`relative rounded-2xl overflow-hidden bg-card shadow-elevated ${isComingSoon ? 'opacity-80' : ''}`}
                >
                  {course.badge && (
                    <div className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 z-10 ${
                      isComingSoon 
                        ? 'bg-muted text-muted-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {!isComingSoon && <Star className="w-3.5 h-3.5 fill-current" />}
                      {course.badge}
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        {course.modules} Modules
                      </span>
                    </div>
                    
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-foreground mb-2">
                      {course.title}
                    </h3>
                    <p className="text-secondary font-medium mb-3">{course.subtitle}</p>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{course.description}</p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-foreground text-sm mb-2">What You'll Learn</h4>
                      <ul className="space-y-1.5">
                        {course.outcomes.slice(0, 3).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                      <div>
                        <span className="font-serif text-2xl font-semibold text-foreground">{course.price}</span>
                        <span className="text-muted-foreground text-sm ml-2">one-time</span>
                      </div>
                      {isComingSoon ? (
                        <Button variant="outline" size="default" disabled className="w-full sm:w-auto">
                          Coming Soon
                        </Button>
                      ) : (
                        <Link to={`/courses/${course.id}`}>
                          <Button variant="gold" size="default" className="group w-full sm:w-auto">
                            Start Learning
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-semibold text-foreground text-center mb-8">
            More Coming Soon
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { title: "Executive Storytelling", subtitle: "Steve Jobs Inspired" },
              { title: "Become a People Leader", subtitle: "Leadership Fundamentals" },
              { title: "Build Resilience", subtitle: "Navigating Change" },
              { title: "Decision-Making", subtitle: "Leading with Conviction" },
              { title: "Innovation & Creativity", subtitle: "Push Your Boundaries" },
              { title: "Negotiation", subtitle: "Winning the Game" },
              { title: "Conflict Management", subtitle: "Keeping the Peace" },
            ].map((c, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border/50 opacity-70">
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Soon</span>
                <h3 className="font-serif text-base font-semibold text-foreground mt-3 mb-1">{c.title}</h3>
                <p className="text-secondary text-sm">{c.subtitle}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/newsletter">
              <Button variant="outline">Get Notified</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Courses;