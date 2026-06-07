import { cookies } from "next/headers";
import { getLeads } from "@/lib/api/leads";
import { getReportSummary, EMPTY_SUMMARY } from "@/lib/api/reports";
import { getLang } from "@/lib/get-lang";
import { translations } from "@/lib/i18n";
import { StatusBadge } from "@/components/ui/badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { ChartAreaStep } from "@/components/ui/8bit-chart-area-step";
import { OnboardingTour } from "@/components/leadscout/onboarding-tour";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { RefreshButton } from "@/components/leadscout/refresh-button";
import type { KpiCardProps } from "@/types";

const bodyTextStyle = {
  fontFamily: "var(--font-body), system-ui, sans-serif",
};

function toChartData(activity: { date: string; leads: number }[], days: readonly string[]) {
  return activity.map((d) => ({
    label: days[new Date(d.date + "T12:00:00").getDay()],
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
  const lang = await getLang();
  const tr = translations[lang];
  const token = (await cookies()).get("ls_token")?.value;
  const [leads, summary] = await Promise.all([
    getLeads({}, token).then(r => r.leads).catch(() => []),
    getReportSummary(token).catch(() => EMPTY_SUMMARY),
  ]);

  const recent = leads.slice(0, 5);
  const chartData = toChartData(summary.weekly_activity, tr.dashboard.days);

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <OnboardingTour />

      <div data-tour="dashboard-kpis" data-stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={tr.dashboard.kpi.totalLeads.label} value={summary.total_leads} sub={tr.dashboard.kpi.totalLeads.sub} />
        <KpiCard label={tr.dashboard.kpi.thisWeek.label} value={summary.new_this_week} sub={tr.dashboard.kpi.thisWeek.sub} />
        <KpiCard label={tr.dashboard.kpi.contacted.label} value={summary.contacted} sub={tr.dashboard.kpi.contacted.sub} />
        <KpiCard label={tr.dashboard.kpi.avgScore.label} value={summary.avg_score} sub={tr.dashboard.kpi.avgScore.sub} />
      </div>

      <div data-stagger className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(520px,0.9fr)]">
        <div data-tour="dashboard-leads" className="pixel-card-sm overflow-hidden bg-white">
          <div
            className="flex items-center justify-between bg-[#F4F4F5] px-5 py-3.5"
            style={{ borderBottom: "2px solid var(--pixel-border, #18181B)" }}
          >
            <h2
              className="retro pixel-text-sm font-black uppercase"
              style={{ color: "var(--text)" }}
            >
              {tr.dashboard.recentLeads}
            </h2>
            <RefreshButton label={tr.dashboard.refresh} />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm" style={bodyTextStyle}>
              <thead className="bg-white">
                <tr style={{ background: "#FAFAF9" }}>
                  {tr.dashboard.tableHeaders.map((h) => (
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
                        title={tr.dashboard.empty.title}
                        description={tr.dashboard.empty.description}
                        action={tr.dashboard.empty.action}
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
          title={tr.dashboard.chart.title}
          eyebrow={tr.dashboard.chart.eyebrow}
          data={chartData}
          className="min-h-[420px]"
          data-tour="dashboard-chart"
        />
      </div>
    </div>
  );
}
