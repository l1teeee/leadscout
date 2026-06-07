"use client";

import * as React from "react";
import MapLibreGL from "maplibre-gl";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { translations } from "@/lib/i18n";

const lightStyle =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DEFAULT_EL_SALVADOR_CENTER: [number, number] = [-89.2182, 13.6929];

export interface MapPoint {
  id: string;
  name: string;
  category: string;
  score: number;
  longitude: number;
  latitude: number;
}

export interface SearchArea {
  center: [number, number];
  radiusKm: number;
  label?: string;
}

export interface UndiscoveredPoint {
  id: string;
  center: [number, number];
  label: string;
}

interface MapProps {
  children?: React.ReactNode;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

interface MapContextValue {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
}

const MapContext = React.createContext<MapContextValue | null>(null);

function isUsableMap(map: MapLibreGL.Map | null): map is MapLibreGL.Map {
  return Boolean(
    map &&
      typeof map.getSource === "function" &&
      typeof map.getLayer === "function" &&
      !(map as MapLibreGL.Map & { _removed?: boolean })._removed
  );
}

export function useMap() {
  const context = React.useContext(MapContext);
  if (!context) throw new Error("useMap must be used within Map");
  return context;
}

export function Map({
  children,
  className,
  center = DEFAULT_EL_SALVADOR_CENTER,
  zoom = 11,
}: MapProps) {
  const { lang } = useLanguage();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const initialViewRef = React.useRef({ center, zoom });
  const [map, setMap] = React.useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const {
      center: [centerLng, centerLat],
      zoom: initialZoom,
    } = initialViewRef.current;

    const mapInstance = new MapLibreGL.Map({
      container: containerRef.current,
      style: lightStyle,
      center: [centerLng, centerLat],
      zoom: initialZoom,
      attributionControl: false,
    });

    mapInstance.addControl(
      new MapLibreGL.NavigationControl({ visualizePitch: false }),
      "top-right"
    );

    const handleLoad = () => setIsLoaded(true);
    mapInstance.on("load", handleLoad);
    setMap(mapInstance);

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.resize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      mapInstance.off("load", handleLoad);
      mapInstance.remove();
      setMap(null);
      setIsLoaded(false);
    };
  }, []);

  return (
    <MapContext.Provider value={{ map, isLoaded }}>
      <div
        ref={containerRef}
        className={cn("relative h-full w-full bg-[var(--surface-2)]", className)}
      >
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <span className="retro pixel-text-xs text-[var(--text-2)]">
              {translations[lang].common.mapLoading}
            </span>
          </div>
        )}
        {map && children}
      </div>
    </MapContext.Provider>
  );
}

function buildCircleGeometry({
  center,
  radiusKm,
}: Pick<SearchArea, "center" | "radiusKm">): GeoJSON.Polygon {
  const [lng, lat] = center;
  const points: [number, number][] = [];
  const segments = 16;
  const latRadius = radiusKm / 111.32;
  const lngRadius = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));

  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([
      lng + Math.cos(angle) * lngRadius,
      lat + Math.sin(angle) * latRadius,
    ]);
  }

  return {
    type: "Polygon",
    coordinates: [points],
  };
}

function buildCirclePolygon(area: SearchArea): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: buildCircleGeometry(area),
      },
    ],
  };
}

function buildUndiscoveredPoints(
  points: UndiscoveredPoint[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      properties: {
        id: point.id,
        label: point.label,
        marker: "?",
      },
      geometry: {
        type: "Point",
        coordinates: point.center,
      },
    })),
  };
}

function buildCenterPoint({
  center,
}: SearchArea): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: center,
        },
      },
    ],
  };
}

interface SearchAreaLayerProps {
  area: SearchArea;
  isDraggable?: boolean;
  onAreaCenterChange?: (center: [number, number]) => void;
}

