import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/external-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { slugify } from "@/hooks/useAdmin";
import {
  Upload, Sparkles, Check, X, Loader2, ImageIcon,
  CheckCircle2, Circle, Save, IndianRupee,
} from "lucide-react";

// ── localStorage helpers for toggle persistence ──
const readToggle = (key: string, defaultVal = true): boolean => {
  try { const v = localStorage.getItem(key); return v === null ? defaultVal : v === "true"; } catch { return defaultVal; }
};
const writeToggle = (key: string, val: boolean) => {
  try { localStorage.setItem(key, String(val)); } catch { /* ignore */ }
};

const METALS = ["22K Gold", "18K Gold", "14K Gold", "Diamond", "Silver 925", "Platinum"];
const OCCASIONS = ["Wedding", "Festive", "Daily Wear", "Engagement", "Casual", "Office"];

type GenStep = { label: string; status: "idle" | "running" | "done" | "error" | "skipped" };
type GenImage = { label: string; url: string | null; approved: boolean | null };

const BASE_STEPS = [
  { id: "upload",    label: "Uploading photo",                   always: true },
  { id: "white_bg",  label: "Generating white background shot",  toggle: "white" },
  { id: "dark_bg",   label: "Generating dark luxury background shot", toggle: "dark" },
  { id: "upscale",   label: "Upscaling to 4K",                   always: true },
  { id: "model",     label: "Generating model image",             toggle: "model" },
  { id: "quality",   label: "Quality check",                     always: true },
] as const;

const buildSteps = (genModel: boolean, genWhite: boolean, genDark: boolean): GenStep[] =>
  BASE_STEPS
    .filter(s => {
      if ((s as any).always) return true;
      if ((s as any).toggle === "model") return genModel;
      if ((s as any).toggle === "white") return genWhite;
      if ((s as any).toggle === "dark") return genDark;
      return true;
    })
    .map(s => ({ label: s.label, status: "idle" as const }));

