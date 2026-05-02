import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryScroller() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="py-14 md:py-20">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Shop by Category"
          title="Curated Categories"
          telugu="ఆభరణాల వర్గాలు"
          subtitle="Discover the breadth of our craftsmanship across seven cherished traditions."
        />
        <div className="mt-10 flex md:grid gap-4 md:gap-6 md:grid-cols-4 lg:grid-cols-7 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[140px] md:min-w-0 aspect-[3/4]" />
              ))
            : categories?.map((c) => (
                <Link
                  key={c.id}
                  to={`/collections/${c.slug}`}
                  className="group min-w-[150px] md:min-w-0 snap-start text-center"
                >
                  <div className="image-zoom-wrap aspect-[3/4] bg-secondary mb-3 shadow-soft">
                    <img
                      src={c.image_url ?? ""}
                      alt={c.name}
                      loading="lazy"
                      className="image-zoom w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-serif text-base md:text-lg group-hover:text-gold transition-colors">{c.name}</p>
                  {c.telugu_name && <p className="telugu text-xs text-muted-foreground mt-0.5">{c.telugu_name}</p>}
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
