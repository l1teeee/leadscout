"use client";

import { useEffect, useMemo } from "react";
import MapLibreGL from "maplibre-gl";
import { List, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyInsight } from "@/components/ui/empty-insight";
import { LayerMarkers, Map, useMap, type MapPoint } from "@/components/ui/mapcn-layer-markers";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";
import type { ExplorerResultsMapProps } from "@/types/explorer";

const bodyTextStyle = { fontFamily: "var(--font-body), system-ui, sans-serif" };

function toMapPoint(lead: ExplorerResultsMapProps["leads"][number]): MapPoint | null {
  if (lead.latitude == null || lead.longitude == null) return null;
  if (!Number.isFinite(lead.latitude) || !Number.isFinite(lead.longitude)) return null;

  return {
    id: lead.id,
    name: lead.name,
    category: lead.category,
    score: lead.score,
    latitude: lead.latitude,
    longitude: lead.longitude,
  };
}

function FitLeadsViewport({
  points,
  selectedId,
}: {
  points: MapPoint[];
  selectedId?: string;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || points.length === 0) return;

    const selectedPoint = selectedId ? points.find((point) => point.id === selectedId) : null;
    if (selectedPoint) {
      map.easeTo({
        center: [selectedPoint.longitude, selectedPoint.latitude],
        zoom: Math.max(map.getZoom(), 15),
        duration: 300,
      });
      return;
    }

    if (points.length === 1) {
      map.easeTo({
        center: [points[0].longitude, points[0].latitude],
        zoom: 15,
        duration: 300,
      });
      return;
    }

    const bounds = new MapLibreGL.LngLatBounds(
      [points[0].longitude, points[0].latitude],
      [points[0].longitude, points[0].latitude]
    );
    points.forEach((point) => bounds.extend([point.longitude, point.latitude]));

    map.fitBounds(bounds, {
      padding: 64,
      maxZoom: 15,
      duration: 350,
    });
  }, [isLoaded, map, points, selectedId]);

  return null;
}

export function ExplorerResultsMap({
  leads,
  selected,
  onSelectLead,
  onBackToTable,
}: ExplorerResultsMapProps) {
  const { lang } = useLanguage();
  const tr = translations[lang].explorer.results;
  const points = useMemo(() => leads.map(toMapPoint).filter((point): point is MapPoint => point !== null), [leads]);
  const selectedPoint = selected ? points.find((point) => point.id === selected.id) : null;
  const center: [number, number] = selectedPoint
    ? [selectedPoint.longitude, selectedPoint.latitude]
    : points[0]
      ? [points[0].longitude, points[0].latitude]
      : [-89.2182, 13.6929];

  return (
    <section className="pixel-card-sm flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b-2 border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
        <div>
          <p className="retro pixel-text-xs uppercase" style={{ color: "var(--text-3)" }}>
            {tr.mapEyebrow}
          </p>
          <h2 className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {tr.mapTitle}
          </h2>
          <p className="mt-1 text-xs font-semibold" style={{ ...bodyTextStyle, color: "var(--text-3)" }}>
            {tr.mapSummary(points.length)}
          </p>
        </div>
        {onBackToTable && (
          <Button variant="secondary" size="sm" className="h-8 justify-center" onClick={onBackToTable}>
            <List size={13} />
            {tr.tableView}
          </Button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {points.length > 0 ? (
          <Map center={center} zoom={13}>
            <FitLeadsViewport points={points} selectedId={selected?.id} />
            <LayerMarkers
              points={points}
              selectedId={selected?.id}
              onPointSelect={(point) => {
                const lead = leads.find((item) => item.id === point.id);
                if (lead) onSelectLead(lead);
              }}
              clustered
            />
          </Map>
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--surface)]">
            <EmptyInsight
              title={tr.mapEmpty.title}
              description={tr.mapEmpty.description}
              compact
              className="max-w-lg"
            />
          </div>
        )}

        {points.length > 0 && (
          <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 border-2 border-[var(--border)] bg-white px-3 py-2 shadow-[3px_3px_0_0_var(--pixel-shadow)]">
            <MapPinned size={14} style={{ color: "var(--text)" }} />
            <span className="retro pixel-text-xs uppercase" style={{ color: "var(--text)" }}>
              {tr.mapCount(points.length)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
