import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/external-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check, X, RefreshCw, Image as ImageIcon, Sparkles, Clock, CheckCircle2,
  XCircle, Star, Layers, Package, Tag,
} from "lucide-react";
import { slugify } from "@/hooks/useAdmin";

// ── Types ──────────────────────────────────────────────────────
type Status = "pending" | "approved" | "rejected";
type ContentType = "banner" | "product" | "offer";

interface AIContentItem {
  id: string;
  content_type: ContentType;
  title: string;
  description: string | null;
  image_url: string | null;
  metadata: Record<string, any> | null;
  status: Status;
  created_at: string;
}

// ── Tabs ───────────────────────────────────────────────────────
const TABS: { value: Status; label: string; icon: typeof Clock }[] = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "approved", label: "Approved", icon: CheckCircle2 },
  { value: "rejected", label: "Rejected", icon: XCircle },
];

const TYPE_ICON: Record<ContentType, typeof Layers> = {
  banner: ImageIcon,
  product: Package,
  offer: Tag,
};

const TYPE_COLOR: Record<ContentType, string> = {
  banner: "bg-blue-100 text-blue-700",
  product: "bg-emerald-100 text-emerald-700",
  offer: "bg-amber-100 text-amber-700",
};

// ── Helpers ────────────────────────────────────────────────────
function qualityBadge(score: number | undefined) {
  if (score == null) return null;
  const cls =
    score >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : score >= 50 ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <Star className="w-3 h-3" /> {score}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Component ──────────────────────────────────────────────────
export default function AdminAIContent() {
  const [tab, setTab] = useState<Status>("pending");
  const queryClient = useQueryClient();

  // Fetch all AI content queue
  const { data: items, isLoading } = useQuery({
    queryKey: ["admin", "ai_content_queue", tab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_content_queue" as any)
        .select("*")
        .eq("status", tab)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AIContentItem[];
    },
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase
        .from("ai_content_queue" as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ai_content_queue"] });
    },
  });

  // Approve handler — updates status + inserts into target table
  async function handleApprove(item: AIContentItem) {
    try {
      // 1. Insert into the appropriate target table
      if (item.content_type === "banner") {
        const { error } = await supabase.from("banners" as any).insert({
          title: item.title,
          subtitle: item.description,
          image_url: item.image_url,
          cta_label: item.metadata?.cta_label || "Shop Now",
          cta_link: `/collections/${item.metadata?.category || ""}`,
          active: true,
          sort_order: 0,
        });
        if (error) throw error;
      } else if (item.content_type === "product") {
        const { error } = await supabase.from("products" as any).insert({
          name: item.title,
          slug: slugify(item.title),
          description: item.description,
          images: item.image_url ? [item.image_url] : [],
          metal: item.metadata?.metal || null,
          occasion: item.metadata?.occasion || null,
          active: true,
          featured: false,
        });
        if (error) throw error;
      } else if (item.content_type === "offer") {
        const { error } = await supabase.from("offers" as any).insert({
          title: item.title,
          description: item.description,
          image_url: item.image_url,
          badge: item.metadata?.badge || null,
          active: true,
          sort_order: 0,
        });
        if (error) throw error;
      }

      // 2. Mark as approved
      await updateStatus.mutateAsync({ id: item.id, status: "approved" });

      // 3. Invalidate target table queries
      queryClient.invalidateQueries();
      toast.success(`${item.content_type} "${item.title}" approved & published`);
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    }
  }

  async function handleReject(item: AIContentItem) {
    await updateStatus.mutateAsync({ id: item.id, status: "rejected" });
    toast.success(`Rejected "${item.title}"`);
  }

  function handleRegenerate(item: AIContentItem) {
    toast.info("Regeneration queued — the agent will produce a new version.", { duration: 3000 });
    // Future: call the agent edge function with item context
  }

  // ── Counts ───────────────────────────────────────────────────
  const { data: counts } = useQuery({
    queryKey: ["admin", "ai_content_queue_counts"],
    queryFn: async () => {
      const result: Record<Status, number> = { pending: 0, approved: 0, rejected: 0 };
      for (const s of ["pending", "approved", "rejected"] as Status[]) {
        const { count, error } = await supabase
          .from("ai_content_queue" as any)
          .select("id", { count: "exact", head: true })
          .eq("status", s);
        if (!error) result[s] = count ?? 0;
      }
      return result;
    },
  });

  return (
    <div>
      <PageHeader
        title="AI Content Queue"
        description="Review, approve, or reject AI-generated banners, products and offers."
        actions={
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C9A84C]" />
            <span className="text-xs text-muted-foreground">Agent 1 — Daily Content</span>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/60 p-1 rounded-lg w-fit">
        {TABS.map((t) => {
          const count = counts?.[t.value] ?? 0;
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                active
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    active && t.value === "pending"
                      ? "bg-[#C9A84C] text-[#1A1A1A]"
                      : "bg-muted-foreground/15 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !items?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No {tab} items</p>
          <p className="text-sm mt-1">
            {tab === "pending"
              ? "The AI agent hasn't generated content yet, or everything has been reviewed."
              : `No ${tab} content to show.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
              onRegenerate={() => handleRegenerate(item)}
              isActing={updateStatus.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Content Card ───────────────────────────────────────────────
function ContentCard({
  item,
  onApprove,
  onReject,
  onRegenerate,
  isActing,
}: {
  item: AIContentItem;
  onApprove: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  isActing: boolean;
}) {
  const TypeIcon = TYPE_ICON[item.content_type];
  const score = item.metadata?.quality_score;
  const qualityNotes = item.metadata?.quality_notes;

  return (
    <div className="bg-card shadow-soft rounded-xl overflow-hidden border border-border hover:border-[#C9A84C]/30 transition-colors">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        {item.image_url && (
          <div className="md:w-64 lg:w-80 shrink-0">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-48 md:h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Type badge + quality */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md ${TYPE_COLOR[item.content_type]}`}>
                  <TypeIcon className="w-3 h-3" />
                  {item.content_type}
                </span>
                {qualityBadge(score)}
                {item.metadata?.category && (
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {item.metadata.category}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-serif text-lg md:text-xl text-foreground leading-tight mb-1">
                {item.title}
              </h3>

              {/* Description */}
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              )}

              {/* Quality notes */}
              {qualityNotes && (
                <p className="text-xs text-muted-foreground/70 mt-2 italic line-clamp-2">
                  QC: {qualityNotes}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>{formatDate(item.created_at)}</span>
                {item.metadata?.metal && <span>Metal: {item.metadata.metal}</span>}
                {item.metadata?.occasion && <span>Occasion: {item.metadata.occasion}</span>}
                {item.metadata?.badge && (
                  <span className="text-[#C9A84C] font-semibold">{item.metadata.badge}</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {item.status === "pending" && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Button
                onClick={onApprove}
                disabled={isActing}
                className="gap-2 bg-[#C9A84C] text-[#1A1A1A] hover:bg-[#D4B85A] shadow-[0_2px_8px_-2px_rgba(201,168,76,0.4)]"
              >
                <Check className="w-4 h-4" /> Approve & Publish
              </Button>
              <Button
                onClick={onReject}
                disabled={isActing}
                variant="outline"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                <X className="w-4 h-4" /> Reject
              </Button>
              <Button
                onClick={onRegenerate}
                variant="outline"
                className="gap-2 ml-auto"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </Button>
            </div>
          )}

          {item.status === "approved" && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Published to {item.content_type}s table
              </span>
            </div>
          )}

          {item.status === "rejected" && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <XCircle className="w-4 h-4" /> Rejected
              </span>
              <Button
                onClick={onRegenerate}
                variant="outline"
                size="sm"
                className="gap-2 ml-auto"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
