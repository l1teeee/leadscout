"use client";
import { useState } from "react";
import { Info, MapPin, LocateFixed, Play, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/8bit-slider";
import { MIN_SEARCH_RADIUS_KM, MAX_SEARCH_RADIUS_KM } from "@/lib/explorer-data";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import type { ExplorerLocationPanelProps } from "@/types/explorer";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function formatKm(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function InfoTooltip({ text }: { text: string }) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.location;
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={tr.infoAria}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex size-4 items-center justify-center"
        style={{ color: "var(--text-3)" }}
      >
        <Info size={11} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-1.5 w-52 -translate-x-1/2 px-2.5 py-2 text-xs font-medium leading-relaxed animate-scale-in"
          style={{
            background: "var(--sidebar)",
            border: "2px solid var(--border)",
            boxShadow: "3px 3px 0 0 var(--pixel-shadow)",
            color: "var(--pixel-highlight)",
            fontFamily: "var(--font-body), system-ui, sans-serif",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export function ExplorerLocationPanel({
  locationQuery,
  onLocationQueryChange,
  selectedPlace,
  selectedCategoryInfo,
  visiblePointsCount,
  placeSuggestions,
  onCategoryOpen,
  onSelectPlace,
  isLocating,
  locationError,
  searchRadius,
  onSearchRadiusChange,
  activeSearchArea,
  hasLocation,
  onBrowserLocation,
  onResetLocation,
  onSearch,
  isSearching,
  searchError,
}: ExplorerLocationPanelProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.location;
  const categoryLabels = translations[lang].explorer.categories;
  const selectedCategoryLabel = selectedCategoryInfo
    ? categoryLabels[selectedCategoryInfo.id as keyof typeof categoryLabels] ?? selectedCategoryInfo.label
    : tr.allCategories;

  return (
    <section className="pixel-card-sm min-h-0 overflow-auto max-h-[50vh] xl:max-h-full bg-white p-4 xl:h-fit">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-(--border) bg-(--surface-2)">
          <MapPin size={15} />
        </div>
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {tr.eyebrow}
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {tr.title}
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="mb-1 block text-xs font-semibold" style={{ color: "var(--text-2)" }}>
            {tr.categoryLabel}
          </span>
          <button
            type="button"
            onClick={onCategoryOpen}
            data-tour="explorer-category"
            className="motion-retro-control flex min-h-12 w-full cursor-pointer items-center justify-between rounded-none border-2 border-(--border) bg-surface px-3 py-2 text-left shadow-[2px_2px_0_0_var(--pixel-shadow)] hover:bg-(--surface-2)"
          >
            <div>
              <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
                {tr.selectedCategory}
              </p>
              <p className="text-sm font-bold" style={{ ...bodyTextStyle, color: "var(--text)" }}>
                {selectedCategoryLabel}
              </p>
            </div>
            <SlidersHorizontal size={15} style={{ color: "var(--text)" }} />
          </button>
          <div className="mt-2 pixel-inset bg-(--surface-2) px-3 py-2">
            <div className="text-xs font-semibold flex items-center gap-1" style={{ color: "var(--text-2)" }}>
              {visiblePointsCount > 0
                ? tr.markers(visiblePointsCount)
                : <>
                    {tr.noMarkers}
                    <InfoTooltip text={tr.noMarkersTooltip} />
                  </>
              }
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
              {tr.zoneLabel}
            </span>
            <InfoTooltip text={tr.zoneTooltip} />
          </span>
          <input
            data-tour="explorer-location"
            value={locationQuery}
            onChange={(e) => onLocationQueryChange(e.target.value)}
            placeholder={tr.placeholder}
            className="h-9 w-full rounded-none border-2 border-(--border) bg-surface px-3 text-sm text-text"
            style={bodyTextStyle}
          />
          <div className="mt-2 max-h-36 overflow-auto pixel-inset bg-surface" suppressHydrationWarning>
            {placeSuggestions.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => onSelectPlace(place)}
                className="block w-full cursor-pointer border-b border-(--border) px-3 py-2 text-left text-xs font-semibold transition-colors last:border-b-0 hover:bg-(--surface-2)"
                style={{ ...bodyTextStyle, color: "var(--text)" }}
              >
                {place.label}
              </button>
            ))}
            {placeSuggestions.length === 0 && locationQuery.trim().length > 2 && (
              <div className="px-3 py-2 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
                {tr.noSuggestions(locationQuery)}
              </div>
            )}
          </div>
        </label>

        <div data-tour="explorer-actions" className="grid gap-2 pt-1">
          <Button
            variant="primary"
            size="sm"
            className="justify-center"
            disabled={isSearching || !hasLocation}
            title={!hasLocation ? tr.selectZoneFirst : undefined}
            onClick={onSearch}
          >
            <Play size={13} />
            {isSearching ? tr.running : tr.run}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="justify-center"
              disabled={isLocating}
              onClick={onBrowserLocation}
            >
              <LocateFixed size={13} />
              {isLocating ? tr.locating : tr.myLocation}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="justify-center"
              disabled={isSearching}
              onClick={onResetLocation}
            >
              <MapPin size={13} />
              {tr.changeZone}
            </Button>
          </div>
        </div>

        {!hasLocation && (
          <p className="text-xs font-semibold text-center" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {tr.selectZoneFirst}
          </p>
        )}

        {locationError && (
          <p className="text-xs font-semibold" style={{ color: "var(--c-hi)" }}>
            {locationError}
          </p>
        )}

        {searchError && (
          <div
            className="border-2 border-(--c-hi) bg-[rgba(230,57,70,0.08)] px-3 py-2 text-xs font-semibold"
            style={{ ...bodyTextStyle, color: "var(--c-hi)" }}
          >
            {searchError}
          </div>
        )}

        <div data-tour="explorer-radius" className="border-t border-(--border) pt-3">
          <p className="retro pixel-text-xs uppercase flex items-center gap-1" style={{ color: "var(--text-3)" }}>
            {tr.rangeTitle}
            <InfoTooltip text={tr.rangeTooltip} />
          </p>
          <div className="mt-3">
            <Slider
              value={[searchRadius]}
              min={MIN_SEARCH_RADIUS_KM}
              max={MAX_SEARCH_RADIUS_KM}
              step={0.5}
              aria-label={tr.radiusAria}
              onValueChange={(value) => onSearchRadiusChange(value[0] ?? MAX_SEARCH_RADIUS_KM)}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span style={{ color: "var(--text-3)" }}>{formatKm(MIN_SEARCH_RADIUS_KM)} km</span>
            <span style={{ color: "var(--text)" }}>
              {formatKm(activeSearchArea.radiusKm)} km {tr.fromZone(selectedPlace?.municipality ?? tr.activeZone)}
            </span>
            <span style={{ color: "var(--text-3)" }}>{formatKm(MAX_SEARCH_RADIUS_KM)} km</span>
          </div>
        </div>
      </div>
    </section>
  );
}
