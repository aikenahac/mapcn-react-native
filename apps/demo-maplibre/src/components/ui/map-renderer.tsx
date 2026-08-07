/**
 * The MapLibre implementation of the renderer adapter boundary (plan §2 D2).
 *
 * `map.tsx`, `map-marker.tsx` and `map-location-puck.tsx` are the only other
 * files that differ between the MapLibre and Mapbox apps -- everything else
 * (map-geojson, map-cluster-layer, map-heatmap, ...) is written once against
 * this adapter's normalized surface and materialized into both apps
 * unchanged.
 *
 * This file intentionally does NOT re-export a fully-abstracted `<Map>`
 * component: `map.tsx` still writes its own JSX against the native
 * `Map`/`Camera` components below, because the two renderers' props differ
 * enough (see plan §1.2) that a third abstraction layer would just be
 * indirection without reducing real duplication. What *is* shared here is
 * everything that's genuinely renderer-specific but reusable: capability
 * flags, event normalization, and the camera controller that backs
 * `useMap()`.
 */
import {
  Camera,
  Map,
  type CameraRef,
  type MapRef,
  type ViewState,
  type ViewStateChangeEvent,
} from "@maplibre/maplibre-react-native";
import type { NativeSyntheticEvent } from "react-native";
import type {
  Bounds,
  Coordinate,
  MapCameraAnimation,
  MapFeaturePressEvent,
  MapRenderer,
  MapViewport,
} from "@/lib/mapcn/types";
import type { MapInstanceMethods, RendererCapabilities } from "@/components/ui/map-types";
import { bboxOf } from "@/lib/mapcn/geo";

export { Map as NativeMap, Camera as NativeCamera };
export type { CameraRef as NativeCameraRef, MapRef as NativeMapRef };

export const RENDERER: MapRenderer = "maplibre";

export const CAPABILITIES: RendererCapabilities = {
  clusterMinPoints: true,
  locationPuckPulsing: false,
  locationPuckScale: false,
  locationPuckImages: false,
  locationPuckPress: true,
  locationPuckCustomChildren: true,
};

export function normalizeViewport(viewState: ViewState): MapViewport {
  return {
    center: viewState.center,
    zoom: viewState.zoom,
    bearing: viewState.bearing,
    pitch: viewState.pitch,
  };
}

export function normalizeRegionChangeEvent(
  event: NativeSyntheticEvent<ViewStateChangeEvent>,
): { viewport: MapViewport; userInteraction: boolean } {
  const { animated: _animated, userInteraction, ...viewState } = event.nativeEvent;
  return { viewport: normalizeViewport(viewState), userInteraction };
}

interface RawPressEvent {
  lngLat: Coordinate;
  point: [number, number];
  features?: Array<unknown>;
}

export function normalizeFeaturePress(event: NativeSyntheticEvent<RawPressEvent>): MapFeaturePressEvent {
  const { lngLat, point, features } = event.nativeEvent;
  return {
    coordinate: lngLat,
    point: { x: point[0], y: point[1] },
     
    features: (features as Array<any> | undefined) ?? [],
  };
}

function mapEasing(easing: MapCameraAnimation["easing"]): "linear" | "ease" | "fly" | undefined {
  return easing;
}

/**
 * Builds the camera-facing subset of `MapInstance` on top of MapLibre's
 * native `MapRef`/`CameraRef`. `map.tsx` combines this with `isLoaded`,
 * `renderer` and the raw refs to produce the full instance handed out by
 * `useMap()`.
 */
