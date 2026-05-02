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
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = { id: undefined as string | undefined, title: "", description: "", image_url: "", badge: "", valid_until: "", sort_order: 0, active: true };

export default function AdminOffers() {
  const { data, isLoading } = useAdminList("offers", "sort_order", true);
  const upsert = useUpsert("offers");
  const remove = useRemove("offers");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  async function save() {
    if (!editing) return;
    const payload: any = {
      ...editing,
      sort_order: Number(editing.sort_order) || 0,
      valid_until: editing.valid_until || null,
    };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Offers & Promotions"
        actions={<Button onClick={() => setEditing({ ...empty })} className="gap-2"><Plus className="w-4 h-4" /> New</Button>} />
      {isLoading ? <p>Loading…</p> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((o: any) => (
            <div key={o.id} className="bg-card shadow-soft overflow-hidden">
              {o.image_url && <img src={o.image_url} className="w-full h-32 object-cover" alt="" />}
              <div className="p-4">
                {o.badge && <span className="inline-block bg-gold/15 text-gold text-[10px] uppercase tracking-wider px-2 py-0.5 mb-2">{o.badge}</span>}
                <p className="font-serif text-lg">{o.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{o.description}</p>
                {o.valid_until && <p className="text-xs text-muted-foreground mt-1">Valid till {new Date(o.valid_until).toLocaleDateString()}</p>}
                <div className="flex justify-between mt-3">
                  <span className={`text-xs ${o.active ? "text-green-700" : "text-muted-foreground"}`}>{o.active ? "Active" : "Hidden"}</span>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => setEditing({ ...empty, ...o, valid_until: o.valid_until ?? "" })}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(o.id), `Delete "${o.title}"?`)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!data?.length && <p className="text-muted-foreground col-span-full">No offers.</p>}
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} offer</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <ImageUploader value={editing.image_url} onChange={(u) => setEditing({ ...editing, image_url: u })} folder="offers" />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Badge</Label><Input value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="Limited Time" /></div>
                <div className="space-y-1.5"><Label>Valid until</Label><Input type="date" value={editing.valid_until ?? ""} onChange={(e) => setEditing({ ...editing, valid_until: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <label className="flex items-center gap-2 mt-6"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label>
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
