"use client";
import { useState } from "react";
import type { View } from "@/types";
import { Sidebar } from "@/components/leadscout/sidebar";
import { Topbar } from "@/components/leadscout/topbar";
import { Dashboard } from "@/components/leadscout/dashboard";
import { Explorer } from "@/components/leadscout/explorer";
import { Oportunidades } from "@/components/leadscout/oportunidades";
import { ModulePlaceholder } from "@/components/leadscout/module-placeholder";
import type { PendingView } from "@/types";

const PENDING_VIEWS = new Set<View>(["leads", "campanas", "reportes", "integraciones", "configuracion"]);

export default function Home() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar active={view} onChange={setView} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar view={view} />

        <main className="flex-1 overflow-auto">
          {view === "dashboard" && <Dashboard />}
          {view === "explorer" && <Explorer />}
          {view === "oportunidades" && <Oportunidades />}
          {PENDING_VIEWS.has(view) && <ModulePlaceholder view={view as PendingView} />}
        </main>
      </div>
    </div>
  );
}
