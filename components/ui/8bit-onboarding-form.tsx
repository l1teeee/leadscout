"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, UserRound, Zap, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/lib/api/auth";
import { getToken } from "@/lib/auth";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const inputCls =
  "h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none";

const INDUSTRIES = [
  "Tecnologia",
  "Retail / Comercio",
  "Gastronomia / Restaurantes",
  "Servicios profesionales",
  "Salud y bienestar",
  "Educacion",
  "Construccion / Inmobiliaria",
  "Logistica y transporte",
  "Marketing y publicidad",
  "Manufactura",
  "Otro",
];

const COUNTRIES = [
  "El Salvador",
  "Guatemala",
  "Honduras",
  "Costa Rica",
  "Panama",
  "Mexico",
  "Argentina",
  "Colombia",
  "Peru",
  "Chile",
  "Otro",
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="retro pixel-text-xs mb-1.5 block uppercase" style={{ color: "var(--text-2)" }}>
      {children}
    </span>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-2 transition-all duration-300"
          style={{
            width: i === current ? "24px" : "8px",
            background: i <= current ? "var(--border)" : "var(--surface-2)",
            border: "1.5px solid var(--border)",
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("El Salvador");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const finish = async (data: Record<string, string> = {}) => {
    setIsSubmitting(true);
    try {
      const token = getToken();
      if (token) await completeOnboarding(token, data);
    } catch {
      // Non-blocking: proceed to dashboard even if API fails
    }
    setIsExiting(true);
    setTimeout(() => router.replace("/dashboard"), 180);
  };

  const skip = () => finish();

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      setStep(1);
      return;
    }
    finish({
      full_name: fullName,
      role,
      workspace_name: workspaceName,
      industry,
      country,
      city,
      phone,
      website,
    });
  };

  const step0Valid = fullName.trim().length > 0;
  const step1Valid = workspaceName.trim().length > 0 && industry.length > 0 && city.trim().length > 0;

  return (
    <div className={cn(isExiting ? "animate-exit" : "animate-scale-in", "w-full max-w-md")}>
      <div className="pixel-card overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: "var(--sidebar)", borderBottom: "2px solid #000" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center"
              style={{ background: "var(--pixel-highlight)", border: "2px solid #000", boxShadow: "2px 2px 0 0 #000" }}
            >
              <Zap size={15} color="#17110D" strokeWidth={2.5} />
            </div>
            <div>
              <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>LeadScout</p>
              <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>Configuracion inicial</p>
            </div>
          </div>
          <StepIndicator current={step} total={2} />
        </div>

        <form onSubmit={nextStep} className="px-6 pb-6 pt-5 space-y-5">
          {/* Step title */}
          <div className="animate-fade-up" style={{ animationDelay: "40ms" }}>
            <div className="mb-1 flex items-center gap-2">
              {step === 0
                ? <UserRound size={14} style={{ color: "var(--text-3)" }} />
                : <Building2 size={14} style={{ color: "var(--text-3)" }} />
              }
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {step === 0 ? "Paso 1 de 2" : "Paso 2 de 2"}
              </p>
            </div>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>
              {step === 0 ? "Queremos conocerte" : "Tu empresa"}
            </h2>
            <p className="mt-1.5 text-xs" style={{ ...body, color: "var(--text-3)" }}>
              {step === 0
                ? "Cuentanos un poco sobre ti para personalizar tu experiencia."
                : "Configuremos tu espacio de trabajo en LeadScout."}
            </p>
          </div>

          {step === 0 && (
            <div data-stagger className="space-y-4">
              <div>
                <FieldLabel>Nombre completo *</FieldLabel>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej: Maria Lopez"
                  required
                  autoFocus
                  className={inputCls}
                  style={body}
                />
              </div>
              <div>
                <FieldLabel>Cargo o rol</FieldLabel>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ej: Director comercial"
                  className={inputCls}
                  style={body}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div data-stagger className="space-y-4">
              <div>
                <FieldLabel>Nombre del workspace / empresa *</FieldLabel>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Ej: Distribuidora El Sol"
                  required
                  autoFocus
                  className={inputCls}
                  style={body}
                />
              </div>
              <div>
                <FieldLabel>Industria *</FieldLabel>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className={cn(inputCls, "cursor-pointer")}
                  style={body}
                >
                  <option value="" disabled>Selecciona tu industria</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Pais</FieldLabel>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={cn(inputCls, "cursor-pointer")}
                    style={body}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Ciudad *</FieldLabel>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: San Salvador"
                    required
                    className={inputCls}
                    style={body}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Telefono</FieldLabel>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+503 1234-5678"
                    className={inputCls}
                    style={body}
                  />
                </div>
                <div>
                  <FieldLabel>Sitio web</FieldLabel>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className={inputCls}
                    style={body}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="animate-fade-up space-y-3 pt-1" style={{ animationDelay: "200ms" }}>
            <button
              type="submit"
              disabled={isSubmitting || (step === 0 ? !step0Valid : !step1Valid)}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}
            >
              {isSubmitting ? "Guardando..." : step === 0 ? "Siguiente" : "Guardar y continuar"}
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              onClick={skip}
              className="retro pixel-text-xs motion-retro-control inline-flex w-full h-8 items-center justify-center gap-1.5 border-2 border-[var(--border)] bg-transparent font-bold hover:bg-[var(--surface-2)] active:translate-x-px active:translate-y-px"
              style={{ color: "var(--text-3)" }}
            >
              <SkipForward size={11} />
              Omitir por ahora
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
