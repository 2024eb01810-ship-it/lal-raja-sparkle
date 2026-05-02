import { Seo } from "@/components/common/Seo";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import { CategoryScroller } from "@/components/home/CategoryScroller";
import { TrendyNecklaces } from "@/components/home/TrendyNecklaces";
import { GiftsForLovedOnes } from "@/components/home/GiftsForLovedOnes";
import { LatestCollections } from "@/components/home/LatestCollections";
import { EarringTypes } from "@/components/home/EarringTypes";
import { LalRajaPromise } from "@/components/home/LalRajaPromise";
import { BridalHighlight } from "@/components/home/BridalHighlight";
import { OffersStrip } from "@/components/home/OffersStrip";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { ProductCard } from "@/components/product/ProductCard";
import { useProducts } from "@/hooks/useContent";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/ui/skeleton";

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

      {/* Featured Pieces */}
      <section className="py-12 md:py-16 bg-brand-soft/40">
        <div className="container-px max-w-7xl mx-auto">
          <SectionHeading title="Featured Pieces" viewAllHref="/collections" viewAllLabel="Shop all" />
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />)
              : featured?.map((p: any) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <BridalHighlight />
      <TrendyNecklaces />
      <GiftsForLovedOnes />
      <LatestCollections />
      <OffersStrip />
      <EarringTypes />
      <LalRajaPromise />
      <TestimonialsCarousel />
      <InstagramGrid />
    </>
  );
};

export default Index;
