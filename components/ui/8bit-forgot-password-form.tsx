"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].auth.forgot;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await forgotPassword(email);
      sessionStorage.setItem("otp_pending_email", email);
      router.push("/verify-otp?mode=reset");
    } catch {
      setErrorMsg(tr.error);
    } finally {
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

          <div className="animate-fade-up space-y-1.5" style={{ animationDelay: "120ms" }}>
            <label htmlFor="fp-email" className="retro pixel-text-xs uppercase" style={{ color: "var(--text-2)" }}>{translations[lang].common.email}</label>
            <input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="m@example.com" required autoComplete="email"
              className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none"
              style={body} />
          </div>

          {errorMsg && (
            <p className="retro pixel-text-xs border-2 border-[#E63946] px-3 py-2" style={{ color: "#E63946", background: "rgba(230,57,70,0.06)" }}>{errorMsg}</p>
          )}

          <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
            <button type="submit" disabled={!email || isLoading}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}>
              {isLoading ? tr.submitting : tr.submit}
              {!isLoading && <ArrowRight size={13} />}
            </button>
          </div>

          <p className="animate-fade-up text-center text-xs" style={{ ...body, color: "var(--text-3)" }}>
            <Link href="/login" className="font-semibold underline underline-offset-2 hover:text-[var(--text)]" style={{ color: "var(--text-2)" }}>
              {translations[lang].common.backToLogin}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
