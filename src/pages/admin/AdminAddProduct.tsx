import { useState } from "react";
import { useAdminList, useUpsert, slugify } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, X, GripVertical, Save, RotateCcw, Link2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/external-client";
import { useLocalStorageDraft } from "@/hooks/useLocalStorageDraft";

const METALS = ["22K Gold", "18K Gold", "18K White Gold", "Diamond", "Silver", "Platinum"];
const OCCASIONS = ["Wedding", "Festive", "Daily", "Engagement", "Anniversary"];
const DESIGN_STYLES = ["Temple", "Kundan", "Polki", "Modern", "Antique", "Diamond", "Plain Gold"];
const STOCK_STATUSES = ["In Stock", "Made to Order", "Out of Stock"];

const FORM_KEY = "lalraja_product_form_draft";

const DEFAULT_FORM = {
  name: "",
  slug: "",
  description: "",
  short_description: "",
  category_id: "none",
  collection_id: "none",
  metal: "",
  design_style: "",
  occasion: [] as string[],
  stones: "",
  price_min: "",
  price_max: "",
  weight_grams: "",
  making_charges: "",
  stock_status: "In Stock",
  // Price breakup fields
  gold_weight_grams: "",
  stone_value: "",
  making_charges_percent: "12",
  making_charges_discount_percent: "0",
  images: [] as string[],
  active: true,
  featured: false,
  new_arrival: false,
  sort_order: "0",
  meta_title: "",
  meta_description: "",
};

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const upsert = useUpsert("products");
  const { data: categories } = useAdminList("categories", "sort_order", true);
  const { data: collections } = useAdminList("collections", "sort_order", true);

  const [form, setForm] = useState(DEFAULT_FORM);

  // Auto-save form to localStorage; restore on mount
  const { hasDraft, clearDraft } = useLocalStorageDraft(
    FORM_KEY,
    form as unknown as Record<string, unknown>,
    setForm as unknown as React.Dispatch<React.SetStateAction<Record<string, unknown>>>,
    DEFAULT_FORM as unknown as Record<string, unknown>,
    ["images"] // images are blob URLs — skip persisting
  );

  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState("");
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  const handleSlugGen = (name: string) => {
    setForm(f => ({ ...f, name, slug: f.slug || slugify(name), meta_title: f.meta_title || name }));
  };

  const handleDescChange = (desc: string) => {
    setForm(f => ({ ...f, description: desc, meta_description: f.meta_description || desc.substring(0, 160) }));
  };

  const toggleOccasion = (occ: string) => {
    setForm(f => ({
      ...f,
      occasion: f.occasion.includes(occ) ? f.occasion.filter(o => o !== occ) : [...f.occasion, occ]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (form.images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed.");
      return;
    }

    setUploading(true);
    const newImages = [...form.images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        toast.error(`Upload failed for ${file.name}: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      newImages.push(data.publicUrl);
    }

    setForm(f => ({ ...f, images: newImages }));
    setUploading(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newImages = [...form.images];
    const [draggedImg] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, draggedImg);
    
    setForm(f => ({ ...f, images: newImages }));
    setDragIndex(null);
  };

  const removeImage = (index: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const addUrlImage = () => {
    const urls = urlInput
      .split("\n")
      .map(u => u.trim())
      .filter(u => u.startsWith("http"));
    if (urls.length === 0) return;
    if (form.images.length + urls.length > 10) {
      toast.error("Maximum 10 images allowed.");
      return;
    }
    setForm(f => ({ ...f, images: [...f.images, ...urls] }));
    setUrlInput("");
    setUrlPreviewError(false);
    toast.success(`${urls.length} URL${urls.length > 1 ? "s" : ""} added.`);
  };

  const save = async () => {
    if (!form.name || !form.description || form.category_id === "none") {
      toast.error("Please fill Name, Description, and Category");
      return;
    }

    // Core columns — guaranteed to exist in original schema
    const payload: Record<string, any> = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      category_id: form.category_id,
      collection_id: form.collection_id === "none" ? null : form.collection_id,
      metal: form.metal || null,
      occasion: form.occasion.length > 0 ? form.occasion.join(", ") : null,
      stones: form.stones || null,
      price_min: form.price_min ? Number(form.price_min) : null,
      price_max: form.price_max ? Number(form.price_max) : null,
      weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
      images: form.images,
      active: form.active,
      featured: form.featured,
    };

    // Extended columns — only added if migrations have been run
    // Run migration/005_missing_product_columns.sql to enable all of these
    const extendedFields: Record<string, any> = {
      design_style: form.design_style || null,
      short_description: form.short_description || null,
      making_charges: form.making_charges ? Number(form.making_charges) : null,
      stock_status: form.stock_status,
      new_arrival: form.new_arrival,
      sort_order: parseInt(form.sort_order) || 0,
      meta_title: form.meta_title || form.name,
      meta_description: form.meta_description || form.description.substring(0, 160),
      gold_weight_grams: form.gold_weight_grams ? Number(form.gold_weight_grams) : null,
      stone_value: form.stone_value ? Number(form.stone_value) : 0,
      making_charges_percent: form.making_charges_percent ? Number(form.making_charges_percent) : 12,
      making_charges_discount_percent: form.making_charges_discount_percent ? Number(form.making_charges_discount_percent) : 0,
    };

    try {
      const result = await upsert.mutateAsync(payload);
      // Try to also save extended fields — silently skip if columns don't exist yet
      try {
        const savedId = (result as any)?.id;
        if (savedId) {
          const { supabase } = await import("@/integrations/supabase/external-client");
          await supabase.from("products" as any).update(extendedFields).eq("id", savedId);
        }
      } catch {
        // Extended columns not yet in DB — run migration/005_missing_product_columns.sql
      }
      clearDraft();
      toast.success("Product added successfully!");
      navigate("/admin/products");
    } catch (err: any) {
      toast.error("Failed to add product: " + err.message);
    }
  };

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/products"><ArrowLeft className="w-5 h-5" /></Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Add Product Manually</h1>
      </div>

      {/* Draft indicator */}
      {hasDraft && (
        <div className="flex items-center justify-between mb-5 px-4 py-2.5 rounded-md border text-sm"
          style={{ background: "#fdf8ec", borderColor: "#e8d5a3", color: "#7a5c1e" }}>
          <span className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <strong>Draft saved</strong> — your changes are automatically saved in this browser.
          </span>
          <button
            onClick={() => { clearDraft(); toast.info("Draft cleared."); }}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Draft
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* SECTION 1 - Basic Details */}
        <section className="bg-card p-6 rounded-lg shadow-soft border border-border">
          <h2 className="text-lg font-medium mb-4 text-gold">1. Basic Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input value={form.name} onChange={e => handleSlugGen(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea rows={5} value={form.description} onChange={e => handleDescChange(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <Textarea rows={2} value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} />
            </div>
          </div>
        </section>

        {/* SECTION 2 - Category & Classification */}
        <section className="bg-card p-6 rounded-lg shadow-soft border border-border">
          <h2 className="text-lg font-medium mb-4 text-gold">2. Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>Select Category</SelectItem>
                  {(categories || []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select value={form.collection_id} onValueChange={v => setForm({ ...form, collection_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select Collection" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(collections || []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Metal Type</Label>
              <Select value={form.metal || "none"} onValueChange={v => setForm({ ...form, metal: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select Metal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {METALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Design Style</Label>
              <Select value={form.design_style || "none"} onValueChange={v => setForm({ ...form, design_style: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select Design" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {DESIGN_STYLES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Occasion</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {OCCASIONS.map(occ => (
                  <Button 
                    key={occ} 
                    type="button" 
                    variant={form.occasion.includes(occ) ? "default" : "outline"}
                    className={form.occasion.includes(occ) ? "bg-gold text-white" : ""}
                    size="sm"
                    onClick={() => toggleOccasion(occ)}
                  >
                    {occ}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Stones (Comma separated)</Label>
              <Input placeholder="Ruby, Emerald, Pearl" value={form.stones} onChange={e => setForm({ ...form, stones: e.target.value })} />
            </div>
          </div>
        </section>

        {/* SECTION 3 - Pricing & Details */}
        <section className="bg-card p-6 rounded-lg shadow-soft border border-border">
          <h2 className="text-lg font-medium mb-4 text-gold">3. Pricing & Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price Min (₹)</Label>
              <Input type="number" value={form.price_min} onChange={e => setForm({ ...form, price_min: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Price Max (₹)</Label>
              <Input type="number" value={form.price_max} onChange={e => setForm({ ...form, price_max: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Weight (grams)</Label>
              <Input type="number" step="0.01" value={form.weight_grams} onChange={e => setForm({ ...form, weight_grams: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Making Charges (%)</Label>
              <Input type="number" step="0.1" value={form.making_charges} onChange={e => setForm({ ...form, making_charges: e.target.value })} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Stock Status</Label>
              <Select value={form.stock_status} onValueChange={v => setForm({ ...form, stock_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STOCK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Breakup Fields */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-sm font-semibold text-gold mb-1">Live Price Breakup Fields</p>
            <p className="text-xs text-muted-foreground mb-4">Fill these to enable the live Price Breakup section on the product page (like Malabar Gold).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Gold Weight (grams) <span className="text-muted-foreground text-xs">for breakup</span></Label>
                <Input type="number" step="0.001" placeholder="e.g. 9.8" value={form.gold_weight_grams} onChange={e => setForm({ ...form, gold_weight_grams: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Stone Value (₹)</Label>
                <Input type="number" placeholder="0" value={form.stone_value} onChange={e => setForm({ ...form, stone_value: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Making Charges % <span className="text-muted-foreground text-xs">(default 12)</span></Label>
                <Input type="number" step="0.1" placeholder="12" value={form.making_charges_percent} onChange={e => setForm({ ...form, making_charges_percent: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Making Discount % <span className="text-muted-foreground text-xs">(default 0)</span></Label>
                <Input type="number" step="0.1" placeholder="0" value={form.making_charges_discount_percent} onChange={e => setForm({ ...form, making_charges_discount_percent: e.target.value })} />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - Images */}
        <section className="bg-card p-6 rounded-lg shadow-soft border border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gold">4. Images</h2>
            <span className="text-sm text-muted-foreground">{form.images.length} / 10 added</span>
          </div>

          {/* Tab switcher */}
          {form.images.length < 10 && (
            <>
              <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    imageTab === "upload"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    imageTab === "url"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" /> Paste URL
                </button>
              </div>

              {/* Upload tab */}
              {imageTab === "upload" && (
                <label className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-8 h-8 text-gold mb-2" />
                  <span className="text-sm font-medium">Click or Drag &amp; Drop Images</span>
                  <span className="text-xs text-muted-foreground mt-1">Supports multiple files (JPG, PNG, WEBP)</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading && <span className="text-sm text-gold flex items-center gap-2 mt-4"><Loader2 className="w-4 h-4 animate-spin"/> Uploading...</span>}
                </label>
              )}

              {/* URL tab */}
              {imageTab === "url" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Image URL(s)</Label>
                    <p className="text-xs text-muted-foreground">Paste one URL per line to add multiple images at once.</p>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder={`https://example.com/image1.jpg\nhttps://example.com/image2.jpg`}
                      value={urlInput}
                      onChange={e => { setUrlInput(e.target.value); setUrlPreviewError(false); }}
                    />
                  </div>

                  {/* Live preview of first URL */}
                  {urlInput.trim().startsWith("http") && (
                    <div className="flex items-start gap-4 p-3 border rounded-lg bg-muted/40">
                      <div className="shrink-0 w-20 h-20 rounded border bg-muted overflow-hidden">
                        {!urlPreviewError ? (
                          <img
                            src={urlInput.split("\n")[0].trim()}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setUrlPreviewError(true)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">Cannot load image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1 truncate">{urlInput.split("\n")[0].trim()}</p>
                        {urlInput.split("\n").filter(u => u.trim().startsWith("http")).length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            +{urlInput.split("\n").filter(u => u.trim().startsWith("http")).length - 1} more URL(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={addUrlImage}
                    disabled={!urlInput.trim().startsWith("http") || form.images.length >= 10}
                    className="gap-2 bg-gold hover:bg-gold/90 text-white w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Image{urlInput.split("\n").filter(u => u.trim().startsWith("http")).length > 1 ? "s" : ""}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Image grid preview */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
              {form.images.map((url, i) => (
                <div
                  key={url + i}
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  className="relative group aspect-square rounded-lg border border-border overflow-hidden bg-muted cursor-move"
                >
                  <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {i === 0 ? "Main" : i + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-1 right-1 p-1 bg-black/40 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 5 - Settings */}
        <section className="bg-card p-6 rounded-lg shadow-soft border border-border">
          <h2 className="text-lg font-medium mb-4 text-gold">5. Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <label className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={v => setForm({ ...form, active: v })} />
              <span className="font-medium">Active (Visible)</span>
            </label>
            <label className="flex items-center gap-3">
              <Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} />
              <span className="font-medium">Featured Product</span>
            </label>
            <label className="flex items-center gap-3">
              <Switch checked={form.new_arrival} onCheckedChange={v => setForm({ ...form, new_arrival: v })} />
              <span className="font-medium">New Arrival</span>
            </label>
            <div className="space-y-2 sm:col-span-3 max-w-xs">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
            </div>
          </div>
        </section>

        {/* SECTION 6 - SEO */}
        <section className="bg-card p-6 rounded-lg shadow-soft border border-border">
          <h2 className="text-lg font-medium mb-4 text-gold">6. SEO Options</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input value={form.meta_title} onChange={e => setForm({ ...form, meta_title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea rows={3} value={form.meta_description} onChange={e => setForm({ ...form, meta_description: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button variant="outline" asChild>
            <Link to="/admin/products">Cancel</Link>
          </Button>
          {hasDraft && (
            <Button
              variant="outline"
              onClick={() => { clearDraft(); toast.info("Draft cleared."); }}
              className="gap-2 text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" /> Clear Draft
            </Button>
          )}
          <Button onClick={save} disabled={upsert.isPending} className="bg-gold hover:bg-gold/90 text-white min-w-[120px]">
            {upsert.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}
