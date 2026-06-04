"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function OnboardingTour() {
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("leadscout_onboarding_pending") !== "1") return;

    const timer = window.setTimeout(() => {
      const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        nextBtnText: "Siguiente",
        prevBtnText: "Atrás",
        doneBtnText: "Terminar",
        popoverClass: "leadscout-driver-popover",
        steps: [
          {
            element: "[data-tour='dashboard-kpis']",
            popover: {
              title: "Tu panel principal",
              description: "Acá ves el total de leads, los nuevos esta semana, contactos activos y el score promedio.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "[data-tour='dashboard-leads']",
            popover: {
              title: "Leads recientes",
              description: "Revisá los negocios detectados más recientemente, su categoría, score y estado comercial.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='dashboard-chart']",
            popover: {
              title: "Actividad semanal",
              description: "Este gráfico muestra qué días generan más oportunidades para tu workspace.",
              side: "left",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-explorer']",
            popover: {
              title: "Siguiente Explorer",
              description: "Al terminar vamos al Explorer para ver dónde hacés tu primera búsqueda y dónde aparecen los resultados.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-leads']",
            popover: {
              title: "Leads",
              description: "Gestioná la base completa, filtrá por estado y prioridad, y revisá datos de contacto.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-opportunities']",
            popover: {
              title: "Oportunidades",
              description: "Organizá tu pipeline comercial entre nuevos, contactados, calificados y perdidos.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-reports']",
            popover: {
              title: "Reportes",
              description: "Medí conversión, actividad, salud comercial y distribución de oportunidades.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-settings']",
            popover: {
              title: "Configuración",
              description: "Gestioná workspace, usuario, equipo, zonas, plan, seguridad y notificaciones.",
              side: "right",
              align: "center",
            },
          },
        ],
        onDestroyed: () => {
          sessionStorage.removeItem("leadscout_onboarding_pending");
          sessionStorage.setItem("leadscout_explorer_tour_pending", "1");
          router.push("/explorer");
        },
      });

      tour.drive();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
