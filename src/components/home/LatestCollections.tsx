import { Link } from "react-router-dom";
import { useCollections } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Malabar-style "Our Latest Collections": left column is a vertical list of
 * 3 collection write-ups (logo-style title + tagline + description), right
 * column shows the active collection imagery (two stacked images).
 */
export function LatestCollections() {
  const { data, isLoading } = useCollections();
  const items = (data ?? []).slice(0, 3);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Our Latest Collections" viewAllHref="/collections" viewAllLabel="View all" />

        <div className="mt-8 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-10">
          {/* Left: list */}
          <div className="space-y-5">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))
              : items.map((c: any, idx: number) => (
                  <Link
                    key={c.id}
                    to={`/collections?collection=${c.slug}`}
                    className={`group block p-5 rounded-2xl border transition-all ${
                      idx === 0
                        ? "border-brand bg-brand-soft/60 shadow-soft"
                        : "border-border bg-secondary/40 hover:border-brand/40"
                    }`}
                  >
                    <h3 className="font-serif text-2xl md:text-3xl tracking-wide text-foreground group-hover:text-brand transition-colors">
                      {c.name}
                    </h3>
                    {c.tagline && (
                      <p className="text-xs uppercase tracking-[0.25em] text-brand mt-1">
                        {c.tagline}
                      </p>
                    )}
                    {c.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    )}
                  </Link>
                ))}
          </div>

          {/* Right: imagery for first collection */}
          {!isLoading && items[0] && (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Link
                to={`/collections?collection=${items[0].slug}`}
                className="image-zoom-wrap aspect-[3/4] rounded-2xl overflow-hidden shadow-soft"
              >
                <img
                  src={items[0].cover_image ?? ""}
                  alt={items[0].name}
                  loading="lazy"
                  className="image-zoom w-full h-full object-cover"
                />
              </Link>
              <Link
                to={`/collections?collection=${(items[1] ?? items[0]).slug}`}
                className="image-zoom-wrap aspect-[3/4] rounded-2xl overflow-hidden shadow-soft"
              >
                <img
                  src={(items[1] ?? items[0]).cover_image ?? ""}
                  alt={(items[1] ?? items[0]).name}
                  loading="lazy"
                  className="image-zoom w-full h-full object-cover"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
