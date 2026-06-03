"use client";

import {
  Activity,
  BadgeCheck,
  Bell,
  Building2,
  CheckCircle2,
  CreditCard,
  Globe2,
  KeyRound,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Switch } from "@/components/ui/8bit-switch";
import { Tag } from "@/components/ui/badge";
import {
  SETTINGS_CURRENT_USER,
  SETTINGS_OPERATIONAL_PREFERENCES,
  SETTINGS_PLAN_USAGE,
  SETTINGS_SECURITY,
  SETTINGS_TEAM_MEMBERS,
  SETTINGS_WORKSPACE,
  SETTINGS_WORK_ZONES,
  type TeamMemberStatus,
  type TeamRole,
  type ZonePriority,
} from "@/lib/settings-data";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const workspace = SETTINGS_WORKSPACE;
const currentUser = SETTINGS_CURRENT_USER;
const team = SETTINGS_TEAM_MEMBERS;
const preferences = SETTINGS_OPERATIONAL_PREFERENCES;
const planUsage = SETTINGS_PLAN_USAGE;
const security = SETTINGS_SECURITY;
const workZones = SETTINGS_WORK_ZONES;
const categories = Array.from(new Set(workZones.flatMap((zone) => zone.categories))).slice(0, 10);

const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  ventas: "Ventas",
  analista: "Analista",
  viewer: "Viewer",
};

const statusLabels: Record<TeamMemberStatus, string> = {
  activo: "Activo",
  invitado: "Invitado",
  suspendido: "Suspendido",
};

const zonePriorityColors: Record<ZonePriority, string> = {
  alta: "var(--c-hi)",
  media: "var(--c-mid)",
  baja: "var(--c-lo)",
};

