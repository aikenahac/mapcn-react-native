import { cn } from "@/lib/utils";
import Mapbox from "@rnmapbox/maps";
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import {
  CAPABILITIES,
  createCameraController,
  MapboxMapView,
  normalizeRegionChangeEvent,
  RENDERER,
  type MapboxCameraRef,
  type MapboxMapViewRef,
} from "./map-renderer";
import type { MapInstance, MapProps } from "./map-types";
import { PROVIDERS, resolveStyleUrl } from "@/lib/mapcn/provider";
import { viewportEquals } from "@/lib/mapcn/geo";
import type { MapViewport, PartialViewport } from "@/lib/mapcn/types";

export type { MapInstance, MapProps };
export { CAPABILITIES as MAP_CAPABILITIES };

const MapContext = createContext<MapInstance | null>(null);

/** Accesses the enclosing `Map`'s instance. Throws outside a `Map`. */
function useMap(): MapInstance {
  const context = use(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

/**
 * Mapbox's MapView can't render arbitrary RN children as overlays the way
 * MapLibre's Map can (plan §14 risk #3) -- `MapControls` and friends
 * register their rendered element here instead, and `Map` renders the
 * registry as siblings of MapView. This is intentionally a separate,
 * non-public context: `useMap()` only ever exposes the shared `MapInstance`
 * shape, never this renderer-specific plumbing.
 */
const OverlayContext = createContext<{
  registerOverlay: (id: string, element: ReactNode) => void;
  unregisterOverlay: (id: string) => void;
} | null>(null);

/** Registers/unregisters an RN overlay element rendered on top of the map. Throws outside a `Map`. */
function useOverlay() {
  const context = use(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within a Map component");
  }
  return context;
}

const DEFAULT_VIEWPORT: MapViewport = { center: [0, 0], zoom: 10, bearing: 0, pitch: 0 };
const DEFAULT_VIEWPORT_CHANGE_THROTTLE = 100;

function isLightDarkPair(
  style: NonNullable<MapProps["style"]>,
): style is { light: string | Record<string, unknown>; dark: string | Record<string, unknown> } {
  return typeof style === "object" && ("light" in style || "dark" in style);
}

function resolveMapStyle(
  style: MapProps["style"],
  colorScheme: "light" | "dark",
  provider: (typeof PROVIDERS)[keyof typeof PROVIDERS],
): string | Record<string, unknown> {
  const resolved: string | Record<string, unknown> | undefined = style
    ? isLightDarkPair(style)
      ? style[colorScheme]
      : style
    : undefined;

  if (resolved === undefined) {
    const defaultStyleId = provider.defaultStyle[colorScheme];
    return resolveStyleUrl(provider, defaultStyleId, process.env.EXPO_PUBLIC_MAPBOX_TOKEN);
  }
  if (typeof resolved === "string" && !resolved.includes("://") && !resolved.startsWith("http")) {
    return resolveStyleUrl(provider, resolved, process.env.EXPO_PUBLIC_MAPBOX_TOKEN);
  }
  return resolved;
}

const DefaultLoader = () => (
  <View className="absolute inset-0 justify-center items-center bg-background/80">
    <ActivityIndicator size="small" color="#999" />
  </View>
);

let accessTokenSet = false;

function ensureAccessToken() {
  if (accessTokenSet) return;
  accessTokenSet = true;
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  if (token) {
    Mapbox.setAccessToken(token);
  } else {
    console.warn(
      "[mapcn] EXPO_PUBLIC_MAPBOX_TOKEN not found. Get a free token at https://account.mapbox.com/access-tokens/",
    );
  }
}

/** The map container. Renders the native map view, camera, and overlay host. */
function Map({
  children,
  style,
  provider: providerId = "mapbox",
  colorScheme: colorSchemeProp,
  viewport,
  defaultViewport,
  onViewportChange,
  onViewportChangeEnd,
  viewportChangeThrottle = DEFAULT_VIEWPORT_CHANGE_THROTTLE,
  bounds,
  padding,
  minZoom,
  maxZoom,
  maxBounds,
  interactive = true,
  gestures,
  compass = false,
  logo = false,
  attribution = false,
  scaleBar = false,
  onPress,
  onLongPress,
  onLoad,
  onError: _onError,
  className,
  containerStyle,
  loader,
  ref,
}: MapProps & { ref?: Ref<MapInstance> }) {
  ensureAccessToken();

  const mapRef = useRef<MapboxMapViewRef | null>(null);
  const cameraRef = useRef<MapboxCameraRef | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [overlays, setOverlays] = useState<Record<string, ReactNode>>({});

  const systemColorScheme = useColorScheme();
  const colorScheme: "light" | "dark" = colorSchemeProp ?? (systemColorScheme === "dark" ? "dark" : "light");
  const provider = PROVIDERS[providerId];

  const [styleOverride, setStyleOverride] = useState<string | undefined>(undefined);

  const isControlled = viewport !== undefined;
  const initialViewport: MapViewport = { ...DEFAULT_VIEWPORT, ...defaultViewport, ...viewport };

  const lastEmittedRef = useRef<MapViewport>(initialViewport);
  const lastAppliedRef = useRef<MapViewport>(initialViewport);
  const isGestureActiveRef = useRef(false);

  const mapStyle = resolveMapStyle(styleOverride ?? style, colorScheme, provider);

  const registerOverlay = useCallback((id: string, element: ReactNode) => {
    setOverlays((prev) => ({ ...prev, [id]: element }));
  }, []);

  const unregisterOverlay = useCallback((id: string) => {
    setOverlays((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const overlayContextValue = useMemo(() => ({ registerOverlay, unregisterOverlay }), [registerOverlay, unregisterOverlay]);

  // createCameraController only stores these ref objects; every `.current`
  // read happens inside the closures it returns, which only ever run from
  // event handlers/effects (see map-renderer.tsx) -- never during render.
  // eslint-disable-next-line react-hooks/refs
  const cameraController = useMemo(() => createCameraController(mapRef, cameraRef), []);

  const instance = useMemo<MapInstance>(
    () => ({
      renderer: RENDERER,
      isLoaded,
      mapRef,
      cameraRef,
      provider: providerId,
      setStyle: setStyleOverride,
      ...cameraController,
    }),
    [isLoaded, cameraController, providerId],
  );

  useImperativeHandle(ref, () => instance, [instance]);

  const throttleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingViewport = useRef<{ viewport: MapViewport; userInteraction: boolean } | null>(null);

  const flushViewportChange = useCallback(() => {
    if (!pendingViewport.current) return;
    const { viewport: next, userInteraction } = pendingViewport.current;
    pendingViewport.current = null;
    lastEmittedRef.current = next;
    onViewportChange?.(next, { userInteraction });
  }, [onViewportChange]);

  const handleCameraChanged = useCallback(
    (event: Parameters<typeof normalizeRegionChangeEvent>[0]) => {
      const { viewport: next, userInteraction } = normalizeRegionChangeEvent(event as never);
      isGestureActiveRef.current = userInteraction;
      if (viewportEquals(next, lastAppliedRef.current) || viewportEquals(next, lastEmittedRef.current)) return;

      pendingViewport.current = { viewport: next, userInteraction };
      if (throttleTimer.current) return;
      throttleTimer.current = setTimeout(() => {
        throttleTimer.current = null;
        flushViewportChange();
      }, viewportChangeThrottle);
    },
    [flushViewportChange, viewportChangeThrottle],
  );

  const handleMapIdleRegion = useCallback(
    (event: Parameters<typeof normalizeRegionChangeEvent>[0]) => {
      const { viewport: next, userInteraction } = normalizeRegionChangeEvent(event as never);
      isGestureActiveRef.current = false;
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
        throttleTimer.current = null;
      }
      pendingViewport.current = null;
      if (!viewportEquals(next, lastEmittedRef.current)) {
        lastEmittedRef.current = next;
        onViewportChange?.(next, { userInteraction });
      }
      onViewportChangeEnd?.(next, { userInteraction });
    },
    [onViewportChange, onViewportChangeEnd],
  );

  useEffect(() => {
    if (!isControlled || !isLoaded || isGestureActiveRef.current) return;
    if (viewportEquals(lastEmittedRef.current, viewport as PartialViewport)) return;
    lastAppliedRef.current = { ...lastAppliedRef.current, ...viewport };
    cameraController.setViewport(viewport as PartialViewport, { duration: 300, easing: "ease" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, isControlled, isLoaded]);

  const handleDidFinishLoadingMap = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  return (
    <MapContext value={instance}>
      <OverlayContext value={overlayContextValue}>
        <View className={cn("flex-1 relative", className)} style={containerStyle}>
          <MapboxMapView
            ref={mapRef}
            style={{ flex: 1 }}
            styleURL={typeof mapStyle === "string" ? mapStyle : undefined}
            styleJSON={typeof mapStyle === "object" ? JSON.stringify(mapStyle) : undefined}
            onDidFinishLoadingMap={handleDidFinishLoadingMap}
            onCameraChanged={handleCameraChanged}
            onMapIdle={handleMapIdleRegion}
            onPress={onPress ? ((feature: unknown) => onPress(normalizePress(feature))) : undefined}
            onLongPress={onLongPress ? ((feature: unknown) => onLongPress(normalizePress(feature))) : undefined}
            compassEnabled={compass !== false}
            logoEnabled={logo !== false}
            attributionEnabled={attribution !== false}
            scaleBarEnabled={scaleBar !== false}
            scrollEnabled={interactive && gestures?.pan !== false}
            zoomEnabled={interactive && gestures?.zoom !== false}
            rotateEnabled={interactive && gestures?.rotate !== false}
            pitchEnabled={interactive && gestures?.pitch !== false}
            contentInset={padding ? [padding.top ?? 0, padding.right ?? 0, padding.bottom ?? 0, padding.left ?? 0] : undefined}
          >
            <Mapbox.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: initialViewport.center,
                zoomLevel: initialViewport.zoom,
                heading: initialViewport.bearing,
                pitch: initialViewport.pitch,
                ...(bounds
                  ? { bounds: { ne: [bounds[2], bounds[3]], sw: [bounds[0], bounds[1]] } }
                  : {}),
              }}
              minZoomLevel={minZoom}
              maxZoomLevel={maxZoom}
              maxBounds={maxBounds ? { ne: [maxBounds[2], maxBounds[3]], sw: [maxBounds[0], maxBounds[1]] } : undefined}
            />
            {children}
          </MapboxMapView>
          {loader !== false && !isLoaded && (loader ?? <DefaultLoader />)}
          {Object.entries(overlays).map(([id, element]) => (
            <React.Fragment key={id}>{element}</React.Fragment>
          ))}
        </View>
      </OverlayContext>
    </MapContext>
  );
}

Map.displayName = "Map";

 
function normalizePress(feature: any) {
  return {
    coordinate: feature.geometry.coordinates as [number, number],
    point: { x: 0, y: 0 },
    features: [feature],
  };
}

export { Map, useMap, useOverlay };

