import { useId, useMemo } from "react";
import type { GeoJsonProperties } from "geojson";
import { circlePolygon, type DistanceUnit, toMeters } from "@/lib/mapcn/geo";
import { MapGeoJSON } from "./map-geojson";
import type { Coordinate, FillStyle, LineStyle, MapFeaturePressEvent } from "@/lib/mapcn/types";

export interface MapCircleProps {
  id?: string;
  center: Coordinate;
  /** Real-world radius, in `units` (default meters). */
  radius: number;
  units?: DistanceUnit;
  /** Polygon resolution. Default scales automatically with radius (see stepsForRadius). */
  steps?: number;

  fill?: FillStyle | false;
  stroke?: LineStyle | false;
  selected?: boolean;
  selectedStyle?: { fill?: FillStyle; stroke?: LineStyle };
  onPress?: (event: MapFeaturePressEvent) => void;

  properties?: GeoJsonProperties;
  beforeId?: string;
}

const DEFAULT_FILL: FillStyle = { color: "#4285F4", opacity: 0.2 };
const DEFAULT_STROKE: LineStyle = { color: "#4285F4", width: 2 };

/**
 * An intent-based circle/radius primitive for search radii, delivery
 * zones, geofence previews, accuracy circles, etc. (plan §7.8). Generates
 * a real geodesic polygon via `circlePolygon` rather than using a native
 * `circle` layer, whose radius is in screen pixels and doesn't represent a
 * true geographic distance -- it would look right at one zoom level and
 * wrong at every other.
 */
export function MapCircle({
  id,
  center,
  radius,
  units = "meters",
  steps,
  fill = DEFAULT_FILL,
  stroke = DEFAULT_STROKE,
  selected = false,
  selectedStyle,
  onPress,
  properties,
  beforeId,
}: MapCircleProps) {
  const autoId = useId();
  const sourceId = id ?? `circle-${autoId}`;

  const feature = useMemo(
    () => circlePolygon(center, toMeters(radius, units), steps, properties),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [center[0], center[1], radius, units, steps, properties],
  );

  // A single-feature primitive doesn't need MapGeoJSON's selectedId/filter
  // mechanism (that's for picking one feature out of many) -- selection
  // here is just "which style set applies", resolved directly.
  const resolvedFill = selected && selectedStyle?.fill ? selectedStyle.fill : fill;
  const resolvedStroke = selected && selectedStyle?.stroke ? selectedStyle.stroke : stroke;

  return (
    <MapGeoJSON
      id={sourceId}
      data={feature}
      point={false}
      line={resolvedStroke}
      fill={resolvedFill}
      beforeId={beforeId}
      onFeaturePress={onPress}
    />
  );
}
