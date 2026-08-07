import { cn } from "@/lib/utils";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import { ActivityIndicator, Pressable, Text, useColorScheme, View } from "react-native";
import {
  CAPABILITIES,
  createCameraController,
  MapboxCallout,
  MapboxLineLayer,
  MapboxMapView,
  MapboxShapeSource,
  normalizeRegionChangeEvent,
  RENDERER,
  type MapboxCameraRef,
  type MapboxMapViewRef,
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

  const isControlled = viewport !== undefined;
  const initialViewport: MapViewport = { ...DEFAULT_VIEWPORT, ...defaultViewport, ...viewport };

  const lastEmittedRef = useRef<MapViewport>(initialViewport);
  const lastAppliedRef = useRef<MapViewport>(initialViewport);
  const isGestureActiveRef = useRef(false);

  const mapStyle = resolveMapStyle(style, colorScheme, provider);

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

type MarkerContextValue = {
  coordinate: [number, number];
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

type MapMarkerProps = {
  children?: ReactNode;
  label?: string;
  /** Anchor point for the marker (0.0 to 1.0). Default is center (0.5, 0.5) */
  anchor?: { x: number; y: number };
  /** Allow marker to overlap with other markers */
  allowOverlap?: boolean;
  /** Callback when marker is pressed */
  onPress?: () => void;
} & (
  | { coordinate: [number, number]; longitude?: never; latitude?: never }
  | { longitude: number; latitude: number; coordinate?: never }
);

function MapMarker({
  children,
  label,
  anchor = { x: 0.5, y: 0.5 },
  allowOverlap = false,
  onPress,
  ...positionProps
}: MapMarkerProps) {
  const id = useId();

  const coordinate: [number, number] =
    "coordinate" in positionProps && positionProps.coordinate
      ? positionProps.coordinate
      : [positionProps.longitude, positionProps.latitude];

  return (
    <MarkerContext.Provider value={{ coordinate }}>
      <Mapbox.MarkerView
        id={id}
        coordinate={coordinate}
        anchor={anchor}
        allowOverlap={allowOverlap}
      >
        <Pressable onPress={onPress}>
          <View className="flex flex-row items-center justify-center">
            {children || <DefaultMarkerIcon />}
            {label && <MarkerLabel>{label}</MarkerLabel>}
          </View>
        </Pressable>
      </Mapbox.MarkerView>
    </MarkerContext.Provider>
  );
}

type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  return (
    <View className={cn("items-center justify-center", className)}>
      {children || <DefaultMarkerIcon />}
    </View>
  );
}

function DefaultMarkerIcon() {
  return (
    <View
      className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md"
      style={{ elevation: 5 }}
    />
  );
}

type MarkerPopupProps = {
  children: ReactNode;
  className?: string;
  /** Title text for the callout */
  title?: string;
};

function MarkerPopup({ children, className, title }: MarkerPopupProps) {
  return (
    <MapboxCallout title={title ?? ""} className={className}>
      <View className="p-3 min-w-[100px] max-w-[300px]">{children}</View>
    </MapboxCallout>
  );
}

type MarkerLabelProps = {
  children: ReactNode;
  className?: string;
  classNameText?: string;
  position?: "top" | "bottom";
};

function MarkerLabel({
  children,
  className,
  classNameText,
  position = "top",
}: MarkerLabelProps) {
  return (
    <View
      className={cn(
        "absolute left-1/2 translate-x-[-50%]",
        position === "top" ? "mb-1 bottom-full" : "mt-1 top-full",
        className,
      )}
    >
      <Text
        className={cn(
          "text-[10px] font-semibold text-foreground",
          classNameText,
        )}
      >
        {children}
      </Text>
    </View>
  );
}

type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showLocate?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showLocate = false,
  className,
  onLocate,
}: MapControlsProps) {
  const map = useMap();
  const { registerOverlay, unregisterOverlay } = useOverlay();
  const { isLoaded } = map;
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const overlayId = useId();

  const handleZoomIn = useCallback(() => {
    map.zoomBy(1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map.zoomBy(-1, { duration: 300 });
  }, [map]);

  const handleLocate = useCallback(async () => {
    setWaitingForLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      };

      map.flyTo([coords.longitude, coords.latitude], { zoom: 14, duration: 1500 });
      onLocate?.(coords);
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setWaitingForLocation(false);
    }
  }, [map, onLocate]);

  const positionStyle = useMemo(
    () =>
      ({
        "top-left": { top: 8, left: 8, zIndex: 1000 },
        "top-right": { top: 8, right: 8, zIndex: 1000 },
        "bottom-left": { bottom: 8, left: 8, zIndex: 1000 },
        "bottom-right": { bottom: 8, right: 8, zIndex: 1000 },
      })[position],
    [position]
  );

  const controlsElement = useMemo(
    () => (
      <View className={cn("absolute gap-1.5", className)} style={positionStyle}>
        {showZoom && (
          <View
            className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden"
            style={{ elevation: 2 }}
          >
            <ControlButton onPress={handleZoomIn} label="+">
              <Text className="text-lg font-semibold text-gray-700">+</Text>
            </ControlButton>
            <View className="h-[1px] bg-gray-200" />
            <ControlButton onPress={handleZoomOut} label="-">
              <Text className="text-lg font-semibold text-gray-700">−</Text>
            </ControlButton>
          </View>
        )}
        {showLocate && (
          <View
            className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden"
            style={{ elevation: 2 }}
          >
            <ControlButton
              onPress={handleLocate}
              label="📍"
              disabled={waitingForLocation}
            >
              {waitingForLocation ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text className="text-lg font-semibold text-gray-700">📍</Text>
              )}
            </ControlButton>
          </View>
        )}
      </View>
    ),
    [
      className,
      positionStyle,
      showZoom,
      showLocate,
      handleZoomIn,
      handleZoomOut,
      handleLocate,
      waitingForLocation,
    ]
  );

  useEffect(() => {
    if (isLoaded) {
      registerOverlay(overlayId, controlsElement);
    }
    return () => {
      unregisterOverlay(overlayId);
    };
  }, [isLoaded, overlayId, registerOverlay, unregisterOverlay, controlsElement]);

  // Return null because the actual rendering happens via the overlay portal
  return null;
}

