"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/location-service";
import type { ExplorerCategoryModalProps } from "@/types/explorer";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };
const normalizeSearch = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function ExplorerCategoryModal({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: ExplorerCategoryModalProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer;
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query.trim());
  const filtered = BUSINESS_CATEGORIES.filter((category) => {
    const translatedCategory =
      tr.categories[category.id as keyof typeof tr.categories] ?? category.label;

    return (
      category.id === "all" ||
      normalizeSearch(category.label).includes(normalizedQuery) ||
      normalizeSearch(translatedCategory).includes(normalizedQuery)
    );
  });

  useEffect(() => {
    if (isOpen) return;

    const timeout = window.setTimeout(() => setQuery(""), 0);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        className="pixel-card-sm w-full max-w-xl animate-fade-up bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-5 py-4">
          <div>
            <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
              {tr.categoryModal.eyebrow}
            </p>
            <h2
              id="category-dialog-title"
              className="text-base font-bold"
              style={{ ...bodyTextStyle, color: "var(--text)" }}
            >
              {tr.categoryModal.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[1px_1px_0_0_var(--pixel-shadow)] transition-transform hover:bg-[var(--pixel-highlight)] active:translate-x-px active:translate-y-px active:shadow-none"
            aria-label={tr.categoryModal.close}
          >
            <X size={13} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Search size={15} className="shrink-0 text-[var(--text-3)]" />
            <input
              className="w-full rounded-none border-2 border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
              style={bodyTextStyle}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tr.categoryModal.searchPlaceholder}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm font-semibold text-[var(--text-3)]" style={bodyTextStyle}>
              {tr.categoryModal.noResults}
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((category) => {
                const isActive = selectedCategory === category.id;
                const count = categoryCounts[category.id] ?? 0;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onSelectCategory(category.id)}
                    className="motion-retro-control min-h-20 rounded-none border-2 p-3 text-left"
                    style={
                      isActive
                        ? {
                            background: "var(--border)",
                            color: "var(--surface)",
                            borderColor: "var(--border)",
                            boxShadow: "2px 2px 0 0 var(--pixel-highlight)",
                          }
                        : {
                            background: "var(--surface)",
                            color: "var(--text)",
                            borderColor: "var(--border)",
                            boxShadow: "2px 2px 0 0 var(--pixel-shadow)",
                          }
                    }
                  >
                    <span className="retro block pixel-text-xs uppercase">
                      {tr.categories[category.id as keyof typeof tr.categories] ?? category.label}
                    </span>
                    <span
                      className="mt-2 block text-xs font-semibold"
                      style={{
                        ...bodyTextStyle,
                        color: isActive ? "var(--surface-2)" : "var(--text-3)",
                      }}
                    >
                      {tr.categoryModal.availableMarkers(count)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
