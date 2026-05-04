import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/external-client";

type Role = "admin" | "editor";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: Role[];
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  roles: [],
  isStaff: false,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRoles(uid: string) {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      if (cancelled) return;
      if (error) {
        console.error("[useAuth] failed to load roles:", error);
        setRoles([]);
      } else {
        setRoles((data ?? []).map((r: any) => r.role as Role));
      }
      setLoading(false);
    }

    function applySession(sess: Session | null) {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer to avoid Supabase deadlock inside the listener callback.
        setTimeout(() => loadRoles(sess.user!.id), 0);
      } else {
        setRoles([]);
        setLoading(false);
      }
    }

    // 1) Subscribe FIRST so we never miss an event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      // Re-enter loading until the next role fetch completes so guards don't
      // make a decision on stale roles from a prior account.
      setLoading(true);
      applySession(sess);
    });

    // 2) Then read the existing session.
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      applySession(sess);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
  }

  const isAdmin = roles.includes("admin");
  const isStaff = isAdmin || roles.includes("editor");

  return (
    <Ctx.Provider value={{ user, session, roles, isStaff, isAdmin, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
