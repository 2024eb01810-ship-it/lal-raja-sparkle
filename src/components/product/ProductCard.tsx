import { Link } from "react-router-dom";
import { priceRange } from "@/lib/format";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    images: any;
    price_min?: number | null;
    price_max?: number | null;
    metal?: string | null;
    category?: { name?: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const imgs: string[] = Array.isArray(product.images) ? product.images : [];
  const main = imgs[0] ?? "";
  const hover = imgs[1] ?? main;
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative image-zoom-wrap aspect-[4/5] bg-secondary shadow-soft">
        <img
          src={main}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover image-zoom group-hover:opacity-0 transition-opacity duration-700"
        />
        <img
          src={hover}
          alt=""
          loading="lazy"
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        />
      </div>
      <div className="pt-4 text-center">
        {product.category?.name && (
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">{product.category.name}</p>
        )}
        <h3 className="font-serif text-base md:text-lg leading-snug group-hover:text-gold transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {priceRange(product.price_min, product.price_max)}
        </p>
      </div>
    </Link>
  );
}