const usage = [
  { label: "Leads detectados", value: planUsage.leads.usedThisMonth, limit: planUsage.leads.monthlyLimit },
  { label: "Busquedas mensuales", value: planUsage.searches.usedThisMonth, limit: planUsage.searches.monthlyLimit },
  { label: "Miembros", value: planUsage.seats.used, limit: planUsage.seats.limit },
  { label: "Exportaciones", value: planUsage.exports.usedThisMonth, limit: planUsage.exports.monthlyLimit },
  { label: "Storage GB", value: planUsage.storageGb.used, limit: planUsage.storageGb.limit },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function compactDate(value?: string) {
  if (!value) return "Pendiente";
  return value.split("T")[0] ?? value;
}

function usagePercent(value: number, limit: number) {
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

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
        {label}
      </span>
      <input
        value={value}
        readOnly
        className="h-9 w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)]"
        style={bodyTextStyle}
      />
    </label>
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
          {value}/{limit}
        </span>
      </div>
      <div className="h-5 border-2 border-[var(--border)] bg-[var(--surface)] p-[2px]">
        <div className="h-full bg-[var(--text)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Configuracion() {
  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="pixel-card-sm overflow-hidden bg-white">
          <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)]">
                  <Building2 size={22} />
                </div>
                <div>
                  <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                    Workspace
                  </p>
                  <h1 className="mt-1 text-2xl font-black leading-tight" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    {workspace.name}
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Tag>{planUsage.plan}</Tag>
                    <Tag>{workspace.status}</Tag>
                    <Tag>{workspace.country}</Tag>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="retro pixel-text-sm motion-retro-control inline-flex h-9 items-center justify-center gap-2 border-2 border-[var(--border)] bg-[var(--border)] px-3 font-bold text-[var(--pixel-highlight)] shadow-[2px_2px_0_var(--pixel-shadow)] active:translate-x-px active:translate-y-px active:scale-[0.98] active:shadow-[1px_1px_0_var(--pixel-shadow)]"
              >
                Guardar cambios
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Field label="Nombre del workspace" value={workspace.name} />
            <Field label="Razon social" value={workspace.legalName} />
            <Field label="Industria" value={workspace.industry} />
            <Field label="Pais" value={workspace.country} />
            <Field label="Ciudad principal" value={workspace.city} />
            <Field label="Telefono" value={workspace.phone} />
            <Field label="Sitio web" value={workspace.website} />
            <Field label="Zona horaria" value={currentUser.timezone} />
            <Field label="Moneda" value={workspace.currency} />
            <Field label="NIT" value={workspace.taxId} />
          </div>
        </section>

        <aside className="pixel-card-sm h-fit bg-white p-5">
          <SectionHeader eyebrow="Cuenta" title="Usuario actual" icon={UserRound} />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-[var(--border)] bg-[var(--pixel-highlight)] retro pixel-text-sm shadow-[2px_2px_0_var(--pixel-shadow)]">
              {initials(currentUser.fullName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {currentUser.fullName}
              </p>
              <p className="truncate text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                {currentUser.email}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <div className="pixel-inset bg-[var(--surface-2)] p-3">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                Rol
              </p>
              <p className="mt-1 text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {roleLabels[currentUser.role]}
              </p>
            </div>
            <div className="pixel-inset bg-[var(--surface-2)] p-3">
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                Idioma
              </p>
              <p className="mt-1 text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {currentUser.locale}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow="Operacion" title="Preferencias del workspace" icon={SlidersHorizontal} />
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow title="Asignacion automatica" description={`Modo activo: ${preferences.assignmentMode}.`} checked />
              <ToggleRow title="Notas obligatorias" description="Requiere nota antes de mover una oportunidad de etapa." checked={preferences.requireLeadNotesBeforeStageChange} />
              <ToggleRow title="Archivar perdidos" description={`Archiva leads perdidos despues de ${preferences.staleLeadDays} dias.`} checked={preferences.autoArchiveLostLeads} />
              <ToggleRow title="Reporte semanal" description={`Horario laboral: ${preferences.businessHours.mondayToFriday}.`} checked={false} />
            </div>
          </section>

          <section className="pixel-card-sm overflow-hidden bg-white">
            <div className="border-b-2 border-[var(--border)] bg-[var(--surface-2)] p-5">
              <SectionHeader eyebrow="Equipo" title="Miembros y roles" icon={UsersRound} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm" style={bodyTextStyle}>
                <thead>
                  <tr>
                    {["Nombre", "Email", "Rol", "Estado", "Actividad"].map((heading) => (
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
                    <tr key={member.email} className="border-b border-[#E4E4E7] last:border-b-0">
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--text)" }}>
                        {member.fullName}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-3)" }}>
                        {member.email}
                      </td>
                      <td className="px-4 py-3">
                        <Tag>{roleLabels[member.role]}</Tag>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-xs font-bold" style={{ color: "var(--text-2)" }}>
                          <span className="h-2 w-2 bg-[var(--c-qualified)]" />
                          {statusLabels[member.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-3)" }}>
                        {compactDate(member.lastActiveAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="pixel-card-sm bg-white p-5">
              <SectionHeader eyebrow="Zonas" title="Cobertura comercial" icon={MapPin} />
              <div className="flex flex-wrap gap-2">
                {workZones.map((zone) => (
                  <Tag key={zone.id}>
                    <span className="mr-1 inline-block h-2 w-2" style={{ background: zonePriorityColors[zone.priority] }} />
                    {zone.name}
                  </Tag>
                ))}
              </div>
            </div>
            <div className="pixel-card-sm bg-white p-5">
              <SectionHeader eyebrow="Categorias" title="Rubros activos" icon={Globe2} />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Tag key={category}>{category}</Tag>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow="Plan" title="Uso mensual" icon={CreditCard} />
            <div className="space-y-4">
              {usage.map((item) => (
                <UsageRow key={item.label} {...item} />
              ))}
            </div>
          </section>

          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow="Seguridad" title="Acceso y sesiones" icon={ShieldCheck} />
            <div className="grid gap-3">
              <div className="flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--surface)] p-3">
                <KeyRound size={16} />
                <div>
                  <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    Password activo
                  </p>
                  <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                    Rotacion cada {security.passwordRotationDays} dias
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-2 border-[var(--border)] bg-[var(--surface)] p-3">
                <BadgeCheck size={16} />
                <div>
                  <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                    Dominios permitidos
                  </p>
                  <p className="text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                    {security.allowedEmailDomains.join(", ")}
                  </p>
                </div>
              </div>
              <ToggleRow title="Verificacion en dos pasos" description={`Nivel de seguridad: ${security.level}.`} checked={security.twoFactorRequired} />
            </div>
          </section>

          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow="Sistema" title="Notificaciones" icon={Bell} />
            <div className="space-y-3">
              <ToggleRow title="Nuevos leads" description="Avisar al detectar oportunidades nuevas." checked={preferences.preferredContactChannels.includes("app")} />
              <ToggleRow title="Email operativo" description="Enviar alertas y reportes al correo del equipo." checked={preferences.preferredContactChannels.includes("email")} />
              <ToggleRow title="WhatsApp comercial" description="Usar WhatsApp como canal preferido de seguimiento." checked={preferences.preferredContactChannels.includes("whatsapp")} />
            </div>
          </section>

          <section className="pixel-card-sm bg-white p-5">
            <SectionHeader eyebrow="Auditoria" title="Actividad reciente" icon={Activity} />
            <div className="space-y-3">
              {[`${currentUser.displayName} reviso seguridad`, "Mariana actualizo zonas", "Carlos cerro 3 oportunidades"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-2)" }}>
                  <CheckCircle2 size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
