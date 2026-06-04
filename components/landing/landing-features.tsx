"use client";

import { BarChart2, Mail, MapPin, TrendingUp, Users, Zap } from "lucide-react";
import type { ElementType } from "react";
import { useIntersection } from "@/hooks/use-intersection";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const features: Array<{ icon: ElementType; name: string; description: string }> = [
  {
    icon: MapPin,
    name: "Explorer",
    description:
      "Explora el mapa y descubrí negocios por zona y rubro. Ajusta el radio de búsqueda y filtra por categoría en tiempo real.",
  },
  {
    icon: Users,
    name: "Leads",
    description:
      "Gestión completa de prospectos con scoring automático de 0 a 100. Prioriza, filtra y contacta desde un solo lugar.",
  },
  {
    icon: TrendingUp,
    name: "Oportunidades",
    description:
      "Rastrea y prioriza tus mejores oportunidades. Visualiza el pipeline completo y detecta dónde enfocar esfuerzos.",
  },
  {
    icon: Mail,
    name: "Campañas",
    description:
      "Campañas de contacto multicanal integradas. Envía secuencias automáticas y medí resultados en tiempo real.",
  },
  {
    icon: BarChart2,
    name: "Reportes",
    description:
      "Métricas en tiempo real de tu pipeline. Analiza conversión, actividad semanal y tendencias de captación.",
  },
  {
    icon: Zap,
    name: "Integraciones",
    description:
      "Conecta con tus herramientas favoritas. API lista para CRMs, plataformas de email y herramientas de automatización.",
  },
];

export function LandingFeatures() {
  const { ref, isVisible } = useIntersection<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-up w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-20 ${isVisible ? "is-visible" : ""}`}
      style={{ background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-7xl">
        <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text-2)" }}>
          MODULOS
        </p>
        <h2 className="retro mt-4 max-w-3xl text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
          Todo tu motor comercial en una sola pantalla
        </h2>
        <div data-stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.name}
                className="lnd-feature-card pixel-card-sm p-5"
                style={{ background: "var(--surface)" }}
              >
                <div
                  className="lnd-feature-icon mb-5 flex size-11 items-center justify-center"
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-base font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  {feature.name}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
