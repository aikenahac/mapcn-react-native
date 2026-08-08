import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import Mapbox, {
  type Camera as MapboxCameraRef,
  type MapView as MapboxMapViewRef,
} from "@rnmapbox/maps";
import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;

if (MAPBOX_ACCESS_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
} else {
  console.warn(
    "[map-mapbox] EXPO_PUBLIC_MAPBOX_API_KEY not found. " +
      "Get your free Mapbox token at: https://account.mapbox.com/access-tokens/",
  );
}

// Camera wrapper to provide MapLibre-compatible API
type CameraAPI = {
  flyTo: (params: {
    center: [number, number];
    zoom: number;
    duration: number;
  }) => void;
  easeTo: (params: {
    center: [number, number];
    zoom: number;
    duration: number;
  }) => void;
};

type CameraWrapperRef = {
  current: CameraAPI | null;
};

function createCameraWrapper(
  internalCameraRef: React.RefObject<MapboxCameraRef | null>,
): CameraWrapperRef {
  return {
    current: {
      flyTo: ({ center, zoom, duration }) => {
        internalCameraRef.current?.setCamera({
          centerCoordinate: center,
          zoomLevel: zoom,
          animationDuration: duration,
          animationMode: "flyTo",
        });
      },
      easeTo: ({ center, zoom, duration }) => {
        internalCameraRef.current?.setCamera({
          centerCoordinate: center,
          zoomLevel: zoom,
          animationDuration: duration,
          animationMode: "easeTo",
        });
      },
    },
  };
}

type MapContextValue = {
  mapRef: React.RefObject<MapboxMapViewRef | null>;
  cameraRef: CameraWrapperRef;
  isLoaded: boolean;
  theme: "light" | "dark";
  registerOverlay: (id: string, element: ReactNode) => void;
  unregisterOverlay: (id: string) => void;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

const defaultStyles = {
  dark: Mapbox.StyleURL.Dark,
  light: Mapbox.StyleURL.Street,
};

type MapStyleOption = string | object;

type MapProps = {
  children?: ReactNode;
  /** Custom map styles for light and dark themes. Overrides the default Mapbox styles. */
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  /** Initial center coordinate [longitude, latitude] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Container style */
  className?: string;
  /** Show loading indicator */
  showLoader?: boolean;
};

const DefaultLoader = () => (
  <View className="absolute inset-0 justify-center items-center bg-white/80">
    <ActivityIndicator size="small" color="#999" />
  </View>
);

function Map({
  children,
  styles,
  center = [0, 0],
  zoom = 10,
  className,
  showLoader = true,
}: MapProps) {
  const mapRef = useRef<MapboxMapViewRef | null>(null);
  const internalCameraRef = useRef<MapboxCameraRef | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [overlays, setOverlays] = useState<Record<string, ReactNode>>({});
  const { colorScheme } = useTheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  // Create camera wrapper with MapLibre-compatible API
  const cameraRef = useMemo(() => createCameraWrapper(internalCameraRef), []);

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

  const mapStyle =
    theme === "dark"
      ? (styles?.dark ?? defaultStyles.dark)
      : (styles?.light ?? defaultStyles.light);

  const handleMapIdle = () => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  };

  return (
    <MapContext.Provider
      value={{ mapRef, cameraRef, isLoaded, theme, registerOverlay, unregisterOverlay }}
    >
      <View className={cn("flex-1 relative", className)}>
        <Mapbox.MapView
          ref={mapRef}
          style={{ flex: 1 }}
          styleURL={mapStyle as string}
          onDidFinishLoadingMap={handleMapIdle}
          compassEnabled={false}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            ref={internalCameraRef}
            zoomLevel={zoom}
            centerCoordinate={center}
            animationMode="flyTo"
            animationDuration={1000}
          />
          {children}
        </Mapbox.MapView>
        {showLoader && !isLoaded && <DefaultLoader />}
        {Object.entries(overlays).map(([id, element]) => (
          <React.Fragment key={id}>{element}</React.Fragment>
        ))}
      </View>
    </MapContext.Provider>
  );
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
    <Mapbox.Callout title={title ?? ""} className={className}>
      <View className="p-3 min-w-[100px] max-w-[300px]">{children}</View>
    </Mapbox.Callout>
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
  const { cameraRef, mapRef, isLoaded, registerOverlay, unregisterOverlay } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(10);
  const overlayId = useId();

  const handleZoomIn = useCallback(async () => {
    if (cameraRef.current && mapRef.current) {
      const center = await mapRef.current.getCenter();
      const newZoom = Math.min(currentZoom + 1, 20);
      setCurrentZoom(newZoom);
      cameraRef.current.easeTo({
        center: center as [number, number],
        zoom: newZoom,
        duration: 300,
      });
    }
  }, [cameraRef, mapRef, currentZoom]);

  const handleZoomOut = useCallback(async () => {
    if (cameraRef.current && mapRef.current) {
      const center = await mapRef.current.getCenter();
      const newZoom = Math.max(currentZoom - 1, 0);
      setCurrentZoom(newZoom);
      cameraRef.current.easeTo({
        center: center as [number, number],
        zoom: newZoom,
        duration: 300,
      });
    }
  }, [cameraRef, mapRef, currentZoom]);

  const handleLocate = useCallback(async () => {
    setWaitingForLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      };

      if (cameraRef.current) {
        cameraRef.current.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration: 1500,
        });
      }

      if (onLocate) {
        onLocate(coords);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setWaitingForLocation(false);
    }
  }, [cameraRef, onLocate]);

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
    <Mapbox.ShapeSource id={sourceId} shape={shape}>
      <Mapbox.LineLayer
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
    </Mapbox.ShapeSource>
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

