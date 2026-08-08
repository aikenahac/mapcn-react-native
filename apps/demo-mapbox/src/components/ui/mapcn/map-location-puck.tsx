import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useMap } from "./map";
import { CAPABILITIES, Mapbox } from "./map-renderer";

export interface MapLocationPuckProps {
  visible?: boolean;
  bearing?: "none" | "heading" | "course";
  accuracyRing?: boolean;
  minDisplacement?: number;

  follow?: false | "position" | "heading" | "course";
  onFollowChange?: (follow: false | "position" | "heading" | "course") => void;

  requestPermission?: boolean;
  onPermissionDenied?: () => void;

  /** Mapbox only. */
  pulsing?: boolean | { color?: string; radius?: number | "accuracy" };
  /** Mapbox only. */
  scale?: number;
  /** Mapbox only. */
  images?: { top?: string; bearing?: string; shadow?: string };
  /** MapLibre only -- accepted, warned, ignored. */
  onPress?: () => void;
  /** MapLibre only -- accepted, warned, ignored. */
  children?: unknown;

  className?: string;
}

export { CAPABILITIES as MAP_LOCATION_PUCK_CAPABILITIES };

/**
 * See the MapLibre implementation for the shared rationale on how `follow`
 * is implemented (camera recentering on location update, not native
 * followUserLocation). No faked parity here either: pulsing/scale/images
 * genuinely have no MapLibre equivalent and are simply absent from that
 * file, not silently ignored props.
 */
export function MapLocationPuck({
  visible = true,
  bearing = "none",
  accuracyRing: _accuracyRing = true,
  minDisplacement: _minDisplacement,
  follow = false,
  onFollowChange,
  requestPermission = true,
  onPermissionDenied,
  pulsing,
  scale,
  images,
  onPress,
  children,
}: MapLocationPuckProps) {
  const map = useMap();
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const hasCenteredRef = useRef(false);

  if (__DEV__ && (onPress || children)) {
    console.warn("[mapcn] MapLocationPuck's onPress/children are MapLibre-only and have no effect on Mapbox.");
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!requestPermission) {
        if (mounted) setPermissionChecked(true);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const granted = status === "granted";
        if (mounted) {
          setHasPermission(granted);
          setPermissionChecked(true);
          if (!granted) onPermissionDenied?.();
        }
      } catch {
        if (mounted) {
          setHasPermission(false);
          setPermissionChecked(true);
          onPermissionDenied?.();
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [requestPermission, onPermissionDenied]);

  const { position } = useLocationTracking({ autoStart: Boolean(follow) && visible, requestPermission: false });

  useEffect(() => {
    if (!follow || !position) return;
    map.flyTo(position.coordinate, { duration: hasCenteredRef.current ? 500 : 0 });
    hasCenteredRef.current = true;
    onFollowChange?.(follow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow, position]);

  if (!visible || !permissionChecked || !hasPermission) return null;

  return (
    <Mapbox.LocationPuck
      puckBearing={bearing === "none" ? undefined : bearing}
      puckBearingEnabled={bearing !== "none"}
      pulsing={pulsing === true ? "default" : pulsing || undefined}
      scale={scale}
      topImage={images?.top}
      bearingImage={images?.bearing}
      shadowImage={images?.shadow}
    />
  );
}
