"use client";

import {
  Activity,
  BadgeCheck,
  Bell,
  Building2,
  CreditCard,
  Globe2,
  KeyRound,
  LifeBuoy,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Switch } from "@/components/ui/8bit-switch";
import { Tag } from "@/components/ui/badge";
import { WorkspaceInfoCard } from "./workspace-info-card";
import {
  SETTINGS_OPERATIONAL_PREFERENCES,
  SETTINGS_SECURITY,
  SETTINGS_WORK_ZONES,
  type ZonePriority,
} from "@/lib/settings-data";
import { useSettings } from "@/lib/hooks/use-settings";
import { useSettingsPanels } from "@/lib/hooks/use-settings-panels";
import { useSupport } from "@/lib/hooks/use-support";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--text-3)] focus:border-[var(--text)] focus:outline-none";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const preferences = SETTINGS_OPERATIONAL_PREFERENCES;
const security = SETTINGS_SECURITY;
const workZones = SETTINGS_WORK_ZONES;
const categories = Array.from(new Set(workZones.flatMap((zone) => zone.categories))).slice(0, 10);

const zonePriorityColors: Record<ZonePriority, string> = {
  alta: "var(--c-hi)",
  media: "var(--c-mid)",
  baja: "var(--c-lo)",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function usagePercent(value: number, limit: number) {
  if (!limit) return 0;
  return Math.min(100, Math.round((value / limit) * 100));
}

function SectionHeader({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Building2;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface-2)]">
        <Icon size={15} />
      </div>
      <div>
        <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
          {eyebrow}
        </p>
        <h2 className="retro pixel-text-sm mt-1 uppercase" style={{ color: "var(--text)" }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// Visually disables and grays out a section that is on the roadmap but not active yet.
function ComingSoon({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const settings = translations[lang].settings;
  return (
    <div className="relative">
      <span
        className="retro pixel-text-xs absolute right-3 top-3 z-10 inline-flex items-center gap-1 border-2 border-[var(--border)] bg-[var(--pixel-highlight)] px-2 py-1 uppercase shadow-[1px_1px_0_var(--pixel-shadow)]"
        style={{ color: "var(--text)" }}
        title={settings.comingSoonHint}
      >
        {settings.comingSoon}
      </span>
      <div className="pointer-events-none select-none opacity-50 grayscale" aria-hidden>
        {children}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
}: {
  title: string;
  description: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-3">
      <div className="min-w-0">
        <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
          {title}
        </p>
        <p className="mt-1 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
          {description}
        </p>
      </div>
      <Switch defaultChecked={checked} aria-label={title} />
    </div>
  );
}

function UsageRow({ label, value, limit }: { label: string; value: number; limit: number }) {
  const pct = usagePercent(value, limit);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold" style={bodyTextStyle}>
        <span style={{ color: "var(--text-2)" }}>{label}</span>
        <span className="tabular-nums" style={{ color: "var(--text)" }}>
          {value.toLocaleString()}/{limit.toLocaleString()}
        </span>
      </div>
      <div className="h-5 border-2 border-[var(--border)] bg-[var(--surface)] p-[2px]">
        <div className="h-full bg-[var(--text)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Configuracion() {
  const { lang } = useLanguage();
  const tr = translations[lang];
  const settings = tr.settings;

  const {
    workspaceName, setWorkspaceName,
    industry, setIndustry,
    country, setCountry,
    city, setCity,
    phone, setPhone,
    website, setWebsite,
    userFullName, userEmail, userRole,
    saveStatus, save,
  } = useSettings();

  const { team, usage, audit, loading } = useSettingsPanels();

  const {
    subject: supportSubject, setSubject: setSupportSubject,
    message: supportMessage, setMessage: setSupportMessage,
    status: supportStatus, error: supportError, submit: submitSupport,
  } = useSupport();

  const planLabel = usage
    ? tr.settingsEnums.plan[usage.plan as keyof typeof tr.settingsEnums.plan] ?? usage.plan
    : "";

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <WorkspaceInfoCard
          workspaceName={workspaceName}
          setWorkspaceName={setWorkspaceName}
          industry={industry}
          setIndustry={setIndustry}
          country={country}
          setCountry={setCountry}
          city={city}
          setCity={setCity}
          phone={phone}
          setPhone={setPhone}
          website={website}
          setWebsite={setWebsite}
          saveStatus={saveStatus}
          save={save}
        />

        <aside className="pixel-card-sm h-fit bg-white p-5">
          <SectionHeader eyebrow={settings.account} title={settings.currentUser} icon={UserRound} />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] retro pixel-text-sm shadow-[2px_2px_0_var(--pixel-shadow)]">
              {initials(userFullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {userFullName}
              </p>
              <p className="truncate text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                {userEmail}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <div className="pixel-inset bg-[var(--surface-2)] p-3">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {settings.role}
              </p>
              <p className="mt-1 text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {tr.settingsEnums.teamRole[userRole as keyof typeof tr.settingsEnums.teamRole] ?? userRole}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {/* Team - live data */}
          <section className="pixel-card-sm overflow-hidden bg-white">
            <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5">
              <SectionHeader eyebrow={settings.sections.team} title={settings.sections.members} icon={UsersRound} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm" style={bodyTextStyle}>
                <thead>
                  <tr>
                    {settings.teamHeaders.slice(0, 3).map((heading) => (
                      <th
                        key={heading}
                        className="retro border-b-2 border-[var(--border)] px-4 py-3 text-left text-[10px] uppercase"
                        style={{ color: "var(--text-3)" }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {team.map((member) => (
                    <tr key={member.id} className="border-b border-[#E4E4E7] last:border-b-0">
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--text)" }}>
                        {member.full_name || member.email}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-3)" }}>
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        <Tag>{tr.settingsEnums.teamRole[member.role as keyof typeof tr.settingsEnums.teamRole] ?? member.role}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && team.length === 0 && (
                <p className="px-4 py-4 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {settings.teamEmpty}
                </p>
              )}
            </div>
          </section>

          <ComingSoon>
            <section className="pixel-card-sm bg-white p-5">
              <SectionHeader eyebrow={settings.sections.operation} title={settings.sections.preferences} icon={SlidersHorizontal} />
              <div className="grid gap-3 md:grid-cols-2">
                <ToggleRow title={settings.toggles.autoAssign.title} description={settings.toggles.autoAssign.description(tr.settingsEnums.assignmentMode[preferences.assignmentMode])} checked />
                <ToggleRow title={settings.toggles.requiredNotes.title} description={settings.toggles.requiredNotes.description} checked={preferences.requireLeadNotesBeforeStageChange} />
                <ToggleRow title={settings.toggles.archiveLost.title} description={settings.toggles.archiveLost.description(preferences.staleLeadDays)} checked={preferences.autoArchiveLostLeads} />
                <ToggleRow title={settings.toggles.weeklyReport.title} description={settings.toggles.weeklyReport.description(preferences.businessHours.mondayToFriday)} checked={false} />
              </div>
            </section>
          </ComingSoon>

          <section className="grid gap-5 md:grid-cols-2">
            <ComingSoon>
              <div className="pixel-card-sm bg-white p-5">
                <SectionHeader eyebrow={settings.sections.zones} title={settings.sections.coverage} icon={MapPin} />
                <div className="flex flex-wrap gap-2">
                  {workZones.map((zone) => (
                    <Tag key={zone.id}>
                      <span className="mr-1 inline-block h-2 w-2" style={{ background: zonePriorityColors[zone.priority] }} />
                      {zone.name}
                    </Tag>
                  ))}
                </div>
              </div>
            </ComingSoon>
            <ComingSoon>
              <div className="pixel-card-sm bg-white p-5">
                <SectionHeader eyebrow={settings.sections.categories} title={settings.sections.activeCategories} icon={Globe2} />
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Tag key={category}>{category}</Tag>
                  ))}
                </div>
              </div>
            </ComingSoon>
          </section>
        </div>

        <div className="space-y-5">
          {/* Plan + monthly usage - live data */}
          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader
              eyebrow={settings.sections.plan}
              title={planLabel || settings.sections.monthlyUsage}
              icon={CreditCard}
            />
            <div className="space-y-4">
              <UsageRow
                label={settings.usageLabels.searches}
                value={usage?.searches_used ?? 0}
                limit={usage?.searches_limit ?? 0}
              />
              <UsageRow
                label={settings.usageLabels.tokens}
                value={usage?.tokens_used ?? 0}
                limit={usage?.tokens_limit ?? 0}
              />
            </div>
          </section>

          {/* Audit - live recent searches */}
          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow={settings.sections.audit} title={settings.sections.recentActivity} icon={Activity} />
            <div className="space-y-3">
              {!loading && audit.length === 0 && (
                <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                  {settings.auditEmpty}
                </p>
              )}
              {audit.map((entry, i) => {
                const query = (entry.query ?? "").trim() || settings.auditFallback.business;
                const location = (entry.location ?? "").trim() || settings.auditFallback.zone;
                return (
                  <div key={i} className="flex items-start gap-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                    <Search size={14} className="mt-0.5 shrink-0" />
                    <span>{settings.auditSearch(query, location, entry.results_count)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <ComingSoon>
            <section className="pixel-card-sm bg-white p-5">
              <SectionHeader eyebrow={settings.sections.security} title={settings.sections.accessSessions} icon={ShieldCheck} />
              <div className="grid gap-3">
                <div className="flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--surface)] p-3">
                  <KeyRound size={16} />
                  <div>
                    <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {settings.securityLabels.password}
                    </p>
                    <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                      {settings.securityLabels.rotation(security.passwordRotationDays)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--surface)] p-3">
                  <BadgeCheck size={16} />
                  <div>
                    <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {settings.securityLabels.domains}
                    </p>
                    <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                      {security.allowedEmailDomains.join(", ")}
                    </p>
                  </div>
                </div>
                <ToggleRow title={settings.toggles.twoFactor.title} description={settings.toggles.twoFactor.description(tr.settingsEnums.securityLevel[security.level])} checked={security.twoFactorRequired} />
              </div>
            </section>
          </ComingSoon>

          <ComingSoon>
            <section className="pixel-card-sm bg-white p-5">
              <SectionHeader eyebrow={settings.sections.system} title={settings.sections.notifications} icon={Bell} />
              <div className="space-y-3">
                <ToggleRow title={settings.toggles.newLeads.title} description={settings.toggles.newLeads.description} checked={preferences.preferredContactChannels.includes("app")} />
                <ToggleRow title={settings.toggles.operationalEmail.title} description={settings.toggles.operationalEmail.description} checked={preferences.preferredContactChannels.includes("email")} />
                <ToggleRow title={settings.toggles.commercialWhatsapp.title} description={settings.toggles.commercialWhatsapp.description} checked={preferences.preferredContactChannels.includes("whatsapp")} />
              </div>
            </section>
          </ComingSoon>

          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow={settings.sections.help} title={settings.sections.contactSupport} icon={LifeBuoy} />
            <p className="mb-3 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
              {settings.support.subtitle}
            </p>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                  {settings.support.subjectLabel}
                </span>
                <input
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  maxLength={150}
                  placeholder={settings.support.subjectPlaceholder}
                  className={cn(inputCls, "h-9")}
                  style={bodyTextStyle}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                  {settings.support.messageLabel}
                </span>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  maxLength={4000}
                  rows={4}
                  placeholder={settings.support.messagePlaceholder}
                  className={cn(inputCls, "resize-none py-2")}
                  style={bodyTextStyle}
                />
              </label>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={submitSupport}
                  disabled={supportStatus === "sending" || supportSubject.trim().length < 3 || supportMessage.trim().length < 10}
                  className="retro pixel-text-sm inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {supportStatus === "sending" ? settings.support.sending : settings.support.submit}
                </button>
                {supportStatus === "ok" && (
                  <span className="text-xs font-semibold" style={{ color: "var(--c-hi)" }}>
                    {settings.support.sent}
                  </span>
                )}
                {supportStatus === "error" && (
                  <span className="text-xs font-semibold" style={{ color: "var(--c-lo)" }}>
                    {supportError ?? settings.support.error}
                  </span>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
