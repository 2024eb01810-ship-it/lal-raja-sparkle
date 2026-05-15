import { Link } from "react-router-dom";
import { priceRange } from "@/lib/format";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

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
  const { toggleWishlist, isInWishlist } = useWishlist();
  const imgs: string[] = Array.isArray(product.images) ? product.images : [];
  const main = imgs[0] ?? "";
  const hover = imgs[1] ?? main;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group block relative">
      <Link to={`/product/${product.slug}`} className="block relative image-zoom-wrap aspect-[4/5] bg-secondary shadow-soft product-card-hover rounded-sm">
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
      </Link>
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product.id);
        }}
        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors z-10"
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-500 hover:text-red-500 transition-colors"}`} />
      </button>
      <div className="pt-4 text-center">
        {product.category?.name && (
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold mb-1">{product.category.name}</p>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-serif text-base md:text-lg leading-snug group-hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {priceRange(product.price_min, product.price_max)}
        </p>
      </div>
    </div>
  );
}
