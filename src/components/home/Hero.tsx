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
      <div className="relative z-10 container-wide mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Star accent */}
          <div className="flex items-center justify-center gap-2 mb-6 opacity-0 animate-fade-up">
            <Star className="w-5 h-5 text-secondary fill-secondary" />
          </div>
          
          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-cream mb-6 opacity-0 animate-fade-up delay-100 leading-tight">
            Helping Ambitious Professionals Break Into <span className="text-gradient-gold">Top 10% Leadership Roles</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-cream/90 max-w-2xl mx-auto mb-4 leading-relaxed opacity-0 animate-fade-up delay-200">
            With clarity, confidence, and a proven system.
          </p>
          <p className="text-base md:text-lg text-cream/70 max-w-2xl mx-auto mb-4 leading-relaxed opacity-0 animate-fade-up delay-250">
            Stop guessing your worth. Master the skills that drive promotions, higher pay, and executive presence — through live coaching and a community of ambitious professionals.
          </p>
          <p className="text-lg md:text-xl text-secondary font-medium max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up delay-300">
            Your career plateau ends here.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up delay-400">
            <Link to="/200k-method">
              <Button variant="hero" size="xl">
                Get the 200K Method
              </Button>
            </Link>
            <a href="#programs">
              <Button variant="heroOutline" size="xl">
                View All Programs
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in delay-500">
        <div className="w-6 h-10 border-2 border-cream/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-cream/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
