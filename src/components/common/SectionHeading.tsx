interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  telugu?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center", telugu }: Props) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3 font-medium">{eyebrow}</p>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-foreground">
        {title}
      </h2>
      {telugu && <p className="telugu text-lg text-muted-foreground mt-2">{telugu}</p>}
      <div className={`gold-divider w-24 my-5 ${align === "center" ? "mx-auto" : ""}`} />
      {subtitle && (
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
