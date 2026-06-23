"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const inputCls =
  "h-11 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none";

export default function LoginForm() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].auth.login;
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("ls_remember_email") ?? "";
  });
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(localStorage.getItem("ls_remember_email"));
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMsg(msg);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 2500);
  };

  const isDisabled = !email || !password || isLoading || Boolean(lockoutUntil);
  const lockoutSecondsLeft = lockoutUntil ? Math.max(0, Math.ceil((lockoutUntil - now) / 1000)) : 0;

  useEffect(() => {
    if (!lockoutUntil) return;
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= lockoutUntil) {
        setFailedAttempts(0);
        setLockoutUntil(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      setToken(result.access_token);
      setFailedAttempts(0);
      setLockoutUntil(null);

      // fire-and-forget: send login notification email (never blocks UX)
      fetch("/api/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result.access_token }),
      }).catch(() => {});

      if (rememberMe) {
        localStorage.setItem("ls_remember_email", email);
      } else {
        localStorage.removeItem("ls_remember_email");
      }

      router.replace(result.user.onboarded ? "/dashboard" : "/onboarding");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      showError(msg.includes("401") ? tr.badCredentials : tr.genericError);
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const currentTime = Date.now();
        setNow(currentTime);
        setLockoutUntil(currentTime + 60000);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-scale-in w-full">
      <div className="pixel-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}
        >
          <p className="retro pixel-text-xs uppercase" style={{ color: "#A1A1AA" }}>{translations[lang].auth.access}</p>
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
            <label htmlFor="login-email" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{translations[lang].common.email}</label>
            <input id="login-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com" required autoComplete="email" className={inputCls} style={body} />
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "180ms" }}>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{translations[lang].common.password}</label>
              <Link href="/forgot-password" className="retro pixel-text-xs underline-offset-2 hover:underline" style={{ color: "var(--text-3)" }}>{tr.forgot}</Link>
            </div>
            <div className="relative">
              <input id="login-password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                autoComplete="current-password" className={`${inputCls} pr-10`} style={body} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center" style={{ color: "var(--text-3)" }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="animate-fade-up flex items-center gap-2" style={{ animationDelay: "210ms" }}>
            <button type="button" role="checkbox" aria-checked={rememberMe} onClick={() => setRememberMe((v) => !v)}
              className="h-6 w-6 shrink-0 border-2 border-[var(--border)] flex items-center justify-center"
              style={{ background: rememberMe ? "var(--border)" : "var(--surface)", boxShadow: "1px 1px 0 var(--pixel-shadow)" }}>
              {rememberMe && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="var(--pixel-highlight)" strokeWidth="1.5" strokeLinecap="square" /></svg>}
            </button>
            <span className="retro pixel-text-xs uppercase cursor-pointer select-none" style={{ color: "var(--text-2)" }} onClick={() => setRememberMe((v) => !v)}>{tr.remember}</span>
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

          {lockoutUntil && (
            <div
              role="alert"
              className="animate-scale-in retro pixel-text-xs border-2 border-[var(--c-hi)] px-3 py-2.5 flex items-start gap-2"
              style={{ color: "var(--c-hi)", background: "rgba(230,57,70,0.08)" }}
            >
              <span aria-hidden="true" className="shrink-0 mt-px">x</span>
              <span>{tr.lockout(lockoutSecondsLeft)}</span>
            </div>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button type="submit" disabled={isDisabled}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-11 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}>
              {isLoading ? tr.submitting : tr.submit}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </div>

          <p className="animate-fade-up text-center text-xs mt-4 sm:mt-6" style={{ ...body, color: "var(--text-3)" }}>
            {tr.noAccount}{" "}
            <Link href="/register" className="font-semibold underline underline-offset-2 hover:text-[var(--text)]" style={{ color: "var(--text-2)" }}>{tr.register}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
