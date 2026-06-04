"use client";

import { Search, Zap, Target, Send } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import Timeline2 from "@/components/ui/8bit-timeline2";

export function LandingSteps() {
  const { ref, isVisible } = useIntersection<HTMLElement>();

  return (
    <section
      ref={ref}
      className={`reveal-up w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-20 ${isVisible ? "is-visible" : ""}`}
      style={{ background: "var(--surface-2)" }}
    >
      <div className="mx-auto max-w-7xl">
        <h2
          className="retro text-2xl font-black uppercase leading-tight sm:text-4xl"
          style={{ color: "var(--text)" }}
        >
          Cómo funciona
        </h2>

        <Timeline2
          title=""
          description="De la búsqueda al cierre — tu pipeline comercial en 4 pasos"
          steps={[
            {
              icon: <Search size={18} strokeWidth={2.5} />,
              title: "Explora",
              description:
                "Definí tu zona y categoría. LeadScout escanea negocios con brechas digitales en segundos.",
            },
            {
              icon: <Zap size={18} strokeWidth={2.5} />,
              title: "Detecta",
              description:
                "Cada negocio recibe un score IA basado en presencia web, reseñas y señales comerciales.",
            },
            {
              icon: <Target size={18} strokeWidth={2.5} />,
              title: "Califica",
              description:
                "Organiza tu pipeline en etapas: nuevos, contactados, calificados y perdidos.",
            },
            {
              icon: <Send size={18} strokeWidth={2.5} />,
              title: "Convierte",
              description:
                "Ejecutá campañas sobre tus mejores leads y medí resultados desde Reportes.",
            },
          ]}
          className="mt-6 px-0 py-8"
        />
      </div>
    </section>
  );
}
