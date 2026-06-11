"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, UserRound, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/lib/api/auth";
import { getToken } from "@/lib/auth";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { COUNTRY_DATA, sanitizeText, sanitizePhone, sanitizeUrl } from "@/lib/profile-fields";

const body = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const inputCls =
  "h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] transition-[border-color,box-shadow] duration-150 focus:shadow-[0_0_0_3px_rgba(28,25,23,0.12)] focus:outline-none";

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
  const { lang } = useLanguage();
  const tr = translations[lang].auth.onboarding;
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Step 0
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");

  // Step 1
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("El Salvador");
  const [city, setCity] = useState("");
  const [cityCustom, setCityCustom] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(Boolean(COUNTRY_DATA["El Salvador"].apiName));
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentDialCode = COUNTRY_DATA[country]?.dialCode ?? "";

  function handleCountryChange(nextCountry: string) {
    const info = COUNTRY_DATA[nextCountry];

    setCountry(nextCountry);
    setPhoneNumber("");
    setCity("");
    setCityCustom(false);
    setCities([]);
    setCitiesLoading(Boolean(info?.apiName));
  }

  // Fetch cities when country changes
  useEffect(() => {
    const info = COUNTRY_DATA[country];

    if (!info?.apiName) return;

    const controller = new AbortController();

    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: info.apiName }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("non-ok");
        return res.json();
      })
      .then((json) => {
        setCities(Array.isArray(json?.data) ? (json.data as string[]) : []);
        setCitiesLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setCities([]);
          setCitiesLoading(false);
        }
      });

    return () => controller.abort();
  }, [country]);

  const finish = async (data: Record<string, string> = {}) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const token = getToken();
      if (!token) {
        throw new Error(tr.expiredSession);
      }
      await completeOnboarding(token, data);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : tr.submitError
      );
      setIsSubmitting(false);
      return;
    }
    sessionStorage.setItem("scoutia_onboarding_pending", "1");
    setIsExiting(true);
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 180);
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      setStep(1);
      return;
    }
    const fullPhone = currentDialCode
      ? `${currentDialCode} ${phoneNumber}`.trim()
      : phoneNumber.trim();
    finish({
      full_name: fullName,
      role,
      workspace_name: workspaceName,
      industry,
      country,
      city,
      phone: fullPhone,
      website,
    });
  };

  const step0Valid = fullName.trim().length > 0;
  const step1Valid =
    workspaceName.trim().length > 0 &&
    industry.length > 0 &&
    city.trim().length > 0;

  // City field display state
  const showCityLoader = citiesLoading && country !== "Otro";
  const showCitySelect = !cityCustom && !citiesLoading && cities.length > 0;
  const showCityText = !showCityLoader && !showCitySelect;

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
              <p className="retro pixel-text-sm leading-none" style={{ color: "#FFFFFF" }}>ScoutIA</p>
              <p className="retro pixel-text-xs mt-1.5" style={{ color: "#A1A1AA" }}>{tr.header}</p>
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
                {tr.step(step + 1, 2)}
              </p>
            </div>
            <h2 className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>
              {step === 0 ? tr.personalTitle : tr.companyTitle}
            </h2>
            <p className="mt-1.5 text-xs" style={{ ...body, color: "var(--text-3)" }}>
              {step === 0
                ? tr.personalSubtitle
                : tr.companySubtitle}
            </p>
          </div>

          {step === 0 && (
            <div data-stagger className="space-y-4">
              <div>
                <FieldLabel>{tr.fullName}</FieldLabel>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(sanitizeText(e.target.value, 80))}
                  placeholder={tr.fullNamePlaceholder}
                  required
                  autoFocus
                  maxLength={80}
                  className={inputCls}
                  style={body}
                />
              </div>
              <div>
                <FieldLabel>{tr.role}</FieldLabel>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(sanitizeText(e.target.value, 60))}
                  placeholder={tr.rolePlaceholder}
                  maxLength={60}
                  className={inputCls}
                  style={body}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div data-stagger className="space-y-4">
              <div>
                <FieldLabel>{tr.workspaceName}</FieldLabel>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(sanitizeText(e.target.value, 80))}
                  placeholder={tr.workspacePlaceholder}
                  required
                  autoFocus
                  maxLength={80}
                  className={inputCls}
                  style={body}
                />
              </div>

              <div>
                <FieldLabel>{tr.industry}</FieldLabel>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                  className={cn(inputCls, "cursor-pointer")}
                  style={body}
                >
                  <option value="" disabled>{tr.industryPlaceholder}</option>
                  {tr.industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Country + City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>{tr.country}</FieldLabel>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className={cn(inputCls, "cursor-pointer")}
                    style={body}
                  >
                    {Object.keys(COUNTRY_DATA).map((c) => (
                      <option key={c} value={c}>{tr.countries[c as keyof typeof tr.countries]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>{tr.city}</FieldLabel>

                  {showCityLoader && (
                    <div className={cn(inputCls, "flex items-center gap-2 cursor-not-allowed opacity-60")}>
                      <Loader2 size={13} className="animate-spin shrink-0" style={{ color: "var(--text-3)" }} />
                      <span className="text-xs" style={{ ...body, color: "var(--text-3)" }}>
                        {tr.loadingCities}
                      </span>
                    </div>
                  )}

                  {showCitySelect && (
                    <select
                      value={city}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setCityCustom(true);
                          setCity("");
                        } else {
                          setCity(e.target.value);
                        }
                      }}
                      required
                      className={cn(inputCls, "cursor-pointer")}
                      style={body}
                    >
                      <option value="" disabled>{tr.citySelect}</option>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">{tr.cityOther}</option>
                    </select>
                  )}

                  {showCityText && (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(sanitizeText(e.target.value, 80))}
                      placeholder={tr.cityPlaceholder}
                      required
                      maxLength={80}
                      autoFocus={cityCustom}
                      className={inputCls}
                      style={body}
                    />
                  )}
                </div>
              </div>

              {/* Phone + Website */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>{tr.phone}</FieldLabel>
                  <div className="flex">
                    {currentDialCode && (
                      <div
                        className="flex h-9 shrink-0 items-center px-2 border-2 border-r-0 border-[var(--border)] bg-[var(--surface-2)] select-none"
                        title={tr.phoneCodeTitle}
                      >
                        <span
                          className="text-xs font-bold whitespace-nowrap"
                          style={{ ...body, color: "var(--text-2)" }}
                        >
                          {currentDialCode}
                        </span>
                      </div>
                    )}
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(sanitizePhone(e.target.value))}
                      placeholder="1234-5678"
                      maxLength={20}
                      className={cn(
                        inputCls,
                        currentDialCode ? "border-l-0 flex-1 min-w-0" : ""
                      )}
                      style={body}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>{tr.website}</FieldLabel>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(sanitizeUrl(e.target.value))}
                    placeholder="https://..."
                    maxLength={200}
                    className={inputCls}
                    style={body}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="animate-fade-up space-y-3 pt-1" style={{ animationDelay: "200ms" }}>
            {submitError && (
              <p className="text-xs font-semibold" style={{ ...body, color: "var(--c-hi)" }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (step === 0 ? !step0Valid : !step1Valid)}
              className="retro pixel-text-sm motion-retro-control inline-flex w-full h-10 items-center justify-center gap-2 border-2 border-[var(--border)] font-bold shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "var(--border)", color: "var(--pixel-highlight)" }}
            >
              {isSubmitting ? tr.submitting : step === 0 ? tr.next : tr.finish}
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
