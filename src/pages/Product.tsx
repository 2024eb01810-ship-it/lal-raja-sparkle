import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Phone, MessageCircle, ChevronLeft, Heart } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { useProduct, useProducts, useStoreInfo } from "@/hooks/useContent";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { priceRange, formatINR } from "@/lib/format";
import { useWishlist } from "@/hooks/useWishlist";
import { PriceBreakup, calcGrandTotal } from "@/components/product/PriceBreakup";


const DEFAULT_GOLD_RATE = 7500;

export default function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const { data: related } = useProducts({ limit: 8 });
  const { data: storeInfo } = useStoreInfo();
  const [active, setActive] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();

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

  // Resolve gold rate
  const goldRate: number = (storeInfo as any)?.gold_rate_22k ?? DEFAULT_GOLD_RATE;

  // Computed grand total (null if no gold_weight_grams)
  const p = product as any;
  const grandTotal = calcGrandTotal(
    p.gold_weight_grams,
    p.stone_value,
    p.making_charges_percent,
    p.making_charges_discount_percent,
    goldRate
  );

  const priceDisplay = grandTotal != null
    ? formatINR(grandTotal)
    : priceRange(product.price_min, product.price_max);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: grandTotal ?? product.price_min,
      highPrice: grandTotal ?? product.price_max,
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

            {/* Price display — grand total if available, else price_min/max */}
            <div className="mb-6">
              <p className="text-2xl font-serif gold-text">{priceDisplay}</p>
              {grandTotal != null && (
                <p className="text-xs text-muted-foreground mt-1">Incl. GST · Based on today's gold rate</p>
              )}
            </div>

            <p className="text-foreground/80 leading-relaxed mb-6">{product.description}</p>

            <dl className="grid grid-cols-2 gap-y-3 text-sm border-y border-border py-5 mb-4">
              {product.metal && (<><dt className="text-muted-foreground">Metal</dt><dd>{product.metal}</dd></>)}
              {product.weight_grams && (<><dt className="text-muted-foreground">Weight</dt><dd>{product.weight_grams} g (approx.)</dd></>)}
              {product.stones && (<><dt className="text-muted-foreground">Stones</dt><dd>{product.stones}</dd></>)}
              {product.occasion && (<><dt className="text-muted-foreground">Occasion</dt><dd>{product.occasion}</dd></>)}
            </dl>

            {/* Live Price Breakup */}
            <PriceBreakup
              goldWeightGrams={p.gold_weight_grams}
              stoneValue={p.stone_value}
              makingChargesPercent={p.making_charges_percent}
              makingChargesDiscountPercent={p.making_charges_discount_percent}
              goldRate={goldRate}
            />

            <div className="flex flex-col gap-3 mt-6">
              <a
                href={`https://wa.me/918184839498?text=${encodeURIComponent(`Hello Lal Raja, I'm interested in ${product.name}. Please share more details.`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-sm font-medium transition-opacity"
                style={{ background: "#C9A84C", color: "white" }}
              >
                <MessageCircle className="w-5 h-5" /> Enquire on WhatsApp
              </a>
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                <a 
                  href="tel:+918184839498" 
                  className="flex items-center justify-center gap-2 py-3 rounded-sm font-medium border-2 transition-colors w-full"
                  style={{ borderColor: "#C9A84C", color: "#C9A84C" }}
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="flex items-center justify-center gap-2 py-3 rounded-sm font-medium border border-border hover:bg-muted transition-colors w-full"
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-500"}`} /> 
                  {isInWishlist(product.id) ? "Saved" : "Save to Wishlist"}
                </button>
              </div>
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
