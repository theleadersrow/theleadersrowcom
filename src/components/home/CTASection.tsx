import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";

const CTASection = () => {
  const scrollToQuiz = () => {
    const quizSection = document.querySelector('[data-quiz-section]');
    quizSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section-padding bg-navy relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container-wide mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-cream mb-6">
            Ready to Unblock Your Career?
          </h2>
          <p className="text-cream/80 text-lg md:text-xl mb-10 leading-relaxed">
            Take the first step toward becoming the leader you're meant to be. 
            Join professionals who are accelerating their careers with proven strategies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Start Your Journey
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="heroOutline" size="xl">
                Get in Touch
              </Button>
            </Link>
          </div>
          
          {/* Quiz promotion */}
          <div className="mt-10 pt-8 border-t border-cream/20">
            <p className="text-cream/60 text-sm mb-3">Not sure where to start?</p>
            <button
              onClick={scrollToQuiz}
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              <Target className="w-4 h-4" />
              Take the 60-Second Career Assessment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
