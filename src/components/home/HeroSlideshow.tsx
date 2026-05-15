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
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-[#2C0A0A]">
        {showSkeleton && <Skeleton className="absolute inset-0 w-full h-full opacity-20" />}
      </section>
    );
  }

  const slides: any[] =
    !isError && banners && banners.length > 0 ? banners : (FALLBACK as any);

  return (
    <section className="relative w-full bg-[#2C0A0A] overflow-hidden">
      <div className="relative w-full h-[500px] md:h-[600px]">
        {slides.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 flex flex-col md:flex-row transition-opacity duration-[800ms] ease-in-out ${
              i === idx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
            }`}
          >
            {/* Text Side (Left on Desktop, Bottom on Mobile) */}
            <div className="order-2 md:order-1 w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 xl:px-32 text-center md:text-left bg-[#2C0A0A]">
              <h1 
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 text-[#C9A84C]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {b.title}
              </h1>
              {b.subtitle && (
                <p className="text-sm md:text-base text-white/90 mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
                  {b.subtitle}
                </p>
              )}
              {b.cta_label && b.cta_link && (
                <div>
                  <Link
                    to={b.cta_link}
                    className="btn-gold"
                  >
                    {b.cta_label}
                  </Link>
                </div>
              )}
            </div>

            {/* Image Side (Right on Desktop, Top on Mobile) */}
            <div className="order-1 md:order-2 w-full md:w-1/2 h-1/2 md:h-full relative">
              <img
                src={b.image_url || FALLBACK[0].image_url}
                alt={b.title ?? "Lal Raja Gold And Diamond Jewellery"}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK[0].image_url;
                }}
              />
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 md:left-1/4 md:-translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-8 bg-[#C9A84C]" : "w-3 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
