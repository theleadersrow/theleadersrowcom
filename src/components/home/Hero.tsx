import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Quote } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  name: string;
  outcome: string | null;
  quote: string;
}

const fallbackTestimonials: Testimonial[] = [
  { name: "Mona", outcome: "200K Method Member", quote: "I've learned things I can truly apply in my life on a daily basis." },
  { name: "James K.", outcome: "$45K salary increase", quote: "Landed a senior role with a 40% salary increase." },
  { name: "Priya R.", outcome: "Landed FAANG offer", quote: "Got offers from 3 top tech companies." },
];

const Hero = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("name, outcome, quote")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(5);

      if (!error && data && data.length > 0) {
        setTestimonials(data as Testimonial[]);
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

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
            Enabling Ambitious Professionals Break Into <span className="text-gradient-gold">Top 10% Leadership Roles</span>
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
            <Link to="/live-programs" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/career-coach" className="w-full sm:w-auto">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                Try AI Career Tools
              </Button>
            </Link>
          </div>

          {/* Social Proof Testimonial Bar */}
          <div className="mt-10 sm:mt-14 opacity-0 animate-fade-up delay-500">
            <a 
              href="#success-stories" 
              className="block bg-cream/10 backdrop-blur-sm rounded-2xl px-5 py-4 sm:px-8 sm:py-5 max-w-2xl mx-auto border border-cream/10 hover:bg-cream/15 hover:border-cream/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary fill-secondary" />
                ))}
              </div>
              <div className="relative h-16 sm:h-14 overflow-hidden">
                <div 
                  className="transition-all duration-500 ease-in-out"
                  key={currentIndex}
                >
                  <p className="text-cream/90 text-sm sm:text-base italic mb-2 line-clamp-2">
                    "{currentTestimonial.quote}"
                  </p>
                  <p className="text-cream/70 text-xs sm:text-sm">
                    <span className="font-medium text-cream">{currentTestimonial.name}</span>
                    {currentTestimonial.outcome && (
                      <span className="text-secondary"> — {currentTestimonial.outcome}</span>
                    )}
                  </p>
                </div>
              </div>
              {/* Dots indicator */}
              <div className="flex justify-center gap-1.5 mt-3">
                {testimonials.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentIndex ? "bg-secondary w-4" : "bg-cream/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-cream/50 text-xs mt-3 hover:text-cream/70 transition-colors">
                View all success stories →
              </p>
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
