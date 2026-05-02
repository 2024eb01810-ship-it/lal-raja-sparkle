import { useAdminList, useUpsert, useRemove } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, MessageCircle } from "lucide-react";

const STATUSES = ["new", "responded", "closed"];

export default function AdminEnquiries() {
  const { data, isLoading } = useAdminList("enquiries");
  const upsert = useUpsert("enquiries");
  const remove = useRemove("enquiries");
  const { confirm, node } = useConfirm();

  return (
    <div>
      <PageHeader title="Enquiries" description="Product enquiries and contact-form submissions." />
      {isLoading ? <p>Loading…</p> : (
        <div className="space-y-3">
          {(data ?? []).map((e: any) => (
            <div key={e.id} className="bg-card shadow-soft p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{e.name}</p>
                    <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {e.phone && <a href={`tel:${e.phone}`} className="hover:text-gold">{e.phone}</a>}
                    {e.email && <> · <a href={`mailto:${e.email}`} className="hover:text-gold">{e.email}</a></>}
                  </p>
                  <p className="text-sm mt-2 whitespace-pre-line">{e.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Select value={e.status} onValueChange={(v) => upsert.mutate({ ...e, status: v })}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    {e.phone && (
                      <a href={`https://wa.me/${e.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white" aria-label="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(e.id), "Delete this enquiry?")}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!data?.length && <p className="text-muted-foreground text-center py-8">No enquiries yet.</p>}
        </div>
      )}
      {node}
    </div>
  );
}
