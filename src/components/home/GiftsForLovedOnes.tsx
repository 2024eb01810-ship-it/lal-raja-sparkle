import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Gift, Coins, Baby, CreditCard, User } from "lucide-react";

const GIFTS = [
  {
    title: "For Her",
    href: "/collections?occasion=wedding",
    img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400",
    Icon: Gift,
  },
  {
    title: "For Bride",
    href: "/bridal",
    img: "https://i.pinimg.com/736x/31/6a/22/316a226686ee8dcedc2ef74352edcd6f.jpg",
    Icon: User,
  },
  {
    title: "Gold Coins",
    href: "/collections?category=coins",
    img: "https://i.pinimg.com/736x/3c/c6/a7/3cc6a74c4a44c41b33b19382b6e84b63.jpg",
    Icon: Coins,
  },
  {
    title: "Under ₹50,000",
    href: "/collections?price=50000",
    img: "https://i.pinimg.com/736x/25/ee/72/25ee7285a7c231e73dcbc7c86d54c1f6.jpg",
    Icon: CreditCard,
  },
  {
    title: "For Anniversary",
    href: "/collections?occasion=anniversary",
    img: "https://i.pinimg.com/736x/3f/2f/2d/3f2f2d874e09febdbb8cec947c0c913d.jpg",
    Icon: Baby,
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
                  <Icon className="w-4 h-4 text-[#C9A84C]" />
                </div>
              </div>
              <p className="font-sans font-semibold text-sm md:text-base mt-3 group-hover:text-[#C9A84C] transition-colors">
                {title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
