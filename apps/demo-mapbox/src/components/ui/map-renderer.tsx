/**
 * The Mapbox implementation of the renderer adapter boundary (plan §2 D2).
 * See apps/demo-maplibre/src/components/ui/map-renderer.tsx for the sibling
 * implementation and the rationale for what does/doesn't live here.
 */
import type { ComponentType } from "react";
import Mapbox, {
  type Camera as MapboxCameraRef,
  type MapView as MapboxMapViewRef,
} from "@rnmapbox/maps";
import type {
  Bounds,
  Coordinate,
  MapCameraAnimation,
  MapFeaturePressEvent,
  MapRenderer,
  MapViewport,
  ScreenPoint,
} from "@/lib/mapcn/types";
import type { MapInstanceMethods, RendererCapabilities } from "@/components/ui/map-types";
import { bboxOf } from "@/lib/mapcn/geo";

export { Mapbox };
export type { MapboxCameraRef, MapboxMapViewRef };

/**
 * @rnmapbox/maps@10.3.5's class components that extend the internal
 * `NativeBridgeComponent` mixin (MapView, Callout, ShapeSource, and every
 * *Layer) are not structurally assignable to React 19.2's `Component` type
 * under TS 6 (confirmed during Phase 0: MarkerView and Camera, which don't
 * use that mixin, typecheck fine as JSX). This is an upstream typing gap,
 * not a bug in this codebase -- every file that needs to render one of
 * these imports the pre-cast version from here instead of re-deriving the
 * same `as unknown as ComponentType<any>` workaround at each call site.
 */
export const MapboxMapView = Mapbox.MapView as unknown as ComponentType<any>;
export const MapboxCallout = Mapbox.Callout as unknown as ComponentType<any>;
export const MapboxShapeSource = Mapbox.ShapeSource as unknown as ComponentType<any>;
export const MapboxLineLayer = Mapbox.LineLayer as unknown as ComponentType<any>;
export const MapboxFillLayer = Mapbox.FillLayer as unknown as ComponentType<any>;
export const MapboxCircleLayer = Mapbox.CircleLayer as unknown as ComponentType<any>;
export const MapboxSymbolLayer = Mapbox.SymbolLayer as unknown as ComponentType<any>;

export const RENDERER: MapRenderer = "mapbox";

export const CAPABILITIES: RendererCapabilities = {
  clusterMinPoints: false,
  locationPuckPulsing: true,
  locationPuckScale: true,
  locationPuckImages: true,
  locationPuckPress: false,
  locationPuckCustomChildren: false,
};

interface RegionPayload {
  zoomLevel: number;
  heading: number;
  pitch: number;
  visibleBounds: Array<Array<number>>;
  isUserInteraction: boolean;
}

/**
 * MapView's region-change callbacks hand back a GeoJSON Feature<Point,
 * RegionPayload> rather than a plain object (see plan §1.2 upstream
 * research) -- this pulls the fields `Map`/`useMap` actually need out of it.
 */
export function normalizeRegionChangeEvent(feature: {
  geometry: { coordinates: Coordinate };
  properties: RegionPayload;
}): { viewport: MapViewport; userInteraction: boolean } {
  const { coordinates } = feature.geometry;
  const { zoomLevel, heading, pitch, isUserInteraction } = feature.properties;
  return {
    viewport: { center: coordinates, zoom: zoomLevel, bearing: heading, pitch },
    userInteraction: isUserInteraction,
  };
}

export function normalizeFeaturePress(feature: {
  geometry: { coordinates: Coordinate };
  properties?: { screenPointX?: number; screenPointY?: number };
   
  features?: Array<any>;
}): MapFeaturePressEvent {
  return {
    coordinate: feature.geometry.coordinates,
    point: { x: feature.properties?.screenPointX ?? 0, y: feature.properties?.screenPointY ?? 0 },
    features: feature.features ?? [],
  };
}

function toMapboxPadding(padding: MapCameraAnimation["padding"]) {
  if (!padding) return undefined;
  return {
    paddingTop: padding.top ?? 0,
    paddingRight: padding.right ?? 0,
    paddingBottom: padding.bottom ?? 0,
    paddingLeft: padding.left ?? 0,
  };
}

function toAnimationMode(easing: MapCameraAnimation["easing"]): "flyTo" | "easeTo" | "linearTo" {
  if (easing === "linear") return "linearTo";
  if (easing === "fly") return "flyTo";
  return "easeTo";
}

/**
 * Builds the camera-facing subset of `MapInstance` on top of Mapbox's
 * native `MapView`/`Camera` refs. `map.tsx` combines this with `isLoaded`,
 * `renderer` and the raw refs to produce the full instance handed out by
 * `useMap()`.
 */
