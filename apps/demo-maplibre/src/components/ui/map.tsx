import { cn } from "@/lib/utils";
import { LocationManager, useCurrentPosition } from "@maplibre/maplibre-react-native";
import {
  createContext,
  Fragment,
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
  NativeCamera,
  NativeMap,
  normalizeRegionChangeEvent,
  RENDERER,
  type NativeCameraRef,
  type NativeMapRef,
} from "./map-renderer";
import type { MapInstance, MapProps } from "./map-types";
import { PROVIDERS, resolveStyleUrl } from "@/lib/mapcn/provider";
import { viewportEquals } from "@/lib/mapcn/geo";
import type { MapViewport, PartialViewport } from "@/lib/mapcn/types";

export type { MapProps };
export { CAPABILITIES as MAP_CAPABILITIES };

const MapContext = createContext<MapInstance | null>(null);

function useMap(): MapInstance {
  const context = use(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

/**
 * MapLibre's Map *can* render arbitrary RN children directly (unlike
 * Mapbox's MapView -- see the Mapbox map.tsx for why that one needs a real
 * portal). This context exists anyway, mirroring Mapbox's exactly, so that
 * shared overlay UI (MapControls, MapPopup, and later MapLegend/
 * MapStyleSwitcher) can be a single byte-identical file materialized into
 * both apps instead of special-casing "just render children" here vs
 * "register into a portal" there.
 */
const OverlayContext = createContext<{
  registerOverlay: (id: string, element: ReactNode) => void;
  unregisterOverlay: (id: string) => void;
} | null>(null);

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
    return resolveStyleUrl(provider, defaultStyleId, process.env.EXPO_PUBLIC_MAPTILER_API_KEY);
  }
  if (typeof resolved === "string" && !resolved.includes("://") && !resolved.startsWith("http")) {
    // A bare style id ("streets", "dark", ...) resolved against the provider.
    return resolveStyleUrl(provider, resolved, process.env.EXPO_PUBLIC_MAPTILER_API_KEY);
  }
  return resolved;
}

const DefaultLoader = () => (
  <View className="absolute inset-0 justify-center items-center bg-background/80">
    <ActivityIndicator size="small" color="#999" />
  </View>
);

function Map({
  children,
  style,
  provider: providerId = "carto",
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
  const mapRef = useRef<NativeMapRef | null>(null);
  const cameraRef = useRef<NativeCameraRef | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [overlays, setOverlays] = useState<Record<string, ReactNode>>({});

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

  const systemColorScheme = useColorScheme();
  const colorScheme: "light" | "dark" = colorSchemeProp ?? (systemColorScheme === "dark" ? "dark" : "light");
  const provider = PROVIDERS[providerId];

  const isControlled = viewport !== undefined;
  const initialViewport: MapViewport = { ...DEFAULT_VIEWPORT, ...defaultViewport, ...viewport };

  // Tracks the last viewport we know the native map is actually showing
  // (from a native event) and the last one we asked it to move to (from a
  // controlled `viewport` prop write). Comparing new values against both,
  // within an epsilon, is what stops onViewportChange -> setState ->
  // viewport prop -> native camera write from ping-ponging forever.
  const lastEmittedRef = useRef<MapViewport>(initialViewport);
  const lastAppliedRef = useRef<MapViewport>(initialViewport);
  const isGestureActiveRef = useRef(false);

  const mapStyle = resolveMapStyle(style, colorScheme, provider);

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
      ...cameraController,
    }),
    [isLoaded, cameraController],
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

  const handleRegionIsChanging = useCallback(
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

  const handleRegionDidChange = useCallback(
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

  // Controlled mode: push `viewport` prop changes to the native camera,
  // but only when they differ from what we last emitted (echo) and only
  // when no gesture is in progress (never fight a user's finger).
  useEffect(() => {
    if (!isControlled || !isLoaded || isGestureActiveRef.current) return;
    if (viewportEquals(lastEmittedRef.current, viewport as PartialViewport)) return;
    lastAppliedRef.current = { ...lastAppliedRef.current, ...viewport };
    cameraController.setViewport(viewport as PartialViewport, { duration: 300, easing: "ease" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, isControlled, isLoaded]);

  const handleMapIdle = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  return (
    <MapContext value={instance}>
      <OverlayContext value={overlayContextValue}>
      <View className={cn("flex-1 relative", className)} style={containerStyle}>
        <NativeMap
          ref={mapRef}
          style={{ flex: 1 }}
          // `style` is intentionally typed as `string | Record<string, unknown>`
          // in the shared contract rather than importing MapLibre's
          // StyleSpecification into it (plan §2 D3) -- cast at this boundary.
          mapStyle={mapStyle as never}
          onDidFinishLoadingMap={handleMapIdle}
          onRegionIsChanging={handleRegionIsChanging}
          onRegionDidChange={handleRegionDidChange}
          onPress={onPress ? ((e) => onPress(normalizePress(e))) : undefined}
          onLongPress={onLongPress ? ((e) => onLongPress(normalizePress(e))) : undefined}
          compass={compass !== false}
          compassPosition={typeof compass === "object" ? toOrnamentPosition(compass.position) : undefined}
          logo={logo !== false}
          logoPosition={typeof logo === "object" ? toOrnamentPosition(logo.position) : undefined}
          attribution={attribution !== false}
          attributionPosition={typeof attribution === "object" ? toOrnamentPosition(attribution.position) : undefined}
          scaleBar={scaleBar !== false}
          scaleBarPosition={typeof scaleBar === "object" ? toOrnamentPosition(scaleBar.position) : undefined}
          dragPan={interactive && gestures?.pan !== false}
          touchZoom={interactive && gestures?.zoom !== false}
          touchRotate={interactive && gestures?.rotate !== false}
          touchPitch={interactive && gestures?.pitch !== false}
          contentInset={padding}
        >
          <NativeCamera
            ref={cameraRef}
            initialViewState={{
              center: initialViewport.center,
              zoom: initialViewport.zoom,
              bearing: initialViewport.bearing,
              pitch: initialViewport.pitch,
              ...(bounds ? { bounds } : {}),
            }}
            minZoom={minZoom}
            maxZoom={maxZoom}
            maxBounds={maxBounds}
          />
          {children}
        </NativeMap>
        {loader !== false && !isLoaded && (loader ?? <DefaultLoader />)}
        {Object.entries(overlays).map(([id, element]) => (
          <Fragment key={id}>{element}</Fragment>
        ))}
      </View>
      </OverlayContext>
    </MapContext>
  );
}

Map.displayName = "Map";

function toOrnamentPosition(position?: "top-left" | "top-right" | "bottom-left" | "bottom-right") {
  switch (position) {
    case "top-left":
      return { top: 8, left: 8 };
    case "top-right":
      return { top: 8, right: 8 };
    case "bottom-left":
      return { bottom: 8, left: 8 };
    case "bottom-right":
      return { bottom: 8, right: 8 };
    default:
      return undefined;
  }
}

 
function normalizePress(event: any) {
  const nativeEvent = event.nativeEvent;
  return {
    coordinate: nativeEvent.lngLat as [number, number],
    point: { x: nativeEvent.point[0], y: nativeEvent.point[1] },
    features: nativeEvent.features ?? [],
  };
}

// Re-export LocationManager for permission handling
export { LocationManager };

export { Map, useCurrentPosition, useMap, useOverlay };
