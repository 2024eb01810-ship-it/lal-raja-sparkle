import { Link } from "react-router-dom";

export function BridalHighlight() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1606293459339-0c8d36e22e51?w=1920"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/55" />
      </div>
      <div className="relative container-px max-w-4xl mx-auto text-center text-background">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">For The Bride</p>
        <h2 className="font-serif text-4xl md:text-6xl mb-3">Heirloom Bridal Edit</h2>
        <p className="telugu text-gold text-lg mb-5">వధూ ప్రత్యేకం</p>
        <p className="text-base md:text-lg text-background/85 max-w-xl mx-auto leading-relaxed mb-8">
          From regal polki haarams to delicate diamond chokers — craft your bridal story with us in a private appointment at our Vijayawada flagship.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/bridal" className="luxury-btn bg-background text-foreground">Explore Bridal</Link>
          <Link to="/bridal#book" className="luxury-btn border border-background/40 text-background hover:bg-background hover:text-foreground">Book Appointment</Link>
        </div>
      </div>
    </section>
  );
}
