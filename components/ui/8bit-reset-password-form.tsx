"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export default function ResetPasswordForm() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].auth.reset;
  const [accessToken] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    return params.get("access_token") ?? "";
  });
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDisabled = !password || !confirm || !accessToken || isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg(tr.mismatch);
      return;
    }
    if (password.length < 8) {
      setErrorMsg(tr.tooShort);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await resetPassword(accessToken, password);
      router.replace("/login");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : tr.genericError);
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-scale-in w-full">
      <div className="pixel-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}>
            <Zap size={15} color="#17110D" strokeWidth={2.5} />
          </div>
          <div>
            <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>ScoutIA</p>
            <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>{tr.header}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-5 space-y-5">
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>{tr.title}</h2>
            <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>{tr.subtitle}</p>
          </div>

          {!accessToken && (
            <p className="retro pixel-text-xs border-2 border-[#E63946] px-3 py-2" style={{ color: "#E63946", background: "rgba(230,57,70,0.06)" }}>
              {tr.invalidLink}
            </p>
          )}

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "120ms" }}>
            <label htmlFor="rp-password" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{tr.newPassword}</label>
            <div className="relative">
              <input id="rp-password" type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8}
                autoComplete="new-password"
                className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
                style={body} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center" style={{ color: "var(--text-3)" }}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "160ms" }}>
            <label htmlFor="rp-confirm" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{translations[lang].common.confirm}</label>
            <input id="rp-confirm" type={showPassword ? "text" : "password"} value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required
              autoComplete="new-password"
              className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
              style={body} />
          </div>

          {errorMsg && (
            <p className="retro pixel-text-xs border-2 border-[#E63946] px-3 py-2" style={{ color: "#E63946", background: "rgba(230,57,70,0.06)" }}>{errorMsg}</p>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <button type="submit" disabled={isDisabled}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}>
              {isLoading ? tr.submitting : tr.submit}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
