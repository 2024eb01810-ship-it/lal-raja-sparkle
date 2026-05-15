import { useState, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/external-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { slugify } from "@/hooks/useAdmin";
import {
  Upload, Sparkles, Check, X, Loader2, ImageIcon,
  CheckCircle2, Circle, Save, FolderUp, IndianRupee
} from "lucide-react";

// ── localStorage helpers for toggle persistence ──
const readToggle = (key: string, defaultVal = true): boolean => {
  try { const v = localStorage.getItem(key); return v === null ? defaultVal : v === "true"; } catch { return defaultVal; }
};
const writeToggle = (key: string, val: boolean) => {
  try { localStorage.setItem(key, String(val)); } catch { /* ignore */ }
};

type ProcessingStatus = "waiting" | "analyzing" | "generating" | "saving" | "done" | "error" | "approved" | "rejected";

interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: ProcessingStatus;
  progressMessage: string;
  
  // Results
  productId?: string;
  rawImageUrl?: string;
  jewelryType?: string;
  metalType?: string;
  designStyle?: string;
  productName?: string;
  description?: string;
  jewelryDescription?: string;
  categorySlug?: string;
  priceMin?: string | number;
  priceMax?: string | number;
  stones?: string;
  occasion?: string;
  
  // Generated Images
  whiteBgUrl?: string | null;
  darkBgUrl?: string | null;
  modelUrl?: string | null;
}

