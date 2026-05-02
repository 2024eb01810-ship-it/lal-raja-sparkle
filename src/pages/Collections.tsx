import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { useCategories, useProducts } from "@/hooks/useContent";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const METALS = ["22K Gold", "18K Gold", "18K White Gold", "18K Rose Gold"];
const OCCASIONS = ["Wedding", "Engagement", "Festive", "Daily", "Anniversary"];

export default function CollectionsPage() {
  const { category } = useParams();
  const [params] = useSearchParams();
  const collectionSlug = params.get("collection") ?? undefined;
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ categorySlug: category });

  const [metals, setMetals] = useState<string[]>([]);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1000000);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (collectionSlug) list = list.filter((p: any) => p.collection?.slug === collectionSlug);
    if (metals.length) list = list.filter((p: any) => metals.includes(p.metal));
    if (occasions.length) list = list.filter((p: any) => occasions.includes(p.occasion));
    list = list.filter((p: any) => (p.price_min ?? 0) <= maxPrice);
    return list;
  }, [products, collectionSlug, metals, occasions, maxPrice]);

  const activeCat = categories?.find((c) => c.slug === category);
  const title = activeCat?.name ?? "All Collections";

  const Filters = (
    <div className="space-y-8">
      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-3">Metal</h4>
        <div className="space-y-2">
          {METALS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={metals.includes(m)}
                onCheckedChange={(v) => setMetals((prev) => (v ? [...prev, m] : prev.filter((x) => x !== m)))}
              />
              {m}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-3">Occasion</h4>
        <div className="space-y-2">
          {OCCASIONS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={occasions.includes(m)}
                onCheckedChange={(v) => setOccasions((prev) => (v ? [...prev, m] : prev.filter((x) => x !== m)))}
              />
              {m}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-3">Max Price</h4>
        <Slider value={[maxPrice]} min={50000} max={1000000} step={10000} onValueChange={(v) => setMaxPrice(v[0])} />
        <p className="text-xs text-muted-foreground mt-2">Up to ₹{maxPrice.toLocaleString("en-IN")}</p>
      </div>
    </div>
  );

  return (
    <>
      <Seo title={`${title} — Lal Raja Gold And Diamond Jewellery`} description={`Explore ${title} from Lal Raja Gold And Diamond Jewellery.`} />
      <section className="container-px max-w-7xl mx-auto py-10 md:py-16">
        <SectionHeading eyebrow="Collections" title={title} telugu={activeCat?.telugu_name ?? undefined} />

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden lg:block sticky top-28 self-start">{Filters}</aside>
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{filtered.length} pieces</p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-6">{Filters}</div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
                : filtered.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
            {!isLoading && filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-20">No pieces match these filters.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
