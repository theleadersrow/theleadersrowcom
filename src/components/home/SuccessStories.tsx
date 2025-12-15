import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Quote, ArrowRight, Star, PenLine, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import journeyAfter from "@/assets/journey-after.jpg";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  outcome: string | null;
  rating: number | null;
}

// Fallback testimonials for when database is empty
const fallbackTestimonials = [
  {
    id: "1",
    name: "Mona",
    role: "Jena, Germany",
    company: "",
    quote: "It has been really positive. I've learned things I can truly apply in my life on a daily basis. Thank you so much for making me a stronger person and making my belief even stronger.",
    outcome: "200K Method Member",
    rating: 5,
  },
  {
    id: "2",
    name: "James K.",
    role: "Product Manager → Senior PM",
    company: "Fortune 500",
    quote: "I was stuck at the same level for 3 years. After the 200K Method, I landed a senior role with a 40% salary increase.",
    outcome: "$45K salary increase",
    rating: 5,
  },
  {
    id: "3",
    name: "Priya R.",
    role: "Associate PM → Product Manager",
    company: "Startup → FAANG",
    quote: "The interview frameworks and personal branding work completely changed how I show up. I got offers from 3 top tech companies.",
    outcome: "Landed FAANG offer",
    rating: 5,
  },
];

const SuccessStories = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [isUsingFallback, setIsUsingFallback] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, name, role, company, quote, outcome, rating")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (!error && data && data.length > 0) {
        setTestimonials(data as Testimonial[]);
        setIsUsingFallback(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">The Transformation</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4 sm:mb-6">
            From Overlooked to Leading
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            This is where the journey leads — confident leadership, visible impact, and career success.
          </p>
        </div>

        {/* After State Hero Image */}
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-8 sm:mb-12 max-w-4xl mx-auto shadow-elevated">
          <img 
            src={journeyAfter} 
            alt="Confident professional leader commanding the room in a boardroom presentation" 
            className="w-full h-56 sm:h-72 lg:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-4 sm:p-8 lg:p-12">
            <div className="max-w-xs sm:max-w-md">
              <p className="text-secondary font-medium mb-1.5 sm:mb-2 text-xs sm:text-sm">Your Future</p>
              <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl text-cream mb-2 sm:mb-4">
                Command the Room. Lead with Confidence.
              </h3>
              <div className="flex items-center gap-2 text-cream/80">
                <span className="text-xs sm:text-sm">This is where you're headed</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            </div>
          </div>
        </div>

        <div id="success-stories" className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 scroll-mt-24">
          <p className="text-secondary font-medium mb-2 sm:mb-3 text-sm sm:text-base">Real Results</p>
          <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-3 sm:mb-4">
            Success Stories
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            Professionals who took action and transformed their careers.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="max-w-6xl mx-auto relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card shadow-elevated flex items-center justify-center text-foreground hover:text-secondary transition-colors disabled:opacity-50"
            disabled={!canScrollPrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card shadow-elevated flex items-center justify-center text-foreground hover:text-secondary transition-colors disabled:opacity-50"
            disabled={!canScrollNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden mx-6 sm:mx-10" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-2 sm:px-3"
                >
                  <div className="bg-card rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-soft flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-secondary/30" />
                      {testimonial.rating && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                star <= testimonial.rating!
                                  ? "text-secondary fill-secondary"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed mb-4 sm:mb-6 flex-grow text-sm sm:text-base">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t border-border pt-3 sm:pt-4">
                      <p className="font-semibold text-foreground text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                        {testimonial.role}
                        {testimonial.company && ` at ${testimonial.company}`}
                      </p>
                      {testimonial.outcome && (
                        <span className="inline-block text-[10px] sm:text-xs font-medium text-secondary bg-secondary/10 px-2.5 sm:px-3 py-1 rounded-full">
                          {testimonial.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-secondary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {isUsingFallback && (
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8 italic">
            * Names and details have been changed. Replace with your real testimonials.
          </p>
        )}

        {/* Write a Review CTA */}
        <div className="text-center mt-10 pt-8 border-t border-border/50 max-w-2xl mx-auto">
          <p className="text-muted-foreground text-sm mb-4">
            Been through one of our programs? We'd love to hear about your experience.
          </p>
          <Link to="/contact">
            <Button variant="outline" className="group">
              <PenLine className="w-4 h-4 mr-2" />
              Write a Review
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
