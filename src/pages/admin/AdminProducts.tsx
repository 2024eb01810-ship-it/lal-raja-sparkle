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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatINRRange } from "@/lib/format";

const METALS = ["Gold 22K", "Gold 18K", "Gold 14K", "Silver 925", "Platinum"];
const OCCASIONS = ["Bridal", "Daily Wear", "Festive", "Casual", "Office"];

const empty = {
  id: undefined as string | undefined,
  name: "", slug: "", description: "",
  category_id: null as string | null, collection_id: null as string | null,
  metal: "", weight_grams: "" as any, occasion: "", stones: "",
  price_min: "" as any, price_max: "" as any,
  images: [""], featured: false, active: true,
};

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminList("products");
  const { data: categories } = useAdminList("categories", "sort_order", true);
  const { data: collections } = useAdminList("collections", "sort_order", true);
  const upsert = useUpsert("products");
  const remove = useRemove("products");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  function startNew() { setEditing({ ...empty }); }
  function startEdit(p: any) {
    setEditing({
      ...empty, ...p,
      images: Array.isArray(p.images) && p.images.length ? p.images : [""],
      weight_grams: p.weight_grams ?? "",
      price_min: p.price_min ?? "", price_max: p.price_max ?? "",
    });
  }
  async function save() {
    if (!editing) return;
    const payload: any = {
      ...editing,
      slug: editing.slug || slugify(editing.name),
      images: editing.images.filter(Boolean),
      weight_grams: editing.weight_grams === "" ? null : Number(editing.weight_grams),
      price_min: editing.price_min === "" ? null : Number(editing.price_min),
      price_max: editing.price_max === "" ? null : Number(editing.price_max),
      category_id: editing.category_id || null,
      collection_id: editing.collection_id || null,
    };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage every piece in the catalogue."
        actions={<Button onClick={startNew} className="gap-2"><Plus className="w-4 h-4" /> New product</Button>}
      />

      {isLoading ? <p>Loading…</p> : (
        <div className="bg-card shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider">
              <tr><th className="p-3">Image</th><th className="p-3">Name</th><th className="p-3">Metal</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {(products ?? []).map((p: any) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.images?.[0] && <img src={p.images[0]} className="w-12 h-12 object-cover rounded" alt="" />}</td>
                  <td className="p-3 font-medium">{p.name}{p.featured && <span className="ml-2 text-[10px] uppercase text-gold">★ Featured</span>}</td>
                  <td className="p-3 text-muted-foreground">{p.metal ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{formatINRRange(p.price_min, p.price_max)}</td>
                  <td className="p-3"><span className={p.active ? "text-green-700" : "text-muted-foreground"}>{p.active ? "Active" : "Hidden"}</span></td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(p.id), `Delete "${p.name}"?`)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {!products?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products yet. Add your first piece.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Slug (auto)</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder={slugify(editing.name)} /></div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={editing.category_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, category_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {(categories ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Collection</Label>
                  <Select value={editing.collection_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, collection_id: v === "none" ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {(collections ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label>Metal</Label>
                  <Select value={editing.metal || "none"} onValueChange={(v) => setEditing({ ...editing, metal: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {METALS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Weight (g)</Label><Input type="number" step="0.01" value={editing.weight_grams} onChange={(e) => setEditing({ ...editing, weight_grams: e.target.value })} /></div>
                <div className="space-y-1.5">
                  <Label>Occasion</Label>
                  <Select value={editing.occasion || "none"} onValueChange={(v) => setEditing({ ...editing, occasion: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {OCCASIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Stones</Label><Input value={editing.stones ?? ""} onChange={(e) => setEditing({ ...editing, stones: e.target.value })} placeholder="Diamond, Polki…" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Price min (₹)</Label><Input type="number" value={editing.price_min} onChange={(e) => setEditing({ ...editing, price_min: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Price max (₹)</Label><Input type="number" value={editing.price_max} onChange={(e) => setEditing({ ...editing, price_max: e.target.value })} /></div>
              </div>

              <div>
                <Label>Images</Label>
                <div className="space-y-3 mt-2">
                  {editing.images.map((url, i) => (
                    <ImageUploader
                      key={i}
                      value={url}
                      folder="products"
                      label={`Image ${i + 1}`}
                      onChange={(u) => {
                        const next = [...editing.images];
                        next[i] = u;
                        setEditing({ ...editing, images: next });
                      }}
                    />
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing({ ...editing, images: [...editing.images, ""] })}>
                    + Add another image
                  </Button>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /> Featured</label>
                <label className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={upsert.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {node}
    </div>
  );
}
