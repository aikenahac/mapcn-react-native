import { LocationManager, UserLocation } from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocationTracking } from "@/hooks/use-location-tracking";
import { useMap } from "./map";
import { CAPABILITIES } from "./map-renderer";

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
  /** MapLibre only. */
  onPress?: () => void;
  /** MapLibre only -- custom JS-rendered puck. */
  children?: ReactNode;

  className?: string;
}

export { CAPABILITIES as MAP_LOCATION_PUCK_CAPABILITIES };

/**
 * Replaces MapUserLocation (kept below as a deprecated alias for v1
 * compatibility). `follow` is implemented as camera recentering on every
 * location update rather than wiring into Camera's native
 * trackUserLocation/followUserLocation prop -- that prop is declarative
 * and owned by Map's own <Camera> element, not reachable from here without
 * threading follow-state back through Map's own props. This is a
 * documented simplification: recentering-on-update is visually equivalent
 * to native tracking for the "keep the puck centered" use case, at the
 * cost of one extra location subscription while `follow` is active.
 */
export function MapLocationPuck({
  visible = true,
  bearing = "none",
  accuracyRing = true,
  minDisplacement,
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

  if (__DEV__ && (pulsing !== undefined || scale !== undefined || images !== undefined)) {
    console.warn("[mapcn] MapLocationPuck's pulsing/scale/images are Mapbox-only and have no effect on MapLibre.");
  }
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!requestPermission) {
        if (mounted) setPermissionChecked(true);
        return;
      }
      try {
        const granted = await LocationManager.requestPermissions();
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
    <UserLocation heading={bearing === "heading" || bearing === "course"} accuracy={accuracyRing} animated minDisplacement={minDisplacement} onPress={onPress}>
      {children}
    </UserLocation>
  );
}

/** @deprecated Use MapLocationPuck. Kept for v1 compatibility; maps v1 prop names onto MapLocationPuck's. */
export interface MapUserLocationProps {
  visible?: boolean;
  showAccuracy?: boolean;
  showHeading?: boolean;
  animated?: boolean;
  minDisplacement?: number;
  onPress?: () => void;
  autoRequestPermission?: boolean;
}

let warnedAboutMapUserLocation = false;

/** @deprecated Use MapLocationPuck. */
export function MapUserLocation({
  visible,
  showAccuracy,
  showHeading,
  minDisplacement,
  onPress,
  autoRequestPermission,
}: MapUserLocationProps) {
  useEffect(() => {
    if (__DEV__ && !warnedAboutMapUserLocation) {
      warnedAboutMapUserLocation = true;
      console.warn("[mapcn] MapUserLocation is deprecated -- use MapLocationPuck instead. See the v1 -> v2 upgrade guide.");
    }
  }, []);
  return (
    <MapLocationPuck
      visible={visible}
      bearing={showHeading ? "heading" : "none"}
      accuracyRing={showAccuracy}
      minDisplacement={minDisplacement}
      onPress={onPress}
      requestPermission={autoRequestPermission}
    />
  );
}
