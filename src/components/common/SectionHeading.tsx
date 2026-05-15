import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  telugu?: string;
  /** When provided, renders Malabar-style title-row with a "View all →" link on the right. */
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function SectionHeading({
  eyebrow, title, subtitle, align = "center", telugu, viewAllHref, viewAllLabel = "View all",
}: Props) {
  // Malabar-style: bold sans title left + "View all →" right
  if (viewAllHref) {
    const isExternal = viewAllHref.startsWith("http");
    return (
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          {eyebrow && (
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#C9A84C] mb-2 font-semibold">{eyebrow}</p>
          )}
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          {telugu && <p className="telugu text-base text-muted-foreground mt-1">{telugu}</p>}
          {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-xl">{subtitle}</p>}
        </div>
        {isExternal ? (
          <a href={viewAllHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A84C] hover:text-[#B8952F] transition-colors shrink-0">
            {viewAllLabel} <ArrowRight className="w-4 h-4" />
          </a>
        ) : (
          <Link to={viewAllHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A84C] hover:text-[#B8952F] transition-colors shrink-0">
            {viewAllLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    );
  }

  // Legacy serif centered heading (kept for other pages)
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 font-medium">{eyebrow}</p>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-foreground">{title}</h2>
      {telugu && <p className="telugu text-lg text-muted-foreground mt-2">{telugu}</p>}
      <div className={`gold-divider w-24 my-5 ${align === "center" ? "mx-auto" : ""}`} />
      {subtitle && (
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
