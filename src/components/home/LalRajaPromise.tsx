import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const pausedRef = useRef(false);

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

  // Reset index when perView changes so layout stays sane
  useEffect(() => {
    setAnimate(false);
    setIndex(0);
    const t = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(t);
  }, [perView]);

  // Auto-advance every 2s, pausing on hover/focus + reduced motion
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) setIndex((i) => i + 1);
    }, 2000);
    return () => window.clearInterval(id);
  }, []);

  // Looping: when we slide into the cloned segment, snap back to 0 silently
  useEffect(() => {
    if (index < PROMISES.length) return;
    const t = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }, 620); // slightly after the transition finishes
    return () => window.clearTimeout(t);
  }, [index]);

  const pages = Math.max(1, Math.ceil(PROMISES.length / perView));
  const currentPage = Math.min(pages - 1, Math.floor((index % PROMISES.length) / perView));
  // Clone the first `perView` cards at the end for a seamless loop
  const items = [...PROMISES, ...PROMISES.slice(0, perView)];
  const translatePct = -(100 / perView) * index;

  const next = () => setIndex((i) => i + 1);
  const prev = () =>
    setIndex((i) => (i - 1 + PROMISES.length) % PROMISES.length);
  const goToPage = (p: number) => setIndex(p * perView);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container-px max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <SectionHeading
              title="Lal Raja Promise"
              viewAllHref="/certifications"
              viewAllLabel="Learn more"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="w-9 h-9 rounded-full border border-border bg-background hover:bg-brand-soft hover:text-brand transition-colors inline-flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="w-9 h-9 rounded-full border border-border bg-background hover:bg-brand-soft hover:text-brand transition-colors inline-flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className="mt-8 overflow-hidden"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          onFocus={() => { pausedRef.current = true; }}
          onBlur={() => { pausedRef.current = false; }}
        >
          <div
            className={`flex ${animate ? "transition-transform duration-[600ms] ease-in-out" : ""}`}
            style={{ transform: `translateX(${translatePct}%)` }}
          >
            {items.map(({ title, desc, Icon }, i) => (
              <div
                key={`${title}-${i}`}
                className="shrink-0 px-2 md:px-2.5"
                style={{ flex: `0 0 ${100 / perView}%` }}
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

        {/* Page dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, p) => (
            <button
              key={p}
              type="button"
              onClick={() => goToPage(p)}
              aria-label={`Go to slide ${p + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                p === currentPage ? "w-8 bg-brand" : "w-3 bg-border hover:bg-brand/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
