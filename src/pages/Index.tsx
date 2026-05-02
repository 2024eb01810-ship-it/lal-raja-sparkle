import { Seo } from "@/components/common/Seo";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { BridalHighlight } from "@/components/home/BridalHighlight";
import { OffersStrip } from "@/components/home/OffersStrip";
import { LegacyBlock } from "@/components/home/LegacyBlock";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: featured, isLoading } = useProducts({ featured: true, limit: 8 });
  return (
    <>
      <Seo
        title="Lal Raja Gold And Diamond Jewellery — Luxury Gold, Diamond & Bridal Jewellery in Vijayawada"
        description="Heritage jewellery house in Vijayawada crafting bridal sets, polki, kundan, temple jewellery and certified diamond solitaires."
      />
      <HeroSlideshow />
      <CategoryScroller />

      <section className="py-14 md:py-20 bg-background">
        <div className="container-px max-w-7xl mx-auto">
          <SectionHeading eyebrow="Handpicked" title="Featured Pieces" />
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
              : featured?.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/collections" className="luxury-btn bg-foreground text-background">Shop All</Link>
          </div>
        </div>
      </section>

      <FeaturedCollections />
      <BridalHighlight />
      <OffersStrip />
      <LegacyBlock />
      <TestimonialsCarousel />
      <InstagramGrid />
    </>
  );
};

export default Index;
