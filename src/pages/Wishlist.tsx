import { useWishlist } from "@/hooks/useWishlist";
import { useProducts } from "@/hooks/useContent";
import { ProductCard } from "@/components/product/ProductCard";
import { Link } from "react-router-dom";
import { ChevronRight, Heart } from "lucide-react";
import { Seo } from "@/components/common/Seo";

export default function Wishlist() {
  const { wishlist } = useWishlist();
  const { data: allProducts, isLoading } = useProducts({ limit: 1000 }); // We fetch enough products to filter from

  const savedProducts = allProducts?.filter(p => wishlist.includes(p.id)) || [];

  return (
    <>
      <Seo title="My Wishlist — Lal Raja Gold And Diamond Jewellery" />
      <div className="container-px max-w-7xl mx-auto py-8 md:py-12 min-h-[60vh]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">Wishlist</span>
        </div>

        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-6 h-6 text-gold" />
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">My Wishlist</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-gold border-t-transparent animate-spin" />
          </div>
        ) : savedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {savedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/50 rounded-lg border border-border">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="font-serif text-2xl mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Save your favorite jewelry pieces here while you browse our collections.
            </p>
            <Link
              to="/collections"
              className="inline-flex items-center justify-center px-8 py-3 bg-gold text-white hover:bg-gold-dark transition-colors font-medium rounded-sm"
              style={{ background: "#C9A84C", color: "white" }}
            >
              Explore Collections
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
