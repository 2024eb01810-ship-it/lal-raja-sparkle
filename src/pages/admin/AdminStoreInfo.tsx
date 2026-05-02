import { useEffect, useState } from "react";
import { useAdminList, useUpsert } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminStoreInfo() {
  const { data, isLoading } = useAdminList("store_info");
  const upsert = useUpsert("store_info");
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (data && data.length && !form) setForm(data[0]);
    if (data && !data.length && !form) setForm({
      name: "Lal Raja Gold And Diamond Jewellery",
      address: "", phone: "", whatsapp: "", email: "",
      announcement: "", instagram_url: "", facebook_url: "", youtube_url: "",
      map_embed_url: "", hours: [], gallery: [],
    });
  }, [data, form]);

  async function save() {
    await upsert.mutateAsync(form);
  }

  if (isLoading || !form) return <p>Loading…</p>;

  return (
    <div>
      <PageHeader title="Store Info" description="Address, contact, social links and the marquee announcement." />
      <div className="bg-card shadow-soft p-6 max-w-2xl space-y-4">
        <div className="space-y-1.5"><Label>Business name</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Address</Label><Textarea value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>WhatsApp number</Label><Input value={form.whatsapp ?? ""} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Top announcement (marquee)</Label><Input value={form.announcement ?? ""} onChange={(e) => setForm({ ...form, announcement: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Instagram URL</Label><Input value={form.instagram_url ?? ""} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Facebook URL</Label><Input value={form.facebook_url ?? ""} onChange={(e) => setForm({ ...form, facebook_url: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>YouTube URL</Label><Input value={form.youtube_url ?? ""} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} /></div>
        </div>
        <div className="space-y-1.5"><Label>Google Map embed URL</Label><Input value={form.map_embed_url ?? ""} onChange={(e) => setForm({ ...form, map_embed_url: e.target.value })} placeholder="https://www.google.com/maps/embed?pb=…" /></div>
        <Button onClick={save} disabled={upsert.isPending}>Save changes</Button>
      </div>
    </div>
  );
}
