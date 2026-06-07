"use client";

import { useEffect } from "react";
import "driver.js/dist/driver.css";
import type { ExplorerTab } from "@/types";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

interface ExplorerOnboardingTourProps {
  setActiveTab: (tab: ExplorerTab) => void;
}

export function ExplorerOnboardingTour({ setActiveTab }: ExplorerOnboardingTourProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.tours;

  useEffect(() => {
    if (sessionStorage.getItem("leadscout_explorer_tour_pending") !== "1") return;

    const startResultsTour = () => {
      setActiveTab("resultados");

      window.setTimeout(async () => {
        const { driver } = await import("driver.js");
        const resultsTour = driver({
          showProgress: true,
          animate: true,
          allowClose: true,
          nextBtnText: tr.next,
          prevBtnText: tr.prev,
          doneBtnText: tr.doneDashboard,
          popoverClass: "leadscout-driver-popover",
          steps: [
            {
              element: "[data-tour='explorer-tab-resultados']",
              popover: {
                title: tr.explorerResults[0].title,
                description: tr.explorerResults[0].description,
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "[data-tour='explorer-results-summary']",
              popover: {
                title: tr.explorerResults[1].title,
                description: tr.explorerResults[1].description,
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "[data-tour='explorer-results-search']",
              popover: {
                title: tr.explorerResults[2].title,
                description: tr.explorerResults[2].description,
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "[data-tour='explorer-results-filters']",
              popover: {
                title: tr.explorerResults[3].title,
                description: tr.explorerResults[3].description,
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "[data-tour='explorer-results-list']",
              popover: {
                title: tr.explorerResults[4].title,
                description: tr.explorerResults[4].description,
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

    const timer = window.setTimeout(async () => {
      const { driver } = await import("driver.js");
      const explorerTour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        nextBtnText: tr.next,
        prevBtnText: tr.prev,
        doneBtnText: tr.doneExplorer,
        popoverClass: "leadscout-driver-popover",
        steps: [
          {
            element: "[data-tour='explorer-tabs']",
            popover: {
              title: tr.explorerSetup[0].title,
              description: tr.explorerSetup[0].description,
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "[data-tour='explorer-category']",
            popover: {
              title: tr.explorerSetup[1].title,
              description: tr.explorerSetup[1].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-location']",
            popover: {
              title: tr.explorerSetup[2].title,
              description: tr.explorerSetup[2].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-actions']",
            popover: {
              title: tr.explorerSetup[3].title,
              description: tr.explorerSetup[3].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-radius']",
            popover: {
              title: tr.explorerSetup[4].title,
              description: tr.explorerSetup[4].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-map']",
            popover: {
              title: tr.explorerSetup[5].title,
              description: tr.explorerSetup[5].description,
              side: "left",
              align: "center",
            },
          },
          {
            element: "[data-tour='explorer-edit-zone']",
            popover: {
              title: tr.explorerSetup[6].title,
              description: tr.explorerSetup[6].description,
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
  }, [setActiveTab, tr]);

  return null;
}
