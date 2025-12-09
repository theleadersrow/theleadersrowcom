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
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-cream mb-6 opacity-0 animate-fade-up delay-100">
            Unlock the Career You Know <span className="text-gradient-gold">You're Capable Of.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-4 leading-relaxed opacity-0 animate-fade-up delay-200">
            No confusion. No guesswork. No stagnation — just clarity, skill, and momentum.
          </p>
          <p className="text-base md:text-lg text-cream/70 max-w-2xl mx-auto mb-4 leading-relaxed opacity-0 animate-fade-up delay-250">
            You're brilliant. You work hard. But growth in today's world requires more than effort — it requires identity shifts, strategic communication, leadership presence, and execution excellence. The Leader's Row is where talented professionals come to grow with intention, strengthen their voice, and accelerate into the top 10% of their field.
          </p>
          <p className="text-base md:text-lg text-cream/70 max-w-2xl mx-auto mb-4 leading-relaxed opacity-0 animate-fade-up delay-275">
            We remove the hidden blockers holding you back and replace them with systems, frameworks, strategic thinking, leadership behaviors, and hands-on practice that turn potential into real, visible progress.
          </p>
          <p className="text-lg md:text-xl text-secondary font-medium max-w-2xl mx-auto mb-10 opacity-0 animate-fade-up delay-300">
            And unlike every other course — we build these muscles LIVE, together. No more learning alone.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up delay-400">
            <a href="#programs">
              <Button variant="hero" size="xl">
                Explore Programs
              </Button>
            </a>
            <Link to="/register">
              <Button variant="heroOutline" size="xl">
                Register Now
              </Button>
            </Link>
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