function ControlButton({
  onPress,
  label,
  children,
  disabled = false,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-8 h-8 justify-center items-center active:bg-gray-100"
      style={disabled ? { opacity: 0.5 } : undefined}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {children}
    </Pressable>
  );
}

type MapRouteProps = {
  coordinates: Array<[number, number]>;
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
};

function MapRoute({
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
}: MapRouteProps) {
  const id = useId();
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;

  if (coordinates.length < 2) {
    return null;
  }

  const shape = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates,
    },
  };

  return (
    <MapboxShapeSource id={sourceId} shape={shape}>
      <MapboxLineLayer
        id={layerId}
        style={{
          lineColor: color,
          lineWidth: width,
          lineOpacity: opacity,
          ...(dashArray && { lineDasharray: dashArray }),
          lineJoin: "round",
          lineCap: "round",
        }}
      />
    </MapboxShapeSource>
  );
}

type MapUserLocationProps = {
  /** Show user location on the map */
  visible?: boolean;
  /** Show accuracy circle around user location */
  showAccuracy?: boolean;
  /** Show heading arrow indicating device direction */
  showHeading?: boolean;
  /** Whether the location marker is animated between updates */
  animated?: boolean;
  /** Minimum delta in meters for location updates */
  minDisplacement?: number;
  /** Callback when user location is pressed */
  onPress?: () => void;
  /** Auto-request location permissions if not granted */
  autoRequestPermission?: boolean;
};

function MapUserLocation({
  visible = true,
  showAccuracy = true,
  showHeading = false,
  animated = true,
  minDisplacement,
  onPress,
  autoRequestPermission = true,
}: MapUserLocationProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAndRequestPermissions = async () => {
      try {
        if (autoRequestPermission) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (mounted) {
            setHasPermission(status === "granted");
            setPermissionChecked(true);
          }
        } else {
          if (mounted) {
            setPermissionChecked(true);
          }
        }
      } catch (error) {
        console.error("Error requesting location permissions:", error);
        if (mounted) {
          setHasPermission(false);
          setPermissionChecked(true);
        }
      }
    };

    if (visible) {
      checkAndRequestPermissions();
    }

    return () => {
      mounted = false;
    };
  }, [visible, autoRequestPermission]);

  if (!visible || !permissionChecked || !hasPermission) {
    return null;
  }

  return (
    <Mapbox.LocationPuck
      puckBearingEnabled={showHeading}
      pulsing={{ isEnabled: animated }}
    />
  );
}

export {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MapUserLocation,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  useMap
};

