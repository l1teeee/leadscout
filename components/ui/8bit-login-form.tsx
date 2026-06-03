"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { login } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const inputCls =
  "h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none";

export default function LoginForm() {
  const router = useRouter();
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

  const isDisabled = !email || !password || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await login(email, password);
      setToken(result.access_token);

      if (rememberMe) {
        localStorage.setItem("ls_remember_email", email);
      } else {
        localStorage.removeItem("ls_remember_email");
      }

      router.replace(result.user.onboarded ? "/dashboard" : "/onboarding");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(msg.includes("401") ? "Email o contrasena incorrectos." : "Error al iniciar sesion.");
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-scale-in w-full">
      <div className="pixel-card overflow-hidden">
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center"
            style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}
          >
            <Zap size={15} color="#17110D" strokeWidth={2.5} />
          </div>
          <div>
            <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>LeadScout</p>
            <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>Panel de operaciones</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>Ingresar</h2>
            <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>Accede a tu cuenta para continuar</p>
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "120ms" }}>
            <label htmlFor="login-email" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com" required autoComplete="email" className={inputCls} style={body} />
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "180ms" }}>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>Contrasena</label>
              <Link href="/forgot-password" className="retro pixel-text-xs underline-offset-2 hover:underline" style={{ color: "var(--text-3)" }}>Olvidaste?</Link>
            </div>
            <div className="relative">
              <input id="login-password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                autoComplete="current-password" className={`${inputCls} pr-10`} style={body} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center" style={{ color: "var(--text-3)" }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="animate-fade-up flex items-center gap-2" style={{ animationDelay: "210ms" }}>
            <button type="button" role="checkbox" aria-checked={rememberMe} onClick={() => setRememberMe((v) => !v)}
              className="h-4 w-4 shrink-0 border-2 border-[var(--border)] flex items-center justify-center"
              style={{ background: rememberMe ? "var(--border)" : "var(--surface)", boxShadow: "1px 1px 0 var(--pixel-shadow)" }}>
              {rememberMe && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="var(--pixel-highlight)" strokeWidth="1.5" strokeLinecap="square" /></svg>}
            </button>
            <span className="retro pixel-text-xs uppercase cursor-pointer select-none" style={{ color: "var(--text-2)" }} onClick={() => setRememberMe((v) => !v)}>Recuerdame</span>
          </div>

          {errorMsg && (
            <p className="retro pixel-text-xs border-2 border-[var(--c-hi)] px-3 py-2" style={{ color: "var(--c-hi)", background: "rgba(230,57,70,0.06)" }}>{errorMsg}</p>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button type="submit" disabled={isDisabled}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}>
              {isLoading ? "Ingresando..." : "Ingresar"}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </div>

          <p className="animate-fade-up text-center text-xs mt-6" style={{ ...body, color: "var(--text-3)" }}>
            No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold underline underline-offset-2 hover:text-[var(--text)]" style={{ color: "var(--text-2)" }}>Registrarse</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
