import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryScroller() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Shop By Category" viewAllHref="/collections" />

        <div className="mt-8 flex md:grid gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-6 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[150px] md:min-w-0 aspect-[3/4] rounded-2xl" />
              ))
            : (categories ?? []).slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  to={`/collections/${c.slug}`}
                  className="group min-w-[160px] md:min-w-0 snap-start"
                >
                  <div className="image-zoom-wrap aspect-[3/4] bg-secondary rounded-2xl overflow-hidden shadow-soft relative">
                    <img
                      src={c.image_url ?? ""}
                      alt={c.name}
                      loading="lazy"
                      className="image-zoom w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <p className="text-background font-sans font-semibold text-sm md:text-base">{c.name}</p>
                      {c.telugu_name && <p className="telugu text-[11px] text-background/80">{c.telugu_name}</p>}
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
