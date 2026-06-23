import Link from "next/link";
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
import { DashboardQuickWins } from "@/components/leadscout/dashboard-quick-wins";
import PriorityDistribution from "@/components/ui/priority-distribution";
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

const TONE_COLORS: Record<string, string> = {
  neutral: "var(--text)",
  info: "#5B5FEF",
  warning: "#E63946",
  score: "#F4A261",
  success: "#3FAE2A",
  pending: "#9A4A00",
};

function KpiCard({
  label,
  value,
  sub,
  tone = "neutral",
  href,
}: KpiCardProps & {
  tone?: "neutral" | "info" | "warning" | "score" | "success" | "pending";
  href?: string;
}) {
  const valueColor = TONE_COLORS[tone] ?? "var(--text)";
  const valueNode = (
    <p
      className="retro text-2xl font-black tabular-nums sm:text-3xl"
      style={{ color: valueColor }}
    >
      {value}
    </p>
  );

  return (
    <div className="pixel-card-sm bg-white p-4 transition-transform hover:-translate-y-0.5">
      <p
        className="retro pixel-text-xs mb-3 uppercase"
        style={{ color: "var(--text-3)" }}
      >
        {label}
      </p>
      {href ? (
        <Link href={href} className="block transition-opacity hover:opacity-70">
          {valueNode}
        </Link>
      ) : (
        valueNode
      )}
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


function CategoryUsagePanel({
  categories,
  maxCount,
  copy,
  className = "",
}: {
  categories: [string, number][];
  maxCount: number;
  copy: {
    title: string;
    used: string;
    empty: string;
    usage: (used: number, empty: number) => string;
    emptyState: {
      title: string;
      description: string;
    };
  };
  className?: string;
}) {
  return (
    <section className={`pixel-card-sm flex flex-col bg-white p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2
          className="retro pixel-text-xs uppercase"
          style={{ color: "var(--text)" }}
        >
          {copy.title}
        </h2>

        {categories.length > 0 && (
          <div
            className="flex shrink-0 items-center gap-3 text-xs font-semibold"
            style={bodyTextStyle}
          >
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-2)" }}>
              <span className="h-2.5 w-2.5 border border-(--border) bg-[#3FAE2A]" />
              {copy.used}
            </span>
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
              <span className="h-2.5 w-2.5 border border-(--border) bg-(--surface-2)" />
              {copy.empty}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-center gap-4">
        {categories.map(([category, count]) => {
          const usedWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
          const emptyCount = Math.max(maxCount - count, 0);

          return (
            <div key={category}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <p
                  className="retro pixel-text-xs min-w-0 flex-1 truncate uppercase"
                  style={{ color: "var(--text)" }}
                >
                  {category}
                </p>
                <p
                  className="shrink-0 text-xs font-bold tabular-nums"
                  style={{ ...bodyTextStyle, color: "var(--text-2)" }}
                >
                  {copy.usage(count, emptyCount)}
                </p>
              </div>
              <div className="flex h-6 overflow-hidden border-2 border-(--border) bg-(--surface-2)">
                <div
                  className="h-full border-r-2 border-(--border)"
                  style={{
                    width: `${usedWidth}%`,
                    background: "#3FAE2A",
                    borderRightWidth: usedWidth > 0 && usedWidth < 100 ? 2 : 0,
                  }}
                />
                <div
                  className="h-full flex-1"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent 0 10px, rgba(28, 25, 23, 0.12) 10px 12px)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <EmptyInsight
            title={copy.emptyState.title}
            description={copy.emptyState.description}
            compact
          />
        )}
      </div>
    </section>
  );
}

export async function Dashboard() {
  const lang = await getLang();
  const tr = translations[lang];
  const token = (await cookies()).get("ls_token")?.value;
  const [leads, summary] = await Promise.all([
    getLeads({}, undefined, token).then(r => r.leads).catch(() => []),
    getReportSummary(token).catch(() => EMPTY_SUMMARY),
  ]);

  const recent = leads.slice(0, 5);
  const chartData = toChartData(summary.weekly_activity, tr.dashboard.days);
  const quickWins = leads
    .filter((lead) => lead.priority === "alta" && lead.status === "nuevo")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const topCategories = Object.entries(summary.by_category)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const maxCategoryCount = Math.max(...topCategories.map(([, count]) => count), 0);

  return (
    <div className="w-full overflow-x-hidden animate-fade-up p-4 sm:p-6 lg:p-8">
      <OnboardingTour />

      <div data-tour="dashboard-kpis" data-stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label={tr.dashboard.kpi.totalLeads.label} value={summary.total_leads} sub={tr.dashboard.kpi.totalLeads.sub} tone="neutral" />
        <KpiCard label={tr.dashboard.kpi.thisWeek.label} value={summary.new_this_week} sub={tr.dashboard.kpi.thisWeek.sub} tone="info" />
        <KpiCard label={tr.dashboard.kpi.highPriority.label} value={summary.by_priority?.alta ?? 0} sub={tr.dashboard.kpi.highPriority.sub} tone="success" />
        <KpiCard label={tr.dashboard.kpi.avgScore.label} value={summary.avg_score} sub={tr.dashboard.kpi.avgScore.sub} tone="score" />
        <KpiCard label={tr.dashboard.kpi.qualified.label} value={summary.by_status?.calificado ?? 0} sub={tr.dashboard.kpi.qualified.sub} tone="success" />
        <KpiCard label={tr.dashboard.kpi.noContact.label} value={summary.total_leads - summary.contacted} sub={tr.dashboard.kpi.noContact.sub} tone="pending" />
      </div>

      <div data-stagger className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-5">
          <DashboardQuickWins
            leads={quickWins}
            priorityLabels={tr.leadPriority}
            copy={{
              title: tr.dashboard.quickWins.title,
              description: tr.dashboard.quickWins.description,
              readyLabel: tr.dashboard.quickWins.ready(quickWins.length),
              empty: tr.dashboard.quickWins.empty,
            }}
          />

          <PriorityDistribution
            variant="horizontal"
            by_priority={summary.by_priority}
            labels={tr.dashboard.priority.labels}
            title={tr.dashboard.priority.title}
            className="min-h-[150px]"
          />
        </div>

        <div className="space-y-5">
          <CategoryUsagePanel
            categories={topCategories}
            maxCount={maxCategoryCount}
            copy={tr.dashboard.categories}
            className="min-h-[150px]"
          />

          <div className="overflow-hidden">
            <ChartAreaStep
              title={tr.dashboard.chart.title}
              eyebrow={tr.dashboard.chart.eyebrow}
              data={chartData}
              className="min-h-[420px]"
              data-tour="dashboard-chart"
            />
          </div>
        </div>
      </div>

      <div data-stagger>
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
      </div>
    </div>
  );
}
