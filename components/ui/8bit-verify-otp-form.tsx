"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };

// OTP flow is deprecated in favor of the backend email-link reset flow.
// This component is kept for reference but redirects to forgot-password.
export default function VerifyOtpForm({ email }: { email: string }) {
  const router = useRouter();
  const errorMsg = "Este flujo ya no esta disponible. Usa el enlace de recuperacion enviado a tu email.";

  return (
    <div className="animate-scale-in w-full">
      <div className="pixel-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4" style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center" style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}>
            <Zap size={15} color="#17110D" strokeWidth={2.5} />
          </div>
          <div>
            <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>LeadScout</p>
            <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>Recuperar acceso</p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5 space-y-5">
          <div>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>Recuperar cuenta</h2>
            <p className="mt-2 text-xs" style={{ ...body, color: "var(--text-3)" }}>
              Revisa tu email <span className="font-semibold" style={{ color: "var(--text-2)" }}>{email}</span> y haz clic en el enlace de recuperacion.
            </p>
          </div>

          {errorMsg && (
            <p className="retro pixel-text-xs border-2 border-[#E63946] px-3 py-2" style={{ color: "#E63946", background: "rgba(230,57,70,0.06)" }}>{errorMsg}</p>
          )}

          <button
            onClick={() => router.replace("/forgot-password")}
            className="retro pixel-text-sm inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px"
            style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}
          >
            Solicitar nuevo enlace
            <ArrowRight size={13} />
          </button>

          <p className="text-center text-xs" style={{ ...body, color: "var(--text-3)" }}>
            <Link href="/login" className="font-semibold underline underline-offset-2" style={{ color: "var(--text-2)" }}>Volver al login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
