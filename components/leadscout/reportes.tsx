import { BarChart3, CheckCircle2, CircleDot, Clock3, TrendingUp } from "lucide-react";
import { getLeads } from "@/lib/api/leads";
import { getReportSummary, EMPTY_SUMMARY } from "@/lib/api/reports";
import { ChartAreaStep } from "@/components/ui/8bit-chart-area-step";
import { EmptyInsight } from "@/components/ui/empty-insight";
import type { LeadPriority, LeadStatus } from "@/lib/data";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevos",
  contactado: "Contactados",
  calificado: "Calificados",
  perdido: "Perdidos",
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  nuevo: "var(--c-new)",
  contactado: "var(--c-contacted)",
  calificado: "var(--c-qualified)",
  perdido: "var(--c-lost)",
};

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function ReportMetric({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: typeof BarChart3;
}) {
  return (
    <div className="pixel-card-sm bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {label}
          </p>
          <p className="retro mt-3 text-2xl font-black tabular-nums" style={{ color: "var(--text)" }}>
            {value}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface-2)]">
          <Icon size={15} />
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
        {sub}
      </p>
    </div>
  );
}

function FunnelRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const width = percent(value, total);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold" style={bodyTextStyle}>
        <span style={{ color: "var(--text-2)" }}>{label}</span>
        <span className="tabular-nums" style={{ color: "var(--text)" }}>
          {value} / {width}%
        </span>
      </div>
      <div className="h-5 border-2 border-[var(--border)] bg-[var(--surface)] p-[2px]">
        <div className="h-full transition-[width] duration-200" style={{ width: `${width}%`, background: color }} />
      </div>
    </div>
  );
}

function CompactList({ title, rows }: { title: string; rows: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  const hasValues = rows.some((row) => row.value > 0);
  return (
    <section className="pixel-card-sm bg-white p-5">
      <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text)" }}>
        {title}
      </p>
      <div className="mt-4 space-y-3">
        {!hasValues && (
          <EmptyInsight
            title="Aun no hay datos suficientes"
            description="Cuando explores una zona, este reporte empezara a mostrar patrones utiles."
            compact
          />
        )}
        {hasValues && rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold" style={bodyTextStyle}>
              <span style={{ color: "var(--text-2)" }}>{row.label}</span>
              <span className="tabular-nums" style={{ color: "var(--text)" }}>{row.value}</span>
            </div>
            <div className="h-4 border-2 border-[var(--border)] bg-[var(--surface)] p-[2px]">
              <div
                className="h-full"
                style={{
                  width: `${Math.max(8, percent(row.value, max))}%`,
                  background: row.color ?? "var(--text)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function Reportes() {
  const [leads, summary] = await Promise.all([
    getLeads().catch(() => []),
    getReportSummary().catch(() => EMPTY_SUMMARY),
  ]);

  const sampleTotal = leads.length;
  const qualified = summary.by_status["calificado"] ?? 0;
  const contacted = (summary.by_status["contactado"] ?? 0) + qualified;
  const highRisk = leads.filter((l) => l.score <= 20).length;
  const conversion = percent(qualified, sampleTotal);

  const statusRows = (Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => ({
    label: STATUS_LABELS[status],
    value: summary.by_status[status] ?? 0,
    color: STATUS_COLORS[status],
  }));

  const priorityRows = (Object.keys(PRIORITY_LABELS) as LeadPriority[]).map((priority) => ({
    label: PRIORITY_LABELS[priority],
    value: summary.by_priority[priority] ?? 0,
  }));

  const categoryRows = Object.entries(summary.by_category)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const chartData = summary.weekly_activity.map((d) => ({
    label: DAYS[new Date(d.date + "T12:00:00").getDay()],
    value: d.leads,
  }));

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <div data-stagger className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric label="Total leads" value={summary.total_leads} sub="Base estimada del workspace" icon={BarChart3} />
        <ReportMetric label="Contactados" value={summary.contacted} sub="En seguimiento comercial" icon={Clock3} />
        <ReportMetric label="Conversion" value={`${conversion}%`} sub="Calificados en la muestra" icon={TrendingUp} />
        <ReportMetric label="Criticos" value={highRisk} sub="Score igual o menor a 20" icon={CircleDot} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <ChartAreaStep title="Actividad semanal" eyebrow="Leads detectados por dia" data={chartData} />

          <section className="pixel-card-sm bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  Pipeline
                </p>
                <h2 className="retro pixel-text-sm mt-2 uppercase" style={{ color: "var(--text)" }}>
                  Conversion por etapa
                </h2>
              </div>
              <div className="pixel-inset bg-[var(--surface-2)] px-3 py-2 text-right">
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  Muestra
                </p>
                <p className="retro pixel-text-sm tabular-nums" style={{ color: "var(--text)" }}>
                  {sampleTotal}
                </p>
              </div>
            </div>
            {sampleTotal === 0 ? (
              <EmptyInsight
                title="El pipeline se activara pronto"
                description="Ejecuta una primera exploracion y aqui veremos como avanzan los leads por etapa."
                action="Explora una zona para iniciar el reporte"
                compact
                className="mt-5"
              />
            ) : (
              <div className="mt-5 space-y-4">
                {statusRows.map((row) => (
                  <FunnelRow key={row.label} label={row.label} value={row.value} total={sampleTotal} color={row.color} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="pixel-card-sm bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-[var(--border)] bg-[var(--surface-2)]">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  Lectura rapida
                </p>
                <h2 className="retro pixel-text-sm mt-1 uppercase" style={{ color: "var(--text)" }}>
                  Salud comercial
                </h2>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {sampleTotal === 0 ? (
                <EmptyInsight
                  title="Todavia no hay actividad comercial"
                  description="En cuanto explores una zona, aqui resumiremos prioridades, avances y oportunidades listas para seguimiento."
                  action="Empieza con una busqueda en Explorer"
                  compact
                />
              ) : (
                <>
                  <div className="pixel-inset bg-[var(--surface-2)] p-3">
                    <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {contacted} leads ya tienen avance comercial.
                    </p>
                    <p className="mt-1 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                      Prioriza los negocios criticos sin contacto para subir velocidad del pipeline.
                    </p>
                  </div>
                  <div className="pixel-inset bg-[var(--surface-2)] p-3">
                    <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                      {qualified} oportunidades estan calificadas.
                    </p>
                    <p className="mt-1 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                      Usalas como base para propuestas y siguientes reportes de cierre.
                    </p>
                  </div>
                </>
              )}
            </div>
          </section>

          <CompactList title="Prioridad" rows={priorityRows} />
          <CompactList title="Categorias" rows={categoryRows} />
        </div>
      </div>
    </div>
  );
}
