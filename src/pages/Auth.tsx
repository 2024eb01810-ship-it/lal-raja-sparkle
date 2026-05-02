import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Phone as PhoneIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, { message: "Enter a valid 10-digit mobile number" });

const otpSchema = z.string().trim().regex(/^\d{6}$/, { message: "Enter the 6-digit code" });

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Already logged in → go home
  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const e164 = (raw: string) => `+91${raw.replace(/\D/g, "")}`;

  const sendOtp = async () => {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164(parsed.data) });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Could not send OTP. Phone provider may not be enabled.");
      return;
    }
    toast.success("OTP sent to your phone");
    setStep("otp");
    setResendIn(30);
  };

  const verifyOtp = async () => {
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: e164(phone),
      token: parsed.data,
      type: "sms",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "Invalid or expired code");
      return;
    }
    toast.success("Welcome to Lal Raja!");
    navigate("/", { replace: true });
  };

  const signInGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return; // browser navigates away
    // tokens received & session set
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="border-b border-border">
        <div className="container-px mx-auto max-w-md flex items-center gap-3 h-14">
          <Link to="/" aria-label="Back to home" className="inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted">
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
          <h1 className="font-serif text-3xl text-foreground mb-1">
            {step === "phone" ? "Welcome" : "Verify your number"}
          </h1>
          <p className="text-sm text-muted-foreground mb-7">
            {step === "phone"
              ? "Sign in or create your account to continue."
              : `We sent a 6-digit code to +91 ${phone}.`}
          </p>

          {step === "phone" ? (
            <>
              {/* Google */}
              <button
                type="button"
                onClick={signInGoogle}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-3 border border-border rounded-full py-3 text-sm font-medium hover:bg-muted transition disabled:opacity-60"
              >
                <GoogleLogo />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6 text-xs text-muted-foreground">
                <div className="flex-1 h-px bg-border" />
                or continue with phone
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Phone */}
              <label className="block text-xs font-medium text-foreground/70 mb-2">
                Mobile number
              </label>
              <div className="flex items-stretch border border-border rounded-md overflow-hidden focus-within:border-brand transition">
                <span className="inline-flex items-center px-3 bg-muted text-sm text-foreground/80 border-r border-border">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98XXXXXXXX"
                  className="flex-1 bg-background px-3 py-3 text-sm outline-none"
                />
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={busy || phone.length !== 10}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-brand text-brand-foreground rounded-full py-3 text-sm font-semibold hover:opacity-95 transition disabled:opacity-60"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneIcon className="w-4 h-4" />}
                Send OTP
              </button>

              <p className="mt-6 text-[11px] text-muted-foreground leading-relaxed">
                By continuing you agree to Lal Raja's Terms of Use & Privacy Policy.
              </p>
            </>
          ) : (
            <>
              <label className="block text-xs font-medium text-foreground/70 mb-2">
                Enter 6-digit code
              </label>
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
                  onClick={() => { setStep("phone"); setOtp(""); }}
                  className="text-foreground/70 hover:text-brand"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={resendIn > 0 || busy}
                  className="text-brand font-medium disabled:text-muted-foreground"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.3 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
