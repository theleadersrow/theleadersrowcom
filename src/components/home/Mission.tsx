import { Compass } from "lucide-react";
import guideCoaching from "@/assets/guide-coaching.jpg";

const Mission = () => {
  return (
    <section className="section-padding bg-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-secondary rounded-full blur-3xl" />
      </div>
      
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image - The Guide */}
          <div className="relative order-2 lg:order-1">
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated">
              <img 
                src={guideCoaching} 
                alt="Expert mentor providing personalized career coaching and guidance" 
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-3 sm:-bottom-4 right-2 sm:-right-4 bg-secondary text-secondary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg text-sm sm:text-base">
              Your Guide Awaits
            </div>
          </div>

          {/* Content */}
          <div className="text-center lg:text-left order-1 lg:order-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto lg:mx-0 mb-6 sm:mb-8">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-secondary" />
            </div>
            
            <p className="text-secondary font-medium mb-3 sm:mb-4 text-sm sm:text-base">Meet Your Guide</p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-cream mb-6 sm:mb-8">
              You Don't Have to Figure It Out Alone
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-cream/90 leading-relaxed mb-6 sm:mb-8">
              The Leader's Row gives you the expert guidance, proven frameworks, and personalized support to
              <span className="text-secondary font-semibold"> accelerate your transformation.</span>
            </p>
            
            <p className="text-base sm:text-lg text-cream/70 leading-relaxed">
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
