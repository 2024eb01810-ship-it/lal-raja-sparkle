import { useState } from "react";
import { useAdminList, useUpsert, useRemove, slugify } from "@/hooks/useAdmin";
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

const empty = { id: undefined as string | undefined, name: "", slug: "", description: "", cover_image: "", featured: false, sort_order: 0, active: true };

export default function AdminCollections() {
  const { data, isLoading } = useAdminList("collections", "sort_order", true);
  const upsert = useUpsert("collections");
  const remove = useRemove("collections");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  async function save() {
    if (!editing) return;
    const payload: any = { ...editing, slug: editing.slug || slugify(editing.name), sort_order: Number(editing.sort_order) || 0 };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Collections" description="Curated themed groupings (e.g. Polki, Temple, Solitaires)."
        actions={<Button onClick={() => setEditing({ ...empty })} className="gap-2"><Plus className="w-4 h-4" /> New</Button>} />
      {isLoading ? <p>Loading…</p> : (
        <div className="bg-card shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider">
              <tr><th className="p-3">Image</th><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Featured</th><th className="p-3">Status</th><th /></tr>
            </thead>
            <tbody>
              {(data ?? []).map((c: any) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3">{c.cover_image && <img src={c.cover_image} className="w-12 h-12 object-cover rounded" alt="" />}</td>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3">{c.featured ? "★" : ""}</td>
                  <td className="p-3"><span className={c.active ? "text-green-700" : "text-muted-foreground"}>{c.active ? "Active" : "Hidden"}</span></td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditing({ ...empty, ...c })}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(c.id), `Delete "${c.name}"?`)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {!data?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No collections.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} collection</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder={slugify(editing.name)} /></div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} /></div>
              <ImageUploader value={editing.cover_image} onChange={(u) => setEditing({ ...editing, cover_image: u })} folder="collections" label="Cover image" />
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5"><Label>Sort order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <label className="flex items-center gap-2"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /> Featured</label>
                <label className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label>
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
