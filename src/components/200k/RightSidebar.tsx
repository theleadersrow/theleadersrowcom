import { useState, useEffect } from "react";
import { 
  Rocket, 
  Sparkles, 
  Users, 
  BookOpen, 
  Trophy, 
  Briefcase, 
  Gift,
  HelpCircle,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "hero", label: "Overview", icon: Rocket },
  { id: "promise", label: "The Promise", icon: Sparkles },
  { id: "difference", label: "What's Different", icon: Sparkles },
  { id: "who-for", label: "Who It's For", icon: Users },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "outcome", label: "The Outcome", icon: Trophy },
  { id: "experience", label: "Program Experience", icon: Briefcase },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "investment", label: "Investment", icon: DollarSign },
];

const RightSidebar = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const showSidebar = isOpen || isHovering;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsOpen(false);
    setIsHovering(false);
  };

  return (
    <>
      {/* Hover trigger zone on the right edge */}
      <div 
        className="fixed right-0 top-1/2 -translate-y-1/2 w-4 h-48 z-40 print:hidden"
        onMouseEnter={() => setIsHovering(true)}
      />

      {/* Toggle button - always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50 print:hidden",
          "bg-secondary text-secondary-foreground p-2 rounded-l-lg shadow-lg",
          "transition-all duration-300 hover:bg-secondary/90",
          showSidebar ? "translate-x-0 opacity-0" : "translate-x-0"
        )}
        aria-label="Open navigation"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Sidebar panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-64 bg-card/95 backdrop-blur-md border-l border-border shadow-2xl z-50 print:hidden",
          "transition-transform duration-300 ease-out",
          showSidebar ? "translate-x-0" : "translate-x-full"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setIsHovering(false);
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-secondary text-secondary-foreground p-2 rounded-l-lg shadow-lg hover:bg-secondary/90 transition-colors"
          aria-label="Close navigation"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Sidebar content */}
        <div className="h-full flex flex-col p-4 overflow-y-auto">
          {/* Header */}
          <div className="mb-4 pb-4 border-b border-border">
            <h3 className="font-serif text-lg font-bold text-foreground">
              On This Page
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Jump to any section
            </p>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                    "hover:bg-muted/80",
                    isActive 
                      ? "bg-secondary/20 text-secondary font-medium" 
                      : "text-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isActive ? "text-secondary" : "text-muted-foreground"
                  )} />
                  <span className="text-sm truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden print:hidden"
          onClick={() => {
            setIsOpen(false);
            setIsHovering(false);
          }}
        />
      )}
    </>
  );
};

export default RightSidebar;
