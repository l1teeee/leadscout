export type WorkspaceStatus = "activo" | "pausado" | "revision";
export type TeamRole = "owner" | "admin" | "ventas" | "analista" | "viewer";
export type TeamMemberStatus = "activo" | "invitado" | "suspendido";
export type NotificationChannel = "email" | "whatsapp" | "app";
export type LeadAssignmentMode = "manual" | "round_robin" | "por_zona";
export type ZonePriority = "alta" | "media" | "baja";
export type SubscriptionPlan = "starter" | "growth" | "agency";
export type SecurityLevel = "basico" | "recomendado" | "estricto";

export interface WorkspaceAgency {
  id: string;
  name: string;
  legalName: string;
  status: WorkspaceStatus;
  industry: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  timezone: string;
  currency: string;
  language: string;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  workspaceId: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  role: TeamRole;
  title: string;
  avatarUrl: string;
  locale: string;
  timezone: string;
  lastLoginAt: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: TeamRole;
  title: string;
  status: TeamMemberStatus;
  assignedZones: string[];
  monthlyLeadQuota: number;
  closedDealsThisMonth: number;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface OperationalPreferences {
  defaultLeadOwnerId: string;
  assignmentMode: LeadAssignmentMode;
  leadScoreThreshold: number;
  maxDailyLeadsPerAgent: number;
  followUpWindowHours: number;
  staleLeadDays: number;
  preferredContactChannels: NotificationChannel[];
  businessHours: {
    mondayToFriday: string;
    saturday: string;
    sunday: string;
  };
  autoArchiveLostLeads: boolean;
  requireLeadNotesBeforeStageChange: boolean;
}

export interface WorkZone {
  id: string;
  name: string;
  department: string;
  municipalities: string[];
  priority: ZonePriority;
  radiusKm: number;
  monthlyLeadTarget: number;
  activeAgents: number;
  categories: string[];
  notes: string;
}

export interface PlanUsage {
  plan: SubscriptionPlan;
  billingCycle: "mensual" | "anual";
  renewalDate: string;
  seats: {
    used: number;
    limit: number;
  };
  leads: {
    usedThisMonth: number;
    monthlyLimit: number;
  };
  searches: {
    usedThisMonth: number;
    monthlyLimit: number;
  };
  exports: {
    usedThisMonth: number;
    monthlyLimit: number;
  };
  storageGb: {
    used: number;
    limit: number;
  };
}

export interface SecuritySettings {
  level: SecurityLevel;
  twoFactorRequired: boolean;
  allowedEmailDomains: string[];
  passwordRotationDays: number;
  sessionTimeoutMinutes: number;
  loginAlertsEnabled: boolean;
  dataExportRequiresAdmin: boolean;
  lastSecurityReviewAt: string;
  activeSessions: number;
}

export const SETTINGS_WORKSPACE: WorkspaceAgency = {
  id: "ws-ls-sv-001",
  name: "Pulso Digital SV",
  legalName: "Pulso Digital, S.A. de C.V.",
  status: "activo",
  industry: "Agencia de marketing y prospeccion B2B",
  country: "El Salvador",
  city: "San Salvador",
  address: "Colonia Escalon, 79 Avenida Norte, San Salvador",
  phone: "+503 2223-4180",
  email: "operaciones@pulsodigitalsv.com",
  website: "https://pulsodigitalsv.com",
  taxId: "0614-120322-101-3",
  timezone: "America/El_Salvador",
  currency: "USD",
  language: "es-SV",
  createdAt: "2026-01-15",
};

export const SETTINGS_CURRENT_USER: CurrentUser = {
  id: "usr-001",
  workspaceId: "ws-ls-sv-001",
  fullName: "Alejandro Morales",
  displayName: "Alejandro",
  email: "alejandro@pulsodigitalsv.com",
  phone: "+503 7741-2098",
  role: "owner",
  title: "Director comercial",
  avatarUrl: "/avatars/alejandro.png",
  locale: "es-SV",
  timezone: "America/El_Salvador",
  lastLoginAt: "2026-06-03T08:42:00-06:00",
};

export const SETTINGS_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "usr-001",
    fullName: "Alejandro Morales",
    email: "alejandro@pulsodigitalsv.com",
    phone: "+503 7741-2098",
    role: "owner",
    title: "Director comercial",
    status: "activo",
    assignedZones: ["zone-ss", "zone-la-libertad"],
    monthlyLeadQuota: 80,
    closedDealsThisMonth: 7,
    joinedAt: "2026-01-15",
    lastActiveAt: "2026-06-03T08:42:00-06:00",
  },
  {
    id: "usr-002",
    fullName: "Mariana Rivas",
    email: "mariana@pulsodigitalsv.com",
    phone: "+503 7602-8841",
    role: "admin",
    title: "Coordinadora de operaciones",
    status: "activo",
    assignedZones: ["zone-ss", "zone-santa-tecla"],
    monthlyLeadQuota: 65,
    closedDealsThisMonth: 5,
    joinedAt: "2026-02-01",
    lastActiveAt: "2026-06-02T17:20:00-06:00",
  },
  {
    id: "usr-003",
    fullName: "Carlos Henriquez",
    email: "carlos@pulsodigitalsv.com",
    phone: "+503 7886-3114",
    role: "ventas",
    title: "Ejecutivo de cuentas",
    status: "activo",
    assignedZones: ["zone-santa-ana"],
    monthlyLeadQuota: 55,
    closedDealsThisMonth: 3,
    joinedAt: "2026-03-10",
    lastActiveAt: "2026-06-03T07:55:00-06:00",
  },
  {
    id: "usr-004",
    fullName: "Sofia Aguilar",
    email: "sofia@pulsodigitalsv.com",
    phone: "+503 7018-5520",
    role: "analista",
    title: "Analista de prospeccion",
    status: "activo",
    assignedZones: ["zone-san-miguel", "zone-usulutan"],
    monthlyLeadQuota: 45,
    closedDealsThisMonth: 2,
    joinedAt: "2026-04-04",
    lastActiveAt: "2026-06-02T15:12:00-06:00",
  },
  {
    id: "usr-005",
    fullName: "Diego Calderon",
    email: "diego@pulsodigitalsv.com",
    phone: "+503 7510-6409",
    role: "viewer",
    title: "Cliente invitado",
    status: "invitado",
    assignedZones: [],
    monthlyLeadQuota: 0,
    closedDealsThisMonth: 0,
    joinedAt: "2026-05-28",
  },
];

