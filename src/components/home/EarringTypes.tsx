import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/common/SectionHeading";

const TYPES = [
  { name: "Studs", img: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600" },
  { name: "Jhumka", img: "https://images.unsplash.com/photo-1631982690223-8aa4be0a2497?w=600" },
  { name: "Drops", img: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600" },
  { name: "Bali", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600" },
  { name: "Dangler", img: "https://images.unsplash.com/photo-1633934542430-0905ccb5f050?w=600" },
];

export function EarringTypes() {
  return (
    <section className="py-12 md:py-16 bg-brand-soft/40">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Shop by Earring Type" viewAllHref="/collections/earrings" viewAllLabel="View all" />

        <div className="mt-8 flex md:grid gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {TYPES.map((t) => (
            <Link
              key={t.name}
              to={`/collections/earrings?type=${t.name.toLowerCase()}`}
              className="group min-w-[180px] md:min-w-0 snap-start text-center"
            >
              <div className="image-zoom-wrap aspect-square bg-background rounded-full overflow-hidden shadow-soft border border-border">
                <img src={t.img} alt={t.name} loading="lazy" className="image-zoom w-full h-full object-cover" />
              </div>
              <p className="font-sans font-semibold text-sm md:text-base mt-3 group-hover:text-[#C9A84C] transition-colors">
                {t.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