export function SearchAreaLayer({
  area,
  isDraggable = false,
  onAreaCenterChange,
}: SearchAreaLayerProps) {
  const { map, isLoaded } = useMap();
  const reactId = React.useId();
  const id = React.useMemo(() => reactId.replaceAll(":", ""), [reactId]);
  const sourceId = React.useMemo(() => `search-area-source-${id}`, [id]);
  const handleSourceId = React.useMemo(() => `search-area-handle-source-${id}`, [id]);
  const fillLayerId = React.useMemo(() => `search-area-fill-${id}`, [id]);
  const lineLayerId = React.useMemo(() => `search-area-line-${id}`, [id]);
  const handleLayerId = React.useMemo(() => `search-area-handle-${id}`, [id]);
  const handleRingLayerId = React.useMemo(() => `search-area-handle-ring-${id}`, [id]);
  const onAreaCenterChangeRef = React.useRef(onAreaCenterChange);
  const skipNextEaseRef = React.useRef(false);

  React.useEffect(() => {
    onAreaCenterChangeRef.current = onAreaCenterChange;
  }, [onAreaCenterChange]);

  const setHandleVisibility = React.useCallback(
    (visible: boolean) => {
      if (!isUsableMap(map)) return;
      const opacity = visible ? 1 : 0;

      try {
        if (map.getLayer(handleLayerId)) {
          map.setPaintProperty(handleLayerId, "circle-opacity", opacity);
          map.setPaintProperty(handleLayerId, "circle-stroke-opacity", opacity);
        }

        if (map.getLayer(handleRingLayerId)) {
          map.setPaintProperty(handleRingLayerId, "circle-opacity", opacity);
          map.setPaintProperty(handleRingLayerId, "circle-stroke-opacity", opacity);
        }
      } catch {
        // Paint updates can arrive while MapLibre is swapping layers.
      }
    },
    [handleLayerId, handleRingLayerId, map]
  );

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }

      if (!map.getSource(handleSourceId)) {
        map.addSource(handleSourceId, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }

      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#1C1917",
            "fill-opacity": 0.08,
          },
        });
      }

      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#1C1917",
            "line-width": 4,
            "line-dasharray": [1.5, 0.75],
          },
        });
      }

      if (!map.getLayer(handleRingLayerId)) {
        map.addLayer({
          id: handleRingLayerId,
          type: "circle",
          source: handleSourceId,
          paint: {
            "circle-radius": 10,
            "circle-color": "rgba(255,255,255,0)",
            "circle-stroke-color": "#1C1917",
            "circle-stroke-width": 2,
            "circle-opacity": 0,
            "circle-stroke-opacity": 0,
          },
        });
      }

      if (!map.getLayer(handleLayerId)) {
        map.addLayer({
          id: handleLayerId,
          type: "circle",
          source: handleSourceId,
          paint: {
            "circle-radius": 4,
            "circle-color": "#FFFFFF",
            "circle-stroke-color": "#1C1917",
            "circle-stroke-width": 2,
            "circle-opacity": 0,
            "circle-stroke-opacity": 0,
          },
        });
      }
    } catch {
      return;
    }

    return () => {
      setHandleVisibility(false);

      try {
        if (!isUsableMap(map)) return;
        if (map.getLayer(handleLayerId)) map.removeLayer(handleLayerId);
        if (map.getLayer(handleRingLayerId)) map.removeLayer(handleRingLayerId);
        if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
        if (map.getSource(handleSourceId)) map.removeSource(handleSourceId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // MapLibre may already have removed layers during teardown.
      }
    };
  }, [
    fillLayerId,
    handleLayerId,
    handleRingLayerId,
    handleSourceId,
    isLoaded,
    lineLayerId,
    map,
    setHandleVisibility,
    sourceId,
  ]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    const setCursor = (cursor: string) => {
      map.getCanvas().style.cursor = cursor;
    };

    if (!isDraggable) {
      setHandleVisibility(false);
      setCursor("");
      return;
    }

    const draggableLayerIds = [fillLayerId, lineLayerId, handleRingLayerId, handleLayerId];
    const handleEnter = () => {
      setHandleVisibility(true);
      setCursor("grab");
    };
    const handleLeave = () => {
      setHandleVisibility(false);
      setCursor("");
    };
    const handleDragMove = (event: MapLibreGL.MapMouseEvent) => {
      const nextCenter: [number, number] = [event.lngLat.lng, event.lngLat.lat];
      skipNextEaseRef.current = true;
      onAreaCenterChangeRef.current?.(nextCenter);
    };
    const handleDragEnd = () => {
      map.off("mousemove", handleDragMove);
      setHandleVisibility(true);
      setCursor("grab");
      map.dragPan.enable();
    };
    const handleDragStart = (event: MapLibreGL.MapMouseEvent) => {
      event.preventDefault();
      setHandleVisibility(true);
      setCursor("grabbing");
      map.dragPan.disable();
      handleDragMove(event);
      map.on("mousemove", handleDragMove);
      map.once("mouseup", handleDragEnd);
    };

    draggableLayerIds.forEach((layerId) => {
      if (!map.getLayer(layerId)) return;
      map.on("mouseenter", layerId, handleEnter);
      map.on("mouseleave", layerId, handleLeave);
      map.on("mousedown", layerId, handleDragStart);
    });

    return () => {
      setHandleVisibility(false);
      draggableLayerIds.forEach((layerId) => {
        map.off("mouseenter", layerId, handleEnter);
        map.off("mouseleave", layerId, handleLeave);
        map.off("mousedown", layerId, handleDragStart);
      });
      map.off("mousemove", handleDragMove);
      map.off("mouseup", handleDragEnd);
      map.dragPan.enable();
      setCursor("");
    };
  }, [
    fillLayerId,
    handleLayerId,
    handleRingLayerId,
    isDraggable,
    isLoaded,
    lineLayerId,
    map,
    setHandleVisibility,
  ]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
      const handleSource = map.getSource(handleSourceId) as
        | MapLibreGL.GeoJSONSource
        | undefined;
      source?.setData(buildCirclePolygon(area));
      handleSource?.setData(buildCenterPoint(area));

      if (skipNextEaseRef.current) {
        skipNextEaseRef.current = false;
        return;
      }

      map.easeTo({ center: area.center, zoom: 11.4, duration: 350 });
    } catch {
      // Ignore stale MapLibre instances while React swaps state during geolocation.
    }
  }, [area, handleSourceId, isLoaded, map, sourceId]);

  return null;
}

