import { Compass } from "lucide-react";

const Mission = () => {
  return (
    <section className="section-padding bg-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>
      
      <div className="container-wide mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-8">
            <Compass className="w-8 h-8 text-secondary" />
          </div>
          
          <p className="text-secondary font-medium mb-4">Our Mission</p>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-cream mb-8">
            Our mission is simple:
          </h2>
          
          <p className="text-xl md:text-2xl text-cream/90 leading-relaxed mb-8">
            To empower you to become the most confident, capable, high-impact version of yourself — 
            <span className="text-secondary font-semibold"> faster and with clarity.</span>
          </p>
          
          <p className="text-lg text-cream/70 leading-relaxed">
            Whether you want to break into top tech, earn senior-level compensation, grow into leadership, 
            or simply stop feeling stuck — we guide you every step of the way.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Mission;
