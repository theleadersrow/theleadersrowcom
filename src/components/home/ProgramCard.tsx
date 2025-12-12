import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

interface ProgramCardProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  price: string;
  priceNote?: string;
  href: string;
  ctaText: string;
  featured?: boolean;
  badge?: string;
}

const ProgramCard = ({
  title,
  subtitle,
  description,
  features,
  price,
  priceNote,
  href,
  ctaText,
  featured = false,
  badge,
}: ProgramCardProps) => {
  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300 md:hover:-translate-y-2 ${
        featured
          ? "bg-navy text-cream shadow-elevated"
          : "bg-card text-card-foreground shadow-card hover:shadow-elevated"
      }`}
    >
      {(featured || badge) && (
        <div className="absolute -top-3 sm:-top-4 left-4 sm:left-8 bg-secondary text-secondary-foreground text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1 rounded-full flex items-center gap-1 sm:gap-1.5">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          {badge || "Most Popular"}
        </div>
      )}

      <div className="mb-5 sm:mb-6 mt-2 sm:mt-0">
        <p className={`text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${featured ? "text-secondary" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
        <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4">{title}</h3>
        <p className={`leading-relaxed text-sm sm:text-base ${featured ? "text-cream/80" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>

      <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5 sm:gap-3">
            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              featured ? "bg-secondary/20" : "bg-secondary/10"
            }`}>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-xs sm:text-sm ${featured ? "text-cream/80" : "text-muted-foreground"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mb-5 sm:mb-6">
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="font-serif text-3xl sm:text-4xl font-semibold">{price}</span>
          {priceNote && (
            <span className={`text-xs sm:text-sm ${featured ? "text-cream/60" : "text-muted-foreground"}`}>
              {priceNote}
            </span>
          )}
        </div>
      </div>

      <Link to={href}>
        <Button
          variant="gold"
          size="lg"
          className="w-full group"
        >
          {ctaText}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  );
};

export default ProgramCard;
