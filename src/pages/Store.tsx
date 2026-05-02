import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useStoreInfo } from "@/hooks/useContent";
import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";

export default function StorePage() {
  const { data: info } = useStoreInfo();
  const hours = (info?.hours as { day: string; open: string; close: string }[] | undefined) ?? [];
  const gallery = (info?.gallery as string[] | undefined) ?? [];

  const jsonLd = info && {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: info.name,
    address: { "@type": "PostalAddress", streetAddress: info.address, addressLocality: "Vijayawada", addressRegion: "Andhra Pradesh", addressCountry: "IN" },
    telephone: info.phone,
  };

  return (
    <>
      <Seo title="Visit Our Store — Lal Raja Jewels, Vijayawada" description="Visit our flagship jewellery store in Vijayawada, Andhra Pradesh." jsonLd={jsonLd ?? undefined} />
      <section className="container-px max-w-7xl mx-auto py-12 md:py-16">
        <SectionHeading eyebrow="Visit Us" title="Our Vijayawada Flagship" telugu="మా దుకాణం" />

        <div className="mt-12 grid lg:grid-cols-2 gap-10">
          <div className="aspect-video w-full overflow-hidden shadow-card">
            {info?.map_embed_url ? (
              <iframe src={info.map_embed_url} className="w-full h-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Store location" />
            ) : <div className="w-full h-full bg-muted" />}
          </div>
          <div className="space-y-6">
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gold mt-1 shrink-0" />
              <div>
                <h3 className="font-serif text-xl mb-1">Address</h3>
                <p className="text-foreground/80">{info?.address}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gold mt-1 shrink-0" />
              <div className="w-full">
                <h3 className="font-serif text-xl mb-2">Store Hours</h3>
                <ul className="text-sm space-y-1">
                  {hours.map((h) => (
                    <li key={h.day} className="flex justify-between border-b border-border/60 py-1">
                      <span className="text-foreground/80">{h.day}</span>
                      <span className="text-muted-foreground">{h.open} – {h.close}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <a href={whatsappLink("Hi, I'd like to visit your store.")} target="_blank" rel="noreferrer" className="luxury-btn bg-[#25D366] text-white">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
              <a href={phoneLink} className="luxury-btn border border-foreground text-foreground"><Phone className="w-4 h-4" /> Call Store</a>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-secondary/40 py-14 md:py-20">
          <div className="container-px max-w-7xl mx-auto">
            <SectionHeading eyebrow="Our Showroom" title="Step inside" />
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((src, i) => (
                <div key={i} className="image-zoom-wrap aspect-[4/3] shadow-soft">
                  <img src={src} alt="" loading="lazy" className="image-zoom w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
