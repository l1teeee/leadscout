import { cookies } from "next/headers";
import { getLeads } from "@/lib/api/leads";
import { getReportSummary, EMPTY_SUMMARY } from "@/lib/api/reports";
import { StatusBadge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { ChartAreaStep } from "@/components/ui/8bit-chart-area-step";
import { OnboardingTour } from "@/components/leadscout/onboarding-tour";
import { EmptyInsight } from "@/components/ui/empty-insight";
import type { KpiCardProps } from "@/types";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function toChartData(activity: { date: string; leads: number }[]) {
  return activity.map((d) => ({
    label: DAYS[new Date(d.date + "T12:00:00").getDay()],
    value: d.leads,
  }));
}

function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <div className="pixel-card-sm bg-white p-4 transition-transform hover:-translate-y-0.5">
      <p
        className="retro pixel-text-xs mb-3 uppercase"
        style={{ color: "var(--text-3)" }}
      >
        {label}
      </p>
      <p
        className="retro text-2xl font-black tabular-nums sm:text-3xl"
        style={{ color: "var(--text)" }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="mt-2 text-xs font-medium"
          style={{ ...bodyTextStyle, color: "var(--text-3)" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export async function Dashboard() {
  const token = (await cookies()).get("ls_token")?.value;
  const [leads, summary] = await Promise.all([
    getLeads({}, token).catch(() => []),
    getReportSummary(token).catch(() => EMPTY_SUMMARY),
  ]);

  const recent = leads.slice(0, 5);
  const chartData = toChartData(summary.weekly_activity);

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <OnboardingTour />

      <div data-tour="dashboard-kpis" data-stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total leads" value={summary.total_leads} sub="en base de datos" />
        <KpiCard label="Esta semana" value={summary.new_this_week} sub="detectados" />
        <KpiCard label="Contactados" value={summary.contacted} sub="en seguimiento" />
        <KpiCard label="Score promedio" value={summary.avg_score} sub="sobre 100" />
      </div>

      <div data-stagger className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(520px,0.9fr)]">
        <div data-tour="dashboard-leads" className="pixel-card-sm overflow-hidden bg-white">
          <div
            className="bg-[#F4F4F5] px-5 py-3.5"
            style={{ borderBottom: "2px solid var(--pixel-border, #18181B)" }}
          >
            <h2
              className="retro pixel-text-sm font-black uppercase"
              style={{ color: "var(--text)" }}
            >
              Leads recientes
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm" style={bodyTextStyle}>
              <thead className="bg-white">
                <tr style={{ background: "#FAFAF9" }}>
                  {["Negocio", "Categoría", "Score", "Estado"].map((h) => (
                    <th
                      key={h}
                      className="retro px-5 py-3 text-left text-[10px] font-black uppercase"
                      style={{
                        color: "var(--text-3)",
                        borderBottom: "2px solid var(--pixel-border, #18181B)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className="cursor-pointer transition-colors hover:bg-[#F4F4F5]"
                    style={{
                      borderBottom: i < recent.length - 1 ? "2px solid #E4E4E7" : undefined,
                    }}
                  >
                    <td className="px-5 py-3">
                      <p className="font-bold" style={{ color: "var(--text)" }}>
                        {lead.name}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>
                        {lead.location}
                      </p>
                    </td>
                    <td
                      className="px-5 py-3 font-semibold"
                      style={{ color: "var(--text-2)" }}
                    >
                      {lead.category}
                    </td>
                    <td className="w-40 px-5 py-3">
                      <div className="pixel-inset bg-white p-1">
                        <ScoreBar score={lead.score} />
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyInsight
                        title="Aún no hay leads recientes"
                        description="Hacé tu primera exploración y pronto encontraremos oportunidades para tu pipeline."
                        action="Empezá en Explorer para llenar esta tabla"
                        compact
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ChartAreaStep
          title="Actividad semanal"
          eyebrow="Leads detectados por día"
          data={chartData}
          className="min-h-[420px]"
          data-tour="dashboard-chart"
        />
      </div>
    </div>
  );
}
