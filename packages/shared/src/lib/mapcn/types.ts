import type { Feature, FeatureCollection, Geometry } from "geojson";

/** [longitude, latitude] — matches MapLibre's LngLat exactly. */
export type Coordinate = [longitude: number, latitude: number];

/** [west, south, east, north]. */
export type Bounds = [west: number, south: number, east: number, north: number];

export type MapRenderer = "maplibre" | "mapbox";

export interface MapViewport {
  center: Coordinate;
  zoom: number;
  bearing: number;
  pitch: number;
}

export type PartialViewport = Partial<MapViewport>;

export interface EdgePadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface MapCameraAnimation {
  /** ms. 0 = instant. */
  duration?: number;
  easing?: "linear" | "ease" | "fly";
  padding?: EdgePadding;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface MapFeaturePressEvent {
  coordinate: Coordinate;
  point: ScreenPoint;
  features: Array<Feature>;
}

export type GeoJSONInput = Feature | FeatureCollection | Geometry | string;

/**
 * A style-spec expression: `["get", "color"]`, `["interpolate", ...]`, etc.
 * Kept loose on purpose — both renderers share the same expression grammar
 * (see plan §1.2), so we don't attempt to model it more strictly than the
 * upstream style specs already do.
 */
 
export type Expression = Array<any>;

export type StyleValue<T> = T | Expression;

/** Shared style objects — identical key names on both renderers. */
export interface PointStyle {
  color?: StyleValue<string>;
  radius?: StyleValue<number>;
  opacity?: StyleValue<number>;
  strokeColor?: StyleValue<string>;
  strokeWidth?: StyleValue<number>;
}

export interface LineStyle {
  color?: StyleValue<string>;
  width?: StyleValue<number>;
  opacity?: StyleValue<number>;
  dashArray?: Array<number>;
  cap?: "butt" | "round" | "square";
  join?: "bevel" | "round" | "miter";
}

export interface FillStyle {
  color?: StyleValue<string>;
  opacity?: StyleValue<number>;
  outlineColor?: StyleValue<string>;
}

export interface TextStyle {
  color?: StyleValue<string>;
  size?: StyleValue<number>;
  haloColor?: string;
  haloWidth?: number;
  font?: Array<string>;
}

export type ColorScheme = "light" | "dark";

export type OrnamentPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** Plain data driving <MapLegend> — deliberately decoupled from any rendering component. */
export type MapLegendData =
  | { type: "categorical"; items: Array<{ label: string; color: string; value?: string | number }> }
  | { type: "steps"; items: Array<{ label: string; color: string; from?: number; to?: number }>; unit?: string }
  | { type: "gradient"; stops: Array<{ at: number; color: string }>; domain: [number, number]; unit?: string };