export function createCameraController(
  mapRef: { current: MapRef | null },
  cameraRef: { current: CameraRef | null },
): MapInstanceMethods {
  return {
    async getViewport() {
      const viewState = await mapRef.current?.getViewState();
      if (!viewState) throw new Error("[mapcn] getViewport() called before the map finished loading");
      return normalizeViewport(viewState);
    },

    setViewport(viewport, animation) {
      const duration = animation?.duration ?? 0;
      const options = {
        center: viewport.center,
        zoom: viewport.zoom,
        bearing: viewport.bearing,
        pitch: viewport.pitch,
        padding: animation?.padding,
      };
      if (duration > 0 && viewport.center) {
        cameraRef.current?.easeTo({ ...options, center: viewport.center, duration, easing: mapEasing(animation?.easing) });
      } else if (viewport.center) {
        cameraRef.current?.jumpTo({ ...options, center: viewport.center });
      } else {
        // No center change -- easeTo also accepts a center-less stop via setStop.
        cameraRef.current?.setStop({ ...options, duration, easing: mapEasing(animation?.easing) });
      }
    },

    flyTo(center, options) {
      cameraRef.current?.flyTo({
        center,
        zoom: options?.zoom,
        duration: options?.duration ?? 1000,
        easing: mapEasing(options?.easing) ?? "fly",
        padding: options?.padding,
      });
    },

    moveTo(center, options) {
      const duration = options?.duration ?? 0;
      if (duration > 0) {
        cameraRef.current?.easeTo({
          center,
          zoom: options?.zoom,
          duration,
          easing: mapEasing(options?.easing),
          padding: options?.padding,
        });
      } else {
        cameraRef.current?.jumpTo({ center, zoom: options?.zoom, padding: options?.padding });
      }
    },

    zoomTo(zoom, options) {
      cameraRef.current?.zoomTo(zoom, {
        duration: options?.duration,
        easing: mapEasing(options?.easing),
        padding: options?.padding,
      });
    },

    async zoomBy(delta, options) {
      const currentZoom = (await mapRef.current?.getZoom()) ?? 0;
      cameraRef.current?.zoomTo(currentZoom + delta, {
        duration: options?.duration,
        easing: mapEasing(options?.easing),
        padding: options?.padding,
      });
    },

    fitBounds(bounds, options) {
      cameraRef.current?.fitBounds(bounds, {
        duration: options?.duration,
        easing: mapEasing(options?.easing),
        padding: options?.padding,
      });
    },

    fitFeatures(data, options) {
      const bbox = bboxOf(data);
      cameraRef.current?.fitBounds(bbox, {
        duration: options?.duration,
        easing: mapEasing(options?.easing),
        padding: options?.padding,
      });
    },

    resetNorth(options) {
      // setStop (not easeTo) accepts a center-less stop.
      cameraRef.current?.setStop({
        bearing: 0,
        duration: options?.duration ?? 300,
        easing: mapEasing(options?.easing),
      });
    },

    async project(coordinate) {
      const point = await mapRef.current?.project(coordinate);
      if (!point) throw new Error("[mapcn] project() called before the map finished loading");
      return { x: point[0], y: point[1] };
    },

    async unproject(point) {
      const coordinate = await mapRef.current?.unproject([point.x, point.y]);
      if (!coordinate) throw new Error("[mapcn] unproject() called before the map finished loading");
      return coordinate;
    },

    async queryFeatures(options) {
      // `Expression`/filter is intentionally loosely typed in the shared
      // contract (plan §7.0) to match both renderers' style-spec grammar;
      // MapLibre's own FilterSpecification union is far stricter, so the
      // cast happens right at this adapter boundary, not in the public API.
      const queryOptions = {
        layers: options?.layers,
        filter: options?.filter as never,
      };

      if (options?.point) {
        return (
          (await mapRef.current?.queryRenderedFeatures([options.point.x, options.point.y], queryOptions)) ?? []
        );
      }

      if (options?.bounds) {
        // MapRef.queryRenderedFeatures takes *pixel* bounds, not geographic
        // ones, so the geographic Bounds get projected to screen space first.
        const [west, south, east, north] = options.bounds as Bounds;
        const topLeft = await mapRef.current?.project([west, north]);
        const bottomRight = await mapRef.current?.project([east, south]);
        if (!topLeft || !bottomRight) return [];
        return (await mapRef.current?.queryRenderedFeatures([topLeft, bottomRight], queryOptions)) ?? [];
      }

      return (await mapRef.current?.queryRenderedFeatures(queryOptions)) ?? [];
    },
  };
}
