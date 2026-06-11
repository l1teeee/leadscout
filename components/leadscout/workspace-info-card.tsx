"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, Pencil } from "lucide-react";
import { Tag } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  COUNTRY_DATA,
  sanitizePhone,
  sanitizeText,
  sanitizeUrl,
  splitPhone,
} from "@/lib/profile-fields";
import type { SaveStatus } from "@/lib/hooks/use-settings";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const inputCls =
  "h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:border-[var(--text)] focus:outline-none";

interface WorkspaceInfoCardProps {
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  website: string;
  setWebsite: (v: string) => void;
  saveStatus: SaveStatus;
  save: () => Promise<boolean>;
}

function FieldSpan({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
      {children}
    </span>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FieldSpan>{label}</FieldSpan>
      <p
        className="flex min-h-9 items-center border-2 border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-semibold"
        style={{ ...bodyTextStyle, color: value ? "var(--text)" : "var(--text-3)" }}
      >
        {value || "-"}
      </p>
    </div>
  );
}

export function WorkspaceInfoCard({
  workspaceName, setWorkspaceName,
  industry, setIndustry,
  country, setCountry,
  city, setCity,
  phone, setPhone,
  website, setWebsite,
  saveStatus, save,
}: WorkspaceInfoCardProps) {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const settings = tr.settings;
  const onb = tr.auth.onboarding;

  const [editing, setEditing] = useState(false);
  const [localPhone, setLocalPhone] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [cityCustom, setCityCustom] = useState(false);

  const snapshot = useRef({ workspaceName, industry, country, city, phone, website });

  const dialCode = COUNTRY_DATA[country]?.dialCode ?? "";
  const saving = saveStatus === "saving";
  const knownCountry = Boolean(COUNTRY_DATA[country]);
  const valid =
    workspaceName.trim().length > 0 && industry.length > 0 && city.trim().length > 0;

  // Fetch cities for the selected country while editing. setState only runs in
  // async callbacks (loading is toggled in the event handlers) to satisfy the
  // react-hooks/set-state-in-effect rule.
  useEffect(() => {
    if (!editing) return;
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
  }, [editing, country]);

  function beginEdit() {
    snapshot.current = { workspaceName, industry, country, city, phone, website };
    setLocalPhone(splitPhone(phone, COUNTRY_DATA[country]?.dialCode ?? ""));
    setCityCustom(false);
    setCities([]);
    setCitiesLoading(Boolean(COUNTRY_DATA[country]?.apiName));
    setEditing(true);
  }

  function cancelEdit() {
    const s = snapshot.current;
    setWorkspaceName(s.workspaceName);
    setIndustry(s.industry);
    setCountry(s.country);
    setCity(s.city);
    setPhone(s.phone);
    setWebsite(s.website);
    setEditing(false);
  }

  function handleCountryChange(next: string) {
    const info = COUNTRY_DATA[next];
    setCountry(next);
    setCity("");
    setCityCustom(false);
    setCities([]);
    setCitiesLoading(Boolean(info?.apiName));
    const nextDial = info?.dialCode ?? "";
    setPhone(nextDial ? `${nextDial} ${localPhone}`.trim() : localPhone.trim());
  }

  function handlePhoneChange(value: string) {
    const local = sanitizePhone(value);
    setLocalPhone(local);
    setPhone(dialCode ? `${dialCode} ${local}`.trim() : local.trim());
  }

  async function handleSave() {
    if (!valid || saving) return;
    const ok = await save();
    if (ok) setEditing(false);
  }

  const showCityLoader = citiesLoading && knownCountry && country !== "Otro";
  const showCitySelect = !cityCustom && !citiesLoading && cities.length > 0;
  const showCityText = !showCityLoader && !showCitySelect;
  const cityOptions = city && !cities.includes(city) ? [city, ...cities] : cities;

  return (
    <section className="pixel-card-sm overflow-hidden bg-white">
      <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)]">
              <Building2 size={22} />
            </div>
            <div>
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {tr.common.workspace}
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {workspaceName || " "}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                {industry && <Tag>{industry}</Tag>}
                {country && <Tag>{country}</Tag>}
              </div>
            </div>
          </div>

          {editing ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--surface)] px-3 font-bold text-[var(--text)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px disabled:opacity-60"
              >
                {settings.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !valid}
                className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? "..." : saveStatus === "error" ? settings.saveStatus.error : settings.save}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={beginEdit}
              aria-label={settings.editAria}
              className="retro pixel-text-sm inline-flex h-9 shrink-0 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98]"
            >
              <Pencil size={13} />
              {settings.edit}
            </button>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <ReadField label={settings.fields.workspaceName} value={workspaceName} />
          <ReadField label={settings.fields.industry} value={industry} />
          <ReadField label={settings.fields.country} value={country} />
          <ReadField label={settings.fields.mainCity} value={city} />
          <ReadField label={settings.fields.phone} value={phone} />
          <ReadField label={settings.fields.website} value={website} />
        </div>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2">
          <label className="block">
            <FieldSpan>{settings.fields.workspaceName}</FieldSpan>
            <input
              value={workspaceName}
              onChange={(e) => setWorkspaceName(sanitizeText(e.target.value, 80))}
              maxLength={80}
              required
              className={inputCls}
              style={bodyTextStyle}
            />
          </label>

          <label className="block">
            <FieldSpan>{settings.fields.industry}</FieldSpan>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              className={cn(inputCls, "cursor-pointer")}
              style={bodyTextStyle}
            >
              <option value="" disabled>{onb.industryPlaceholder}</option>
              {onb.industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldSpan>{settings.fields.country}</FieldSpan>
            <select
              value={knownCountry ? country : ""}
              onChange={(e) => handleCountryChange(e.target.value)}
              className={cn(inputCls, "cursor-pointer")}
              style={bodyTextStyle}
            >
              {!knownCountry && (
                <option value="" disabled>{country || onb.country}</option>
              )}
              {Object.keys(COUNTRY_DATA).map((c) => (
                <option key={c} value={c}>{onb.countries[c as keyof typeof onb.countries]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <FieldSpan>{settings.fields.mainCity}</FieldSpan>
            {showCityLoader && (
              <div className={cn(inputCls, "flex cursor-not-allowed items-center gap-2 opacity-60")}>
                <Loader2 size={13} className="shrink-0 animate-spin" style={{ color: "var(--text-3)" }} />
                <span className="text-xs" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {onb.loadingCities}
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
                style={bodyTextStyle}
              >
                <option value="" disabled>{onb.citySelect}</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__custom__">{onb.cityOther}</option>
              </select>
            )}
            {showCityText && (
              <input
                value={city}
                onChange={(e) => setCity(sanitizeText(e.target.value, 80))}
                maxLength={80}
                required
                placeholder={onb.cityPlaceholder}
                className={inputCls}
                style={bodyTextStyle}
              />
            )}
          </label>

          <label className="block">
            <FieldSpan>{settings.fields.phone}</FieldSpan>
            <div className="flex">
              {dialCode && (
                <div className="flex h-9 shrink-0 select-none items-center border-2 border-r-0 border-[var(--border)] bg-[var(--surface-2)] px-2">
                  <span className="whitespace-nowrap text-xs font-bold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                    {dialCode}
                  </span>
                </div>
              )}
              <input
                type="tel"
                value={localPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                maxLength={20}
                placeholder="1234-5678"
                className={cn(inputCls, dialCode ? "min-w-0 flex-1 border-l-0" : "")}
                style={bodyTextStyle}
              />
            </div>
          </label>

          <label className="block">
            <FieldSpan>{settings.fields.website}</FieldSpan>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(sanitizeUrl(e.target.value))}
              maxLength={200}
              placeholder="https://..."
              className={inputCls}
              style={bodyTextStyle}
            />
          </label>
        </div>
      )}
    </section>
  );
}
