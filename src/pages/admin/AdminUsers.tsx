import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/external-client";
import { PageHeader } from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type Role = "admin" | "editor";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const { confirm, node } = useConfirm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users-with-roles"],
    queryFn: async () => {
      const [{ data: profiles, error: pe }, { data: roles, error: re }] = await Promise.all([
        supabase.from("profiles").select("id, email, full_name, created_at"),
        supabase.from("user_roles").select("id, user_id, role"),
      ]);
      if (pe) throw pe;
      if (re) throw re;
      return (profiles ?? []).map((p: any) => ({
        ...p,
        roles: (roles ?? []).filter((r: any) => r.user_id === p.id),
      }));
    },
  });

  const grantRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users-with-roles"] }); toast.success("Role granted"); },
    onError: (e: any) => toast.error(e.message),
  });

  const revokeRole = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "users-with-roles"] }); toast.success("Role revoked"); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Grant admin or editor access. New staff sign up via the link you share, then you assign their role here."
      />
      <div className="bg-gold/10 border border-gold/30 px-4 py-3 mb-6 text-sm">
        Public sign-ups are <strong>disabled</strong>. To invite a new staff member, create their account from
        Lovable Cloud → Users → Add user, then assign a role below.
      </div>

      {isLoading ? <p>Loading…</p> : (
        <div className="bg-card shadow-soft overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider">
              <tr><th className="p-3">User</th><th className="p-3">Roles</th><th className="p-3">Add role</th><th /></tr>
            </thead>
            <tbody>
              {(data ?? []).map((u: any) => (
                <tr key={u.id} className="border-t border-border align-top">
                  <td className="p-3">
                    <p className="font-medium">{u.full_name || u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.id === me?.id && <span className="text-[10px] uppercase tracking-wider text-gold">You</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      {u.roles.map((r: any) => (
                        <span key={r.id} className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-xs rounded">
                          <ShieldCheck className="w-3 h-3" /> {r.role}
                          <button onClick={() => confirm(() => revokeRole.mutate(r.id), `Revoke ${r.role}?`)} className="ml-1 text-destructive">×</button>
                        </span>
                      ))}
                      {!u.roles.length && <span className="text-xs text-muted-foreground">No roles</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <AddRole userId={u.id} existing={u.roles.map((r: any) => r.role)} onGrant={(role) => grantRole.mutate({ userId: u.id, role })} />
                  </td>
                  <td />
                </tr>
              ))}
              {!data?.length && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {node}
    </div>
  );
}

function AddRole({ userId: _u, existing, onGrant }: { userId: string; existing: string[]; onGrant: (r: Role) => void }) {
  const [val, setVal] = useState<Role | "">("");
  const available: Role[] = (["admin", "editor"] as Role[]).filter((r) => !existing.includes(r));
  if (!available.length) return <span className="text-xs text-muted-foreground">All roles assigned</span>;
  return (
    <div className="flex gap-2">
      <Select value={val} onValueChange={(v) => setVal(v as Role)}>
        <SelectTrigger className="w-[130px]"><SelectValue placeholder="Role…" /></SelectTrigger>
        <SelectContent>{available.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
      </Select>
      <Button size="sm" disabled={!val} onClick={() => { onGrant(val as Role); setVal(""); }}>Grant</Button>
    </div>
  );
}
