import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-padding bg-navy relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-cream mb-4 sm:mb-6">
            Ready to Unblock Your Career?
          </h2>
          <p className="text-cream/80 text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 leading-relaxed px-2">
            Take the first step toward becoming the leader you're meant to be. 
            Join professionals who are accelerating their careers with proven strategies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="group w-full sm:w-auto">
                Start Your Journey
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                Get in Touch
              </Button>
            </Link>
          </div>
          
          {/* AI Career Coach promotion */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-cream/20">
            <p className="text-cream/60 text-sm mb-3">Not sure where to start?</p>
            <Link
              to="/career-coach"
              className="inline-flex items-center gap-2 text-secondary hover:text-secondary/80 font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Try Our AI Career Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
