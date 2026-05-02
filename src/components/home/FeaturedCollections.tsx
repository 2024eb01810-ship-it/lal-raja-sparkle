import { Link } from "react-router-dom";
import { useCollections } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCollections() {
  const { data, isLoading } = useCollections(true);
  return (
    <section className="py-14 md:py-20 bg-secondary/40">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Featured Collections" viewAllHref="/collections" />
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
            : data?.map((c) => (
                <Link key={c.id} to={`/collections?collection=${c.slug}`} className="group relative block">
                  <div className="image-zoom-wrap aspect-[4/5] shadow-card">
                    <img src={c.cover_image ?? ""} alt={c.name} loading="lazy" className="image-zoom w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-background">
                    <h3 className="font-serif text-xl md:text-2xl">{c.name}</h3>
                    <p className="text-xs uppercase tracking-[0.25em] text-gold mt-1">Discover →</p>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
