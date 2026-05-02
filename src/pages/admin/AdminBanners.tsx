import { useState } from "react";
import { useAdminList, useUpsert, useRemove } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/PageHeader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

const empty = { id: undefined as string | undefined, image_url: "", title: "", subtitle: "", cta_label: "", cta_link: "", sort_order: 0, active: true };

export default function AdminBanners() {
  const { data, isLoading } = useAdminList("banners", "sort_order", true);
  const upsert = useUpsert("banners");
  const remove = useRemove("banners");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  async function save() {
    if (!editing) return;
    const payload: any = { ...editing, sort_order: Number(editing.sort_order) || 0 };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Hero Banners" description="Slides shown at the top of the home page."
        actions={<Button onClick={() => setEditing({ ...empty })} className="gap-2"><Plus className="w-4 h-4" /> New</Button>} />
      {isLoading ? <p>Loading…</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {(data ?? []).map((b: any) => (
            <div key={b.id} className="bg-card shadow-soft overflow-hidden">
              {b.image_url && <img src={b.image_url} className="w-full h-44 object-cover" alt="" />}
              <div className="p-4">
                <p className="font-serif text-lg">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.subtitle}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-xs ${b.active ? "text-green-700" : "text-muted-foreground"}`}>{b.active ? "Active" : "Hidden"} · order {b.sort_order}</span>
                  <div>
                    <Button variant="ghost" size="icon" onClick={() => setEditing({ ...empty, ...b })}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(b.id), "Delete this banner?")}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!data?.length && <p className="text-muted-foreground col-span-full">No banners.</p>}
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} banner</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <ImageUploader value={editing.image_url} onChange={(u) => setEditing({ ...editing, image_url: u })} folder="banners" label="Background image (1920×1080 recommended)" />
              <div className="space-y-1.5"><Label>Title</Label><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Subtitle</Label><Input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>CTA label</Label><Input value={editing.cta_label ?? ""} onChange={(e) => setEditing({ ...editing, cta_label: e.target.value })} placeholder="Shop now" /></div>
                <div className="space-y-1.5"><Label>CTA link</Label><Input value={editing.cta_link ?? ""} onChange={(e) => setEditing({ ...editing, cta_link: e.target.value })} placeholder="/collections" /></div>
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
