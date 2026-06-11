import { translations } from "@/lib/i18n";
import { buildContextString } from "@/lib/ai-context";

export function hasAiContext(): boolean {
  return buildContextString().trim().length > 0;
}

export async function launchAiContextGate(opts: {
  lang: "en" | "es";
  onGoToContext: () => void;
}): Promise<void> {
  await import("driver.js/dist/driver.css");
  const { driver } = await import("driver.js");
  const gate = translations[opts.lang].aiContext.gate;

  const tour = driver({
    allowClose: true,
    showProgress: false,
    doneBtnText: gate.cta,
    popoverClass: "scoutia-driver-popover",
    showButtons: ["next", "close"],
    steps: [
      {
        element: "[data-tour='sidebar-ai-context']",
        popover: {
          title: gate.title,
          description: gate.description,
          side: "right",
          align: "center",
        },
      },
    ],
    onNextClick: (_element, _step, { driver: activeDriver }) => {
      activeDriver.destroy();
      opts.onGoToContext();
    },
    onCloseClick: (_element, _step, { driver: activeDriver }) => {
      activeDriver.destroy();
    },
  });

  tour.drive();
}
