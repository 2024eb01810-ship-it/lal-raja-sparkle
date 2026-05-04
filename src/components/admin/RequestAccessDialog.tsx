import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().max(1000).optional(),
});

export function RequestAccessDialog({ trigger }: { trigger: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first, then request access.");
      return;
    }
    const parsed = schema.safeParse({ email, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("admin_access_requests").insert({
      user_id: user.id,
      email: parsed.data.email,
      message: parsed.data.message || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request sent. An admin will review it shortly.");
    setMessage("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request admin access</DialogTitle>
          <DialogDescription>
            We'll notify the site admin with your email. They'll grant you access if approved.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!user && (
            <p className="text-xs text-destructive">
              You need to sign in first so the admin can link the access to your account.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="req-email">Your email</Label>
            <Input id="req-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!user?.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-msg">Message (optional)</Label>
            <Textarea
              id="req-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Tell the admin who you are and why you need access."
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !user} className="w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