interface UndiscoveredPointsLayerProps {
  points: UndiscoveredPoint[];
}

export function UndiscoveredPointsLayer({
  points,
}: UndiscoveredPointsLayerProps) {
  const { map, isLoaded } = useMap();
  const reactId = React.useId();
  const id = React.useMemo(() => reactId.replaceAll(":", ""), [reactId]);
  const sourceId = React.useMemo(() => `undiscovered-points-source-${id}`, [id]);
  const circleLayerId = React.useMemo(() => `undiscovered-points-circle-${id}`, [id]);
  const ringLayerId = React.useMemo(() => `undiscovered-points-ring-${id}`, [id]);
  const labelLayerId = React.useMemo(() => `undiscovered-points-label-${id}`, [id]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: buildUndiscoveredPoints(points),
        });
      }

      if (!map.getLayer(circleLayerId)) {
        map.addLayer({
          id: circleLayerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 13,
            "circle-color": "#D4D4D4",
            "circle-opacity": 0.86,
            "circle-stroke-color": "#525252",
            "circle-stroke-width": 2,
          },
        });
      }

      if (!map.getLayer(ringLayerId)) {
        map.addLayer({
          id: ringLayerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 18,
            "circle-color": "rgba(255,255,255,0)",
            "circle-stroke-color": "#737373",
            "circle-stroke-width": 1,
            "circle-stroke-opacity": 0.7,
          },
        });
      }

      if (!map.getLayer(labelLayerId)) {
        map.addLayer({
          id: labelLayerId,
          type: "symbol",
          source: sourceId,
          layout: {
            "text-field": ["get", "marker"],
            "text-size": 15,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#1C1917",
            "text-halo-color": "#EFEFE8",
            "text-halo-width": 2,
          },
        });
      }
    } catch {
      return;
    }

    return () => {
      try {
        if (!isUsableMap(map)) return;
        if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
        if (map.getLayer(ringLayerId)) map.removeLayer(ringLayerId);
        if (map.getLayer(circleLayerId)) map.removeLayer(circleLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // MapLibre may already have removed layers during teardown.
      }
    };
  }, [
    circleLayerId,
    isLoaded,
    labelLayerId,
    map,
    points,
    ringLayerId,
    sourceId,
  ]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
      source?.setData(buildUndiscoveredPoints(points));
    } catch {
      // Ignore stale MapLibre instances while map data updates.
    }
  }, [isLoaded, map, points, sourceId]);

  return null;
}

interface LayerMarkersProps {
  points: MapPoint[];
  selectedId?: string;
  onPointSelect?: (point: MapPoint) => void;
  clustered?: boolean;
}

function toFeatureCollection(points: MapPoint[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      properties: {
        id: point.id,
        name: point.name,
        category: point.category,
        score: point.score,
      },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    })),
  };
}

