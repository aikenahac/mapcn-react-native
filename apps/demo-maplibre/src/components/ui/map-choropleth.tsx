import { useEffect, useId, useMemo } from "react";
import type { Feature, FeatureCollection } from "geojson";
import type { NativeSyntheticEvent } from "react-native";
import { MapLayer, MapSource } from "./map-renderer";
import { linePaintFrom, selectionFilter } from "@/lib/mapcn/style";
import { buildChoroplethLegend, buildInterpolateExpression, buildStepExpression, computeScale, type ChoroplethScale } from "@/lib/mapcn/scale";
import type { FillStyle, LineStyle, MapFeaturePressEvent, MapLegendData } from "@/lib/mapcn/types";

export type { ChoroplethScale };

export interface MapChoroplethProps {
  id?: string;
  data: FeatureCollection;
  /** Numeric feature property key. For a computed value, precompute it first via lib/mapcn/geo's precomputeValues -- native style evaluation can't call back into JS per feature. */
  value: string;
  scale?: ChoroplethScale;

  opacity?: number;
  border?: LineStyle | false;
  missing?: { color?: string; opacity?: number } | "hide";

  selectedId?: string | number | null;
  idProperty?: string;
  selected?: { fill?: FillStyle; border?: LineStyle };
  onFeaturePress?: (feature: Feature, event: MapFeaturePressEvent) => void;

  /** Emits normalized legend data, e.g. for <MapLegend data={legend} />. */
  onLegendChange?: (legend: MapLegendData) => void;

  beforeId?: string;
  fillStyle?: Record<string, unknown>;
  borderStyle?: Record<string, unknown>;
}

const DEFAULT_SCALE: ChoroplethScale = { type: "quantize", steps: 5 };
const DEFAULT_BORDER: LineStyle = { color: "#ffffff", width: 1 };

/**
 * A choropleth abstraction (plan §7.6) built on native `["step"/"interpolate"]`
 * expression evaluation -- the domain/breaks are computed once in JS
 * (lib/mapcn/scale.ts) and the actual per-feature styling happens entirely
 * natively, which is why value accessors are a precompute step rather than
 * a runtime callback prop (that would mean round-tripping every feature
 * through JS every frame).
 */
export function MapChoropleth({
  id,
  data,
  value,
  scale = DEFAULT_SCALE,
  opacity = 0.7,
  border = DEFAULT_BORDER,
  missing = { color: "#e5e7eb", opacity: 0.4 },
  selectedId,
  idProperty = "id",
  selected,
  onFeaturePress,
  onLegendChange,
  beforeId,
  fillStyle,
  borderStyle,
}: MapChoroplethProps) {
  const autoId = useId();
  const sourceId = id ?? `choropleth-${autoId}`;

  const computed = useMemo(() => computeScale(scale, data, value), [scale, data, value]);

  const missingColor = missing === "hide" ? "rgba(0,0,0,0)" : missing.color ?? "#e5e7eb";
  const fillExpression = useMemo(
    () => (scale.type === "linear" ? buildInterpolateExpression(value, scale.colors, computed.domain, missingColor) : buildStepExpression(value, computed, missingColor)),
    [scale, value, computed, missingColor],
  );

  useEffect(() => {
    onLegendChange?.(buildChoroplethLegend(scale, computed));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, computed]);

  const hasSelection = selectedId !== undefined && selectedId !== null;
  const selectionExpr = useMemo(() => (hasSelection ? selectionFilter(idProperty, selectedId as string | number) : undefined), [hasSelection, idProperty, selectedId]);

  const handlePress = onFeaturePress
    ?  
      (event: NativeSyntheticEvent<any>) => {
        const feature: Feature | undefined = event.nativeEvent.features?.[0];
        if (!feature) return;
        const coordinate = event.nativeEvent.lngLat ?? [0, 0];
        const point = event.nativeEvent.point ? { x: event.nativeEvent.point[0], y: event.nativeEvent.point[1] } : { x: 0, y: 0 };
        onFeaturePress(feature, { coordinate, point, features: event.nativeEvent.features ?? [feature] });
      }
    : undefined;

  return (
    <MapSource id={sourceId} data={data} onPress={handlePress}>
      <MapLayer
        id={`${sourceId}-fill`}
        type="fill"
        beforeId={beforeId}
        style={{ fillColor: fillExpression, fillOpacity: missing === "hide" ? ["case", ["!", ["has", value]], 0, opacity] : opacity, ...fillStyle }}
      />
      {border !== false && (
        <MapLayer id={`${sourceId}-border`} type="line" beforeId={beforeId} style={{ ...linePaintFrom(border), ...borderStyle }} />
      )}
      {hasSelection && selected?.fill && <MapLayer id={`${sourceId}-selected-fill`} type="fill" filter={selectionExpr} style={{ fillColor: selected.fill.color, fillOpacity: selected.fill.opacity }} />}
      {hasSelection && selected?.border && <MapLayer id={`${sourceId}-selected-border`} type="line" filter={selectionExpr} style={linePaintFrom(selected.border)} />}
    </MapSource>
  );
}
