export type Lang = "en" | "es";

type ModuleTranslation = {
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  queue: string[];
};

type LangTranslations = {
  nav: {
    sections: { main: string; operations: string; system: string };
    items: Record<string, string>;
  };
  topbar: {
    titles: Record<string, string>;
    signOut: string;
    userMenu: string;
    settings: string;
  };
  modules: Record<string, ModuleTranslation>;
  queue: string;
  langToggle: string;
};

export const translations: Record<Lang, LangTranslations> = {
  en: {
    nav: {
      sections: { main: "Main", operations: "Operations", system: "System" },
      items: {
        dashboard: "Dashboard",
        explorer: "Explorer",
        opportunities: "Opportunities",
        leads: "Leads",
        campaigns: "Campaigns",
        reports: "Reports",
        integrations: "Integrations",
        settings: "Settings",
      },
    },
    topbar: {
      titles: {
        "/dashboard": "Dashboard",
        "/explorer": "Explorer",
        "/opportunities": "Opportunities",
        "/leads": "Leads",
        "/campaigns": "Campaigns",
        "/reports": "Reports",
        "/integrations": "Integrations",
        "/settings": "Settings",
      },
      signOut: "Sign out",
      userMenu: "User menu",
      settings: "Settings",
    },
    modules: {
      leads: {
        eyebrow: "Operations",
        title: "Leads",
        description: "Central list to manage detected businesses, statuses and next contacts.",
        status: "Leads base in preparation",
        queue: ["segments", "assignments", "bulk actions"],
      },
      campaigns: {
        eyebrow: "Operations",
        title: "Campaigns",
        description: "Organize sequences, messages and commercial actions by segment.",
        status: "Campaign engine pending",
        queue: ["templates", "sequences", "metrics per send"],
      },
      reports: {
        eyebrow: "Analytics",
        title: "Reports",
        description: "Metrics to review activity, conversion and opportunity quality.",
        status: "Analytics panel in queue",
        queue: ["conversion", "activity", "pipeline quality"],
      },
      integrations: {
        eyebrow: "System",
        title: "Integrations",
        description: "Connections with external tools to enrich data and sync work.",
        status: "Connectors not installed",
        queue: ["crm", "email", "enrichment"],
      },
      settings: {
        eyebrow: "System",
        title: "Settings",
        description: "General workspace preferences, team and operational rules.",
        status: "Preferences ready to define",
        queue: ["team", "rules", "workspace"],
      },
    },
    queue: "Queue",
    langToggle: "ES",
  },
  es: {
    nav: {
      sections: { main: "Principal", operations: "Operación", system: "Sistema" },
      items: {
        dashboard: "Dashboard",
        explorer: "Explorer",
        opportunities: "Oportunidades",
        leads: "Leads",
        campaigns: "Campañas",
        reports: "Reportes",
        integrations: "Integraciones",
        settings: "Configuración",
      },
    },
    topbar: {
      titles: {
        "/dashboard": "Dashboard",
        "/explorer": "Explorer",
        "/opportunities": "Oportunidades",
        "/leads": "Leads",
        "/campaigns": "Campañas",
        "/reports": "Reportes",
        "/integrations": "Integraciones",
        "/settings": "Configuración",
      },
      signOut: "Cerrar sesión",
      userMenu: "Menú de usuario",
      settings: "Configuración",
    },
    modules: {
      leads: {
        eyebrow: "Operación",
        title: "Leads",
        description: "Listado central para administrar negocios detectados, estados y próximos contactos.",
        status: "Base de leads en preparación",
        queue: ["segmentos", "asignaciones", "acciones masivas"],
      },
      campaigns: {
        eyebrow: "Operación",
        title: "Campañas",
        description: "Espacio para organizar secuencias, mensajes y acciones comerciales por segmento.",
        status: "Motor de campañas pendiente",
        queue: ["plantillas", "secuencias", "métricas por envío"],
      },
      reports: {
        eyebrow: "Análisis",
        title: "Reportes",
        description: "Métricas para revisar actividad, conversión y calidad de oportunidades.",
        status: "Panel analítico en cola",
        queue: ["conversión", "actividad", "calidad del pipeline"],
      },
      integrations: {
        eyebrow: "Sistema",
        title: "Integraciones",
        description: "Conexiones con herramientas externas para enriquecer datos y sincronizar trabajo.",
        status: "Conectores no instalados",
        queue: ["crm", "email", "enriquecimiento"],
      },
      settings: {
        eyebrow: "Sistema",
        title: "Configuración",
        description: "Preferencias generales del workspace, equipo y reglas operativas.",
        status: "Preferencias listas para definir",
        queue: ["equipo", "reglas", "workspace"],
      },
    },
    queue: "Cola",
    langToggle: "EN",
  },
};