export function LayerMarkers({
  points,
  selectedId,
  onPointSelect,
  clustered = false,
}: LayerMarkersProps) {
  const { map, isLoaded } = useMap();
  const reactId = React.useId();
  const id = React.useMemo(() => reactId.replaceAll(":", ""), [reactId]);
  const sourceId = React.useMemo(() => `scraping-markers-source-${id}`, [id]);
  const layerId = React.useMemo(() => `scraping-markers-layer-${id}`, [id]);
  const clusterLayerId = React.useMemo(() => `scraping-markers-clusters-${id}`, [id]);
  const clusterCountLayerId = React.useMemo(() => `scraping-markers-cluster-count-${id}`, [id]);
  const selectedLayerId = React.useMemo(
    () => `scraping-markers-selected-${id}`,
    [id]
  );
  const pointsRef = React.useRef(points);
  const onPointSelectRef = React.useRef(onPointSelect);

  React.useEffect(() => {
    pointsRef.current = points;
    onPointSelectRef.current = onPointSelect;
  }, [onPointSelect, points]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: toFeatureCollection(pointsRef.current),
          cluster: clustered,
          clusterMaxZoom: 15,
          clusterRadius: 44,
        });
      }

      if (clustered && !map.getLayer(clusterLayerId)) {
        map.addLayer({
          id: clusterLayerId,
          type: "circle",
          source: sourceId,
          filter: ["has", "point_count"],
          paint: {
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              6,
              22,
              14,
              27,
              30,
              32,
            ],
            "circle-color": "#1C1917",
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 3,
          },
        });
      }

      if (clustered && !map.getLayer(clusterCountLayerId)) {
        map.addLayer({
          id: clusterCountLayerId,
          type: "symbol",
          source: sourceId,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": "#FFFFFF",
            "text-halo-color": "#1C1917",
            "text-halo-width": 1,
          },
        });
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          filter: clustered ? ["!", ["has", "point_count"]] : ["all"],
          paint: {
            "circle-radius": 7,
            "circle-color": [
              "case",
              ["<=", ["get", "score"], 20],
              "#E63946",
              ["<=", ["get", "score"], 40],
              "#9A4A00",
              ["<=", ["get", "score"], 60],
              "#5B5FEF",
              "#3FAE2A",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#1C1917",
          },
        });
      }

      if (!map.getLayer(selectedLayerId)) {
        map.addLayer({
          id: selectedLayerId,
          type: "circle",
          source: sourceId,
          filter: clustered
            ? ["all", ["!", ["has", "point_count"]], ["==", ["get", "id"], ""]]
            : ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 12,
            "circle-color": "rgba(255,255,255,0)",
            "circle-stroke-width": 3,
            "circle-stroke-color": "#1C1917",
          },
        });
      }
    } catch {
      return;
    }

    const handleClick = (
      event: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      }
    ) => {
      const feature = event.features?.[0];
      const pointId = String(feature?.properties?.id ?? "");
      const point = pointsRef.current.find((item) => item.id === pointId);
      if (point) onPointSelectRef.current?.(point);
    };

    const handleClusterClick = async (
      event: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      }
    ) => {
      const feature = event.features?.[0];
      const clusterId = Number(feature?.properties?.cluster_id);
      const coordinates =
        feature?.geometry.type === "Point" ? feature.geometry.coordinates : null;
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;

      if (!source || !Number.isFinite(clusterId) || !coordinates) return;

      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: [coordinates[0], coordinates[1]],
          zoom,
          duration: 300,
        });
      } catch {
        // The cluster may disappear if the map zoom changes during the click.
      }
    };

    const handleEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, handleEnter);
    map.on("mouseleave", layerId, handleLeave);
    if (clustered) {
      map.on("click", clusterLayerId, handleClusterClick);
      map.on("mouseenter", clusterLayerId, handleEnter);
      map.on("mouseleave", clusterLayerId, handleLeave);
    }

    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, handleEnter);
      map.off("mouseleave", layerId, handleLeave);
      if (clustered) {
        map.off("click", clusterLayerId, handleClusterClick);
        map.off("mouseenter", clusterLayerId, handleEnter);
        map.off("mouseleave", clusterLayerId, handleLeave);
      }

      try {
        if (!isUsableMap(map)) return;
        if (map.getLayer(selectedLayerId)) map.removeLayer(selectedLayerId);
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getLayer(clusterCountLayerId)) map.removeLayer(clusterCountLayerId);
        if (map.getLayer(clusterLayerId)) map.removeLayer(clusterLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // MapLibre may already have removed layers during teardown.
      }
    };
  }, [
    clusterCountLayerId,
    clustered,
    clusterLayerId,
    isLoaded,
    layerId,
    map,
    selectedLayerId,
    sourceId,
  ]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource | undefined;
      source?.setData(toFeatureCollection(points));
    } catch {
      // Ignore stale MapLibre instances while filters/geolocation update.
    }
  }, [isLoaded, map, points, sourceId]);

  React.useEffect(() => {
    if (!isUsableMap(map) || !isLoaded) return;

    try {
      if (!map.getLayer(selectedLayerId)) return;
      map.setFilter(
        selectedLayerId,
        clustered
          ? ["all", ["!", ["has", "point_count"]], ["==", ["get", "id"], selectedId ?? ""]]
          : ["==", ["get", "id"], selectedId ?? ""]
      );
    } catch {
      // Ignore stale MapLibre instances while filters/geolocation update.
    }
  }, [clustered, isLoaded, map, selectedId, selectedLayerId]);

  return null;
}
