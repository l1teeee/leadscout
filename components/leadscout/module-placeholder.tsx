import { Switch } from "@/components/ui/8bit-switch";
import { Spinner } from "@/components/ui/8bit-spinner";
import type { ModulePlaceholderProps, PendingView } from "@/types";

const MODULE_COPY: Record<
  PendingView,
  {
    eyebrow: string;
    title: string;
    description: string;
    status: string;
    queue: string[];
  }
> = {
  leads: {
    eyebrow: "Operación",
    title: "Leads",
    description: "Listado central para administrar negocios detectados, estados y próximos contactos.",
    status: "Base de leads en preparación",
    queue: ["segmentos", "asignaciones", "acciones masivas"],
  },
  campanas: {
    eyebrow: "Operación",
    title: "Campañas",
    description: "Espacio para organizar secuencias, mensajes y acciones comerciales por segmento.",
    status: "Motor de campañas pendiente",
    queue: ["plantillas", "secuencias", "métricas por envío"],
  },
  reportes: {
    eyebrow: "Análisis",
    title: "Reportes",
    description: "Métricas para revisar actividad, conversión y calidad de oportunidades.",
    status: "Panel analítico en cola",
    queue: ["conversión", "actividad", "calidad del pipeline"],
  },
  integraciones: {
    eyebrow: "Sistema",
    title: "Integraciones",
    description: "Conexiones con herramientas externas para enriquecer datos y sincronizar trabajo.",
    status: "Conectores no instalados",
    queue: ["crm", "email", "enriquecimiento"],
  },
  configuracion: {
    eyebrow: "Sistema",
    title: "Configuración",
    description: "Preferencias generales del workspace, equipo y reglas operativas.",
    status: "Preferencias listas para definir",
    queue: ["equipo", "reglas", "workspace"],
  },
};

export function ModulePlaceholder({ view }: ModulePlaceholderProps) {
  const copy = MODULE_COPY[view];

  return (
    <div className="w-full animate-fade-up p-4 sm:p-6 lg:p-8">
      <section className="pixel-card w-full overflow-hidden">
        <div className="flex items-center justify-between border-b-[4px] border-[var(--border)] bg-[var(--surface-2)] px-5 py-3">
          <p className="retro pixel-text-xs font-bold uppercase" style={{ color: "var(--text-2)" }}>
            {copy.eyebrow}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 border-[3px] border-[var(--border)] bg-[#E63946]" />
            <span className="h-3 w-3 border-[3px] border-[var(--border)] bg-[#FFFFFF]" />
            <span className="h-3 w-3 border-[3px] border-[var(--border)] bg-[#3FAE2A]" />
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[1fr_220px]">
          <div>
            <h2
              className="retro text-xl font-bold uppercase leading-relaxed"
              style={{ color: "var(--text)" }}
            >
              {copy.title}
            </h2>
            <p
              className="retro pixel-text-sm mt-3"
              style={{ color: "var(--text-2)" }}
            >
              {copy.description}
            </p>

            <div className="pixel-inset mt-5 p-4">
              <p className="retro pixel-text-xs font-bold uppercase" style={{ color: "var(--text)" }}>
                {copy.status}
              </p>
            </div>
          </div>

          <aside className="pixel-card-sm bg-[var(--surface-2)] p-4">
            <p className="retro pixel-text-xs font-bold uppercase" style={{ color: "var(--text)" }}>
              Cola
            </p>
            <div className="mt-3 space-y-2">
              {copy.queue.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 border-[3px] border-[var(--border)] bg-[var(--surface)] px-2 py-1.5"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center border-[3px] border-[var(--border)] bg-[var(--pixel-highlight)] retro pixel-text-xs font-bold leading-none"
                    style={{ color: "var(--text)" }}
                  >
                    {index + 1}
                  </span>
                  <span
                    className="retro pixel-text-xs uppercase"
                    style={{ color: "var(--text-2)" }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {view === "configuracion" && (
          <div className="border-t-2 border-[var(--border)] p-6">
            <p className="retro pixel-text-xs font-bold uppercase" style={{ color: "var(--text)" }}>
              Componentes
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="pixel-card-sm p-4">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Switch 8-bit
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>
                    Modo compacto
                  </span>
                  <Switch defaultChecked aria-label="Modo compacto" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm" style={{ color: "var(--text-2)" }}>
                    Alertas activas
                  </span>
                  <Switch aria-label="Alertas activas" />
                </div>
              </div>

              <div className="pixel-card-sm p-4">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Loaders
                </p>
                <div className="mt-4 flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" label="Cargando leads" />
                    <span className="text-sm" style={{ color: "var(--text-2)" }}>
                      Leads
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner variant="diamond" size="md" label="Sincronizando" />
                    <span className="text-sm" style={{ color: "var(--text-2)" }}>
                      Sync
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
