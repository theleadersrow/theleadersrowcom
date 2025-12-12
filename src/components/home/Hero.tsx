import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-navy-dark/60" />
      
      {/* Content */}
      <div className="relative z-10 container-wide mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-28 lg:py-32 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Star accent */}
          <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6 opacity-0 animate-fade-up">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-secondary fill-secondary" />
          </div>
          
          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-4 sm:mb-6 opacity-0 animate-fade-up delay-100 leading-tight px-2">
            Helping Ambitious Professionals Break Into <span className="text-gradient-gold">Top 10% Leadership Roles</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-cream/90 max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed opacity-0 animate-fade-up delay-200 px-4">
            Clarity. Confidence. A proven system.
          </p>
          <div className="text-sm sm:text-base lg:text-lg text-cream/70 max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5 sm:space-y-2 opacity-0 animate-fade-up delay-250 px-4">
            <p>Stop guessing your worth.</p>
            <p>Master the skills that drive promotions and higher pay.</p>
            <p>Live coaching. Ambitious community. Real results.</p>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-secondary font-semibold max-w-2xl mx-auto mb-8 sm:mb-10 opacity-0 animate-fade-up delay-300 px-4">
            Your career plateau ends here.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 opacity-0 animate-fade-up delay-400 px-4">
            <Link to="/200k-method" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Get the 200K Method
              </Button>
            </Link>
            <a href="#programs" className="w-full sm:w-auto">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                View All Programs
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-500 hidden sm:block">
        <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-cream/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
