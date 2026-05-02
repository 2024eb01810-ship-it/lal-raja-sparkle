import { Link } from "react-router-dom";

export function LegacyBlock() {
  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="container-px max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="image-zoom-wrap aspect-[4/5] shadow-luxury">
          <img
            src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200"
            alt="Lal Raja craftsmanship"
            loading="lazy"
            className="image-zoom w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Our Legacy</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-3">Three generations of craftsmanship</h2>
          <p className="telugu text-lg text-muted-foreground mb-5">లాల్ రాజా వారసత్వం</p>
          <p className="text-foreground/80 leading-relaxed mb-4">
            For over five decades, the Lal Raja atelier in Vijayawada has hand-crafted jewellery for the most cherished moments of South Indian families.
          </p>
          <p className="text-foreground/80 leading-relaxed mb-7">
            Every piece is BIS Hallmarked, every diamond IGI certified, and every customer welcomed like family.
          </p>
          <Link to="/about" className="luxury-btn bg-foreground text-background">Read Our Story</Link>
        </div>
      </div>
    </section>
  );
}
