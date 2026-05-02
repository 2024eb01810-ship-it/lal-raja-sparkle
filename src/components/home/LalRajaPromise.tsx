import { SectionHeading } from "@/components/common/SectionHeading";
import {
  ShieldCheck,
  Wrench,
  BadgeCheck,
  Gem,
  Repeat,
  Lock,
  Leaf,
  Scale,
  Calendar,
} from "lucide-react";

const PROMISES = [
  {
    title: "Complete Transparency",
    desc: "Detailed invoice with accurate gross weight, stone weight and net-gold weight on every tag.",
    Icon: ShieldCheck,
  },
  {
    title: "Assured Lifetime Maintenance",
    desc: "Free lifetime cleaning and polishing for every piece bought at our Vijayawada showroom.",
    Icon: Wrench,
  },
  {
    title: "BIS 916 Hallmarked Gold",
    desc: "100% HUID hallmarking guarantees the purity of every gram of gold you take home.",
    Icon: BadgeCheck,
  },
  {
    title: "Certified Natural Diamonds",
    desc: "Each certified natural diamond passes 28 quality checks before reaching you.",
    Icon: Gem,
  },
  {
    title: "Guaranteed Buyback",
    desc: "Buyback guarantee on all gold and diamond jewellery at fair, transparent rates.",
    Icon: Repeat,
  },
  {
    title: "Your Jewellery Is Insured",
    desc: "Assured 1-year insurance against loss by burglary, fire and extortion (T&Cs apply).",
    Icon: Lock,
  },
  {
    title: "Responsibly Sourced",
    desc: "Gold sourced from authorised channels with full traceability from refinery to showroom.",
    Icon: Leaf,
  },
  {
    title: "Fair Price Policy",
    desc: "One transparent making charge — no surprises, no hidden margins.",
    Icon: Scale,
  },
  {
    title: "Advance Plans",
    desc: "Book your wedding jewellery in advance and pay at the booked rate or current rate, whichever is lower.",
    Icon: Calendar,
  },
];

export function LalRajaPromise() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading title="Lal Raja Promise" viewAllHref="/certifications" viewAllLabel="Learn more" />

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-5">
          {PROMISES.map(({ title, desc, Icon }) => (
            <article
              key={title}
              className="group relative p-5 md:p-6 rounded-2xl bg-brand-soft/60 border border-brand-soft hover:border-brand/40 hover:shadow-card transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-background flex items-center justify-center shadow-soft mb-3">
                <Icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-sans font-semibold text-sm md:text-base text-foreground mb-1.5">
                {title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
