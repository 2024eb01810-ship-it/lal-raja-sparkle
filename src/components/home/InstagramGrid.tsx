import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { useStoreInfo } from "@/hooks/useContent";

const TILES = [
  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600",
  "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600",
  "https://images.unsplash.com/photo-1635767582909-345b8caa9f87?w=600",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600",
  "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600",
];

export function InstagramGrid() {
  const { data } = useStoreInfo();
  return (
    <section className="py-14 md:py-20 bg-secondary/30">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading eyebrow="@lalrajajewels" title="Follow our journey" />
        <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {TILES.map((src, i) => (
            <a
              key={i}
              href={data?.instagram_url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="group relative block image-zoom-wrap aspect-square"
            >
              <img src={src} alt="" loading="lazy" className="image-zoom w-full h-full object-cover" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                <Instagram className="w-6 h-6 text-background opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
