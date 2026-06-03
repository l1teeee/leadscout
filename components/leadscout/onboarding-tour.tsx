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
        prevBtnText: "Atras",
        doneBtnText: "Terminar",
        popoverClass: "leadscout-driver-popover",
        steps: [
          {
            element: "[data-tour='dashboard-kpis']",
            popover: {
              title: "Tu tablero principal",
              description: "Aqui ves leads totales, nuevos de la semana, contactos activos y score promedio.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "[data-tour='dashboard-leads']",
            popover: {
              title: "Leads recientes",
              description: "Revisa los negocios detectados mas recientes, su categoria, score y estado comercial.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='dashboard-chart']",
            popover: {
              title: "Actividad semanal",
              description: "Esta grafica muestra que dias generan mas oportunidades para tu workspace.",
              side: "left",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-explorer']",
            popover: {
              title: "Siguiente: Explorer",
              description: "Al terminar iremos a Explorer para ver donde haces tu primera busqueda y donde aparecen los resultados.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-leads']",
            popover: {
              title: "Leads",
              description: "Administra la base completa, filtra por estado, prioridad y revisa datos de contacto.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-oportunidades']",
            popover: {
              title: "Oportunidades",
              description: "Organiza tu pipeline comercial por nuevos, contactados, calificados y perdidos.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-reportes']",
            popover: {
              title: "Reportes",
              description: "Mide conversion, actividad, salud comercial y distribucion de oportunidades.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-configuracion']",
            popover: {
              title: "Configuracion",
              description: "Gestiona workspace, usuario, equipo, zonas, plan, seguridad y notificaciones.",
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
