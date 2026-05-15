import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shows products from necklaces-chains category.
 */
export function TrendyNecklaces() {
  const { data: products, isLoading } = useProducts({ categorySlug: 'necklaces-chains' });

  const tiles = products ? products.slice(0, 5) : [];

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Trendy Necklaces" viewAllHref="/collections?category=necklaces-chains" viewAllLabel="View all" />

        <div className="mt-8 flex md:grid gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="min-w-[180px] md:min-w-0 aspect-square rounded-2xl" />
            ))
          ) : tiles.length > 0 ? (
            tiles.map((p: any) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="group min-w-[180px] md:min-w-0 snap-start text-center flex flex-col"
              >
                <div className="image-zoom-wrap aspect-square bg-brand-soft rounded-2xl overflow-hidden shadow-soft">
                  <img
                    src={p.image_urls?.[0] ?? ""}
                    alt={p.name}
                    loading="lazy"
                    className="image-zoom w-full h-full object-cover"
                  />
                </div>
                <p className="font-sans font-semibold text-sm md:text-base mt-3 group-hover:text-[#C9A84C] transition-colors line-clamp-1 px-1">
                  {p.name}
                </p>
                {p.base_price && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ₹{p.base_price.toLocaleString("en-IN")}
                  </p>
                )}
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p className="font-serif text-2xl">Coming Soon</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
