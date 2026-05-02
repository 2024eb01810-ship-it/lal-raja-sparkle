import { useState } from "react";
import { Star } from "lucide-react";
import { useTestimonials } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";

export function TestimonialsCarousel() {
  const { data } = useTestimonials();
  const [i, setI] = useState(0);
  if (!data || data.length === 0) return null;
  const t = data[i % data.length];
  return (
    <section className="py-14 md:py-20">
      <div className="container-px max-w-4xl mx-auto">
        <SectionHeading eyebrow="Testimonials" title="Cherished by families" />
        <div className="mt-10 text-center">
          {t.photo_url && (
            <img src={t.photo_url} alt={t.name} loading="lazy" className="w-20 h-20 rounded-full object-cover mx-auto mb-5 ring-2 ring-gold/40" />
          )}
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: t.rating }).map((_, idx) => (
              <Star key={idx} className="w-4 h-4 fill-gold text-gold" />
            ))}
          </div>
          <blockquote className="font-serif text-xl md:text-2xl italic text-foreground/90 leading-relaxed">
            “{t.message}”
          </blockquote>
          <p className="mt-5 text-sm uppercase tracking-[0.25em] text-gold">{t.name}</p>
          {t.occasion && <p className="text-xs text-muted-foreground mt-1">{t.occasion}</p>}
          <div className="flex justify-center gap-2 mt-8">
            {data.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Testimonial ${idx + 1}`}
                className={`h-1 transition-all ${idx === i ? "w-10 bg-gold" : "w-5 bg-border"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
