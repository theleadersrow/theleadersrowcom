import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const programLinks = [
    { href: "/200k-method", label: "200K Method" },
    { href: "/weekly-edge", label: "Weekly Edge" },
  ];

  const contentLinks = [
    { href: "/newsletter", label: "Newsletter" },
    { href: "#", label: "Book (Coming Soon)", disabled: true },
  ];

  const resourceLinks = [
    { href: "/guide", label: "Free Guide" },
  ];

  const isProgramsActive = programLinks.some(link => location.pathname === link.href);
  const isContentActive = contentLinks.some(link => location.pathname === link.href);
  const isResourcesActive = resourceLinks.some(link => location.pathname === link.href);

  const headerBg = isScrolled || !isHomePage
    ? "bg-card/95 backdrop-blur-md shadow-soft"
    : "bg-transparent";

  const textColor = isScrolled || !isHomePage
    ? "text-foreground"
    : "text-cream";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className={`font-serif text-xl md:text-2xl font-semibold tracking-tight transition-colors whitespace-nowrap ${textColor}`}>
              The Leader's Row
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                location.pathname === "/" ? "text-secondary" : textColor
              }`}
            >
              Home
            </Link>

            {/* Programs Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isProgramsActive ? "text-secondary" : textColor
                }`}
              >
                Programs
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[160px]"
              >
                {programLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer ${
                        location.pathname === link.href
                          ? "text-secondary"
                          : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/courses"
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                location.pathname === "/courses" ? "text-secondary" : textColor
              }`}
            >
              Courses
            </Link>

            {/* Content Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isContentActive ? "text-secondary" : textColor
                }`}
              >
                Content
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[160px]"
              >
                {contentLinks.map((link) => (
                  <DropdownMenuItem key={link.href + link.label} asChild={!link.disabled} disabled={link.disabled}>
                    {link.disabled ? (
                      <span className="w-full text-muted-foreground cursor-not-allowed">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        to={link.href}
                        className={`w-full cursor-pointer ${
                          location.pathname === link.href
                            ? "text-secondary"
                            : "text-foreground hover:text-secondary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isResourcesActive ? "text-secondary" : textColor
                }`}
              >
                Resources
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[160px]"
              >
                {resourceLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer ${
                        location.pathname === link.href
                          ? "text-secondary"
                          : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                location.pathname === "/contact" ? "text-secondary" : textColor
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`h-10 px-5 relative ${isScrolled || !isHomePage ? '' : 'border-cream/30 text-cream hover:bg-cream/10 hover:border-cream'}`}
                >
                  <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Beta
                  </span>
                  Rimo AI Coach
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border border-border shadow-elevated z-50 min-w-[200px]">
                <DropdownMenuItem asChild>
                  <Link to="/career-coach" className="w-full cursor-pointer text-foreground hover:text-secondary">
                    All AI Tools
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/beta-event" className="w-full cursor-pointer text-foreground hover:text-secondary flex items-center gap-2">
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">Beta</span>
                    Resume Intelligence Suite
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/register">
              <Button variant={isScrolled || !isHomePage ? "gold" : "navHero"} className="h-10 px-5">
                Register Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 ${textColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card rounded-2xl mt-2 p-6 shadow-elevated animate-scale-in">
            <nav className="flex flex-col gap-4">
              <Link
                to="/"
                className={`text-base font-medium py-2 transition-colors ${
                  location.pathname === "/" ? "text-secondary" : "text-foreground hover:text-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
              Home
              </Link>

              {/* Mobile Programs Section */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setIsProgramsOpen(!isProgramsOpen)}
                  className="flex items-center justify-between w-full text-base font-medium py-2 text-foreground"
                >
                  Programs
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProgramsOpen ? "rotate-180" : ""}`} />
                </button>
                {isProgramsOpen && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {programLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`text-base py-2 transition-colors ${
                          location.pathname === link.href
                            ? "text-secondary"
                            : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/courses"
                className={`text-base font-medium py-2 transition-colors border-t border-border pt-4 ${
                  location.pathname === "/courses" ? "text-secondary" : "text-foreground hover:text-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Courses
              </Link>

              {/* Mobile Content Section */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setIsContentOpen(!isContentOpen)}
                  className="flex items-center justify-between w-full text-base font-medium py-2 text-foreground"
                >
                  Content
                  <ChevronDown className={`h-4 w-4 transition-transform ${isContentOpen ? "rotate-180" : ""}`} />
                </button>
                {isContentOpen && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {contentLinks.map((link) => (
                      link.disabled ? (
                        <span
                          key={link.href + link.label}
                          className="text-base py-2 text-muted-foreground/60 cursor-not-allowed"
                        >
                          {link.label}
                        </span>
                      ) : (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`text-base py-2 transition-colors ${
                            location.pathname === link.href
                              ? "text-secondary"
                              : "text-muted-foreground hover:text-secondary"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Resources Section */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                  className="flex items-center justify-between w-full text-base font-medium py-2 text-foreground"
                >
                  Resources
                  <ChevronDown className={`h-4 w-4 transition-transform ${isResourcesOpen ? "rotate-180" : ""}`} />
                </button>
                {isResourcesOpen && (
                  <div className="pl-4 flex flex-col gap-2 mt-2">
                    {resourceLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`text-base py-2 transition-colors ${
                          location.pathname === link.href
                            ? "text-secondary"
                            : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/contact"
                className={`text-base font-medium py-2 transition-colors border-t border-border pt-4 ${
                  location.pathname === "/contact" ? "text-secondary" : "text-foreground hover:text-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="border-t border-border pt-4">
                <p className="text-base font-medium py-2 text-foreground flex items-center gap-2">
                  Rimo AI Coach
                  <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">Beta</span>
                </p>
                <div className="pl-4 flex flex-col gap-2 mt-2">
                  <Link
                    to="/career-coach"
                    className="text-base py-2 text-muted-foreground hover:text-secondary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    All AI Tools
                  </Link>
                  <Link
                    to="/beta-event"
                    className="text-base py-2 text-muted-foreground hover:text-secondary transition-colors flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">Beta</span>
                    Resume Intelligence Suite
                  </Link>
                </div>
              </div>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="gold" className="w-full mt-2">
                  Register Now
                </Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;