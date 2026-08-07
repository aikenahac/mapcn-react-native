import type { Feature } from "geojson";
import type { ReactNode, Ref } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type {
  Bounds,
  Coordinate,
  EdgePadding,
  GeoJSONInput,
  MapCameraAnimation,
  MapFeaturePressEvent,
  MapRenderer,
  MapViewport,
  OrnamentPosition,
  PartialViewport,
} from "../../lib/mapcn/types";
import type { MapProviderId } from "../../lib/mapcn/provider";

/**
 * All public prop interfaces for mapcn components live here, in one
 * renderer-independent file. Both the MapLibre and Mapbox implementations
 * of `Map` import their props type from the materialized copy of *this*
 * file rather than declaring their own -- that's what makes API parity a
 * property of the type system rather than a convention two humans have to
 * remember to keep in sync (plan §2 D3).
 *
 * Renderer-specific extras are opt-in escape hatches (`maplibre?`, `mapbox?`)
 * on `MapProps`, never leaked into the shared contract.
 */

export type MapStyleSource = string | Record<string, unknown>;

export interface MapProps {
  children?: ReactNode;

  /**
   * A named provider style ("streets", "dark", ...), an explicit URL/style
   * spec, or a light/dark pair of either. Resolved against the configured
   * basemap provider (see lib/mapcn/provider.ts). Defaults to the
   * provider's `defaultStyle` for the active color scheme.
   */
  style?: MapStyleSource | { light: MapStyleSource; dark: MapStyleSource };
  provider?: MapProviderId;
  /** Overrides the color scheme used to pick the style. Defaults to RN's useColorScheme(). */
  colorScheme?: "light" | "dark";

  // --- viewport ---
  /** Controlled. When set, the map camera follows this value. */
  viewport?: PartialViewport;
  /** Uncontrolled initial viewport. Ignored if `viewport` is set. */
  defaultViewport?: PartialViewport;
  /** Fires continuously while the viewport changes (throttled, see `viewportChangeThrottle`). */
  onViewportChange?: (viewport: MapViewport, meta: { userInteraction: boolean }) => void;
  /** Fires once movement settles. */
  onViewportChangeEnd?: (viewport: MapViewport, meta: { userInteraction: boolean }) => void;
  /** ms; default 100. */
  viewportChangeThrottle?: number;
  /** Fit these bounds on mount. Mutually exclusive with defaultViewport.center. */
  bounds?: Bounds;
  padding?: EdgePadding;

  minZoom?: number;
  maxZoom?: number;
  maxBounds?: Bounds;

  // --- interaction ---
  interactive?: boolean;
  gestures?: { pan?: boolean; zoom?: boolean; rotate?: boolean; pitch?: boolean };

  // --- ornaments ---
  compass?: boolean | { position: OrnamentPosition };
  logo?: boolean | { position: OrnamentPosition };
  attribution?: boolean | { position: OrnamentPosition };
  scaleBar?: boolean | { position: OrnamentPosition };

  // --- events ---
  onPress?: (event: MapFeaturePressEvent) => void;
  onLongPress?: (event: MapFeaturePressEvent) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;

  // --- presentation ---
  className?: string;
  containerStyle?: StyleProp<ViewStyle>;
  loader?: ReactNode | false;

  ref?: Ref<MapInstance>;

  /** Escape hatches -- documented as advanced, deliberately loosely typed. */
  maplibre?: Record<string, unknown>;
  mapbox?: Record<string, unknown>;
}

export interface MapInstance {
  renderer: MapRenderer;
  isLoaded: boolean;

  getViewport(): Promise<MapViewport>;
  setViewport(v: PartialViewport, animation?: MapCameraAnimation): void;
  flyTo(center: Coordinate, options?: { zoom?: number } & MapCameraAnimation): void;
  moveTo(center: Coordinate, options?: { zoom?: number } & MapCameraAnimation): void;
  zoomTo(zoom: number, options?: MapCameraAnimation): void;
  zoomBy(delta: number, options?: MapCameraAnimation): void;
  fitBounds(bounds: Bounds, options?: MapCameraAnimation): void;
  fitFeatures(data: GeoJSONInput, options?: MapCameraAnimation): void;
  resetNorth(options?: MapCameraAnimation): void;

  project(coordinate: Coordinate): Promise<{ x: number; y: number }>;
  unproject(point: { x: number; y: number }): Promise<Coordinate>;
  queryFeatures(options?: {
    point?: { x: number; y: number };
    bounds?: Bounds;
    layers?: Array<string>;
     
    filter?: Array<any>;
  }): Promise<Array<Feature>>;

  /** Raw renderer refs. Types differ per renderer -- branch on `renderer`. */
   
  mapRef: { current: any };
   
  cameraRef: { current: any };
}

/**
 * The renderer-independent camera/query methods of MapInstance, minus the
 * bookkeeping fields (`renderer`, `isLoaded`, the raw refs) that `Map`
 * itself owns. Each renderer adapter's `createCameraController()` returns
 * exactly this shape, built on top of that renderer's native map/camera
 * refs -- this is what makes the two adapters interchangeable from `Map`'s
 * point of view.
 */
export type MapInstanceMethods = Omit<MapInstance, "renderer" | "isLoaded" | "mapRef" | "cameraRef">;

/** Per-renderer capability flags, used to warn (not silently drop) unsupported props. */
export interface RendererCapabilities {
  /** GeoJSONSource clusterMinPoints -- MapLibre only. */
  clusterMinPoints: boolean;
  /** LocationPuck pulsing animation -- Mapbox only. */
  locationPuckPulsing: boolean;
  /** LocationPuck custom scale -- Mapbox only. */
  locationPuckScale: boolean;
  /** LocationPuck custom top/bearing/shadow images -- Mapbox only. */
  locationPuckImages: boolean;
  /** LocationPuck onPress -- MapLibre only. */
  locationPuckPress: boolean;
  /** LocationPuck fully custom JS-rendered children -- MapLibre only. */
  locationPuckCustomChildren: boolean;
}
