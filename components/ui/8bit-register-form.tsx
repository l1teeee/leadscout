"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { register } from "@/lib/api/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const block = (e: React.SyntheticEvent) => e.preventDefault();
const secureInputProps = {
  onCopy: block, onCut: block, onPaste: block, onDrop: block,
  onDragStart: block, onContextMenu: block, autoComplete: "new-password",
  autoCorrect: "off", autoCapitalize: "off", spellCheck: false, maxLength: 128,
} as const;

export default function RegisterForm({ className }: { className?: string }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].auth.register;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMsg(msg);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMsg(null);

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showError(tr.invalidPassword);
      return;
    }
    if (password !== confirm) {
      showError(tr.mismatch);
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password);
      sessionStorage.setItem("otp_pending_email", email);
      router.replace("/verify-otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      showError(msg.includes("400") ? tr.duplicateEmail : tr.genericError);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("animate-scale-in w-full", className)}>
      <div className="pixel-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
          <p className="retro pixel-text-xs uppercase" style={{ color: "#A1A1AA" }}>{tr.header}</p>
          <div className="flex gap-1.5" aria-hidden="true">
            <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #3A2719", background: "#E63946" }} />
            <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #3A2719", background: "rgba(255,255,255,0.12)" }} />
            <span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #3A2719", background: "#3FAE2A" }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>{tr.title}</h2>
            <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>{tr.subtitle}</p>
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "120ms" }}>
            <label htmlFor="reg-email" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{translations[lang].common.email}</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com" required autoComplete="email"
              className="h-11 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
              style={body} />
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "160ms" }}>
            <label htmlFor="reg-password" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{translations[lang].common.password}</label>
            <div className="relative">
              <input {...secureInputProps} id="reg-password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="h-11 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
                style={body} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center" style={{ color: "var(--text-3)" }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {password.length > 0 && (
            <div className="space-y-1.5 px-1">
              {[
                { label: tr.passwordRules[0], ok: password.length >= 8 },
                { label: tr.passwordRules[1], ok: /[A-Z]/.test(password) },
                { label: tr.passwordRules[2], ok: /[0-9]/.test(password) },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="h-4 w-4 shrink-0 border-2 flex items-center justify-center"
                    style={{ borderColor: ok ? "var(--c-qualified)" : "var(--border)", background: ok ? "var(--c-qualified)" : "var(--surface)" }}>
                    {ok && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="square" /></svg>}
                  </div>
                  <span className="retro pixel-text-xs" style={{ color: ok ? "var(--c-qualified)" : "var(--text-3)" }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "200ms" }}>
            <label htmlFor="reg-confirm" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{tr.confirmPassword}</label>
            <input {...secureInputProps} id="reg-confirm" type={showPassword ? "text" : "password"} value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required
              className="h-11 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
              style={body} />
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="animate-scale-in retro pixel-text-xs border-2 border-[var(--c-hi)] px-3 py-2.5 flex items-start gap-2"
              style={{ color: "var(--c-hi)", background: "rgba(230,57,70,0.08)" }}
            >
              <span aria-hidden="true" className="shrink-0 mt-px">✕</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button type="submit" disabled={!email || !password || !confirm || isLoading}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-11 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}>
              {isLoading ? tr.submitting : tr.submit}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </div>

          <p className="animate-fade-up text-center text-xs" style={{ ...body, color: "var(--text-3)" }}>
            {tr.hasAccount}{" "}
            <Link href="/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--text-2)" }}>{tr.login}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
