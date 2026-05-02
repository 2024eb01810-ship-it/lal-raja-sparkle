import { Link } from "react-router-dom";
import { useOffers } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export function OffersStrip() {
  const { data, isLoading } = useOffers();
  return (
    <section className="py-14 md:py-20">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading eyebrow="Limited Time" title="Offers & Promotions" />
        <div className="mt-10 grid md:grid-cols-3 gap-5 md:gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)
            : data?.slice(0, 3).map((o) => (
                <div key={o.id} className="group relative overflow-hidden bg-card shadow-card">
                  <div className="image-zoom-wrap aspect-[4/3]">
                    <img src={o.image_url ?? ""} alt={o.title} loading="lazy" className="image-zoom w-full h-full object-cover" />
                  </div>
                  {o.badge && (
                    <span className="absolute top-3 left-3 bg-gold text-gold-foreground text-[10px] tracking-widest uppercase px-2.5 py-1">{o.badge}</span>
                  )}
                  <div className="p-5">
                    <h3 className="font-serif text-xl mb-1">{o.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{o.description}</p>
                  </div>
                </div>
              ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/offers" className="luxury-btn bg-foreground text-background">View All Offers</Link>
        </div>
      </div>
    </section>
  );
}
