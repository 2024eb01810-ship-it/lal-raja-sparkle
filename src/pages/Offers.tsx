import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useOffers } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";
import { whatsappLink } from "@/lib/whatsapp";

export default function OffersPage() {
  const { data, isLoading } = useOffers();
  return (
    <>
      <Seo title="Offers & Promotions — Lal Raja Jewels" description="Festive specials, bridal bonuses and gold exchange offers at Lal Raja Jewels." />
      <section className="container-px max-w-7xl mx-auto py-12 md:py-16">
        <SectionHeading eyebrow="Limited Time" title="Current Offers" subtitle="Festive specials and exclusive in-store bonuses." />
        <div className="mt-12 grid md:grid-cols-2 gap-6 md:gap-8">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[16/9]" />)
            : data?.map((o) => (
                <article key={o.id} className="group relative overflow-hidden bg-card shadow-card">
                  <div className="image-zoom-wrap aspect-[16/9]">
                    <img src={o.image_url ?? ""} alt={o.title} loading="lazy" className="image-zoom w-full h-full object-cover" />
                  </div>
                  {o.badge && <span className="absolute top-4 left-4 bg-gold text-gold-foreground text-xs tracking-widest uppercase px-3 py-1.5">{o.badge}</span>}
                  <div className="p-6">
                    <h3 className="font-serif text-2xl mb-2">{o.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{o.description}</p>
                    {o.valid_until && <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Valid until {new Date(o.valid_until).toLocaleDateString("en-IN")}</p>}
                    <a href={whatsappLink(`Hi, I'd like to know more about the offer: ${o.title}`)} target="_blank" rel="noreferrer" className="luxury-btn bg-foreground text-background">Enquire on WhatsApp</a>
                  </div>
                </article>
              ))}
        </div>
      </section>
    </>
  );
}
