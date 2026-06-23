import { cookies } from "next/headers";
import { OportunidadesKanban } from "@/components/leadscout/oportunidades-kanban";
import { getLeads, MAX_LEADS_LIMIT } from "@/lib/api/leads";
import type { Lead } from "@/lib/data";

export async function Oportunidades() {
  const token = (await cookies()).get("ls_token")?.value;
  const { leads } = await getLeads({ limit: MAX_LEADS_LIMIT }, undefined, token).catch(() => ({ leads: [] as Lead[], total: 0 }));

  return <OportunidadesKanban initialLeads={leads} />;
}
