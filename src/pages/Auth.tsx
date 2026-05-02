import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/integrations/firebase/client";
import logo from "@/assets/logo.png";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(254);
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password too long" });
const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Enter your name" })
  .max(80, { message: "Name too long" });
const otpSchema = z.string().trim().regex(/^\d{6}$/, { message: "Enter the 6-digit code" });

type Mode = "signin" | "signup";
type Step = "form" | "otp";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Already logged in → home
  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("form");
    setOtp("");
  };

  const signIn = async () => {
    const e = emailSchema.safeParse(email);
    const p = passwordSchema.safeParse(password);
    if (!e.success) return toast.error(e.error.issues[0].message);
    if (!p.success) return toast.error(p.error.issues[0].message);

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: e.data,
      password: p.data,
    });
    setBusy(false);

    if (error) {
      if (/email.*not.*confirm/i.test(error.message)) {
        toast.error("Please verify your email first. We'll send a new code.");
        // auto-trigger OTP so they can verify now
        sendOtp();
      } else {
        toast.error(error.message || "Could not sign in");
      }
      return;
    }
    trackEvent("login", { method: "email" });
    toast.success("Welcome back!");
    navigate("/", { replace: true });
  };

  const sendOtp = async () => {
    const e = emailSchema.safeParse(email);
    if (!e.success) return toast.error(e.error.issues[0].message);
    setBusy(true);
    // shouldCreateUser:false because the account already exists (created in signUp)
    const { error } = await supabase.auth.signInWithOtp({
      email: e.data,
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Could not send the code");
      return;
    }
    toast.success(`Code sent to ${e.data}`);
    setStep("otp");
    setResendIn(30);
  };

  const signUp = async () => {
    const n = nameSchema.safeParse(fullName);
    const e = emailSchema.safeParse(email);
    const p = passwordSchema.safeParse(password);
    if (!n.success) return toast.error(n.error.issues[0].message);
    if (!e.success) return toast.error(e.error.issues[0].message);
    if (!p.success) return toast.error(p.error.issues[0].message);

    setBusy(true);
    // Create the account with password. emailRedirectTo is required by the
    // SDK but the user will use the OTP code, not the link.
    const { error } = await supabase.auth.signUp({
      email: e.data,
      password: p.data,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: n.data },
      },
    });
    setBusy(false);

    if (error) {
      // Existing account — they should sign in instead
      if (/already.*registered|user.*exists/i.test(error.message)) {
        toast.error("This email is already registered. Try signing in.");
        switchMode("signin");
        return;
      }
      toast.error(error.message || "Could not create account");
      return;
    }
    trackEvent("sign_up", { method: "email" });
    // Now send the 6-digit OTP for verification
    await sendOtp();
  };

  const verifyOtp = async () => {
    const e = emailSchema.safeParse(email);
    const code = otpSchema.safeParse(otp);
    if (!e.success) return toast.error(e.error.issues[0].message);
    if (!code.success) return toast.error(code.error.issues[0].message);

    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: e.data,
      token: code.data,
      type: "email",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Invalid or expired code");
      return;
    }
    trackEvent("login", { method: "email_otp" });
    toast.success("Verified! Welcome to Lal Raja.");
    navigate("/", { replace: true });
  };

  const forgotPassword = async () => {
    const e = emailSchema.safeParse(email);
    if (!e.success) return toast.error("Enter your email above first, then tap 'Forgot password?'");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(e.data, {
      redirectTo: `${window.location.origin}/`,
    });
    setBusy(false);
    if (error) return toast.error(error.message || "Could not send reset email");
    toast.success("Password reset link sent to your email");
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="container-px mx-auto max-w-md flex items-center gap-3 h-14">
          <Link
            to="/"
            aria-label="Back to home"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Lal Raja" className="h-8 w-auto" />
            <span className="font-serif text-lg">Lal Raja</span>
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-start justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          {step === "otp" ? (
            <>
              <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-brand" />
              </div>
              <h1 className="font-serif text-3xl text-foreground mb-1 text-center">
                Enter verification code
              </h1>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </p>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="w-full border border-border rounded-md px-4 py-3 text-center text-xl tracking-[0.5em] font-semibold outline-none focus:border-brand"
              />

              <button
                type="button"
                onClick={verifyOtp}
                disabled={busy || otp.length !== 6}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-brand text-brand-foreground rounded-full py-3 text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
              >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify & Continue
              </button>

              <div className="mt-4 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                  }}
                  className="text-foreground/70 hover:text-brand"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendIn > 0 || busy}
                  className="text-brand font-medium disabled:text-muted-foreground"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl text-foreground mb-1">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground mb-7">
                {mode === "signin"
                  ? "Sign in with your email and password."
                  : "Sign up — we'll email you a 6-digit code to verify."}
              </p>

              {/* Tabs */}
              <div className="flex bg-muted rounded-full p-1 mb-6 text-sm">
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className={`flex-1 py-2 rounded-full transition ${
                    mode === "signin" ? "bg-background shadow-sm font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className={`flex-1 py-2 rounded-full transition ${
                    mode === "signup" ? "bg-background shadow-sm font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  mode === "signin" ? signIn() : signUp();
                }}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-2">Full name</label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-background border border-border rounded-md px-3 py-3 text-sm outline-none focus:border-brand"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-2">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-background border border-border rounded-md px-3 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-foreground/70">Password</label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={forgotPassword}
                        className="text-xs text-brand font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                    className="w-full bg-background border border-border rounded-md px-3 py-3 text-sm outline-none focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-brand text-brand-foreground rounded-full py-3 text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "signin" ? "Sign in" : "Send verification code"}
                </button>
              </form>

              <p className="mt-6 text-[11px] text-muted-foreground leading-relaxed">
                By continuing you agree to Lal Raja's Terms of Use & Privacy Policy.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
