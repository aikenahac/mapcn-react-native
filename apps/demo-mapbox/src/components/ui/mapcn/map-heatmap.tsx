import { useId, useMemo } from "react";
import { MapLayer, MapSource } from "./map-renderer";
import type { Expression, GeoJSONInput } from "@/lib/mapcn/types";

export interface MapHeatmapZoomStop {
  zoom: number;
  value: number;
}

export interface MapHeatmapProps {
  id?: string;
  data: GeoJSONInput;

  /** Property key, constant, or expression. */
  weight?: string | number | Expression;
  /** Normalizes a property key's raw range into 0..1. Required when `weight` is a property key. */
  weightRange?: [min: number, max: number];

  radius?: number | Array<MapHeatmapZoomStop>;
  intensity?: number | Array<MapHeatmapZoomStop>;
  opacity?: number | Array<MapHeatmapZoomStop>;
  /** Colors spread evenly across density 0..1, or explicit density stops. */
  colors?: Array<string> | Array<{ at: number; color: string }>;

  minZoom?: number;
  maxZoom?: number;
  beforeId?: string;
  /** Raw escape hatch, merged last. */
  heatmapStyle?: Record<string, unknown>;
}

const DEFAULT_COLORS = ["#3b82f6", "#22d3ee", "#facc15", "#f97316", "#ef4444"];

function zoomExpression(value: number | Array<MapHeatmapZoomStop>): number | Expression {
  if (typeof value === "number") return value;
  const sorted = [...value].sort((a, b) => a.zoom - b.zoom);
  const expr: Expression = ["interpolate", ["linear"], ["zoom"]];
  sorted.forEach((stop) => expr.push(stop.zoom, stop.value));
  return expr;
}

function weightExpression(weight: string | number | Expression | undefined, range: [number, number] | undefined): Expression | number | undefined {
  if (weight === undefined) return undefined;
  if (typeof weight !== "string") return weight;
  const [min, max] = range ?? [0, 1];
  return ["interpolate", ["linear"], ["get", weight], min, 0, max, 1];
}

function colorExpression(colors: MapHeatmapProps["colors"]): Expression {
  const stops =
    !colors || typeof colors[0] === "string"
      ? (colors as Array<string> | undefined ?? DEFAULT_COLORS).map((color, i, arr) => ({
          at: i / (arr.length - 1 || 1),
          color,
        }))
      : (colors as Array<{ at: number; color: string }>);

  const expr: Expression = ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(0,0,0,0)"];
  for (const stop of stops) {
    if (stop.at === 0) continue; // density 0 is always transparent -- the #1 heatmap footgun this avoids
    expr.push(stop.at, stop.color);
  }
  return expr;
}

/**
 * A high-level heatmap primitive (plan §7.4... §7.4 is clusters; this is
 * §7.4-adjacent per the numbered feature list -- heatmaps). Exposes 5
 * concepts (weight, radius, intensity, opacity, colors) instead of raw
 * heatmap-* paint properties, and compiles the common footguns (forgetting
 * the transparent density-0 stop, weight not being normalized) away.
 */
export function MapHeatmap({
  id,
  data,
  weight,
  weightRange,
  radius = 20,
  intensity = 1,
  opacity = 1,
  colors,
  minZoom,
  maxZoom,
  beforeId,
  heatmapStyle,
}: MapHeatmapProps) {
  const autoId = useId();
  const sourceId = id ?? `heatmap-${autoId}`;

  const style = useMemo(
    () => ({
      heatmapWeight: weightExpression(weight, weightRange),
      heatmapRadius: zoomExpression(radius),
      heatmapIntensity: zoomExpression(intensity),
      heatmapOpacity: zoomExpression(opacity),
      heatmapColor: colorExpression(colors),
      ...heatmapStyle,
    }),
     
    [weight, weightRange, radius, intensity, opacity, colors, heatmapStyle],
  );

  return (
    <MapSource id={sourceId} data={data}>
      <MapLayer id={`${sourceId}-heatmap`} type="heatmap" beforeId={beforeId} minZoom={minZoom} maxZoom={maxZoom} style={style} />
    </MapSource>
  );
}