export function createCameraController(
  mapRef: { current: MapboxMapViewRef | null },
  cameraRef: { current: MapboxCameraRef | null },
): MapInstanceMethods {
  return {
    async getViewport() {
      const [center, zoom] = await Promise.all([mapRef.current?.getCenter(), mapRef.current?.getZoom()]);
      if (!center || zoom === undefined) {
        throw new Error("[mapcn] getViewport() called before the map finished loading");
      }
      // Mapbox's MapView doesn't expose heading/pitch directly; Camera's
      // onCameraChanged (wired in map.tsx) is the source of truth for those
      // while the map is live. At rest we report 0 rather than stale state.
      return { center: center as Coordinate, zoom, bearing: 0, pitch: 0 };
    },

    setViewport(viewport, animation) {
      cameraRef.current?.setCamera({
        centerCoordinate: viewport.center,
        zoomLevel: viewport.zoom,
        heading: viewport.bearing,
        pitch: viewport.pitch,
        padding: toMapboxPadding(animation?.padding),
        animationDuration: animation?.duration ?? 0,
        animationMode: toAnimationMode(animation?.easing),
      });
    },

    flyTo(center, options) {
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: options?.zoom,
        padding: toMapboxPadding(options?.padding),
        animationDuration: options?.duration ?? 1000,
        animationMode: "flyTo",
      });
    },

    moveTo(center, options) {
      cameraRef.current?.setCamera({
        centerCoordinate: center,
        zoomLevel: options?.zoom,
        padding: toMapboxPadding(options?.padding),
        animationDuration: options?.duration ?? 0,
        animationMode: (options?.duration ?? 0) > 0 ? toAnimationMode(options?.easing) : "linearTo",
      });
    },

    zoomTo(zoom, options) {
      cameraRef.current?.setCamera({
        zoomLevel: zoom,
        animationDuration: options?.duration ?? 0,
        animationMode: toAnimationMode(options?.easing),
      });
    },

    async zoomBy(delta, options) {
      const currentZoom = (await mapRef.current?.getZoom()) ?? 0;
      cameraRef.current?.setCamera({
        zoomLevel: currentZoom + delta,
        animationDuration: options?.duration ?? 0,
        animationMode: toAnimationMode(options?.easing),
      });
    },

    fitBounds(bounds, options) {
      const [west, south, east, north] = bounds as Bounds;
      cameraRef.current?.setCamera({
        bounds: {
          ne: [east, north],
          sw: [west, south],
          ...toMapboxPadding(options?.padding),
        },
        animationDuration: options?.duration ?? 0,
        animationMode: toAnimationMode(options?.easing),
      });
    },

    fitFeatures(data, options) {
      const [west, south, east, north] = bboxOf(data);
      cameraRef.current?.setCamera({
        bounds: {
          ne: [east, north],
          sw: [west, south],
          ...toMapboxPadding(options?.padding),
        },
        animationDuration: options?.duration ?? 0,
        animationMode: toAnimationMode(options?.easing),
      });
    },

    resetNorth(options) {
      cameraRef.current?.setCamera({
        heading: 0,
        animationDuration: options?.duration ?? 300,
        animationMode: toAnimationMode(options?.easing),
      });
    },

    async project(coordinate) {
      const point = await mapRef.current?.getPointInView(coordinate);
      if (!point) throw new Error("[mapcn] project() called before the map finished loading");
      return { x: point[0] as number, y: point[1] as number };
    },

    async unproject(point) {
      const coordinate = await mapRef.current?.getCoordinateFromView([point.x, point.y]);
      if (!coordinate) throw new Error("[mapcn] unproject() called before the map finished loading");
      return coordinate as Coordinate;
    },

    async queryFeatures(options) {
      // See MapLibre adapter for why `filter` is cast at this boundary: the
      // shared `Expression` type is intentionally loose to match both
      // renderers' style-spec grammar.
      const filter = options?.filter as never;

      if (options?.point) {
        const result = await mapRef.current?.queryRenderedFeaturesAtPoint(
          [options.point.x, options.point.y],
          filter,
          options.layers,
        );
        return result?.features ?? [];
      }

      if (options?.bounds) {
        const rect = await geographicBoundsToPixelRect(mapRef.current, options.bounds);
        if (!rect) return [];
        const result = await mapRef.current?.queryRenderedFeaturesInRect(rect, filter, options.layers);
        return result?.features ?? [];
      }

      // rnmapbox has no "query the whole current viewport" call that
      // doesn't need an explicit pixel rect (unlike MapLibre's
      // `queryRenderedFeatures()` with no arguments) -- documented gap, not
      // silently faked. Callers needing this should query against
      // `mapRef.current` directly with the screen's own dimensions.
      return [];
    },
  };
}

async function geographicBoundsToPixelRect(
  map: MapboxMapViewRef | null | undefined,
  bounds: Bounds,
): Promise<[number, number, number, number] | null> {
  if (!map) return null;
  const [west, south, east, north] = bounds;
  const topLeft = (await map.getPointInView([west, north])) as [number, number] | undefined;
  const bottomRight = (await map.getPointInView([east, south])) as [number, number] | undefined;
  if (!topLeft || !bottomRight) return null;
  // queryRenderedFeaturesInRect expects [top, left, bottom, right] (see the
  // upstream doc comment on MapView.queryRenderedFeaturesInRect).
  return [topLeft[1], topLeft[0], bottomRight[1], bottomRight[0]];
}

export function screenPointOf(x: number, y: number): ScreenPoint {
  return { x, y };
}
