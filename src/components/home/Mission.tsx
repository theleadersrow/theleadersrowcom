import { Compass } from "lucide-react";
import guideCoaching from "@/assets/guide-coaching.jpg";

const Mission = () => {
  return (
    <section className="section-padding bg-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>
      
      <div className="container-wide mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image - The Guide */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden shadow-elevated">
              <img 
                src={guideCoaching} 
                alt="Expert mentor providing personalized career coaching and guidance" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg">
              Your Guide Awaits
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto lg:mx-0 mb-8">
              <Compass className="w-8 h-8 text-secondary" />
            </div>
            
            <p className="text-secondary font-medium mb-4">Meet Your Guide</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-cream mb-8">
              You Don't Have to Figure It Out Alone
            </h2>
            
            <p className="text-xl md:text-2xl text-cream/90 leading-relaxed mb-8">
              The Leader's Row gives you the expert guidance, proven frameworks, and personalized support to
              <span className="text-secondary font-semibold"> accelerate your transformation.</span>
            </p>
            
            <p className="text-lg text-cream/70 leading-relaxed">
              Whether you want to break into top tech, earn senior-level compensation, grow into leadership, 
              or simply stop feeling stuck — we'll guide you every step of the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
