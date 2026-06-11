"use client";

import { useEffect, useState } from "react";
import {
  getAudit,
  getTeam,
  getUsage,
  type AuditEntryData,
  type TeamMemberData,
  type UsageData,
} from "@/lib/api/settings";

export interface SettingsPanels {
  team: TeamMemberData[];
  usage: UsageData | null;
  audit: AuditEntryData[];
  loading: boolean;
}

// Loads the live Settings panels (team, plan/usage, audit). Each source is
// independent: one failing endpoint never blanks the others.
export function useSettingsPanels(): SettingsPanels {
  const [team, setTeam] = useState<TeamMemberData[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [audit, setAudit] = useState<AuditEntryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getTeam(), getUsage(), getAudit()]).then(([t, u, a]) => {
      if (!active) return;
      if (t.status === "fulfilled") setTeam(t.value);
      if (u.status === "fulfilled") setUsage(u.value);
      if (a.status === "fulfilled") setAudit(a.value);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { team, usage, audit, loading };
}
