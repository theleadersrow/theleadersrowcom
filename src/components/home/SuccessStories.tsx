import { Quote, ArrowRight } from "lucide-react";
import journeyAfter from "@/assets/journey-after.jpg";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Senior Product Manager → Director",
    company: "Tech Company",
    quote: "Within 6 months, I went from feeling invisible to leading a team of 12. The frameworks and coaching gave me the confidence to advocate for myself.",
    outcome: "Promoted to Director",
  },
  {
    name: "James K.",
    role: "Product Manager → Senior PM",
    company: "Fortune 500",
    quote: "I was stuck at the same level for 3 years. After the 200K Method, I landed a senior role with a 40% salary increase.",
    outcome: "$45K salary increase",
  },
  {
    name: "Priya R.",
    role: "Associate PM → Product Manager",
    company: "Startup → FAANG",
    quote: "The interview frameworks and personal branding work completely changed how I show up. I got offers from 3 top tech companies.",
    outcome: "Landed FAANG offer",
  },
];

const SuccessStories = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-wide mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-secondary font-medium mb-3">The Transformation</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
            From Overlooked to Leading
          </h2>
          <p className="text-muted-foreground text-lg">
            This is where the journey leads — confident leadership, visible impact, and career success.
          </p>
        </div>

        {/* After State Hero Image */}
        <div className="relative rounded-2xl overflow-hidden mb-12 max-w-4xl mx-auto shadow-elevated">
          <img 
            src={journeyAfter} 
            alt="Confident professional leader commanding the room in a boardroom presentation" 
            className="w-full h-72 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 md:p-12">
            <div className="max-w-md">
              <p className="text-secondary font-medium mb-2 text-sm">Your Future</p>
              <h3 className="font-serif text-2xl md:text-3xl text-cream mb-4">
                Command the Room. Lead with Confidence.
              </h3>
              <div className="flex items-center gap-2 text-cream/80">
                <span className="text-sm">This is where you're headed</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-8">
          <p className="text-secondary font-medium mb-3">Real Results</p>
          <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Success Stories
          </h3>
          <p className="text-muted-foreground">
            Professionals who took action and transformed their careers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-soft flex flex-col"
            >
              <Quote className="w-8 h-8 text-secondary/30 mb-4" />
              <p className="text-foreground leading-relaxed mb-6 flex-grow">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground mb-2">{testimonial.role}</p>
                <span className="inline-block text-xs font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                  {testimonial.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 italic">
          * Names and details have been changed. Replace with your real testimonials.
        </p>
      </div>
    </section>
  );
};

export default SuccessStories;
