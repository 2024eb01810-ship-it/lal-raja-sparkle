import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Gift, Coins, Baby, CreditCard, User } from "lucide-react";

const GIFTS = [
  {
    title: "Gifts Under ₹15,000",
    href: "/collections?budget=under-15000",
    img: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600",
    Icon: Gift,
  },
  {
    title: "Gold Coins & Bars",
    href: "/collections?category=coins",
    img: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600",
    Icon: Coins,
  },
  {
    title: "For Kids",
    href: "/collections?for=kids",
    img: "https://images.unsplash.com/photo-1543158181-e6f9f6712055?w=600",
    Icon: Baby,
  },
  {
    title: "Gift Cards",
    href: "/contact?topic=gift-card",
    img: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600",
    Icon: CreditCard,
  },
  {
    title: "For Him",
    href: "/collections?for=him",
    img: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600",
    Icon: User,
  },
];

export function GiftsForLovedOnes() {
  return (
    <section className="py-12 md:py-16 bg-brand-soft/40">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Gifts For Your Loved Ones" viewAllHref="/collections?gift=true" viewAllLabel="View all" />

        <div className="mt-8 flex md:grid gap-3 md:gap-5 md:grid-cols-3 lg:grid-cols-5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
          {GIFTS.map(({ title, href, img, Icon }) => (
            <Link
              key={title}
              to={href}
              className="group min-w-[180px] md:min-w-0 snap-start text-center"
            >
              <div className="image-zoom-wrap aspect-square bg-secondary rounded-2xl overflow-hidden shadow-soft relative">
                <img src={img} alt={title} loading="lazy" className="image-zoom w-full h-full object-cover" />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background/90 flex items-center justify-center shadow-soft">
                  <Icon className="w-4 h-4 text-brand" />
                </div>
              </div>
              <p className="font-sans font-semibold text-sm md:text-base mt-3 group-hover:text-brand transition-colors">
                {title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
