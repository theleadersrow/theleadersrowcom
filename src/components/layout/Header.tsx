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
  const programsLinks = {
    selfPaced: [
      { href: "/courses", label: "Self-Paced Courses", description: "Learn at your own pace" },
    ],
    live: [
      { href: "/200k-method", label: "200K Method", description: "8-Week Career Accelerator", isLive: true },
      { href: "/weekly-edge", label: "Weekly Edge", description: "Ongoing group coaching", isLive: true },
    ],
  };

  const aiToolsLinks = [
    { href: "/resume-suite", label: "Resume Intelligence Suite", description: "AI-powered resume optimization" },
    { href: "/interview-prep", label: "Interview Prep Suite", description: "Practice with AI feedback" },
    { href: "/linkedin-signal", label: "LinkedIn Signal Score", description: "Optimize your LinkedIn presence" },
    { href: "/strategic-benchmark", label: "Career Compass Dashboard", description: "Strategic level assessment" },
    { href: "/career-advisor", label: "AI Personal Advisor (Rimo)", description: "Your AI career coach" },
  ];

  const speakingLinks = [
    { href: "/contact?type=keynote", label: "Keynotes", icon: Mic },
    { href: "/contact?type=workshop", label: "Corporate Workshops", icon: Users },
    { href: "/contact?type=offsite", label: "Leadership Offsites", icon: Calendar },
    { href: "/contact?type=tech-talk", label: "Product & Tech Talks", icon: BookOpen },
    { href: "/contact?type=media", label: "Media & Podcast Appearances", icon: MessageSquare },
  ];

  const contentLinks = {
    main: [
      { href: "/newsletter", label: "Newsletter", description: "Weekly insights on Substack" },
      { href: "#", label: "Book (The Invisible Ladder)", description: "Coming Soon", disabled: true },
      { href: "/guide", label: "Free Guide", description: "Career acceleration blueprint" },
    ],
    social: [
      { href: "https://linkedin.com/in/omoniyitolu", label: "LinkedIn", icon: Linkedin, external: true },
      { href: "https://twitter.com", label: "Twitter / X", icon: Twitter, external: true },
      { href: "https://instagram.com", label: "Instagram", icon: Instagram, external: true },
    ],
  };

  const communityLinks = [
    { href: "/register", label: "Leader's Row Community", description: "Join our private community" },
    { href: "/beta-event", label: "Live Roundtables", description: "Interactive sessions" },
    { href: "/beta-event", label: "Ask Me Anything Events", description: "Direct Q&A sessions" },
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
  const isProgramsActive = [...programsLinks.selfPaced, ...programsLinks.live].some(link => isActiveLink(link.href));
  const isAIToolsActive = aiToolsLinks.some(link => isActiveLink(link.href));
  const isSpeakingActive = speakingLinks.some(link => location.pathname.startsWith(link.href.split('?')[0]));
  const isContentActive = contentLinks.main.some(link => isActiveLink(link.href));
  const isCommunityActive = communityLinks.some(link => isActiveLink(link.href));
  const isContactActive = contactLinks.some(link => isActiveLink(link.href));

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
          <nav className="hidden xl:flex items-center gap-5">
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
                className="bg-card border border-border shadow-elevated z-50 min-w-[280px] p-2"
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">
                  Self-Paced Learning
                </DropdownMenuLabel>
                {programsLinks.selfPaced.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer flex flex-col gap-0.5 py-2 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">
                  Live Courses & Accelerators
                </DropdownMenuLabel>
                {programsLinks.live.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer flex flex-col gap-0.5 py-2 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      <span className="font-medium flex items-center gap-2">
                        {link.label}
                        {link.isLive && (
                          <span className="bg-green-500/20 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Live
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
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
                className="bg-card border border-border shadow-elevated z-50 min-w-[280px] p-2"
              >
                <p className="text-xs text-muted-foreground px-2 pb-2">
                  Career intelligence powered by AI
                </p>
                {aiToolsLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer flex flex-col gap-0.5 py-2 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Speaking Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-secondary outline-none ${
                  isSpeakingActive ? "text-secondary" : textColor
                }`}
              >
                Speaking
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="bg-card border border-border shadow-elevated z-50 min-w-[240px] p-2"
              >
                {speakingLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      to={link.href}
                      className="w-full cursor-pointer flex items-center gap-3 py-2 text-foreground hover:text-secondary"
                    >
                      <link.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/contact?type=speaking"
                    className="w-full cursor-pointer flex items-center gap-2 py-2 text-secondary font-medium"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Book Me to Speak
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                className="bg-card border border-border shadow-elevated z-50 min-w-[260px] p-2"
              >
                {contentLinks.main.map((link) => (
                  <DropdownMenuItem 
                    key={link.href + link.label} 
                    asChild={!link.disabled} 
                    disabled={link.disabled}
                  >
                    {link.disabled ? (
                      <div className="w-full flex flex-col gap-0.5 py-2 text-muted-foreground/60 cursor-not-allowed">
                        <span className="font-medium">{link.label}</span>
                        <span className="text-xs">{link.description}</span>
                      </div>
                    ) : (
                      <Link
                        to={link.href}
                        className={`w-full cursor-pointer flex flex-col gap-0.5 py-2 ${
                          isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                        }`}
                      >
                        <span className="font-medium">{link.label}</span>
                        <span className="text-xs text-muted-foreground">{link.description}</span>
                      </Link>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2">
                  Social Links
                </DropdownMenuLabel>
                <div className="flex items-center gap-2 px-2 py-2">
                  {contentLinks.social.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <link.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
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
                className="bg-card border border-border shadow-elevated z-50 min-w-[260px] p-2"
              >
                {communityLinks.map((link) => (
                  <DropdownMenuItem key={link.href + link.label} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer flex flex-col gap-0.5 py-2 ${
                        isActiveLink(link.href) ? "text-secondary" : "text-foreground hover:text-secondary"
                      }`}
                    >
                      <span className="font-medium">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/register"
                    className="w-full cursor-pointer flex items-center gap-2 py-2 text-secondary font-medium"
                  >
                    <ArrowRight className="h-4 w-4" />
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
                className="bg-card border border-border shadow-elevated z-50 min-w-[220px] p-2"
              >
                {contactLinks.map((link) => (
                  <DropdownMenuItem key={link.href + link.label} asChild>
                    <Link
                      to={link.href}
                      className={`w-full cursor-pointer flex items-center gap-3 py-2 ${
                        link.highlight 
                          ? "text-secondary font-medium" 
                          : isActiveLink(link.href) 
                            ? "text-secondary" 
                            : "text-foreground hover:text-secondary"
                      }`}
                    >
                      <link.icon className={`h-4 w-4 ${link.highlight ? "text-secondary" : "text-muted-foreground"}`} />
                      <span>{link.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden xl:flex items-center gap-3 ml-4">
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
            className={`xl:hidden p-2 ${textColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-card rounded-2xl mt-2 p-6 shadow-elevated animate-scale-in max-h-[80vh] overflow-y-auto">
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
                    <p className="text-xs text-muted-foreground py-2 font-medium">Self-Paced</p>
                    {programsLinks.selfPaced.map((link) => (
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
                    <p className="text-xs text-muted-foreground py-2 font-medium mt-2">Live Programs</p>
                    {programsLinks.live.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`text-sm py-2 transition-colors flex items-center gap-2 ${
                          isActiveLink(link.href) ? "text-secondary" : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                        <span className="bg-green-500/20 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Live
                        </span>
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

              {/* Mobile Speaking Section */}
              <div className="border-t border-border pt-2">
                <button
                  onClick={() => toggleMobileSection('speaking')}
                  className="flex items-center justify-between w-full text-base font-medium py-3 text-foreground"
                >
                  Speaking
                  <ChevronDown className={`h-4 w-4 transition-transform ${openMobileSection === 'speaking' ? "rotate-180" : ""}`} />
                </button>
                {openMobileSection === 'speaking' && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {speakingLinks.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        className="text-sm py-2 transition-colors text-muted-foreground hover:text-secondary flex items-center gap-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      to="/contact?type=speaking"
                      className="text-sm py-2 mt-2 transition-colors text-secondary font-medium flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Book Me to Speak
                    </Link>
                  </div>
                )}
              </div>

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
                    {contentLinks.main.map((link) => (
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
                    <div className="flex items-center gap-3 py-3">
                      {contentLinks.social.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <link.icon className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
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
