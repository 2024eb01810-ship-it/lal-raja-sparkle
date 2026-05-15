import { Link } from "react-router-dom";
import { useCollections } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export function LatestCollections() {
  const { data, isLoading } = useCollections();
  const items = (data ?? []).slice(0, 4);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Our Latest Collections" viewAllHref="/collections" viewAllLabel="View all" />

        <div className="mt-8 flex md:grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[260px] md:min-w-0 aspect-[4/5] rounded-2xl" />
              ))
            : items.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/collections/${c.slug}`}
                  className="group min-w-[260px] md:min-w-0 snap-start flex flex-col"
                >
                  <div className="image-zoom-wrap aspect-[4/5] bg-secondary rounded-2xl overflow-hidden shadow-soft">
                    <img
                      src={c.cover_image ?? ""}
                      alt={c.name}
                      loading="lazy"
                      className="image-zoom w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 px-1">
                    <h3 className="font-serif text-xl group-hover:text-[#C9A84C] transition-colors">
                      {c.name}
                    </h3>
                    {c.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
