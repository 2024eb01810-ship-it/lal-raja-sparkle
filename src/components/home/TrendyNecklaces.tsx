import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Malabar-style "Trendy Necklaces" rail — 5 rounded image tiles with title +
 * "Starts from" price. Pulls from the CMS Categories table, filtered to
 * necklace-like categories; falls back to the first 5 categories.
 */
export function TrendyNecklaces() {
  const { data: categories, isLoading } = useCategories();

  const necklaces = (categories ?? [])
    .filter((c: any) =>
      /neck|haar|chain|pendant|chok/i.test(`${c.name} ${c.slug}`)
    )
    .slice(0, 5);
  const tiles = necklaces.length >= 3 ? necklaces : (categories ?? []).slice(0, 5);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Trendy Necklaces" viewAllHref="/collections" viewAllLabel="View all" />

        <div className="mt-8 flex md:grid gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[180px] md:min-w-0 aspect-square rounded-2xl" />
              ))
            : tiles.map((c: any, i: number) => (
                <Link
                  key={c.id}
                  to={`/collections/${c.slug}`}
                  className="group min-w-[180px] md:min-w-0 snap-start text-center"
                >
                  <div className="image-zoom-wrap aspect-square bg-brand-soft rounded-2xl overflow-hidden shadow-soft">
                    <img
                      src={c.image_url ?? ""}
                      alt={c.name}
                      loading="lazy"
                      className="image-zoom w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-sans font-semibold text-sm md:text-base mt-3 group-hover:text-brand transition-colors">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Starts from ₹{(15000 + i * 12000).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
