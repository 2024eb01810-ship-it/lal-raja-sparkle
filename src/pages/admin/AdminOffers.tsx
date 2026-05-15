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
import { Plus, Pencil, Trash2, Sparkles, Loader2, Check, X, Copy } from "lucide-react";
import { toast } from "sonner";

const empty = { id: undefined as string | undefined, title: "", description: "", image_url: "", badge: "", valid_until: "", sort_order: 0, active: true };

interface GenOffer {
  id?: string;
  title: string;
  description: string;
  badge: string;
  valid_until: string;
  festival_context: string;
  instagram_caption: string;
}

export default function AdminOffers() {
  const { data, isLoading } = useAdminList("offers", "sort_order", true);
  const upsert = useUpsert("offers");
  const remove = useRemove("offers");
  const { confirm, node } = useConfirm();
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<GenOffer | null>(null);
  const [approving, setApproving] = useState(false);

  async function save() {
    if (!editing) return;
    const p: any = { ...editing, sort_order: Number(editing.sort_order) || 0, valid_until: editing.valid_until || null };
    if (!p.id) delete p.id;
    await upsert.mutateAsync(p);
    setEditing(null);
  }

  async function handleGenerate() {
    setGenerating(true);
    setPreview(null);
    try {
      const res = await fetch("https://clwjecqqmjbjcpivvgmd.supabase.co/functions/v1/generate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(await res.text() || "Generation failed");
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Generation failed");
      setPreview(result.offer);
      toast.success("Offer generated! Review the preview.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to generate offer");
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
        description: preview.description,
        badge: preview.badge,
        valid_until: preview.valid_until,
        active: true,
        sort_order: 0,
      });
      setPreview(null);
      toast.success("Offer approved & published!");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save offer");
    } finally {
      setApproving(false);
    }
  }

  function copyCaption() {
    if (!preview?.instagram_caption) return;
    navigator.clipboard.writeText(preview.instagram_caption);
    toast.success("Instagram caption copied!");
  }

  return (
    <div>
      <PageHeader title="Offers & Promotions"
        actions={
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={generating} className="gap-2"
              style={{ background: "linear-gradient(135deg,#D4A853,#E8C36A,#B8922E)", color: "#1a1207", border: "none", fontWeight: 600, boxShadow: "0 2px 12px rgba(212,168,83,0.35)" }}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating…" : "✨ Generate Offer"}
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
              <p className="font-serif text-xl">Generating offer…</p>
              <p className="text-sm text-muted-foreground mt-2">AI is researching upcoming festivals and crafting a compelling offer.<br/>This takes <strong>15–30 seconds</strong>.</p>
            </div>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full animate-pulse" style={{ background: "linear-gradient(90deg,#D4A853,#E8C36A,#D4A853)", width: "100%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!preview} onOpenChange={(v) => { if (!v) setPreview(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif text-xl">
                <Sparkles className="w-5 h-5 text-gold" /> AI-Generated Offer Preview
              </DialogTitle>
            </DialogHeader>
          </div>
          {preview && (
            <div className="px-6 pt-5 space-y-4">
              {preview.badge && (
                <span className="inline-block bg-gold/15 text-gold text-xs uppercase tracking-wider px-3 py-1 rounded-full font-semibold">
                  {preview.badge}
                </span>
              )}
              <h3 className="font-serif text-2xl">{preview.title}</h3>
              <p className="text-muted-foreground">{preview.description}</p>
              <div className="flex gap-3 text-sm">
                <span className="bg-gold/10 text-gold px-2 py-0.5 rounded text-xs">🎉 {preview.festival_context}</span>
                {preview.valid_until && (
                  <span className="bg-muted px-2 py-0.5 rounded text-xs">
                    📅 Valid till {new Date(preview.valid_until).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Instagram Caption */}
              {preview.instagram_caption && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">📸 Instagram Caption</span>
                    <Button variant="ghost" size="sm" onClick={copyCaption} className="gap-1.5 text-xs h-7">
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{preview.instagram_caption}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end py-5 border-t">
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
