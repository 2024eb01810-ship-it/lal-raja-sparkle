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
import { Plus, Pencil, Trash2, Sparkles, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

const empty = { id: undefined as string | undefined, image_url: "", title: "", subtitle: "", cta_label: "", cta_link: "", sort_order: 0, active: true };

interface GenBanner {
  id?: string;
  image_url: string;
  title: string;
  category: string;
  festival: string;
  quality_score: number;
  passed: boolean;
}

export default function AdminBanners() {
  const { data, isLoading } = useAdminList("banners", "sort_order", true);
  const upsert = useUpsert("banners");
  const remove = useRemove("banners");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<GenBanner | null>(null);
  const [approving, setApproving] = useState(false);

  async function save() {
    if (!editing) return;
    const p: any = { ...editing, sort_order: Number(editing.sort_order) || 0 };
    if (!p.id) delete p.id;
    await upsert.mutateAsync(p);
    setEditing(null);
  }

  async function handleGenerate() {
    setGenerating(true);
    setPreview(null);
    try {
      const res = await fetch("https://clwjecqqmjbjcpivvgmd.supabase.co/functions/v1/generate-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text() || "Generation failed");
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Generation failed");
      setPreview(result.banner);
      toast.success("Banner generated! Review the preview.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to generate banner");
    } finally {
      setGenerating(false);
    }
  }

  async function handleApprove() {
    if (!preview) return;
    setApproving(true);
    try {
      await upsert.mutateAsync({
        title: preview.title,
        subtitle: "Sacred jewelry for eternal love and devotion",
        image_url: preview.image_url,
        cta_label: "Shop Now",
        cta_link: `/collections/${preview.category}`,
        active: true,
        sort_order: 0,
      });
      setPreview(null);
      toast.success("Banner approved & published!");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save banner");
    } finally {
      setApproving(false);
    }
  }

  const scoreColor = (s: number) =>
    s >= 80 ? "bg-green-500/15 text-green-600 border-green-500/30"
    : s >= 60 ? "bg-yellow-500/15 text-yellow-600 border-yellow-500/30"
    : "bg-red-500/15 text-red-600 border-red-500/30";

  return (
    <div>
      <PageHeader title="Hero Banners" description="Slides shown at the top of the home page."
        actions={
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={generating} className="gap-2"
              style={{ background: "linear-gradient(135deg,#D4A853,#E8C36A,#B8922E)", color: "#1a1207", border: "none", fontWeight: 600, boxShadow: "0 2px 12px rgba(212,168,83,0.35)" }}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating…" : "✨ Generate Banner"}
            </Button>
            <Button onClick={() => setEditing({ ...empty })} className="gap-2"><Plus className="w-4 h-4" /> New</Button>
          </div>
        } />

      {generating && (
        <div className="mb-6 p-8 bg-card border border-gold/30 rounded-lg shadow-soft">
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
              <Sparkles className="w-7 h-7 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="font-serif text-xl">Generating banner…</p>
              <p className="text-sm text-muted-foreground mt-2">AI is searching festivals, selecting models & creating your banner.<br/>This takes <strong>30–60 seconds</strong>.</p>
            </div>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ background: "linear-gradient(90deg,#D4A853,#E8C36A,#D4A853)", width: "100%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!preview} onOpenChange={(v) => { if (!v) setPreview(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif text-xl">
                <Sparkles className="w-5 h-5 text-gold" /> AI-Generated Banner Preview
              </DialogTitle>
            </DialogHeader>
          </div>
          {preview && (
            <div>
              {preview.image_url && (
                <div className="mt-4 px-6">
                  <img src={preview.image_url} className="w-full rounded-lg shadow-md" alt="Generated banner" style={{ maxHeight: 340, objectFit: "cover" }} />
                </div>
              )}
              <div className="px-6 pt-5 pb-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg">{preview.title}</h3>
                  <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${scoreColor(preview.quality_score)}`}>
                    Quality: {preview.quality_score}/100
                  </span>
                </div>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span className="bg-gold/10 text-gold px-2 py-0.5 rounded text-xs">🎉 {preview.festival}</span>
                  <span className="bg-muted px-2 py-0.5 rounded text-xs">📂 {preview.category}</span>
                </div>
                <p className="text-sm text-muted-foreground">Subtitle: <em>"Sacred jewelry for eternal love and devotion"</em></p>
                <p className="text-sm text-muted-foreground">CTA: <strong>Shop Now</strong> → /collections/{preview.category}</p>
              </div>
              <div className="flex gap-3 justify-end px-6 py-5 border-t mt-2">
                <Button variant="outline" onClick={() => setPreview(null)} className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4" /> ❌ Reject
                </Button>
                <Button onClick={handleApprove} disabled={approving} className="gap-2"
                  style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white", border: "none", fontWeight: 600 }}>
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} ✅ Approve & Publish
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
