import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Award, Gem, Users, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Seo title="About — Lal Raja Jewels" description="Three generations of jewellery craftsmanship in Vijayawada." />
      <section className="relative h-[45vh] md:h-[60vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1920" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative h-full flex items-center justify-center text-center text-background container-px">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-3">Our Heritage</p>
            <h1 className="font-serif text-5xl md:text-7xl">About Lal Raja</h1>
            <p className="telugu text-xl text-gold mt-3">లాల్ రాజా గురించి</p>
          </div>
        </div>
      </section>

      <section className="container-px max-w-4xl mx-auto py-14 md:py-20 text-center">
        <SectionHeading eyebrow="Since 1972" title="A legacy in gold" />
        <div className="mt-8 space-y-5 text-foreground/85 leading-relaxed text-base md:text-lg">
          <p>Founded by master craftsman Sri Lal Raja Garu in the heart of Vijayawada, our atelier began as a single workshop crafting wedding jewellery for South Indian families.</p>
          <p>Today, three generations later, the same hands-on artistry guides every piece — from intricate temple haarams to certified diamond solitaires.</p>
          <p>We measure success not in carats but in the trust of generations who choose Lal Raja for their most cherished moments.</p>
        </div>
      </section>

      <section className="bg-secondary/40 py-14 md:py-20">
        <div className="container-px max-w-7xl mx-auto">
          <SectionHeading eyebrow="What we stand for" title="Craftsmanship & Trust" />
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[
              { icon: Gem, title: "Master Craftsmanship", text: "Hand-crafted by artisans with over 30 years of experience." },
              { icon: ShieldCheck, title: "BIS Hallmarked", text: "Every piece of gold is BIS hallmarked for purity." },
              { icon: Award, title: "IGI Certified", text: "All diamonds come with IGI/GIA certification." },
              { icon: Users, title: "Family First", text: "Three generations of trusted relationships." },
            ].map((c) => (
              <div key={c.title} className="bg-card p-6 text-center shadow-soft">
                <c.icon className="w-8 h-8 mx-auto text-gold mb-3" />
                <h3 className="font-serif text-lg mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
