import { useState, useEffect, useCallback } from "react";
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
import { Plus, Pencil, Trash2, Sparkles, Save, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { priceRange as formatINRRange } from "@/lib/format";

const METALS = ["Gold 22K", "Gold 18K", "Gold 14K", "Silver 925", "Platinum"];
const OCCASIONS = ["Bridal", "Daily Wear", "Festive", "Casual", "Office"];

const empty = {
  id: undefined as string | undefined,
  name: "", slug: "", description: "",
  category_id: null as string | null, collection_id: null as string | null,
  metal: "", weight_grams: "" as any, occasion: "", stones: "",
  price_min: "" as any, price_max: "" as any,
  images: [""], featured: false, active: true,
  whatsapp_number: "", phone_number: "", enquiry_message: "",
  // Price breakup
  gold_weight_grams: "" as any,
  stone_value: "" as any,
  making_charges_percent: "" as any,
  making_charges_discount_percent: "" as any,
};

export default function AdminProducts() {
  const { data: products, isLoading } = useAdminList("products");
  const { data: categories } = useAdminList("categories", "sort_order", true);
  const { data: collections } = useAdminList("collections", "sort_order", true);
  const upsert = useUpsert("products");
  const remove = useRemove("products");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [editingDraftKey, setEditingDraftKey] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Auto-save editing dialog to localStorage
  useEffect(() => {
    if (!editing || !editingDraftKey) return;
    try {
      const toSave = { ...editing };
      localStorage.setItem(editingDraftKey, JSON.stringify(toSave));
      setHasDraft(true);
    } catch { /* ignore */ }
  }, [editing, editingDraftKey]);

  const clearEditingDraft = useCallback(() => {
    if (editingDraftKey) {
      localStorage.removeItem(editingDraftKey);
      setHasDraft(false);
    }
  }, [editingDraftKey]);

  function startNew() {
    const key = "lalraja_product_edit_new";
    setEditingDraftKey(key);
    // Restore draft if one exists for new product
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setEditing({ ...empty, ...JSON.parse(raw) });
        setHasDraft(true);
        return;
      }
    } catch { /* ignore */ }
    setEditing({ ...empty });
    setHasDraft(false);
  }
  function startEdit(p: any) {
    const key = `lalraja_product_edit_${p.id}`;
    setEditingDraftKey(key);
    // Restore saved draft for this product if it exists
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setEditing({ ...empty, ...p, ...JSON.parse(raw) });
        setHasDraft(true);
        return;
      }
    } catch { /* ignore */ }
    // No draft — load fresh from product data
    setEditing({
      ...empty, ...p,
      images: Array.isArray(p.images) && p.images.length ? p.images : [""],
      weight_grams: p.weight_grams ?? "",
      price_min: p.price_min ?? "", price_max: p.price_max ?? "",
      gold_weight_grams: p.gold_weight_grams ?? "",
      stone_value: p.stone_value ?? "",
      making_charges_percent: p.making_charges_percent ?? "12",
      making_charges_discount_percent: p.making_charges_discount_percent ?? "0",
    });
    setHasDraft(false);
  }
  async function save() {
    if (!editing) return;
    // Core columns only \u2014 guaranteed to exist in original schema
    const payload: any = {
      id: editing.id,
      name: editing.name,
      slug: editing.slug || slugify(editing.name),
      description: editing.description,
      category_id: editing.category_id || null,
      collection_id: editing.collection_id || null,
      metal: editing.metal || null,
      weight_grams: editing.weight_grams === "" ? null : Number(editing.weight_grams),
      occasion: editing.occasion || null,
      stones: editing.stones || null,
      price_min: editing.price_min === "" ? null : Number(editing.price_min),
      price_max: editing.price_max === "" ? null : Number(editing.price_max),
      images: editing.images.filter(Boolean),
      featured: editing.featured,
      active: editing.active,
      whatsapp_number: editing.whatsapp_number?.trim() || null,
      phone_number: editing.phone_number?.trim() || null,
      enquiry_message: editing.enquiry_message?.trim() || null,
    };
    if (!payload.id) delete payload.id;
    await upsert.mutateAsync(payload);
    // Try extended (price breakup) columns \u2014 silent if not in DB yet
    try {
      if (editing.id) {
        const { supabase } = await import("@/integrations/supabase/external-client");
        await supabase.from("products" as any).update({
          gold_weight_grams: editing.gold_weight_grams === "" ? null : Number(editing.gold_weight_grams),
          stone_value: editing.stone_value === "" ? 0 : Number(editing.stone_value),
          making_charges_percent: editing.making_charges_percent === "" ? 12 : Number(editing.making_charges_percent),
          making_charges_discount_percent: editing.making_charges_discount_percent === "" ? 0 : Number(editing.making_charges_discount_percent),
        }).eq("id", editing.id);
      }
    } catch {
      // Extended columns not yet in DB \u2014 run migration/005_missing_product_columns.sql
    }
    clearEditingDraft();
    setEditing(null);
    setHasDraft(false);
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage every piece in the catalogue."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" className="gap-2 text-gold border-gold hover:bg-gold/10">
              <Link to="/admin/bulk-upload">✨ AI Generate</Link>
            </Button>
            <Button asChild className="gap-2 bg-gold hover:bg-gold/90 text-white">
              <Link to="/admin/products/new">➕ Add Manually</Link>
            </Button>
          </div>
        }
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

      <Dialog open={!!editing} onOpenChange={(v) => { if (!v) { setEditing(null); setHasDraft(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editing?.id ? "Edit product" : "New product"}</span>
              {hasDraft && (
                <span className="flex items-center gap-1.5 text-xs font-normal px-2 py-1 rounded-full border"
                  style={{ background: "#fdf8ec", borderColor: "#e8d5a3", color: "#7a5c1e" }}>
                  <Save className="w-3 h-3" /> Draft saved
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
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

              {/* Price Breakup Fields */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-medium mb-1" style={{ color: "#C9A84C" }}>Live Price Breakup</p>
                <p className="text-xs text-muted-foreground mb-3">Powers the dynamic breakup shown on product page.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Gold Weight (g)</Label><Input type="number" step="0.001" placeholder="e.g. 9.8" value={editing.gold_weight_grams} onChange={(e) => setEditing({ ...editing, gold_weight_grams: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Stone Value (₹)</Label><Input type="number" placeholder="0" value={editing.stone_value} onChange={(e) => setEditing({ ...editing, stone_value: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Making Charges %</Label><Input type="number" step="0.1" placeholder="12" value={editing.making_charges_percent} onChange={(e) => setEditing({ ...editing, making_charges_percent: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Making Discount %</Label><Input type="number" step="0.1" placeholder="0" value={editing.making_charges_discount_percent} onChange={(e) => setEditing({ ...editing, making_charges_discount_percent: e.target.value })} /></div>
                </div>
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

              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <p className="text-sm font-medium">Contact CTAs (optional)</p>
                  <p className="text-xs text-muted-foreground">Leave blank to use the store-wide defaults.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>WhatsApp number</Label>
                    <Input
                      placeholder="918184839498"
                      value={editing.whatsapp_number ?? ""}
                      onChange={(e) => setEditing({ ...editing, whatsapp_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone number</Label>
                    <Input
                      placeholder="+918184839498"
                      value={editing.phone_number ?? ""}
                      onChange={(e) => setEditing({ ...editing, phone_number: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Prefilled WhatsApp message</Label>
                  <Textarea
                    rows={2}
                    placeholder={`Hello Lal Raja Gold And Diamond Jewellery, I'd like to enquire about "${editing.name || "this piece"}".`}
                    value={editing.enquiry_message ?? ""}
                    onChange={(e) => setEditing({ ...editing, enquiry_message: e.target.value })}
                  />
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
            {hasDraft && (
              <Button variant="outline" className="gap-1.5 text-muted-foreground" onClick={() => clearEditingDraft()}>
                <RotateCcw className="w-3.5 h-3.5" /> Clear Draft
              </Button>
            )}
            <Button onClick={save} disabled={upsert.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {node}
    </div>
  );
}
