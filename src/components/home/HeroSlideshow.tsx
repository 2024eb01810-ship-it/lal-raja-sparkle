import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBanners } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";

const FALLBACK = [{
  id: "fallback",
  image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920",
  title: "Tanvika",
  subtitle:
    "Presenting our latest temple jewellery collection — where sacred artistry meets timeless devotion and grace.",
  cta_label: "Shop Now",
  cta_link: "/collections",
}] as const;

export function HeroSlideshow() {
  const { data: banners, isLoading, isError } = useBanners();
  const [idx, setIdx] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading) { setShowSkeleton(false); return; }
    const t = setTimeout(() => setShowSkeleton(true), 250);
    return () => clearTimeout(t);
  }, [isLoading]);

  useEffect(() => {
    if (!banners || banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners]);

  if (isLoading) {
    return (
      <section className="relative w-full h-[42vh] md:h-[80vh] overflow-hidden bg-secondary">
        {showSkeleton && <Skeleton className="absolute inset-0 w-full h-full" />}
      </section>
    );
  }

  const slides: any[] =
    !isError && banners && banners.length > 0 ? banners : (FALLBACK as any);

  return (
    <section className="relative w-full overflow-hidden bg-foreground">
      <div className="relative w-full h-[42vh] md:h-[80vh]">
        {slides.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ${
              i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={b.image_url}
              alt={b.title ?? "Lal Raja Gold And Diamond Jewellery"}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
            {/* Gradient overlay — darker on right so text reads */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/10 to-black/55" />

            <div className="absolute inset-0 flex items-center">
              <div className="container-px max-w-7xl mx-auto w-full">
                <div className="ml-auto md:w-1/2 max-w-xl text-background animate-fade-up text-center md:text-left md:pr-4">
                  <h1 className="font-serif italic text-5xl sm:text-6xl md:text-8xl font-light leading-[0.95] mb-3 lowercase">
                    {b.title}
                  </h1>
                  <div className="h-px w-24 bg-background/50 mx-auto md:mx-0 mb-4" />
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-background/85 mb-5">
                    Crafted for prosperity · Inspired by divinity
                  </p>
                  {b.subtitle && (
                    <p className="text-sm md:text-base text-background/90 mb-7 max-w-md mx-auto md:mx-0 leading-relaxed">
                      {b.subtitle}
                    </p>
                  )}
                  {b.cta_label && b.cta_link && (
                    <Link
                      to={b.cta_link}
                      className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-brand-cream text-brand font-semibold text-sm tracking-wide hover:bg-background transition-colors shadow-soft"
                    >
                      {b.cta_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-brand" : "w-3 bg-background/60 hover:bg-background"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
