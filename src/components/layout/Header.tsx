import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, ExternalLink, Linkedin, Twitter, Instagram, Calendar, Mic, Users, BookOpen, MessageSquare, Phone, Star, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileSection = (section: string) => {
    setOpenMobileSection(openMobileSection === section ? null : section);
  };

  // Navigation structure
  const programsLinks = [
    { href: "/live-programs", label: "Live Programs" },
    { href: "/courses", label: "Self-Paced Learning" },
    { href: "/coaching", label: "1:1 Results-Driven Coaching" },
  ];

  const aiToolsLinks = [
    { href: "/career-coach", label: "All Tools" },
    { href: "/beta-event", label: "Beta Testing", isBeta: true },
  ];

  const speakingLinks = [
    { href: "/contact?type=keynote", label: "Keynotes", icon: Mic },
    { href: "/contact?type=workshop", label: "Corporate Workshops", icon: Users },
    { href: "/contact?type=offsite", label: "Leadership Offsites", icon: Calendar },
    { href: "/contact?type=tech-talk", label: "Product & Tech Talks", icon: BookOpen },
    { href: "/contact?type=media", label: "Media & Podcast Appearances", icon: MessageSquare },
  ];

  const contentLinks = [
    { href: "/newsletter", label: "Newsletter" },
    { href: "/guide", label: "Free Guide" },
    { href: "#", label: "Book", disabled: true },
    { href: "/social", label: "Social Media" },
  ];

  const communityLinks = [
    { href: "/community", label: "Leader's Row Community" },
    { href: "/ama-events", label: "Ask Me Anything Events" },
  ];

  const contactLinks = [
    { href: "/contact", label: "Get in Touch", icon: MessageSquare },
    { href: "/review", label: "Write a Review / Testimonial", icon: Star },
    { href: "/book-call", label: "Book a Strategy Call", icon: Phone, highlight: true },
  ];

  const headerBg = isScrolled || !isHomePage
    ? "bg-card/95 backdrop-blur-md shadow-soft"
    : "bg-transparent";

  const textColor = isScrolled || !isHomePage
    ? "text-foreground"
    : "text-cream";

  const isActiveLink = (href: string) => location.pathname === href;
  const isProgramsActive = programsLinks.some(link => isActiveLink(link.href));
  const isAIToolsActive = aiToolsLinks.some(link => isActiveLink(link.href));
  const isSpeakingActive = speakingLinks.some(link => location.pathname.startsWith(link.href.split('?')[0]));
  const isContentActive = contentLinks.some(link => isActiveLink(link.href));
  const isCommunityActive = communityLinks.some(link => isActiveLink(link.href));
  const isContactActive = contactLinks.some(link => isActiveLink(link.href));

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <span className={`font-serif text-2xl md:text-3xl font-bold tracking-tight transition-colors ${textColor}`}>
              TLR
            </span>
            <span className={`text-lg md:text-xl ${textColor} opacity-40`}>|</span>
            <span className={`text-sm md:text-base font-medium tracking-wide transition-colors ${textColor} opacity-80`}>
              The Leader's Row
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5">
            {/* Home */}
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
                className="bg-card border border-border shadow-elevated z-50 min-w-[160px] p-1"
              >
                {programsLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer py-1.5 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* AI Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isAIToolsActive ? "text-secondary" : textColor
                }`}
              >
                AI Tools
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[200px] p-1"
              >
                {aiToolsLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer py-1.5 flex items-center gap-2 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                      {link.isBeta && (
                        <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Beta
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Speaking - Direct Link */}
            <Link
              to="/speaking"
              className={`text-sm font-medium transition-colors hover:text-secondary ${
                location.pathname === "/speaking" ? "text-secondary" : textColor
              }`}
            >
              Speaking
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
                className="bg-card border border-border shadow-elevated z-50 min-w-[160px] p-1"
              >
                {contentLinks.map((link) => (
                  <DropdownMenuItem 
                    key={link.href + link.label} 
                    asChild={!link.disabled} 
                    disabled={link.disabled}
                  >
                    {link.disabled ? (
                      <span className="w-full py-1.5 text-muted-foreground/60 cursor-not-allowed">
                        {link.label} (Coming Soon)
                      </span>
                    ) : (
                      <Link
                        to={link.href}
                        className={`w-full cursor-pointer py-1.5 ${
                          isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isCommunityActive ? "text-secondary" : textColor
                }`}
              >
                Community
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[180px] p-1"
              >
                {communityLinks.map((link) => (
                  <DropdownMenuItem key={link.href + link.label} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer py-1.5 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/join-community"
                    className="w-full cursor-pointer py-1.5 text-secondary font-medium"
                  >
                    Join the Community
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Contact Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isContactActive ? "text-secondary" : textColor
                }`}
              >
                Contact
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[180px] p-1"
              >
                {contactLinks.map((link) => (
                  <DropdownMenuItem key={link.href + link.label} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer py-1.5 ${
                        link.highlight 
                          ? "text-secondary font-medium" 
                          : isActiveLink(link.href) 
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
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 ml-3">
            <Link to="/login">
              <Button 
                variant="ghost" 
                className={`h-10 px-4 ${isScrolled || !isHomePage ? '' : 'text-cream hover:text-cream hover:bg-cream/10'}`}
              >
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant={isScrolled || !isHomePage ? "gold" : "navHero"} className="h-10 px-5">
                Get Started
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
          <div className="lg:hidden bg-card rounded-2xl mt-2 p-6 shadow-elevated animate-scale-in max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className={`text-base font-medium py-3 transition-colors ${
                  location.pathname === "/" ? "text-secondary" : "text-foreground hover:text-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>

              {/* Mobile Programs Section */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={() => toggleMobileSection('programs')}
                  className="flex items-center justify-between w-full text-base font-medium py-3 text-foreground"
                >
                  Programs
                  <ChevronDown className={`h-4 w-4 transition-transform ${openMobileSection === 'programs' ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === 'programs' && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {programsLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`text-sm py-2 transition-colors ${
                          isActiveLink(link.href) ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile AI Tools Section */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={() => toggleMobileSection('ai-tools')}
                  className="flex items-center justify-between w-full text-base font-medium py-3 text-foreground"
                >
                  AI Tools
                  <ChevronDown className={`h-4 w-4 transition-transform ${openMobileSection === 'ai-tools' ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === 'ai-tools' && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {aiToolsLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`text-sm py-2 transition-colors flex items-center gap-2 ${
                          isActiveLink(link.href) ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                        {link.isBeta && (
                          <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Beta
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Speaking - Direct Link */}
              <Link
                to="/speaking"
                className={`text-base font-medium py-3 transition-colors border-t border-border pt-4 ${
                  location.pathname === "/speaking" ? "text-secondary" : "text-foreground hover:text-secondary"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Speaking
              </Link>

              {/* Mobile Content Section */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={() => toggleMobileSection('content')}
                  className="flex items-center justify-between w-full text-base font-medium py-3 text-foreground"
                >
                  Content
                  <ChevronDown className={`h-4 w-4 transition-transform ${openMobileSection === 'content' ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === 'content' && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {contentLinks.map((link) => (
                      link.disabled ? (
                        <span
                          key={link.href + link.label}
                          className="text-sm py-2 text-muted-foreground/60 cursor-not-allowed"
                        >
                          {link.label} (Coming Soon)
                        </span>
                      ) : (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`text-sm py-2 transition-colors ${
                            isActiveLink(link.href) ? "text-secondary" : "text-muted-foreground hover:text-secondary"
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

              {/* Mobile Community Section */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={() => toggleMobileSection('community')}
                  className="flex items-center justify-between w-full text-base font-medium py-3 text-foreground"
                >
                  Community
                  <ChevronDown className={`h-4 w-4 transition-transform ${openMobileSection === 'community' ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === 'community' && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {communityLinks.map((link) => (
                      <Link
                        key={link.href + link.label}
                        to={link.href}
                        className={`text-sm py-2 transition-colors ${
                          isActiveLink(link.href) ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/register"
                      className="text-sm py-2 mt-2 transition-colors text-secondary font-medium flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Join the Community
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Contact Section */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={() => toggleMobileSection('contact')}
                  className="flex items-center justify-between w-full text-base font-medium py-3 text-foreground"
                >
                  Contact
                  <ChevronDown className={`h-4 w-4 transition-transform ${openMobileSection === 'contact' ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === 'contact' && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {contactLinks.map((link) => (
                      <Link
                        key={link.href + link.label}
                        to={link.href}
                        className={`text-sm py-2 transition-colors flex items-center gap-2 ${
                          link.highlight ? "text-secondary font-medium" : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile CTA Buttons */}
              <div className="border-t border-border pt-4 mt-2 flex flex-col gap-3">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="gold" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
