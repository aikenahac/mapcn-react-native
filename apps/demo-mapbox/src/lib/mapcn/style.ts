import type { Expression, FillStyle, LineStyle, PointStyle } from "./types";

/**
 * Converts mapcn's high-level style objects into native paint-property
 * style objects. Both renderers use identical camelCased paint/layout key
 * names and identical expression syntax (confirmed during Phase 0 research
 * -- see plan §1.2), so this mapping is genuinely renderer-independent.
 */
export function circlePaintFrom(style: PointStyle | false | undefined): Record<string, unknown> | undefined {
  if (!style) return undefined;
  const paint: Record<string, unknown> = {};
  if (style.color !== undefined) paint.circleColor = style.color;
  if (style.radius !== undefined) paint.circleRadius = style.radius;
  if (style.opacity !== undefined) paint.circleOpacity = style.opacity;
  if (style.strokeColor !== undefined) paint.circleStrokeColor = style.strokeColor;
  if (style.strokeWidth !== undefined) paint.circleStrokeWidth = style.strokeWidth;
  return paint;
}

export function linePaintFrom(style: LineStyle | false | undefined): Record<string, unknown> | undefined {
  if (!style) return undefined;
  const paint: Record<string, unknown> = {};
  if (style.color !== undefined) paint.lineColor = style.color;
  if (style.width !== undefined) paint.lineWidth = style.width;
  if (style.opacity !== undefined) paint.lineOpacity = style.opacity;
  if (style.dashArray !== undefined) paint.lineDasharray = style.dashArray;
  if (style.cap !== undefined) paint.lineCap = style.cap;
  if (style.join !== undefined) paint.lineJoin = style.join;
  return paint;
}

export function fillPaintFrom(style: FillStyle | false | undefined): Record<string, unknown> | undefined {
  if (!style) return undefined;
  const paint: Record<string, unknown> = {};
  if (style.color !== undefined) paint.fillColor = style.color;
  if (style.opacity !== undefined) paint.fillOpacity = style.opacity;
  if (style.outlineColor !== undefined) paint.fillOutlineColor = style.outlineColor;
  return paint;
}

const GEOMETRY_TYPE: Expression = ["geometry-type"];

export function geometryTypeFilter(types: Array<string>): Expression {
  return ["in", GEOMETRY_TYPE, ["literal", types]];
}

export const POINT_GEOMETRY_FILTER = geometryTypeFilter(["Point", "MultiPoint"]);
export const LINE_GEOMETRY_FILTER = geometryTypeFilter(["LineString", "MultiLineString"]);
export const POLYGON_GEOMETRY_FILTER = geometryTypeFilter(["Polygon", "MultiPolygon"]);

export function combineFilters(...filters: Array<Expression | undefined>): Expression {
  const present = filters.filter((f): f is Expression => f !== undefined);
  if (present.length === 0) return ["all"];
  if (present.length === 1) return present[0]!;
  return ["all", ...present];
}

/** `["==", ["get", idProperty], selectedId]` -- the selection mechanism used everywhere instead of native feature state (Mapbox-only; see plan §2 D6). */
export function selectionFilter(idProperty: string, selectedId: string | number): Expression {
  return ["==", ["get", idProperty], selectedId];
}
