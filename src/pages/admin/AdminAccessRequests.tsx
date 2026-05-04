import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  message: string | null;
  status: string;
  created_at: string;
}

export default function AdminAccessRequests() {
  const { user } = useAuth();
  const [rows, setRows] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_access_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as AccessRequest[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(req: AccessRequest) {
    setBusyId(req.id);
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: req.user_id, role: "editor" });
    if (roleErr && !roleErr.message.includes("duplicate")) {
      toast.error(roleErr.message);
      setBusyId(null);
      return;
    }
    const { error } = await supabase
      .from("admin_access_requests")
      .update({ status: "approved", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success(`Granted editor access to ${req.email}`);
    load();
  }

  async function reject(req: AccessRequest) {
    setBusyId(req.id);
    const { error } = await supabase
      .from("admin_access_requests")
      .update({ status: "rejected", reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq("id", req.id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Request rejected");
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Access Requests</h1>
        <p className="text-sm text-muted-foreground">Users requesting staff access to the admin panel.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-card border border-border p-4 rounded-md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()} · <span className="uppercase">{r.status}</span>
                  </p>
                  {r.message && <p className="text-sm mt-2 whitespace-pre-wrap">{r.message}</p>}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => approve(r)} disabled={busyId === r.id}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(r)} disabled={busyId === r.id}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
