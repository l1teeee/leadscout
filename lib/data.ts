export type LeadStatus = "nuevo" | "contactado" | "calificado" | "perdido";
export type LeadPriority = "alta" | "media" | "baja";

export interface Lead {
  id: string;
  name: string;
  category: string;
  location: string;
  score: number;
  status: LeadStatus;
  priority: LeadPriority;
  issues: string[];
  phone?: string;
  website?: string;
  lastContact?: string;
}

export const LEADS: Lead[] = [
  {
    id: "1",
    name: "Ferretería Don Osvaldo",
    category: "Ferretería",
    location: "Palermo, CABA",
    score: 14,
    status: "nuevo",
    priority: "alta",
    issues: ["Sin sitio web", "Sin Google My Business", "Sin redes sociales"],
    phone: "+54 11 4832-1100",
  },
  {
    id: "2",
    name: "Estética Valentina",
    category: "Estética",
    location: "Belgrano, CABA",
    score: 28,
    status: "contactado",
    priority: "alta",
    issues: ["Sitio desactualizado", "Sin reservas online", "Sin reseñas"],
    phone: "+54 11 4783-5522",
    website: "esteticavalentina.com.ar",
    lastContact: "2026-05-28",
  },
  {
    id: "3",
    name: "Taller Mecánico Ríos",
    category: "Automotriz",
    location: "Flores, CABA",
    score: 9,
    status: "nuevo",
    priority: "alta",
    issues: ["Sin presencia digital", "Sin WhatsApp Business", "Sin fotos"],
    phone: "+54 11 4631-0088",
  },
  {
    id: "4",
    name: "Panadería El Trigo",
    category: "Gastronomía",
    location: "Villa Urquiza, CABA",
    score: 47,
    status: "calificado",
    priority: "media",
    issues: ["Sin delivery online", "Instagram sin actividad"],
    phone: "+54 11 4522-7733",
    website: "panaderiaeltrigo.com.ar",
    lastContact: "2026-05-30",
  },
  {
    id: "5",
    name: "Librería Gutenberg",
    category: "Retail",
    location: "San Telmo, CABA",
    score: 22,
    status: "nuevo",
    priority: "media",
    issues: ["Sitio sin SSL", "Sin catálogo online", "Velocidad muy baja"],
    phone: "+54 11 4300-4411",
    website: "libreriagtbg.com.ar",
  },
  {
    id: "6",
    name: "Consultorio Dra. Pereyra",
    category: "Salud",
    location: "Recoleta, CABA",
    score: 35,
    status: "contactado",
    priority: "media",
    issues: ["Sin turnos online", "Sin presencia en mapas"],
    phone: "+54 11 4801-2200",
    lastContact: "2026-05-25",
  },
  {
    id: "7",
    name: "Gimnasio Fortis",
    category: "Deportes",
    location: "Caballito, CABA",
    score: 62,
    status: "calificado",
    priority: "baja",
    issues: ["Tracking de conversión ausente"],
    phone: "+54 11 4903-6655",
    website: "fortisgimnasio.com.ar",
    lastContact: "2026-05-31",
  },
  {
    id: "8",
    name: "Vivero Los Aromos",
    category: "Jardín",
    location: "Devoto, CABA",
    score: 11,
    status: "nuevo",
    priority: "alta",
    issues: ["Sin sitio web", "Solo WhatsApp informal", "Sin Google Maps"],
    phone: "+54 11 4504-9900",
  },
  {
    id: "9",
    name: "Cerrajería Rápida 24h",
    category: "Servicios",
    location: "Almagro, CABA",
    score: 18,
    status: "perdido",
    priority: "baja",
    issues: ["Duplicado en Google", "Reseñas negativas sin respuesta"],
    phone: "+54 11 4862-3300",
    lastContact: "2026-04-10",
  },
  {
    id: "10",
    name: "Indumentaria Hilo & Aguja",
    category: "Moda",
    location: "Once, CABA",
    score: 31,
    status: "nuevo",
    priority: "media",
    issues: ["Tienda online rota", "Sin medios de pago digitales"],
    phone: "+54 11 4963-1177",
    website: "hiloaguja.com.ar",
  },
];

export const STATS = {
  totalLeads: 148,
  newThisWeek: 23,
  contacted: 41,
  avgScore: 26,
  highPriority: 38,
};

export const CHART_DATA = [
  { label: "Lun", value: 12 },
  { label: "Mar", value: 19 },
  { label: "Mié", value: 8 },
  { label: "Jue", value: 24 },
  { label: "Vie", value: 17 },
  { label: "Sáb", value: 6 },
  { label: "Dom", value: 3 },
];
