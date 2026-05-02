import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ShieldCheck, Award, BadgeCheck, Gem, FileCheck2, Sparkles } from "lucide-react";

const CERTS = [
  {
    icon: ShieldCheck,
    title: "BIS Hallmark",
    text: "Every gold ornament carries the Bureau of Indian Standards hallmark — your assurance of certified purity (22K / 18K / 14K).",
  },
  {
    icon: Award,
    title: "IGI Certified Diamonds",
    text: "Our diamonds are graded by the International Gemological Institute for cut, colour, clarity and carat weight.",
  },
  {
    icon: BadgeCheck,
    title: "GIA Certified Solitaires",
    text: "Premium solitaires come with a GIA report — the global gold standard for diamond grading.",
  },
  {
    icon: Gem,
    title: "Certified Gemstones",
    text: "Precious and semi-precious stones are independently lab-tested for natural origin and treatment disclosure.",
  },
  {
    icon: FileCheck2,
    title: "Transparent Invoicing",
    text: "Itemised invoices detail metal weight, stone weight, making charges and applicable taxes — no hidden costs.",
  },
  {
    icon: Sparkles,
    title: "Lifetime Maintenance",
    text: "Complimentary cleaning, polishing and rhodium plating for life on every Lal Raja purchase.",
  },
];

export default function CertificationsPage() {
  return (
    <>
      <Seo
        title="Certifications & Trust — Lal Raja Jewels"
        description="BIS Hallmarked gold, IGI & GIA certified diamonds, transparent invoicing and lifetime maintenance from Lal Raja Jewels, Vijayawada."
      />

      <section className="relative h-[40vh] md:h-[55vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920"
          alt="Certified jewellery craftsmanship"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative h-full flex items-center justify-center text-center text-background container-px">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-3">Trust & Assurance</p>
            <h1 className="font-serif text-5xl md:text-7xl">Certifications</h1>
            <p className="telugu text-xl text-gold mt-3">ధృవీకరణలు</p>
          </div>
        </div>
      </section>

      <section className="container-px max-w-4xl mx-auto py-14 md:py-20 text-center">
        <SectionHeading
          eyebrow="Our promise"
          title="Purity you can verify"
          subtitle="Every piece that leaves our atelier is certified, hallmarked and backed by a lifetime of care — because trust is the truest hallmark of all."
        />
      </section>

      <section className="container-px max-w-7xl mx-auto pb-16 md:pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CERTS.map((c) => (
            <div key={c.title} className="bg-card p-7 shadow-soft border border-border/50 hover:border-gold/40 transition-colors">
              <c.icon className="w-9 h-9 text-gold mb-4" />
              <h3 className="font-serif text-xl mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-14 md:py-20">
        <div className="container-px max-w-4xl mx-auto text-center">
          <SectionHeading eyebrow="Verify your jewellery" title="How to read your hallmark" />
          <div className="mt-8 grid sm:grid-cols-3 gap-6 text-left">
            {[
              { n: "01", t: "BIS Logo", d: "The triangular BIS mark confirms certified purity testing." },
              { n: "02", t: "Purity Grade", d: "916 for 22K, 750 for 18K, 585 for 14K gold." },
              { n: "03", t: "Jeweller's Mark", d: "Our unique identification, traceable to Lal Raja Jewels." },
            ].map((s) => (
              <div key={s.n} className="bg-card p-6 shadow-soft">
                <p className="text-xs tracking-[0.3em] text-gold mb-2">{s.n}</p>
                <h4 className="font-serif text-lg mb-1">{s.t}</h4>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
