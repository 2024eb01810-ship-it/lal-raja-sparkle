import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBanners } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";

export function HeroSlideshow() {
  const { data: banners, isLoading } = useBanners();
  const [idx, setIdx] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!banners || banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners]);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) return <Skeleton className="w-full h-[70vh] md:h-[85vh]" />;
  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full h-[78vh] md:h-[88vh] overflow-hidden">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ${
            i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <img
            src={b.image_url}
            alt={b.title ?? "Lal Raja Jewels"}
            className="w-full h-full object-cover"
            style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.05)` }}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-gradient-hero-overlay" />
          <div className="absolute inset-0 flex items-end md:items-center">
            <div className="container-px max-w-7xl mx-auto pb-16 md:pb-0">
              <div className="max-w-xl text-background animate-fade-up">
                <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Lal Raja Jewels</p>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-medium leading-[1.05] mb-4">
                  {b.title}
                </h1>
                {b.subtitle && (
                  <p className="text-base md:text-lg text-background/85 mb-7 max-w-md">{b.subtitle}</p>
                )}
                {b.cta_label && b.cta_link && (
                  <Link
                    to={b.cta_link}
                    className="luxury-btn text-foreground bg-background hover:text-foreground"
                  >
                    {b.cta_label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1 transition-all ${i === idx ? "w-10 bg-gold" : "w-5 bg-background/50"}`}
          />
        ))}
      </div>
    </section>
  );
}
