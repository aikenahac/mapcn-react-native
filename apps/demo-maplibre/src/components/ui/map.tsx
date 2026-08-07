import { cn } from "@/lib/utils";
import {
  Callout,
  GeoJSONSource,
  Layer,
  LocationManager,
  Marker,
  UserLocation,
  useCurrentPosition,
} from "@maplibre/maplibre-react-native";
import {
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
import {
  ActivityIndicator,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
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
      </View>
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

function anchorObjectToAnchorString(anchor: { x: number; y: number }) {
  const horizontal = anchor.x <= 0.25 ? "left" : anchor.x >= 0.75 ? "right" : "center";
  const vertical = anchor.y <= 0.25 ? "top" : anchor.y >= 0.75 ? "bottom" : "center";

  if (horizontal === "center" && vertical === "center") return "center";
  if (horizontal === "center") return vertical;
  if (vertical === "center") return horizontal;

  return `${vertical}-${horizontal}` as "top-left" | "top-right" | "bottom-left" | "bottom-right";
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
  allowOverlap: _allowOverlap = false,
  onPress,
  ...positionProps
}: MapMarkerProps) {
  const id = useId();

  const coordinate: [number, number] = 'coordinate' in positionProps && positionProps.coordinate
    ? positionProps.coordinate
    : [positionProps.longitude, positionProps.latitude];

  return (
    <MarkerContext value={{ coordinate }}>
      <Marker
        id={id}
        lngLat={coordinate}
        anchor={anchorObjectToAnchorString(anchor)}
      >
        <Pressable onPress={onPress}>
          <View className="flex flex-row items-center justify-center">
            {children || <DefaultMarkerIcon />}
            {label && <MarkerLabel>{label}</MarkerLabel>}
          </View>
        </Pressable>
      </Marker>
    </MarkerContext>
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
  return <View className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" style={{ elevation: 5 }} />;
}

type MarkerPopupProps = {
  children: ReactNode;
  className?: string;
  /** Title text for the callout */
  title?: string;
};

function MarkerPopup({ children, className, title }: MarkerPopupProps) {
  return (
    <Callout title={title} className={className}>
      <View className="p-3 min-w-[100px] max-w-[300px]">{children}</View>
    </Callout>
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
        className
      )}
    >
      <Text className={cn("text-[10px] font-semibold text-foreground", classNameText)}>{children}</Text>
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
  const { cameraRef, mapRef, isLoaded } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(10);

  const handleZoomIn = async () => {
    if (cameraRef.current && mapRef.current) {
      const center = await mapRef.current.getCenter();
      const newZoom = Math.min(currentZoom + 1, 20);
      setCurrentZoom(newZoom);
      cameraRef.current.easeTo({
        center: center, // LngLat is already [longitude, latitude]
        zoom: newZoom,
        duration: 300,
      });
    }
  };

  const handleZoomOut = async () => {
    if (cameraRef.current && mapRef.current) {
      const center = await mapRef.current.getCenter();
      const newZoom = Math.max(currentZoom - 1, 0);
      setCurrentZoom(newZoom);
      cameraRef.current.easeTo({
        center: center, // LngLat is already [longitude, latitude]
        zoom: newZoom,
        duration: 300,
      });
    }
  };

  const handleLocate = async () => {
    setWaitingForLocation(true);
    try {
      // Location handling would need native permissions setup
      // This is a simplified version
      if (cameraRef.current && onLocate) {
        // You would get actual location here
        const coords = { longitude: 0, latitude: 0 };
        cameraRef.current.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration: 1500,
        });
        onLocate(coords);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setWaitingForLocation(false);
    }
  };

  if (!isLoaded) return null;

  const positionStyle = {
    "top-left": { top: 8, left: 8 },
    "top-right": { top: 8, right: 8 },
    "bottom-left": { bottom: 8, left: 8 },
    "bottom-right": { bottom: 8, right: 8 },
  }[position];

  return (
    <View className={cn("absolute gap-1.5", className)} style={positionStyle}>
      {showZoom && (
        <View className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ elevation: 2 }}>
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
        <View className="rounded border border-gray-200 bg-white shadow-sm overflow-hidden" style={{ elevation: 2 }}>
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
  );
}

function ControlButton({
  onPress,
  label,
  children,
  disabled = false,
}: {
  onPress: () => void;
  label: string;
  children: ReactNode;
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
    <GeoJSONSource id={sourceId} data={shape}>
      <Layer
        id={layerId}
        type="line"
        style={{
          lineColor: color,
          lineWidth: width,
          lineOpacity: opacity,
          ...(dashArray && { lineDasharray: dashArray }),
          lineJoin: "round",
          lineCap: "round",
        }}
      />
    </GeoJSONSource>
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
          const granted = await LocationManager.requestPermissions();
          if (mounted) {
            setHasPermission(granted);
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
    <UserLocation
      accuracy={showAccuracy}
      heading={showHeading}
      animated={animated}
      minDisplacement={minDisplacement}
      onPress={onPress}
    />
  );
}

// Re-export LocationManager for permission handling
export { LocationManager };

  export {
    Map,
    MapControls,
    MapMarker,
    MapRoute,
    MapUserLocation,
    MarkerContent,
    MarkerLabel,
    MarkerPopup,
    useCurrentPosition,
    useMap
  };
