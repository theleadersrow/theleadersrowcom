import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-navy-dark text-cream/80">
      <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-semibold text-cream mb-4">
              The Leader's Row
            </h3>
            <p className="text-cream/60 max-w-md leading-relaxed">
              Helping ambitious professionals remove every blocker in their career 
              and giving them the tools to grow, rise, and lead.
            </p>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-cream mb-4">Programs</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/the-next-leap" className="text-cream/60 hover:text-secondary transition-colors">
                  The Next Leap
                </Link>
              </li>
              <li>
                <Link to="/level-up-weekly" className="text-cream/60 hover:text-secondary transition-colors">
                  Level-Up Weekly
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-cream mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-cream/60 hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-cream/60 hover:text-secondary transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-cream/60 hover:text-secondary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cream/60 hover:text-secondary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-cream/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-cream/40 text-sm">
              © {new Date().getFullYear()} The Leader's Row. All rights reserved.
            </p>
            <a 
              href="mailto:connect@theleadersrow.com" 
              className="text-cream/60 hover:text-secondary transition-colors text-sm"
            >
              connect@theleadersrow.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
