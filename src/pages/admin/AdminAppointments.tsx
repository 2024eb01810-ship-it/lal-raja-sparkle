import { useAdminList, useUpsert, useRemove } from "@/hooks/useAdmin";
import { PageHeader } from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const STATUSES = ["new", "contacted", "scheduled", "completed", "cancelled"];

export default function AdminAppointments() {
  const { data, isLoading } = useAdminList("appointments");
  const upsert = useUpsert("appointments");
  const remove = useRemove("appointments");
  const { confirm, node } = useConfirm();

  return (
    <div>
      <PageHeader title="Appointments" description="Bridal and consultation bookings from the website." />
      {isLoading ? <p>Loading…</p> : (
        <div className="bg-card shadow-soft overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider">
              <tr><th className="p-3">When</th><th className="p-3">Name</th><th className="p-3">Phone</th><th className="p-3">Type</th><th className="p-3">Date</th><th className="p-3">Notes</th><th className="p-3">Status</th><th /></tr>
            </thead>
            <tbody>
              {(data ?? []).map((a: any) => (
                <tr key={a.id} className="border-t border-border align-top">
                  <td className="p-3 text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{a.name}{a.email && <div className="text-xs text-muted-foreground">{a.email}</div>}</td>
                  <td className="p-3"><a className="hover:text-gold" href={`tel:${a.phone}`}>{a.phone}</a></td>
                  <td className="p-3 capitalize">{a.appointment_type}</td>
                  <td className="p-3">{a.preferred_date ? new Date(a.preferred_date).toLocaleDateString() : "—"}</td>
                  <td className="p-3 text-muted-foreground max-w-[240px]"><div className="line-clamp-2">{a.notes ?? "—"}</div></td>
                  <td className="p-3">
                    <Select value={a.status} onValueChange={(v) => upsert.mutate({ ...a, status: v })}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => confirm(() => remove.mutate(a.id), "Delete this appointment?")}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {!data?.length && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No appointments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {node}
    </div>
  );
}
