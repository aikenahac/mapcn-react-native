import {
  Callout,
  Camera,
  LineLayer,
  LocationManager,
  MapView,
  MarkerView,
  ShapeSource,
  UserLocation,
  useCurrentPosition,
  type CameraRef,
  type MapViewRef,
} from "@maplibre/maplibre-react-native";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type MapContextValue = {
  mapRef: React.RefObject<MapViewRef | null>;
  cameraRef: React.RefObject<CameraRef | null>;
  isLoaded: boolean;
  theme: "light" | "dark";
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
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type MapStyleOption = string | object;

type MapProps = {
  children?: ReactNode;
  /** Custom map styles for light and dark themes. Overrides the default Carto styles. */
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  /** Initial center coordinate [longitude, latitude] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Container style */
  style?: ViewStyle;
  /** Show loading indicator */
  showLoader?: boolean;
};

const DefaultLoader = () => (
  <View style={loaderStyles.container}>
    <ActivityIndicator size="small" color="#999" />
  </View>
);

const loaderStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});

function Map({
  children,
  styles,
  center = [0, 0],
  zoom = 10,
  style,
  showLoader = true,
}: MapProps) {
  const mapRef = useRef<MapViewRef | null>(null);
  const cameraRef = useRef<CameraRef | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";

  const mapStyle =
    theme === "dark"
      ? styles?.dark ?? defaultStyles.dark
      : styles?.light ?? defaultStyles.light;

  const handleMapIdle = () => {
    if (!isLoaded) {
      setIsLoaded(true);
    }
  };

  return (
    <MapContext.Provider value={{ mapRef, cameraRef, isLoaded, theme }}>
      <View style={[mapStyles.container, style]}>
        <MapView
          ref={mapRef}
          style={mapStyles.map}
          mapStyle={mapStyle}
          onDidFinishLoadingMap={handleMapIdle}
          compass={false}
          logo={false}
          attribution={false}
        >
          <Camera
            ref={cameraRef}
            zoom={zoom}
            center={center}
            easing="fly"
            duration={1000}
          />
          {children}
        </MapView>
        {showLoader && !isLoaded && <DefaultLoader />}
      </View>
    </MapContext.Provider>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
});

type MarkerContextValue = {
  coordinate: [number, number];
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  /** Anchor point for the marker (0.0 to 1.0). Default is center (0.5, 0.5) */
  anchor?: { x: number; y: number };
  /** Allow marker to overlap with other markers */
  allowOverlap?: boolean;
  /** Callback when marker is pressed */
  onPress?: () => void;
};

function MapMarker({
  longitude,
  latitude,
  children,
  anchor = { x: 0.5, y: 0.5 },
  allowOverlap = false,
  onPress,
}: MapMarkerProps) {
  const id = useId();
  const coordinate: [number, number] = [longitude, latitude];

  return (
    <MarkerContext.Provider value={{ coordinate }}>
      <MarkerView
        id={id}
        coordinate={coordinate}
        anchor={anchor}
        allowOverlap={allowOverlap}
      >
        <Pressable onPress={onPress}>{children}</Pressable>
      </MarkerView>
    </MarkerContext.Provider>
  );
}

type MarkerContentProps = {
  children?: ReactNode;
  style?: ViewStyle;
};

function MarkerContent({ children, style }: MarkerContentProps) {
  return (
    <View style={[markerStyles.content, style]}>
      {children || <DefaultMarkerIcon />}
    </View>
  );
}

function DefaultMarkerIcon() {
  return <View style={markerStyles.defaultIcon} />;
}

const markerStyles = StyleSheet.create({
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  defaultIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

type MarkerPopupProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Title text for the callout */
  title?: string;
};

function MarkerPopup({ children, style, title }: MarkerPopupProps) {
  return (
    <Callout title={title} style={style}>
      <View style={popupStyles.container}>{children}</View>
    </Callout>
  );
}

const popupStyles = StyleSheet.create({
  container: {
    padding: 12,
    minWidth: 100,
    maxWidth: 300,
  },
});

type MarkerLabelProps = {
  children: ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  position?: "top" | "bottom";
};

function MarkerLabel({
  children,
  style,
  textStyle,
  position = "top",
}: MarkerLabelProps) {
  const positionStyle =
    position === "top" ? labelStyles.top : labelStyles.bottom;

  return (
    <View style={[labelStyles.container, positionStyle, style]}>
      <Text style={[labelStyles.text, textStyle]}>{children}</Text>
    </View>
  );
}

const labelStyles = StyleSheet.create({
  container: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  top: {
    bottom: "100%",
    marginBottom: 4,
  },
  bottom: {
    top: "100%",
    marginTop: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
  },
});

type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showLocate?: boolean;
  style?: ViewStyle;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showLocate = false,
  style,
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

  const positionStyle = controlPositionStyles[position];

  return (
    <View style={[controlStyles.container, positionStyle, style]}>
      {showZoom && (
        <View style={controlStyles.group}>
          <ControlButton onPress={handleZoomIn} label="+">
            <Text style={controlStyles.buttonText}>+</Text>
          </ControlButton>
          <View style={controlStyles.separator} />
          <ControlButton onPress={handleZoomOut} label="-">
            <Text style={controlStyles.buttonText}>−</Text>
          </ControlButton>
        </View>
      )}
      {showLocate && (
        <View style={controlStyles.group}>
          <ControlButton
            onPress={handleLocate}
            label="📍"
            disabled={waitingForLocation}
          >
            {waitingForLocation ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={controlStyles.buttonText}>📍</Text>
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
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        controlStyles.button,
        pressed && controlStyles.buttonPressed,
        disabled && controlStyles.buttonDisabled,
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {children}
    </Pressable>
  );
}

const controlPositionStyles = StyleSheet.create({
  "top-left": {
    top: 8,
    left: 8,
  },
  "top-right": {
    top: 8,
    right: 8,
  },
  "bottom-left": {
    bottom: 8,
    left: 8,
  },
  "bottom-right": {
    bottom: 8,
    right: 8,
  },
});

const controlStyles = StyleSheet.create({
  container: {
    position: "absolute",
    gap: 6,
  },
  group: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  button: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#f3f4f6",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
});

type MapRouteProps = {
  coordinates: [number, number][];
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
    <ShapeSource id={sourceId} shape={shape}>
      <LineLayer
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
    </ShapeSource>
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

