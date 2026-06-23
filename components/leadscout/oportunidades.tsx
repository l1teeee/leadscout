import { cookies } from "next/headers";
import { OportunidadesKanban } from "@/components/leadscout/oportunidades-kanban";
import { getLeads } from "@/lib/api/leads";
import type { Lead } from "@/lib/data";

const INITIAL_LIMIT = 50;

export async function Oportunidades() {
  const token = (await cookies()).get("ls_token")?.value;
  const { leads, total } = await getLeads(
    { limit: INITIAL_LIMIT, sort_by: "score", sort_order: "desc" },
    undefined,
    token,
  ).catch(() => ({ leads: [] as Lead[], total: 0 }));

  return <OportunidadesKanban initialLeads={leads} total={total} />;
}
