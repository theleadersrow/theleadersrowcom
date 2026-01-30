import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "I understood how much PPS and a good resume matter for next career leap",
  },
  {
    quote: "I realized that I can showcase myself as a PM since I had done a lot of it in my previous jobs, despite not having the title.",
  },
  {
    quote: "I am very happy with the attention to detail, personal care, understanding I have received during this coaching. I never knew how important it is to understand my identity and how to position my experience to align with my desired career graph. It's such good investment for one's career.",
  },
  {
    quote: "Overall, the program is going well so far and has been real boosting the confidence.",
  },
  {
    quote: "I was able to identify my true level—I wasn't sure before how I should target myself. After getting help on positioning and branding, I immediately started getting traction from the job market and was able to interview for an APM role at Google and get that role. So happy I invested in this training!",
  },
  {
    quote: "It was my dream to interview and work at Capital One and I can't believe I got called in after my branding was re-done. The recruiter even said 'Your resume is very well written and your positioning is very crisp.' So worth the effort. Thank you so much!",
  },
  {
    quote: "I took a leap of faith to join this program and wasn't 100% sure at first, but I started quickly getting interview calls after updating my positioning. Earlier, I wouldn't hear back for weeks but now recruiters tell me how crisp my pitch is and that I'm a great fit for the roles I apply for. This program was so worth it!",
  },
  {
    quote: "I am a more confident PM after this course and have been able to confidently create more presence and visibility at work, especially with leadership teams.",
  },
];

const TestimonialCard = ({ quote }: { quote: string }) => (
  <div className="flex-shrink-0 w-[350px] md:w-[400px] bg-card rounded-2xl p-6 border border-border/50 shadow-soft mx-3">
    <div className="flex items-center gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className="w-4 h-4 text-secondary fill-secondary" />
      ))}
    </div>
    <p className="text-foreground text-base leading-relaxed mb-4 line-clamp-6">
      "{quote}"
    </p>
    <p className="text-muted-foreground font-medium text-sm">— Anonymous</p>
  </div>
);

const TestimonialsMarquee = () => {
  // Split testimonials into two rows
  const firstRow = testimonials.slice(0, 4);
  const secondRow = testimonials.slice(4);

  return (
    <section id="reviews" className="py-16 bg-background overflow-hidden scroll-mt-20">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-secondary font-medium mb-2">Real Results</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
            What Members Are Saying
          </h2>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="space-y-6">
        {/* First Row - Scrolling Left */}
        <div className="relative">
          <div className="flex animate-marquee-left">
            {/* First set */}
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={`first-${index}`} quote={testimonial.quote} />
            ))}
            {/* Duplicate for seamless loop */}
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={`first-dup-${index}`} quote={testimonial.quote} />
            ))}
            {/* Third set for wider screens */}
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={`first-dup2-${index}`} quote={testimonial.quote} />
            ))}
          </div>
        </div>

        {/* Second Row - Scrolling Right */}
        <div className="relative">
          <div className="flex animate-marquee-right">
            {/* First set */}
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={`second-${index}`} quote={testimonial.quote} />
            ))}
            {/* Duplicate for seamless loop */}
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={`second-dup-${index}`} quote={testimonial.quote} />
            ))}
            {/* Third set for wider screens */}
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={`second-dup2-${index}`} quote={testimonial.quote} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
