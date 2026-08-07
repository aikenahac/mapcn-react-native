import { useId, useMemo, type ReactNode } from "react";
import type { NativeSyntheticEvent } from "react-native";
import { MapLayer, MapSource } from "./map-renderer";
import {
  circlePaintFrom,
  combineFilters,
  fillPaintFrom,
  LINE_GEOMETRY_FILTER,
  linePaintFrom,
  POINT_GEOMETRY_FILTER,
  POLYGON_GEOMETRY_FILTER,
  selectionFilter,
} from "@/lib/mapcn/style";
import type {
  Expression,
  FillStyle,
  GeoJSONInput,
  LineStyle,
  MapFeaturePressEvent,
  PointStyle,
} from "@/lib/mapcn/types";

export interface MapGeoJSONProps {
  id?: string;
  data: GeoJSONInput;

  /** Per-geometry-type styling. `false` disables that layer entirely. */
  point?: PointStyle | false;
  line?: LineStyle | false;
  fill?: FillStyle | false;

  /** Styles applied to the selected feature only (rendered as a highlight layer). */
  selected?: { point?: PointStyle; line?: LineStyle; fill?: FillStyle };
  selectedId?: string | number | null;
  /** default "id" */
  idProperty?: string;

  filter?: Expression;
  minZoom?: number;
  maxZoom?: number;
  beforeId?: string;

  onFeaturePress?: (event: MapFeaturePressEvent) => void;
  hitbox?: { width: number; height: number };

  /** Raw style escape hatches, merged last over the computed style. */
  pointStyle?: Record<string, unknown>;
  lineStyle?: Record<string, unknown>;
  fillStyle?: Record<string, unknown>;

  /** Extra raw layers rendered against the same source. */
  children?: ReactNode;
}

const DEFAULT_POINT_STYLE: PointStyle = { color: "#4285F4", radius: 5, strokeColor: "#ffffff", strokeWidth: 1.5 };
const DEFAULT_LINE_STYLE: LineStyle = { color: "#4285F4", width: 3 };
const DEFAULT_FILL_STYLE: FillStyle = { color: "#4285F4", opacity: 0.3, outlineColor: "#4285F4" };

/**
 * The foundational GeoJSON rendering primitive (plan §7.3). Renders every
 * geometry type in a FeatureCollection through one native source and up to
 * three base layers (fill, line, circle), each filtered by geometry type
 * so a mixed collection renders correctly with no per-type wiring from the
 * caller. MapClusterLayer, MapHeatmap, MapChoropleth, MapCircle and
 * MapPolygon are all built on this (or the same MapSource/MapLayer
 * primitives directly).
 */
export function MapGeoJSON({
  id,
  data,
  point = DEFAULT_POINT_STYLE,
  line = DEFAULT_LINE_STYLE,
  fill = DEFAULT_FILL_STYLE,
  selected,
  selectedId,
  idProperty = "id",
  filter,
  minZoom,
  maxZoom,
  beforeId,
  onFeaturePress,
  hitbox,
  pointStyle,
  lineStyle,
  fillStyle,
  children,
}: MapGeoJSONProps) {
  const autoId = useId();
  const sourceId = id ?? `geojson-${autoId}`;

  const hasSelection = selectedId !== undefined && selectedId !== null;
  const selectionExpr = useMemo(
    () => (hasSelection ? selectionFilter(idProperty, selectedId as string | number) : undefined),
    [hasSelection, idProperty, selectedId],
  );

  const handlePress = onFeaturePress
    ?  
      (event: NativeSyntheticEvent<any>) => onFeaturePress(normalizeSourcePress(event))
    : undefined;

  return (
    <MapSource id={sourceId} data={data} onPress={handlePress} hitbox={hitbox}>
      {fill !== false && (
        <MapLayer
          id={`${sourceId}-fill`}
          type="fill"
          beforeId={beforeId}
          minZoom={minZoom}
          maxZoom={maxZoom}
          filter={combineFilters(POLYGON_GEOMETRY_FILTER, filter)}
          style={{ ...fillPaintFrom(fill), ...fillStyle }}
        />
      )}
      {line !== false && (
        <MapLayer
          id={`${sourceId}-line`}
          type="line"
          beforeId={beforeId}
          minZoom={minZoom}
          maxZoom={maxZoom}
          filter={combineFilters(LINE_GEOMETRY_FILTER, filter)}
          style={{ ...linePaintFrom(line), ...lineStyle }}
        />
      )}
      {point !== false && (
        <MapLayer
          id={`${sourceId}-point`}
          type="circle"
          beforeId={beforeId}
          minZoom={minZoom}
          maxZoom={maxZoom}
          filter={combineFilters(POINT_GEOMETRY_FILTER, filter)}
          style={{ ...circlePaintFrom(point), ...pointStyle }}
        />
      )}
      {hasSelection && selected?.fill && (
        <MapLayer
          id={`${sourceId}-selected-fill`}
          type="fill"
          filter={combineFilters(POLYGON_GEOMETRY_FILTER, selectionExpr)}
          style={fillPaintFrom(selected.fill)}
        />
      )}
      {hasSelection && selected?.line && (
        <MapLayer
          id={`${sourceId}-selected-line`}
          type="line"
          filter={combineFilters(LINE_GEOMETRY_FILTER, selectionExpr)}
          style={linePaintFrom(selected.line)}
        />
      )}
      {hasSelection && selected?.point && (
        <MapLayer
          id={`${sourceId}-selected-point`}
          type="circle"
          filter={combineFilters(POINT_GEOMETRY_FILTER, selectionExpr)}
          style={circlePaintFrom(selected.point)}
        />
      )}
      {children}
    </MapSource>
  );
}

 
function normalizeSourcePress(event: NativeSyntheticEvent<any>): MapFeaturePressEvent {
  const payload = event.nativeEvent;
  const coordinate = payload.lngLat ?? payload.coordinates ?? payload.geometry?.coordinates ?? [0, 0];
  const point = payload.point ? { x: payload.point[0], y: payload.point[1] } : { x: 0, y: 0 };
  return { coordinate, point, features: payload.features ?? [] };
}
