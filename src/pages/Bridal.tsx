import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/external-client";
import { useProducts, useTestimonials } from "@/hooks/useContent";
import { ProductCard } from "@/components/product/ProductCard";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  phone: z.string().trim().min(7, "Enter a valid number").max(20),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  preferred_date: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
type FormData = z.infer<typeof schema>;

export default function BridalPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { data: bridal } = useProducts({ categorySlug: "bridal-sets", limit: 8 });
  const { data: testimonials } = useTestimonials();

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      name: values.name, phone: values.phone, email: values.email || null,
      preferred_date: values.preferred_date || null,
      appointment_type: "bridal", notes: values.notes || null,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Couldn't submit", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Appointment requested", description: "Our bridal stylist will reach out shortly." });
    reset();
  };

  return (
    <>
      <Seo title="Bridal Collection — Lal Raja Gold And Diamond Jewellery" description="Heirloom bridal jewellery and private appointments at Lal Raja Gold And Diamond Jewellery, Vijayawada." />
      {/* Hero */}
      <section className="relative h-[55vh] md:h-[70vh] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1606293459339-0c8d36e22e51?w=1920" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative h-full flex items-center justify-center text-center text-background container-px">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-3">For The Bride</p>
            <h1 className="font-serif text-5xl md:text-7xl mb-3">Heirloom Bridal</h1>
            <p className="telugu text-xl text-gold">వధూ ప్రత్యేకం</p>
          </div>
        </div>
      </section>

      <section className="container-px max-w-7xl mx-auto py-14 md:py-20">
        <SectionHeading eyebrow="Curated" title="Bridal Sets" subtitle="From regal polki haarams to delicate diamond chokers." />
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {bridal?.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/collections/bridal-sets" className="luxury-btn bg-foreground text-background">View All Bridal</Link>
        </div>
      </section>

      {/* Appointment */}
      <section id="book" className="bg-secondary/40 py-14 md:py-20">
        <div className="container-px max-w-3xl mx-auto">
          <SectionHeading eyebrow="Private Appointment" title="Book Your Bridal Visit" subtitle="A complimentary one-on-one styling session at our Vijayawada flagship." />
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4">
            <div>
              <Input placeholder="Full name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Input placeholder="Phone" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
              </div>
              <Input placeholder="Email (optional)" {...register("email")} />
            </div>
            <Input type="date" {...register("preferred_date")} />
            <Textarea placeholder="Tell us about your wedding date, budget, preferences…" rows={4} {...register("notes")} />
            <Button type="submit" disabled={submitting} className="luxury-btn bg-foreground text-background w-full">
              {submitting ? "Sending…" : "Request Appointment"}
            </Button>
          </form>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-px max-w-7xl mx-auto py-14 md:py-20">
        <SectionHeading eyebrow="Real Brides" title="Stories from our families" />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {testimonials?.slice(0, 3).map((t) => (
            <article key={t.id} className="bg-card shadow-card p-6 text-center">
              {t.photo_url && <img src={t.photo_url} alt={t.name} loading="lazy" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 ring-2 ring-gold/40" />}
              <div className="flex justify-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />)}
              </div>
              <p className="font-serif italic text-foreground/85 leading-relaxed">“{t.message}”</p>
              <p className="mt-4 text-xs uppercase tracking-[0.25em] text-gold">{t.name}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
