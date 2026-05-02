import { useEffect, useState } from "react";
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
  const [perView, setPerView] = useState(3);

  // Responsive perView via matchMedia
  useEffect(() => {
    const compute = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setPerView(3);
      else if (window.matchMedia("(min-width: 640px)").matches) setPerView(2);
      else setPerView(1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Continuous marquee: width = (cards / perView) * 100% per copy.
  // We render two copies so the loop is seamless (translate -50% over duration).
  const trackWidthPct = (PROMISES.length / perView) * 100;
  // 2.5s per card → smooth, ~22s per full lap of the 9 promise cards.
  const durationSec = PROMISES.length * 2.5;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <SectionHeading
          title="Lal Raja Promise"
          viewAllHref="/certifications"
          viewAllLabel="Learn more"
        />

        <div className="mt-8 overflow-hidden group">
          <div
            className="flex promise-marquee will-change-transform"
            style={{
              width: `${trackWidthPct * 2}%`,
              animationDuration: `${durationSec}s`,
            }}
          >
            {[...PROMISES, ...PROMISES].map(({ title, desc, Icon }, i) => (
              <div
                key={i}
                className="shrink-0 px-2 md:px-2.5"
                style={{ flex: `0 0 ${100 / (PROMISES.length * 2) * (PROMISES.length / perView)}%` }}
              >
                <article className="h-full p-5 md:p-6 rounded-2xl bg-brand-soft/60 border border-brand-soft hover:border-brand/40 hover:shadow-card transition-all">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
