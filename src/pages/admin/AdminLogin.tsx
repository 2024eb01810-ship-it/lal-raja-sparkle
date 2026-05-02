import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Seo } from "@/components/common/Seo";
import logo from "@/assets/logo.png";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { from?: string } };
  const { user, isStaff, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user && isStaff) {
      navigate(state?.from ?? "/admin", { replace: true });
    }
  }, [authLoading, user, isStaff, navigate, state]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign-in failed");
      return;
    }
    toast.success("Welcome back");
  }

  return (
    <>
      <Seo title="Admin — Lal Raja" description="Staff sign-in" />
      <div className="min-h-screen flex items-center justify-center bg-secondary/40 px-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm bg-card p-8 shadow-luxury">
          <div className="text-center mb-6">
            <img src={logo} alt="Lal Raja" className="h-14 mx-auto mb-3" />
            <h1 className="font-serif text-2xl">Staff Sign-in</h1>
            <p className="text-xs text-muted-foreground mt-1">Authorised personnel only</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </Button>
            {user && !isStaff && (
              <p className="text-xs text-destructive text-center">
                You are signed in but have no staff role. Ask an admin to grant you access.
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
