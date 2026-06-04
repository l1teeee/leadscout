"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { ExplorerTab } from "@/types";

interface ExplorerOnboardingTourProps {
  setActiveTab: (tab: ExplorerTab) => void;
}

export function ExplorerOnboardingTour({ setActiveTab }: ExplorerOnboardingTourProps) {
  useEffect(() => {
    if (sessionStorage.getItem("leadscout_explorer_tour_pending") !== "1") return;

    const startResultsTour = () => {
      setActiveTab("resultados");

      window.setTimeout(() => {
        const resultsTour = driver({
          showProgress: true,
          animate: true,
          allowClose: true,
          nextBtnText: "Siguiente",
          prevBtnText: "Atrás",
          doneBtnText: "Terminar",
          popoverClass: "leadscout-driver-popover",
          steps: [
            {
              element: "[data-tour='explorer-tab-resultados']",
              popover: {
                title: "Pestaña Resultados",
                description: "Después de ejecutar una búsqueda, acá revisás todos los negocios encontrados.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "[data-tour='explorer-results-summary']",
              popover: {
                title: "Resumen de resultados",
                description: "Este contador te dice cuántos negocios son visibles y cuántos están representados en el mapa.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "[data-tour='explorer-results-search']",
              popover: {
                title: "Buscar dentro de resultados",
                description: "Filtrá por nombre, categoría o zona para encontrar rápidamente un negocio específico.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "[data-tour='explorer-results-filters']",
              popover: {
                title: "Filtros comerciales",
                description: "Cambia entre todos, nuevos, contactados, calificados o perdidos para revisar el pipeline.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "[data-tour='explorer-results-list']",
              popover: {
                title: "Tabla de negocios",
                description: "Acá aparece cada lead con zona, score, prioridad y estado. Al hacer clic se abre el detalle lateral.",
                side: "top",
                align: "start",
              },
            },
          ],
          onDestroyed: () => {
            sessionStorage.removeItem("leadscout_explorer_tour_pending");
          },
        });

        resultsTour.drive();
      }, 450);
    };

    setActiveTab("ubicacion");

    const timer = window.setTimeout(() => {
      const explorerTour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        nextBtnText: "Siguiente",
        prevBtnText: "Atrás",
        doneBtnText: "Ver resultados",
        popoverClass: "leadscout-driver-popover",
        steps: [
          {
            element: "[data-tour='explorer-tabs']",
            popover: {
              title: "Explorer",
              description: "Esta sección sirve para configurar una búsqueda y descubrir negocios locales.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "[data-tour='explorer-category']",
            popover: {
              title: "Categoría",
              description: "Primero elegís el rubro: gastronomía, retail, servicios, salud u otro tipo de negocio.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-location']",
            popover: {
              title: "Zona de búsqueda",
              description: "Luego definís dónde buscar. Podés escribir una ciudad o seleccionar una sugerencia.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-actions']",
            popover: {
              title: "Ejecutar búsqueda",
              description: "Este botón inicia el scraping. También podés usar tu ubicación para centrar la búsqueda.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-radius']",
            popover: {
              title: "Rango",
              description: "El radio limita cuántos negocios se revisan. Un rango menor ayuda a tener resultados más precisos.",
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-map']",
            popover: {
              title: "Mapa de búsqueda",
              description: "Acá ves la zona activa, negocios detectados y puntos pendientes de escaneo.",
              side: "left",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-edit-zone']",
            popover: {
              title: "Mover zona",
              description: "Activá editar zona para arrastrar el área de búsqueda directamente en el mapa.",
              side: "left",
              align: "center",
            },
          },
        ],
        onDestroyed: startResultsTour,
      });

      explorerTour.drive();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [setActiveTab]);

  return null;
}
