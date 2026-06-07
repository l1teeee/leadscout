"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "driver.js/dist/driver.css";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

export function OnboardingTour() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.tours;

  useEffect(() => {
    if (sessionStorage.getItem("leadscout_onboarding_pending") !== "1") return;

    const timer = window.setTimeout(async () => {
      const { driver } = await import("driver.js");
      const tour = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        nextBtnText: tr.next,
        prevBtnText: tr.prev,
        doneBtnText: tr.doneDashboard,
        popoverClass: "leadscout-driver-popover",
        steps: [
          {
            element: "[data-tour='dashboard-kpis']",
            popover: {
              title: tr.dashboard[0].title,
              description: tr.dashboard[0].description,
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "[data-tour='dashboard-leads']",
            popover: {
              title: tr.dashboard[1].title,
              description: tr.dashboard[1].description,
              side: "right",
              align: "start",
            },
          },
          {
            element: "[data-tour='dashboard-chart']",
            popover: {
              title: tr.dashboard[2].title,
              description: tr.dashboard[2].description,
              side: "left",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-explorer']",
            popover: {
              title: tr.dashboard[3].title,
              description: tr.dashboard[3].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-leads']",
            popover: {
              title: tr.dashboard[4].title,
              description: tr.dashboard[4].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-opportunities']",
            popover: {
              title: tr.dashboard[5].title,
              description: tr.dashboard[5].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-reports']",
            popover: {
              title: tr.dashboard[6].title,
              description: tr.dashboard[6].description,
              side: "right",
              align: "center",
            },
          },
          {
            element: "[data-tour='sidebar-settings']",
            popover: {
              title: tr.dashboard[7].title,
              description: tr.dashboard[7].description,
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
  }, [router, tr]);

  return null;
}
