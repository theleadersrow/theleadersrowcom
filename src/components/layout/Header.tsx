import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToQuiz = () => {
    const quizSection = document.querySelector('[data-quiz-section]');
    if (quizSection) {
      quizSection.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/200k-method", label: "200K Method" },
    { href: "/weekly-edge", label: "Weekly Edge" },
    { href: "/newsletter", label: "Newsletter" },
    { href: "/contact", label: "Contact" },
  ];

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
          <Link to="/" className="flex items-center gap-2">
            <span className={`font-serif text-xl md:text-2xl font-semibold tracking-tight transition-colors ${textColor}`}>
              The Leader's Row
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-secondary ${
                  location.pathname === link.href
                    ? "text-secondary"
                    : textColor
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isHomePage && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={scrollToQuiz}
                className={`${textColor} hover:text-secondary`}
              >
                Take Quiz
              </Button>
            )}
            <Link to="/register">
              <Button variant={isScrolled || !isHomePage ? "gold" : "navHero"} size="default">
                Register Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 ${textColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-card rounded-2xl mt-2 p-6 shadow-elevated animate-scale-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-base font-medium py-2 transition-colors ${
                    location.pathname === link.href
                      ? "text-secondary"
                      : "text-foreground hover:text-secondary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isHomePage && (
                <button
                  onClick={scrollToQuiz}
                  className="text-base font-medium py-2 text-secondary hover:text-secondary/80 text-left"
                >
                  Take Career Quiz
                </button>
              )}
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
