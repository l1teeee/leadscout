"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { login, register } from "@/lib/api/auth";
import { setToken } from "@/lib/auth";
import LoadingScreen from "@/components/ui/8bit-loading-screen";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const block = (e: React.SyntheticEvent) => e.preventDefault();
const secureInputProps = {
  onCopy: block, onCut: block, onPaste: block, onDrop: block,
  onDragStart: block, onContextMenu: block, autoComplete: "new-password",
  autoCorrect: "off", autoCapitalize: "off", spellCheck: false, maxLength: 128,
} as const;

const LOADER_MIN_DURATION = 5200;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function RegisterForm({ className }: { className?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg("La contrasena no cumple los requisitos.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Las contrasenas no coinciden.");
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      setLoadingProgress((current) => Math.min(92, current + 4));
    }, 180);

    try {
      await register(email, password);
      setLoadingProgress(72);
      try {
        const result = await login(email, password);
        setToken(result.access_token);
        setLoadingProgress(88);
      } catch {
        // Auto-login failed after register - go to login page
      }
      const elapsed = Date.now() - startedAt;
      if (elapsed < LOADER_MIN_DURATION) {
        await wait(LOADER_MIN_DURATION - elapsed);
      }
      window.clearInterval(progressTimer);
      setLoadingProgress(100);
      sessionStorage.setItem("leadscout_onboarding_pending", "1");
      await wait(650);
      setSuccess(true);
      setTimeout(() => { router.replace("/dashboard"); router.refresh(); }, 1200);
    } catch (err) {
      window.clearInterval(progressTimer);
      const msg = err instanceof Error ? err.message : "Error al crear cuenta.";
      setErrorMsg(msg.includes("400") ? "Este correo ya tiene una cuenta." : msg);
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  if (success) {
    return (
      <div className="animate-scale-in w-full">
        <div className="pixel-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}>
              <Zap size={15} color="#17110D" strokeWidth={2.5} />
            </div>
            <div>
              <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>LeadScout</p>
              <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>Panel de operaciones</p>
            </div>
          </div>
          <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle size={32} style={{ color: "var(--c-qualified)" }} />
            <div>
              <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>Cuenta creada</p>
              <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>Redirigiendo al dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("animate-scale-in w-full", className)}>
        <div className="pixel-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}>
              <Zap size={15} color="#17110D" strokeWidth={2.5} />
            </div>
            <div>
              <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>LeadScout</p>
              <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>Creando cuenta</p>
            </div>
          </div>
          <LoadingScreen
            title="Creando usuario"
            progress={loadingProgress}
            tips={[
              "Creando credenciales seguras...",
              "Preparando tu workspace inicial...",
              "Asignando permisos de owner...",
              "Iniciando sesion automaticamente...",
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("animate-scale-in w-full", className)}>
      <div className="pixel-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}>
            <Zap size={15} color="#17110D" strokeWidth={2.5} />
          </div>
          <div>
            <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>LeadScout</p>
            <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>Panel de operaciones</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>Crear cuenta</h2>
            <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>Empieza a detectar oportunidades hoy</p>
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "120ms" }}>
            <label htmlFor="reg-email" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>Email</label>
            <input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com" required autoComplete="email"
              className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
              style={body} />
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "160ms" }}>
            <label htmlFor="reg-password" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>Contrasena</label>
            <div className="relative">
              <input {...secureInputProps} id="reg-password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
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
                { label: "Minimo 8 caracteres", ok: password.length >= 8 },
                { label: "Al menos una mayuscula", ok: /[A-Z]/.test(password) },
                { label: "Al menos un numero", ok: /[0-9]/.test(password) },
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
            <label htmlFor="reg-confirm" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>Confirmar contrasena</label>
            <input {...secureInputProps} id="reg-confirm" type={showPassword ? "text" : "password"} value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required
              className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
              style={body} />
          </div>

          {errorMsg && (
            <p className="retro pixel-text-xs border-2 border-[#E63946] px-3 py-2" style={{ color: "#E63946", background: "rgba(230,57,70,0.06)" }}>{errorMsg}</p>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "240ms" }}>
            <button type="submit" disabled={!email || !password || !confirm || isLoading}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </div>

          <p className="animate-fade-up text-center text-xs" style={{ ...body, color: "var(--text-3)" }}>
            Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--text-2)" }}>Ingresar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
