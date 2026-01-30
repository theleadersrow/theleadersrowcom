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
  ChevronRight,
  Menu
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
  { id: "toolkit", label: "Free Toolkit", icon: Gift },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "investment", label: "Investment", icon: DollarSign },
];

const PageSidebar = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-secondary text-secondary-foreground rounded-full shadow-lg flex items-center justify-center hover:shadow-gold transition-all"
        aria-label="Toggle navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-50 transition-all duration-300",
          // Desktop styles
          "lg:top-1/2 lg:-translate-y-1/2 lg:left-4",
          isCollapsed ? "lg:w-14" : "lg:w-48",
          // Mobile styles
          "lg:translate-x-0",
          isMobileOpen 
            ? "bottom-0 left-0 right-0 translate-y-0" 
            : "bottom-0 left-0 right-0 translate-y-full lg:translate-y-0"
        )}
      >
        <div
          className={cn(
            "bg-card/95 backdrop-blur-md border border-border/50 shadow-card",
            // Desktop rounded
            "lg:rounded-xl",
            // Mobile rounded top
            "rounded-t-2xl lg:rounded-2xl",
            "overflow-hidden"
          )}
        >
          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-secondary text-secondary-foreground rounded-full items-center justify-center shadow-md hover:scale-110 transition-transform"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>

          {/* Header - Desktop Only */}
          {!isCollapsed && (
            <div className="hidden lg:block px-4 py-3 border-b border-border/50">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">
                On This Page
              </p>
            </div>
          )}

          {/* Mobile Header */}
          <div className="lg:hidden px-4 py-3 border-b border-border/50 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Jump to Section</p>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "py-2",
            // Mobile: horizontal scroll
            "lg:block",
            "max-h-[50vh] lg:max-h-none overflow-y-auto"
          )}>
            <ul className="space-y-0.5 px-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                        isActive 
                          ? "bg-secondary/20 text-secondary font-medium" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        isCollapsed && "lg:justify-center lg:px-2"
                      )}
                      title={isCollapsed ? section.label : undefined}
                    >
                      <Icon className={cn(
                        "flex-shrink-0 transition-colors",
                        isActive ? "text-secondary" : "text-muted-foreground",
                        isCollapsed ? "w-5 h-5" : "w-4 h-4"
                      )} />
                      {!isCollapsed && (
                        <span className="text-sm truncate">{section.label}</span>
                      )}
                      {/* Mobile always shows label */}
                      <span className="lg:hidden text-sm truncate">{section.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default PageSidebar;
