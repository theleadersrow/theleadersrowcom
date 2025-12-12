import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-cream/80">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-cream mb-3 sm:mb-4">
              The Leader's Row
            </h3>
            <p className="text-cream/60 max-w-md leading-relaxed text-sm sm:text-base">
              Helping ambitious professionals remove every blocker in their career 
              and giving them the tools to grow, rise, and lead.
            </p>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-cream mb-3 sm:mb-4 text-sm sm:text-base">Programs</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/200k-method" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  200K Method
                </Link>
              </li>
              <li>
                <Link to="/level-up-weekly" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  Weekly Edge
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-cream mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/contact" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-cream/60 hover:text-secondary transition-colors text-sm">
                  Member Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-cream/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-cream/40 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} The Leader's Row. All rights reserved.
            </p>
            <a 
              href="mailto:theleadersrow@gmail.com" 
              className="text-cream/60 hover:text-secondary transition-colors text-xs sm:text-sm"
            >
              theleadersrow@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
