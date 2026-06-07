"use client";

import { Filter, ListChecks, PhoneCall, Users } from "lucide-react";
import { useIntersection } from "@/hooks/use-intersection";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyFont = { fontFamily: "var(--font-body), system-ui, sans-serif" };

const cardColors = ["var(--c-new)", "var(--c-hi)", "var(--c-qualified)", "var(--text)"];
const priorityColors = ["var(--c-hi)", "var(--c-new)", "var(--c-qualified)", "var(--c-new)"];

export function LandingLeads() {
  const { lang } = useLanguage();
  const tr = translations[lang].landing.leads;
  const { ref: mockRef, isVisible: isMockVisible } = useIntersection<HTMLDivElement>();
  const { ref: textRef, isVisible: isTextVisible } = useIntersection<HTMLDivElement>();

  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-20" style={{ background: "var(--surface)" }}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
        <div ref={mockRef} className={`pixel-card reveal-right w-full min-w-0 overflow-hidden p-4 sm:p-5 ${isMockVisible ? "is-visible" : ""}`}>
          <div className="flex items-center justify-between gap-3 pb-4" style={{ borderBottom: "2px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 items-center justify-center"
                style={{ background: "var(--text)", border: "2px solid var(--border)", color: "var(--pixel-highlight)" }}
              >
                <Users size={18} strokeWidth={2.5} />
              </span>
              <div>
                <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                  {tr.panelEyebrow}
                </p>
                <p className="text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  {tr.heading}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center active:translate-x-0.5 active:translate-y-0.5"
              aria-label={tr.filterAria}
              style={{
                background: "var(--surface-2)",
                border: "2px solid var(--border)",
                boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                color: "var(--text)",
                transition: "transform 150ms var(--ease-out), opacity 150ms var(--ease-out)",
              }}
            >
              <Filter size={16} />
            </button>
          </div>

          <div data-stagger className="mt-5 grid grid-cols-2 gap-3">
            {tr.cards.map((card, index) => (
              <div
                key={card.title}
                className="lnd-kpi-card p-3"
                style={{ background: "var(--surface-2)", border: "2px solid var(--border)" }}
              >
                <div className="mb-2 h-2 w-8" style={{ background: cardColors[index] }} />
                <p className="text-sm font-extrabold" style={{ ...bodyFont, color: "var(--text)" }}>
                  {card.title}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5" style={{ ...bodyFont, color: "var(--text-2)" }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 max-w-full overflow-x-auto" style={{ border: "2px solid var(--border)" }}>
            <table className="pixel-table w-full" style={bodyFont}>
              <thead style={{ background: "var(--surface-2)", color: "var(--text-2)" }}>
                <tr>
                  {tr.columns.map((heading) => (
                    <th key={heading} className="px-3 py-3 text-left text-xs font-extrabold uppercase">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: "var(--surface)", color: "var(--text)" }}>
                {tr.rows.map((lead, i) => (
                  <tr
                    key={lead.business}
                    className="lnd-row"
                    style={{
                      opacity: isMockVisible ? 1 : 0,
                      transform: isMockVisible ? "translateX(0)" : "translateX(-10px)",
                      transition: `opacity 280ms var(--ease-out) ${i * 80}ms, transform 280ms var(--ease-out) ${i * 80}ms`,
                    }}
                  >
                    <td className="px-3 py-3 text-sm font-extrabold">{lead.business}</td>
                    <td className="px-3 py-3">
                      <span className="retro pixel-text-xs px-2 py-1" style={{ background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
                        {lead.signal}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs font-bold uppercase" style={{ color: "var(--text-2)" }}>
                      {lead.status}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-extrabold uppercase" style={{ color: priorityColors[i] }}>
                        {lead.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div ref={textRef} className={`reveal-left ${isTextVisible ? "is-visible" : ""}`}>
          <p className="retro pixel-text-sm uppercase" style={{ color: "var(--text-2)" }}>
            {tr.eyebrow}
          </p>
          <h2 className="retro mt-4 text-2xl font-black uppercase leading-tight sm:text-4xl" style={{ color: "var(--text)" }}>
            {tr.title}
          </h2>
          <p className="mt-5 text-base font-medium leading-7" style={{ ...bodyFont, color: "var(--text-2)" }}>
            {tr.description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-extrabold" style={{ ...bodyFont, background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
              <ListChecks size={14} />
              {tr.reviewSignals}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-2 text-xs font-extrabold" style={{ ...bodyFont, background: "var(--surface-2)", border: "2px solid var(--border)", color: "var(--text)" }}>
              <PhoneCall size={14} />
              {tr.availableContact}
            </span>
          </div>
          <ul data-stagger className="mt-7 space-y-3">
            {tr.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm font-semibold leading-6" style={{ ...bodyFont, color: "var(--text)" }}>
                <span className="mt-2 size-2 shrink-0" style={{ background: "var(--c-new)", border: "1px solid var(--border)" }} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
