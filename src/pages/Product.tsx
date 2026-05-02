import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Phone, MessageCircle, ChevronLeft } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { useProduct, useProducts } from "@/hooks/useContent";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { phoneLink, productEnquiryLink } from "@/lib/whatsapp";
import { priceRange } from "@/lib/format";

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: related } = useProducts({ limit: 8 });
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <div className="container-px max-w-7xl mx-auto py-10 grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square" />
        <div className="space-y-4"><Skeleton className="h-10 w-3/4" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-32" /></div>
      </div>
    );
  }
  if (!product) return <div className="container-px py-20 text-center">Product not found.</div>;

  const images: string[] = Array.isArray(product.images) ? (product.images as unknown as string[]) : [];
  const enquireMsg = `Hello Lal Raja Gold And Diamond Jewellery, I'd like to enquire about "${product.name}".`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: product.price_min,
      highPrice: product.price_max,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <Seo title={`${product.name} — Lal Raja Gold And Diamond Jewellery`} description={product.description ?? undefined} jsonLd={jsonLd} />
      <div className="container-px max-w-7xl mx-auto py-6 md:py-10">
        <Link to="/collections" className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-gold mb-6">
          <ChevronLeft className="w-3 h-3" /> Back
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="image-zoom-wrap aspect-square bg-secondary mb-3 shadow-soft">
              <img
                src={images[active] ?? ""}
                alt={product.name}
                className="image-zoom w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`shrink-0 w-20 h-20 border-2 transition-colors ${i === active ? "border-gold" : "border-transparent"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {(product as any).category?.name && (
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">{(product as any).category.name}</p>
            )}
            <h1 className="font-serif text-3xl md:text-5xl mb-4">{product.name}</h1>
            <p className="text-2xl font-serif gold-text mb-6">{priceRange(product.price_min, product.price_max)}</p>
            <p className="text-foreground/80 leading-relaxed mb-8">{product.description}</p>

            <dl className="grid grid-cols-2 gap-y-3 text-sm border-y border-border py-5 mb-8">
              {product.metal && (<><dt className="text-muted-foreground">Metal</dt><dd>{product.metal}</dd></>)}
              {product.weight_grams && (<><dt className="text-muted-foreground">Weight</dt><dd>{product.weight_grams} g (approx.)</dd></>)}
              {product.stones && (<><dt className="text-muted-foreground">Stones</dt><dd>{product.stones}</dd></>)}
              {product.occasion && (<><dt className="text-muted-foreground">Occasion</dt><dd>{product.occasion}</dd></>)}
            </dl>

            <div className="grid sm:grid-cols-2 gap-3">
              <a
                href={productEnquiryLink(product.name, product.slug)}
                target="_blank"
                rel="noreferrer"
                className="luxury-btn bg-[#25D366] text-white hover:opacity-90"
              >
                <MessageCircle className="w-4 h-4" /> Enquire on WhatsApp
              </a>
              <a href={phoneLink} className="luxury-btn border border-foreground text-foreground">
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Final pricing depends on prevailing gold rate, weight and stones. BIS Hallmarked · IGI Certified.
            </p>
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="mt-20 md:mt-28">
            <h2 className="font-serif text-2xl md:text-3xl text-center mb-2">You may also love</h2>
            <div className="gold-divider w-24 mx-auto mb-10" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.filter((r: any) => r.id !== product.id).slice(0, 4).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
