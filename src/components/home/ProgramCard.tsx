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
      className={`relative rounded-3xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-2 ${
        featured
          ? "bg-navy text-cream shadow-elevated"
          : "bg-card text-card-foreground shadow-card hover:shadow-elevated"
      }`}
    >
      {(featured || badge) && (
        <div className="absolute -top-4 left-8 bg-secondary text-secondary-foreground text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-current" />
          {badge || "Most Popular"}
        </div>
      )}

      <div className="mb-6">
        <p className={`text-sm font-medium mb-2 ${featured ? "text-secondary" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
        <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-4">{title}</h3>
        <p className={`leading-relaxed ${featured ? "text-cream/80" : "text-muted-foreground"}`}>
          {description}
        </p>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              featured ? "bg-secondary/20" : "bg-secondary/10"
            }`}>
              <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className={`text-sm ${featured ? "text-cream/80" : "text-muted-foreground"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-4xl font-semibold">{price}</span>
          {priceNote && (
            <span className={`text-sm ${featured ? "text-cream/60" : "text-muted-foreground"}`}>
              {priceNote}
            </span>
          )}
        </div>
      </div>

      <Link to={href}>
        <Button
          variant={featured ? "hero" : "gold"}
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