export default function AdminUploadProduct() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image generation toggle state (localStorage-backed) ──
  const [genModel, setGenModel] = useState(() => readToggle("generate_model_image", true));
  const [genWhite, setGenWhite] = useState(() => readToggle("generate_white_bg", true));
  const [genDark,  setGenDark]  = useState(() => readToggle("generate_dark_bg",  true));

  const toggleGenModel = (v: boolean) => { setGenModel(v); writeToggle("generate_model_image", v); };
  const toggleGenWhite = (v: boolean) => { setGenWhite(v); writeToggle("generate_white_bg", v); };
  const toggleGenDark  = (v: boolean) => { setGenDark(v);  writeToggle("generate_dark_bg",  v); };

  // ── Form state ──
  const [form, setForm] = useState({
    name: "", description: "", category_id: "", collection_id: "",
    metal: "", weight_grams: "", stones: "", occasion: "",
    price_min: "", price_max: "", whatsapp_number: "",
  });
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Generation state ──
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState<GenStep[]>(() => buildSteps(genModel, genWhite, genDark));
  const [generatedImages, setGeneratedImages] = useState<GenImage[]>([]);
  const [showResults, setShowResults] = useState(false);

  // ── Data from DB ──
  const { data: categories } = useQuery({
    queryKey: ["admin", "categories", "sort_order", true],
    queryFn: async () => {
      const { data } = await supabase.from("categories" as any).select("*").order("sort_order", { ascending: true });
      return data ?? [];
    },
  });
  const { data: collections } = useQuery({
    queryKey: ["admin", "collections", "sort_order", true],
    queryFn: async () => {
      const { data } = await supabase.from("collections" as any).select("*").order("sort_order", { ascending: true });
      return data ?? [];
    },
  });
  const { data: storeInfo } = useQuery({
    queryKey: ["admin", "store_info"],
    queryFn: async () => {
      const { data } = await supabase.from("store_info" as any).select("*").limit(1).maybeSingle();
      return data;
    },
  });

  // Pre-fill whatsapp from store_info
  const whatsapp = form.whatsapp_number || storeInfo?.whatsapp || "";

  // ── Drag & Drop ──
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) { setRawFile(file); setRawImage(URL.createObjectURL(file)); }
  }, []);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setRawFile(file); setRawImage(URL.createObjectURL(file)); }
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  // ── Generate images (calls edge function) ──
  async function handleGenerate() {
    if (!rawFile) return toast.error("Upload a jewelry photo first");
    if (!form.name.trim()) return toast.error("Enter a product name");
    if (!genWhite && !genDark && !genModel) return toast.error("Enable at least one image type to generate");

    const currentSteps = buildSteps(genModel, genWhite, genDark);
    setGenerating(true);
    setShowResults(false);
    setSteps(currentSteps);
    setGeneratedImages([]);

    const updateStep = (idx: number, status: GenStep["status"]) =>
      setSteps(prev => prev.map((s, i) => i === idx ? { ...s, status } : s));

    try {
      // Step 0: Upload raw image
      updateStep(0, "running");
      const ext = rawFile.name.split(".").pop() || "jpg";
      const uploadPath = `products/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(uploadPath, rawFile, {
        cacheControl: "3600", upsert: false,
      });
      if (upErr) throw new Error("Upload failed: " + upErr.message);
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(uploadPath);
      const rawImageUrl = urlData.publicUrl;
      updateStep(0, "done");

      // Remaining steps
      for (let i = 1; i < currentSteps.length - 1; i++) updateStep(i, "running");

      // Call generate-product-images with toggle flags
      const { data: genRes, error: genErr } = await supabase.functions.invoke("generate-product-images", {
        body: {
          raw_image_url: rawImageUrl,
          product_name: form.name,
          jewelry_description: form.description || form.name,
          category_slug: (categories as any[])?.find((c: any) => c.id === form.category_id)?.slug || "necklaces-chains",
          generate_model: genModel,
          generate_white_bg: genWhite,
          generate_dark_bg: genDark,
        },
      });

      if (genErr || !genRes?.success) throw new Error(genErr?.message || genRes?.error || "Generation failed");

      for (let i = 1; i < currentSteps.length; i++) updateStep(i, "done");

      const imgs: GenImage[] = [];
      if (genWhite && genRes.images?.white_bg) imgs.push({ label: "White Background", url: genRes.images.white_bg, approved: null });
      if (genDark  && genRes.images?.dark_bg)  imgs.push({ label: "Dark Luxury Background", url: genRes.images.dark_bg, approved: null });
      if (genModel && genRes.images?.model)    imgs.push({ label: "Brand Model Wearing", url: genRes.images.model, approved: null });

      setGeneratedImages(imgs);
      setShowResults(true);
      toast.success("Images generated! Review and approve below.");
    } catch (err: any) {
      const lastIdx = currentSteps.length - 1;
      setSteps(prev => prev.map((s, i) => i === lastIdx ? { ...s, status: "error" } : s.status === "running" ? { ...s, status: "error" } : s));
      toast.error(err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  // ── Save product ──
  async function handleSave() {
    const approved = generatedImages.filter(img => img.approved === true);
    if (!approved.length) return toast.error("Approve at least one image before saving");

    setSaving(true);
    try {
      // Upload raw image to Supabase storage
      let uploadedUrls: string[] = [];
      if (rawFile) {
        const ext = rawFile.name.split(".").pop() || "jpg";
        const path = `products/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, rawFile, {
          cacheControl: "3600", upsert: false,
        });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
          uploadedUrls.push(urlData.publicUrl);
        }
      }
      // Add approved generated image URLs
      approved.forEach(img => { if (img.url && !uploadedUrls.includes(img.url)) uploadedUrls.push(img.url); });

      const payload: any = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        category_id: form.category_id || null,
        collection_id: form.collection_id || null,
        metal: form.metal || null,
        weight_grams: form.weight_grams ? Number(form.weight_grams) : null,
        stones: form.stones || null,
        occasion: form.occasion || null,
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        whatsapp_number: whatsapp || null,
        images: uploadedUrls,
        active: true, featured: false,
      };

      const { error } = await supabase.from("products" as any).insert(payload);
      if (error) throw error;

      queryClient.invalidateQueries();
      toast.success(`"${form.name}" saved to products!`);

      // Reset
      setForm({ name: "", description: "", category_id: "", collection_id: "",
        metal: "", weight_grams: "", stones: "", occasion: "",
        price_min: "", price_max: "", whatsapp_number: "" });
      setRawImage(null); setRawFile(null);
      setGeneratedImages([]); setShowResults(false);
      setSteps(INITIAL_STEPS);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Upload Product"
        description="Upload a raw jewelry photo, generate AI backgrounds and model shots, then publish."
        actions={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-xs text-muted-foreground">AI-Powered</span>
          </div>
        }
      />

      {/* ── Image Generation Settings ── */}
      <div className="bg-card shadow-soft rounded-xl p-6 mb-6">
        <h2 className="font-serif text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          Image Generation Settings
        </h2>
        <div className="space-y-4">
          {/* Model Image Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Generate Model Image</span>
                {!genModel && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    <IndianRupee className="w-2.5 h-2.5" />~₹8 saved per product
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Shows jewelry on brand model</p>
            </div>
            <Switch
              id="toggle-model-image"
              checked={genModel}
              onCheckedChange={toggleGenModel}
              className="data-[state=checked]:bg-[#C9A84C]"
            />
          </div>

          {/* White Background Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <span className="text-sm font-medium">Generate White Background</span>
              <p className="text-xs text-muted-foreground mt-0.5">Clean white product shot</p>
            </div>
            <Switch
              id="toggle-white-bg"
              checked={genWhite}
              onCheckedChange={toggleGenWhite}
              className="data-[state=checked]:bg-[#C9A84C]"
            />
          </div>

          {/* Dark Background Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <span className="text-sm font-medium">Generate Dark Background</span>
              <p className="text-xs text-muted-foreground mt-0.5">Luxury dark background shot</p>
            </div>
            <Switch
              id="toggle-dark-bg"
              checked={genDark}
              onCheckedChange={toggleGenDark}
              className="data-[state=checked]:bg-[#C9A84C]"
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Upload & Details ── */}
      <div className="bg-card shadow-soft rounded-xl p-6 space-y-6">
        <h2 className="font-serif text-xl flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center text-xs font-bold">1</span>
          Upload & Details
        </h2>

        {/* Drag & drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? "border-[#C9A84C] bg-[#C9A84C]/5" :
            rawImage ? "border-[#C9A84C]/40 bg-[#C9A84C]/5" : "border-border hover:border-[#C9A84C]/40"
          }`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {rawImage ? (
            <div className="flex items-center gap-6">
              <img src={rawImage} alt="Raw" className="w-32 h-32 object-cover rounded-lg shadow-md" />
              <div className="text-left">
                <p className="font-medium text-foreground">{rawFile?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {rawFile ? `${(rawFile.size / 1024 / 1024).toFixed(1)} MB` : ""}
                </p>
                <button onClick={(e) => { e.stopPropagation(); setRawImage(null); setRawFile(null); }}
                  className="text-xs text-destructive mt-2 hover:underline">Remove & re-upload</button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="font-medium text-foreground">Drop your jewelry photo here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse · PNG, JPG up to 50MB</p>
            </>
          )}
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Product name *</Label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Lakshmi Antique Necklace Set" />
          </div>
          <div className="space-y-1.5">
            <Label>Metal type</Label>
            <Select value={form.metal || "none"} onValueChange={v => set("metal", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {METALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3}
            placeholder="Describe the piece — craftsmanship, occasion, unique details…" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category_id || "none"} onValueChange={v => set("category_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {(categories ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Collection</Label>
            <Select value={form.collection_id || "none"} onValueChange={v => set("collection_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {(collections ?? []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Weight (g)</Label>
            <Input type="number" step="0.01" value={form.weight_grams} onChange={e => set("weight_grams", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Occasion</Label>
            <Select value={form.occasion || "none"} onValueChange={v => set("occasion", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {OCCASIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label>Price min (₹)</Label>
            <Input type="number" value={form.price_min} onChange={e => set("price_min", e.target.value)} placeholder="15000" />
          </div>
          <div className="space-y-1.5">
            <Label>Price max (₹)</Label>
            <Input type="number" value={form.price_max} onChange={e => set("price_max", e.target.value)} placeholder="50000" />
          </div>
          <div className="space-y-1.5">
            <Label>Stones (optional)</Label>
            <Input value={form.stones} onChange={e => set("stones", e.target.value)} placeholder="Diamond, Polki…" />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp number</Label>
            <Input value={whatsapp} onChange={e => set("whatsapp_number", e.target.value)} placeholder="918184839498" />
          </div>
        </div>

        {/* Generate button */}
        <div className="pt-2">
          <Button onClick={handleGenerate} disabled={generating}
            className="gap-2 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B85A] shadow-[0_2px_12px_-3px_rgba(201,168,76,0.5)] px-8 py-3 text-base font-semibold">
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {generating ? "Generating…" : "Generate Images"}
          </Button>
        </div>
      </div>

      {/* ── SECTION 3: Generation Progress ── */}
      {(generating || showResults) && (
        <div className="bg-card shadow-soft rounded-xl p-6 mt-6">
          <h2 className="font-serif text-xl flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center text-xs font-bold">2</span>
            Generation Progress
          </h2>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                {step.status === "done" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> :
                 step.status === "running" ? <Loader2 className="w-5 h-5 text-[#C9A84C] animate-spin shrink-0" /> :
                 step.status === "error" ? <X className="w-5 h-5 text-destructive shrink-0" /> :
                 <Circle className="w-5 h-5 text-muted-foreground/30 shrink-0" />}
                <span className={`text-sm ${
                  step.status === "done" ? "text-foreground" :
                  step.status === "running" ? "text-[#C9A84C] font-medium" :
                  "text-muted-foreground"
                }`}>
                  Step {i + 1}: {step.label}
                  {step.status === "running" && "…"}
                  {step.status === "done" && " ✅"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 2: Generated Images Preview ── */}
      {showResults && generatedImages.length > 0 && (
        <div className="bg-card shadow-soft rounded-xl p-6 mt-6">
          <h2 className="font-serif text-xl flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center text-xs font-bold">3</span>
            Generated Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {generatedImages.map((img, i) => (
              <div key={i} className={`rounded-xl border-2 overflow-hidden transition-all ${
                img.approved === true ? "border-emerald-500 shadow-md" :
                img.approved === false ? "border-destructive/40 opacity-50" :
                "border-border"
              }`}>
                <div className="aspect-square bg-muted relative">
                  {img.url ? (
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  {img.approved === true && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium mb-2">{img.label}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={img.approved === true ? "default" : "outline"}
                      className={img.approved === true ? "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" : "gap-1.5"}
                      onClick={() => setGeneratedImages(prev =>
                        prev.map((g, j) => j === i ? { ...g, approved: true } : g))}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="outline"
                      className={`gap-1.5 ${img.approved === false ? "text-destructive border-destructive" : ""}`}
                      onClick={() => setGeneratedImages(prev =>
                        prev.map((g, j) => j === i ? { ...g, approved: false } : g))}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Product button */}
          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {generatedImages.filter(g => g.approved === true).length} of {generatedImages.length} images approved
            </p>
            <Button onClick={handleSave} disabled={saving || !generatedImages.some(g => g.approved)}
              className="gap-2 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B85A] shadow-[0_2px_12px_-3px_rgba(201,168,76,0.5)] px-6">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Product
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
