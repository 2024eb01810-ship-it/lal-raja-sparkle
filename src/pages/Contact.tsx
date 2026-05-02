import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone, MessageCircle, MapPin, Mail } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStoreInfo } from "@/hooks/useContent";
import { phoneLink, whatsappLink } from "@/lib/whatsapp";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const { toast } = useToast();
  const { data: info } = useStoreInfo();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    const { error } = await supabase.from("enquiries").insert({
      name: values.name, phone: values.phone || null,
      email: values.email || null, message: values.message,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Couldn't send", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Message sent", description: "We'll be in touch shortly." });
    reset();
  };

  return (
    <>
      <Seo title="Contact — Lal Raja Jewels" description="Get in touch with Lal Raja Jewels in Vijayawada via WhatsApp, phone or email." />
      <section className="container-px max-w-6xl mx-auto py-12 md:py-16">
        <SectionHeading eyebrow="Get In Touch" title="We'd love to hear from you" />

        <div className="mt-12 grid md:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-5">
            <a href={whatsappLink("Hello Lal Raja Jewels, I have an enquiry.")} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-5 bg-card shadow-soft hover:shadow-card transition-shadow">
              <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">WhatsApp</p>
                <p className="font-serif text-lg">{info?.whatsapp ?? "+91 8184839498"}</p>
              </div>
            </a>
            <a href={phoneLink} className="flex items-center gap-4 p-5 bg-card shadow-soft hover:shadow-card transition-shadow">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center"><Phone className="w-5 h-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">Call</p>
                <p className="font-serif text-lg">{info?.phone ?? "+91 8184839498"}</p>
              </div>
            </a>
            <div className="flex items-center gap-4 p-5 bg-card shadow-soft">
              <div className="w-12 h-12 rounded-full bg-accent text-foreground flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">Visit</p>
                <p className="font-serif text-lg">{info?.address ?? "Vijayawada, Andhra Pradesh"}</p>
              </div>
            </div>
            {info?.email && (
              <div className="flex items-center gap-4 p-5 bg-card shadow-soft">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Email</p>
                  <p className="font-serif text-lg">{info.email}</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 md:p-8 shadow-card">
            <h3 className="font-serif text-2xl mb-2">Send a message</h3>
            <div>
              <Input placeholder="Full name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <Input placeholder="Phone (optional)" {...register("phone")} />
            <Input placeholder="Email (optional)" {...register("email")} />
            <div>
              <Textarea placeholder="Your message" rows={5} {...register("message")} />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message.message}</p>}
            </div>
            <Button type="submit" disabled={submitting} className="luxury-btn bg-foreground text-background w-full">
              {submitting ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