export default function BulkUpload() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // ── Image generation toggle state (localStorage-backed, shared with single upload) ──
  const [genModel, setGenModel] = useState(() => readToggle("generate_model_image", true));
  const [genWhite, setGenWhite] = useState(() => readToggle("generate_white_bg", true));
  const [genDark,  setGenDark]  = useState(() => readToggle("generate_dark_bg",  true));

  const toggleGenModel = (v: boolean) => { setGenModel(v); writeToggle("generate_model_image", v); };
  const toggleGenWhite = (v: boolean) => { setGenWhite(v); writeToggle("generate_white_bg", v); };
  const toggleGenDark  = (v: boolean) => { setGenDark(v);  writeToggle("generate_dark_bg",  v); };

  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);

  // ── Draft persistence helpers ──
  const DRAFT_KEY = "lalraja_bulk_upload_draft";

  const saveDraftField = (itemId: string, updates: Partial<FileItem>) => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const all = raw ? JSON.parse(raw) : {};
      all[itemId] = { ...(all[itemId] ?? {}), ...updates };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  };

  const removeDraftItem = (itemId: string) => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const all = JSON.parse(raw);
      delete all[itemId];
      localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  };

  // Restore text-field drafts into already-processed file items
  const restoreDrafts = (fileList: FileItem[]) => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return fileList;
      const all = JSON.parse(raw);
      return fileList.map(f => all[f.id] ? { ...f, ...all[f.id] } : f);
    } catch {
      return fileList;
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories" as any).select("*");
      return data ?? [];
    },
  });

  // ── Drag & Drop & File Selection ──
  const processSelectedFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles: FileItem[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 50 MB)`);
        continue;
      }
      
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "waiting",
        progressMessage: "Waiting to process...",
      });
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} images added`);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    processSelectedFiles(e.dataTransfer.files);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processSelectedFiles(e.target.files);
    if (e.target) e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<FileItem>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    // Persist editable text fields to localStorage
    const textFields: (keyof FileItem)[] = [
      "productName", "description", "categorySlug", "metalType",
      "designStyle", "stones", "priceMin", "priceMax", "occasion"
    ];
    const textUpdates = Object.fromEntries(
      Object.entries(updates).filter(([k]) => textFields.includes(k as keyof FileItem))
    );
    if (Object.keys(textUpdates).length > 0) saveDraftField(id, textUpdates);
  };

  // ── Processing Pipeline ──
  const startProcessing = async () => {
    const pendingFiles = files.filter(f => f.status === "waiting" || f.status === "error");
    if (pendingFiles.length === 0) {
      toast.info("No new files to process.");
      return;
    }

    setProcessing(true);

    for (const item of pendingFiles) {
      try {
        updateFile(item.id, { status: "analyzing", progressMessage: "Uploading raw image..." });
        
        // 1. Upload to Supabase Storage (product-images bucket)
        const safeName = item.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const path = `raw/${crypto.randomUUID()}_${safeName}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, item.file, {
          cacheControl: "3600",
          upsert: false,
        });

        if (upErr) throw new Error("Upload failed: " + upErr.message);

        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        const rawImageUrl = urlData.publicUrl;
        
        updateFile(item.id, { rawImageUrl, progressMessage: "Analyzing with Claude..." });

        // 2. Call analyze-jewelry
        const { data: analyzeRes, error: analyzeErr } = await supabase.functions.invoke("analyze-jewelry", {
          body: { image_url: rawImageUrl }
        });

        if (analyzeErr || !analyzeRes?.success) {
          throw new Error("Analysis failed: " + (analyzeErr?.message || analyzeRes?.error));
        }

        const analysis = analyzeRes.analysis;
        updateFile(item.id, { 
          ...analysis,
          productName: analysis.product_name,
          categorySlug: analysis.category_slug,
          metalType: analysis.metal,
          designStyle: analysis.design_style,
          jewelryDescription: analysis.jewelry_description,
          priceMin: analysis.price_min,
          priceMax: analysis.price_max,
          stones: analysis.stones,
          occasion: analysis.occasion,
          status: "generating", 
          progressMessage: "Generating AI backgrounds & model shots..." 
        });

        // 3. Call generate-product-images
        const { data: genRes, error: genErr } = await supabase.functions.invoke("generate-product-images", {
          body: {
            raw_image_url: rawImageUrl,
            product_name: analysis.product_name,
            jewelry_description: analysis.jewelry_description,
            category_slug: analysis.category_slug,
            generate_model: genModel,
            generate_white_bg: genWhite,
            generate_dark_bg: genDark,
          }
        });

        if (genErr || !genRes?.success) {
          throw new Error("Generation failed: " + (genErr?.message || genRes?.error));
        }

        const images = genRes.images;
        
        updateFile(item.id, {
          whiteBgUrl: images.white_bg,
          darkBgUrl: images.dark_bg,
          modelUrl: images.model,
          status: "saving",
          progressMessage: "Saving to database as draft..."
        });

        // 4. Save to products table as draft
        const matchedCategory = categories?.find(c => c.slug === analysis.category_slug);
        
        const uploadedUrls: string[] = [];
        if (images.white_bg) uploadedUrls.push(images.white_bg);
        if (images.dark_bg) uploadedUrls.push(images.dark_bg);
        if (images.model) uploadedUrls.push(images.model);

        const payload: any = {
          name: analysis.product_name || "Untitled Product",
          slug: slugify(analysis.product_name || "Untitled Product") + "-" + Math.floor(Math.random() * 10000),
          description: analysis.description || null,
          category_id: matchedCategory?.id || null,
          metal: analysis.metal || null,
          price_min: analysis.price_min || null,
          price_max: analysis.price_max || null,
          stones: analysis.stones || null,
          occasion: analysis.occasion || null,
          images: uploadedUrls,
          // raw_image_url doesn't exist on products table schema directly, we use images array
          active: false, 
          featured: false,
        };

        const { data: productData, error: insertErr } = await supabase
          .from("products" as any)
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw new Error("Failed to save draft: " + insertErr.message);

        updateFile(item.id, {
          status: "done",
          progressMessage: "Processing complete. Ready for review.",
          productId: productData.id
        });

      } catch (err: any) {
        console.error(`Error processing file ${item.id}:`, err);
        updateFile(item.id, { status: "error", progressMessage: err.message || "An error occurred" });
      }
    }

    setProcessing(false);
    toast.success("Bulk processing finished.");
  };

  // ── Approval & Saving ──
  const handleApprove = async (item: FileItem) => {
    if (!item.productId) return;
    
    try {
      const matchedCategory = categories?.find(c => c.slug === item.categorySlug);

      const payload = {
        name: item.productName,
        description: item.description,
        category_id: matchedCategory?.id || null,
        metal: item.metalType,
        price_min: item.priceMin ? Number(item.priceMin) : null,
        price_max: item.priceMax ? Number(item.priceMax) : null,
        stones: item.stones,
        occasion: item.occasion,
        active: true // Product goes live
      };

      const { error } = await supabase
        .from("products" as any)
        .update(payload)
        .eq("id", item.productId);

      if (error) throw error;
      
      updateFile(item.id, { status: "approved", progressMessage: "Approved and live!" });
      removeDraftItem(item.id); // clear draft for this item
      toast.success(`${item.productName} is now live!`);
      queryClient.invalidateQueries();

    } catch (err: any) {
      console.error("Approve error", err);
      toast.error(`Failed to approve ${item.productName}`);
    }
  };

  const handleReject = async (item: FileItem) => {
    if (!item.productId) return;

    try {
      const { error } = await supabase
        .from("products" as any)
        .delete()
        .eq("id", item.productId);

      if (error) throw error;
      
      updateFile(item.id, { status: "rejected", progressMessage: "Rejected and deleted" });
      removeDraftItem(item.id); // clear draft for this item
      toast.success(`${item.productName} was rejected and deleted.`);

    } catch (err: any) {
      console.error("Reject error", err);
      toast.error(`Failed to reject ${item.productName}`);
    }
  };

  const completedCount = files.filter(f => ["done", "error", "approved", "rejected"].includes(f.status)).length;
  const itemsForReview = files.filter(f => f.status === "done");

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <PageHeader
        title="Bulk Upload"
        description="Upload multiple jewelry photos at once. AI will automatically analyze, categorise, and generate professional backgrounds for all of them."
        actions={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-xs font-medium text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-1 rounded-full">AI Pipeline</span>
          </div>
        }
      />

      {/* ── Image Generation Settings ── */}
      <div className="bg-card shadow-soft rounded-xl p-6">
        <h2 className="font-serif text-lg mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C9A84C]" />
          Image Generation Settings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Model Image Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1 min-w-0 mr-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-medium">Generate Model Images</span>
                {!genModel && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    <IndianRupee className="w-2.5 h-2.5" />~₹8 saved
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Shows jewelry on brand model</p>
            </div>
            <Switch
              id="bulk-toggle-model"
              checked={genModel}
              onCheckedChange={toggleGenModel}
              className="data-[state=checked]:bg-[#C9A84C] shrink-0"
            />
          </div>

          {/* White Background Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1 min-w-0 mr-3">
              <span className="text-sm font-medium">Generate White Background</span>
              <p className="text-xs text-muted-foreground mt-0.5">Clean white product shot</p>
            </div>
            <Switch
              id="bulk-toggle-white-bg"
              checked={genWhite}
              onCheckedChange={toggleGenWhite}
              className="data-[state=checked]:bg-[#C9A84C] shrink-0"
            />
          </div>

          {/* Dark Background Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex-1 min-w-0 mr-3">
              <span className="text-sm font-medium">Generate Dark Background</span>
              <p className="text-xs text-muted-foreground mt-0.5">Luxury dark background shot</p>
            </div>
            <Switch
              id="bulk-toggle-dark-bg"
              checked={genDark}
              onCheckedChange={toggleGenDark}
              className="data-[state=checked]:bg-[#C9A84C] shrink-0"
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Upload Zone ── */}
      <div className="bg-card shadow-soft rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center text-xs font-bold">1</span>
            Upload Zone
          </h2>
          <div className="text-sm font-medium text-muted-foreground">
            {files.length} images selected
          </div>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            dragOver ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-border hover:border-[#C9A84C]/40"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Drag & Drop Jewelry Photos</h3>
          <p className="text-sm text-muted-foreground mb-6">Supports JPG, PNG, WEBP up to 50MB per file</p>
          
          <div className="flex items-center justify-center gap-4">
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Select Files
            </Button>
            <Button onClick={() => folderInputRef.current?.click()} variant="outline" className="gap-2">
              <FolderUp className="w-4 h-4" /> Select Folder
            </Button>
          </div>
          
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          <input ref={folderInputRef} type="file" accept="image/*" webkitdirectory="" directory="" onChange={handleFileChange} className="hidden" />
        </div>

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Selected Files ({files.length})</h3>
            <div className="flex flex-wrap gap-4 max-h-[300px] overflow-y-auto p-2 border rounded-lg bg-muted/30">
              {files.map((file) => (
                <div key={file.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border bg-background shadow-sm">
                  <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => removeFile(file.id)} className="text-white hover:text-red-400 p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {file.status !== "waiting" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                      {file.status}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={startProcessing} disabled={processing || files.every(f => ["done", "approved", "rejected"].includes(f.status))}
                className="gap-2 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B85A] shadow-[0_2px_12px_-3px_rgba(201,168,76,0.5)] px-8 py-4 h-auto text-base font-semibold">
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {processing ? "Processing Pipeline..." : "Start AI Processing"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Processing Queue ── */}
      {(processing || completedCount > 0) && (
        <div className="bg-card shadow-soft rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center text-xs font-bold">2</span>
              Processing Queue
            </h2>
            <div className="text-sm font-medium">
              {completedCount} / {files.length} completed
            </div>
          </div>

          <div className="space-y-3">
            {files.map((item) => (
              <div key={item.id} className={`flex items-center gap-4 p-3 border rounded-lg bg-background ${item.status === 'rejected' ? 'opacity-50' : ''}`}>
                <img src={item.previewUrl} alt="thumbnail" className="w-12 h-12 rounded object-cover border" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate text-sm">{item.file.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.status === "done" ? "bg-blue-100 text-blue-700" :
                      item.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                      item.status === "rejected" || item.status === "error" ? "bg-red-100 text-red-700" :
                      item.status === "waiting" ? "bg-gray-100 text-gray-700" :
                      "bg-[#C9A84C]/20 text-[#9A7D2C]"
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs flex items-center gap-2">
                    {["analyzing", "generating", "saving"].includes(item.status) ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#C9A84C]" />
                    ) : ["done", "approved"].includes(item.status) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : ["error", "rejected"].includes(item.status) ? (
                      <X className="w-3.5 h-3.5 text-red-600" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground/40" />
                    )}
                    <span className="text-muted-foreground truncate">{item.progressMessage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3: Results & Approval ── */}
      {itemsForReview.length > 0 && (
        <div className="bg-card shadow-soft rounded-xl p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="font-serif text-xl flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#C9A84C] text-[#1A1A1A] flex items-center justify-center text-xs font-bold">3</span>
              Results & Approval
            </h2>
            <div className="text-sm font-medium text-muted-foreground">
              {itemsForReview.length} products waiting for review
            </div>
          </div>

          <div className="space-y-8">
            {itemsForReview.map((item) => (
              <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 rounded-xl border-2 border-border transition-all">
                {/* Images Column */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  <div className="col-span-2 aspect-video bg-muted rounded-lg overflow-hidden border">
                    {item.modelUrl ? <img src={item.modelUrl} alt="Model" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30"/></div>}
                  </div>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                    {item.whiteBgUrl ? <img src={item.whiteBgUrl} alt="White BG" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground/30"/></div>}
                  </div>
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden border">
                    {item.darkBgUrl ? <img src={item.darkBgUrl} alt="Dark BG" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-muted-foreground/30"/></div>}
                  </div>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <Label>Product Name</Label>
                        <Input value={item.productName || ""} onChange={(e) => updateFile(item.id, { productName: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Category Slug</Label>
                        <Input value={item.categorySlug || ""} onChange={(e) => updateFile(item.id, { categorySlug: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Metal</Label>
                        <Input value={item.metalType || ""} onChange={(e) => updateFile(item.id, { metalType: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Style</Label>
                        <Input value={item.designStyle || ""} onChange={(e) => updateFile(item.id, { designStyle: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Stones</Label>
                        <Input value={item.stones || ""} onChange={(e) => updateFile(item.id, { stones: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Price Min (₹)</Label>
                        <Input type="number" value={item.priceMin || ""} onChange={(e) => updateFile(item.id, { priceMin: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Price Max (₹)</Label>
                        <Input type="number" value={item.priceMax || ""} onChange={(e) => updateFile(item.id, { priceMax: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea value={item.description || ""} onChange={(e) => updateFile(item.id, { description: e.target.value })} rows={3} />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline"
                      className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(item)}>
                      <X className="w-4 h-4" /> Reject & Delete
                    </Button>
                    <Button variant="default"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={() => handleApprove(item)}>
                      <Check className="w-4 h-4" /> Approve (Go Live)
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
