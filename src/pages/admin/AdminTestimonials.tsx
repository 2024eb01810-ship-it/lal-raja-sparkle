import { useState } from "react";
import { useAdminList, useUpsert, useRemove } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";

const empty = { id: undefined as string | undefined, name: "", message: "", rating: 5, occasion: "", photo_url: "", sort_order: 0, approved: true };

export default function AdminTestimonials() {
  const { data, isLoading } = useAdminList("testimonials", "sort_order", true);
  const upsert = useUpsert("testimonials");
  const remove = useRemove("testimonials");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  async function save() {
    if (!editing) return;
    const payload: any = { ...editing, sort_order: Number(editing.sort_order) || 0, rating: Number(editing.rating) || 5 };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Testimonials"
        actions={<Button onClick={() => setEditing({ ...empty })} className="gap-2"><Plus className="w-4 h-4" /> New</Button>} />
      {isLoading ? <p>Loading…</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {(data ?? []).map((t: any) => (
            <div key={t.id} className="bg-card shadow-soft p-5">
              <div className="flex items-start gap-3">
                {t.photo_url && <img src={t.photo_url} className="w-12 h-12 rounded-full object-cover" alt="" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t.name}</p>
                  <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-gold text-gold" />)}</div>
                  {t.occasion && <p className="text-xs text-muted-foreground">{t.occasion}</p>}
                  <p className="text-sm mt-2 line-clamp-3">"{t.message}"</p>
                  <div className="flex justify-between mt-3 items-center">
                    <span className={`text-xs ${t.approved ? "text-green-700" : "text-amber-600"}`}>{t.approved ? "Approved" : "Pending"}</span>
                    <div>
                      <Button variant="ghost" size="icon" onClick={() => setEditing({ ...empty, ...t })}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(t.id), `Delete "${t.name}"?`)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!data?.length && <p className="text-muted-foreground col-span-full">No testimonials.</p>}
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} testimonial</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Customer name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Occasion</Label><Input value={editing.occasion ?? ""} onChange={(e) => setEditing({ ...editing, occasion: e.target.value })} placeholder="Wedding, Anniversary…" /></div>
              </div>
              <div className="space-y-1.5"><Label>Message</Label><Textarea rows={4} value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} /></div>
              <ImageUploader value={editing.photo_url} onChange={(u) => setEditing({ ...editing, photo_url: u })} folder="testimonials" label="Photo" />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label>Rating</Label><Input type="number" min={1} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <label className="flex items-center gap-2 mt-6"><Switch checked={editing.approved} onCheckedChange={(v) => setEditing({ ...editing, approved: v })} /> Approved</label>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} disabled={upsert.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {node}
    </div>
  );
}