export const SETTINGS_OPERATIONAL_PREFERENCES: OperationalPreferences = {
  defaultLeadOwnerId: "usr-002",
  assignmentMode: "por_zona",
  leadScoreThreshold: 68,
  maxDailyLeadsPerAgent: 18,
  followUpWindowHours: 24,
  staleLeadDays: 10,
  preferredContactChannels: ["whatsapp", "email", "app"],
  businessHours: {
    mondayToFriday: "08:00-18:00",
    saturday: "09:00-13:00",
    sunday: "cerrado",
  },
  autoArchiveLostLeads: true,
  requireLeadNotesBeforeStageChange: true,
};

export const SETTINGS_WORK_ZONES: WorkZone[] = [
  {
    id: "zone-ss",
    name: "San Salvador Centro",
    department: "San Salvador",
    municipalities: ["San Salvador", "Mejicanos", "Soyapango", "Ilopango"],
    priority: "alta",
    radiusKm: 18,
    monthlyLeadTarget: 120,
    activeAgents: 2,
    categories: ["Restaurantes", "Clinicas", "Retail", "Servicios profesionales"],
    notes: "Zona principal para cuentas con alta urgencia digital y presencia local activa.",
  },
  {
    id: "zone-santa-tecla",
    name: "Santa Tecla y Antiguo Cuscatlan",
    department: "La Libertad",
    municipalities: ["Santa Tecla", "Antiguo Cuscatlan", "Nuevo Cuscatlan"],
    priority: "alta",
    radiusKm: 14,
    monthlyLeadTarget: 95,
    activeAgents: 2,
    categories: ["Cafeterias", "Bienes raices", "Educacion", "Salud"],
    notes: "Buen potencial para paquetes premium de sitio web, pauta y automatizacion.",
  },
  {
    id: "zone-la-libertad",
    name: "Costa La Libertad",
    department: "La Libertad",
    municipalities: ["La Libertad", "Tamanique", "Chiltiupan"],
    priority: "media",
    radiusKm: 32,
    monthlyLeadTarget: 55,
    activeAgents: 1,
    categories: ["Turismo", "Hoteles", "Restaurantes", "Tours"],
    notes: "Negocios con temporadas fuertes; priorizar WhatsApp Business y reservas online.",
  },
  {
    id: "zone-santa-ana",
    name: "Santa Ana Metropolitana",
    department: "Santa Ana",
    municipalities: ["Santa Ana", "Chalchuapa", "Coatepeque"],
    priority: "media",
    radiusKm: 25,
    monthlyLeadTarget: 70,
    activeAgents: 1,
    categories: ["Automotriz", "Ferreterias", "Clinicas", "Comercio local"],
    notes: "Mercado estable para auditorias de Google Business Profile y landing pages.",
  },
  {
    id: "zone-san-miguel",
    name: "San Miguel Urbano",
    department: "San Miguel",
    municipalities: ["San Miguel", "Quelepa", "Moncagua"],
    priority: "media",
    radiusKm: 22,
    monthlyLeadTarget: 60,
    activeAgents: 1,
    categories: ["Restaurantes", "Retail", "Servicios", "Salud"],
    notes: "Prospectar negocios con baja presencia en mapas y poca actividad en redes.",
  },
  {
    id: "zone-usulutan",
    name: "Usulutan y Bahia de Jiquilisco",
    department: "Usulutan",
    municipalities: ["Usulutan", "Puerto El Triunfo", "Jiquilisco"],
    priority: "baja",
    radiusKm: 30,
    monthlyLeadTarget: 35,
    activeAgents: 1,
    categories: ["Turismo", "Agronegocios", "Restaurantes", "Servicios locales"],
    notes: "Zona secundaria para exploracion; validar demanda antes de abrir campanas masivas.",
  },
];

export const SETTINGS_PLAN_USAGE: PlanUsage = {
  plan: "agency",
  billingCycle: "mensual",
  renewalDate: "2026-06-15",
  seats: {
    used: 5,
    limit: 8,
  },
  leads: {
    usedThisMonth: 428,
    monthlyLimit: 1200,
  },
  searches: {
    usedThisMonth: 316,
    monthlyLimit: 900,
  },
  exports: {
    usedThisMonth: 18,
    monthlyLimit: 50,
  },
  storageGb: {
    used: 3.7,
    limit: 20,
  },
};

export const SETTINGS_SECURITY: SecuritySettings = {
  level: "recomendado",
  twoFactorRequired: true,
  allowedEmailDomains: ["pulsodigitalsv.com"],
  passwordRotationDays: 90,
  sessionTimeoutMinutes: 480,
  loginAlertsEnabled: true,
  dataExportRequiresAdmin: true,
  lastSecurityReviewAt: "2026-05-20",
  activeSessions: 6,
};
