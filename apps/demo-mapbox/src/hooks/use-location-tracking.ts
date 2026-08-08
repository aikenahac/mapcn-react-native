import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinate } from "../lib/mapcn/types";

export type LocationAccuracy = "lowest" | "low" | "balanced" | "high" | "highest";

const ACCURACY_MAP: Record<LocationAccuracy, Location.LocationAccuracy> = {
  lowest: Location.LocationAccuracy.Lowest,
  low: Location.LocationAccuracy.Low,
  balanced: Location.LocationAccuracy.Balanced,
  high: Location.LocationAccuracy.High,
  highest: Location.LocationAccuracy.Highest,
};

export type LocationTrackingStatus = "idle" | "requesting-permission" | "denied" | "starting" | "tracking" | "stopped" | "error";
export type LocationPermissionState = "undetermined" | "granted" | "denied";

export interface MapPosition {
  coordinate: Coordinate;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

function toMapPosition(location: Location.LocationObject): MapPosition {
  return {
    coordinate: [location.coords.longitude, location.coords.latitude],
    accuracy: location.coords.accuracy,
    altitude: location.coords.altitude,
    altitudeAccuracy: location.coords.altitudeAccuracy,
    heading: location.coords.heading,
    speed: location.coords.speed,
    timestamp: location.timestamp,
  };
}

export interface UseLocationTrackingOptions {
  /** Reserved for future background support -- only "foreground" ships in 2.0. */
  mode?: "foreground";
  /** Starts tracking immediately on mount. Default false (call `start()` explicitly). */
  autoStart?: boolean;
  requestPermission?: boolean;
  accuracy?: LocationAccuracy;
  /** Meters between updates. */
  distanceInterval?: number;
  /** ms between updates. */
  timeInterval?: number;
  onUpdate?: (position: MapPosition) => void;
  onError?: (error: Error) => void;
}

export interface UseLocationTrackingResult {
  position: MapPosition | null;
  coordinate: Coordinate | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number | null;
  status: LocationTrackingStatus;
  permission: LocationPermissionState;
  error: Error | null;
  start: () => Promise<void>;
  stop: () => void;
  requestPermission: () => Promise<boolean>;
}

/**
 * Ongoing location tracking built on expo-location, shared by both renderers.
 * No background tracking or geofencing in 2.0 -- `mode` reserves the
 * extension point so adding "background" later doesn't need a breaking
 * redesign.
 */
export function useLocationTracking(options: UseLocationTrackingOptions = {}): UseLocationTrackingResult {
  const { autoStart = false, requestPermission: shouldRequestPermission = true, accuracy = "balanced", distanceInterval, timeInterval, onUpdate, onError } = options;

  const [position, setPosition] = useState<MapPosition | null>(null);
  const [status, setStatus] = useState<LocationTrackingStatus>("idle");
  const [permission, setPermission] = useState<LocationPermissionState>("undetermined");
  const [error, setError] = useState<Error | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const mountedRef = useRef(true);
  const startInFlightRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  const requestPermissionFn = useCallback(async (): Promise<boolean> => {
    setStatus("requesting-permission");
    try {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      const granted = permissionStatus === "granted";
      if (mountedRef.current) setPermission(granted ? "granted" : "denied");
      return granted;
    } catch (err) {
      if (mountedRef.current) {
        setPermission("denied");
        setError(err as Error);
      }
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (mountedRef.current) setStatus("stopped");
  }, []);

  const start = useCallback(async () => {
    // Idempotent, and guarded synchronously (not just via subscriptionRef):
    // `start`'s identity changes when `permission` updates (it's in the
    // deps below), which re-fires the autoStart effect while the first
    // call is still awaiting permission/getCurrentPositionAsync -- without
    // this flag, both calls would eventually pass the checks below and
    // each start their own watchPositionAsync subscription.
    if (startInFlightRef.current || subscriptionRef.current) return;
    startInFlightRef.current = true;

    setError(null);
    let granted = permission === "granted";
    if (!granted && shouldRequestPermission) {
      granted = await requestPermissionFn();
    }
    if (!granted) {
      startInFlightRef.current = false;
      if (mountedRef.current) setStatus("denied");
      return;
    }

    setStatus("starting");
    try {
      const initial = await Location.getCurrentPositionAsync({ accuracy: ACCURACY_MAP[accuracy] });
      if (!mountedRef.current) return;
      const initialPosition = toMapPosition(initial);
      setPosition(initialPosition);
      onUpdate?.(initialPosition);

      subscriptionRef.current = await Location.watchPositionAsync(
        { accuracy: ACCURACY_MAP[accuracy], distanceInterval, timeInterval },
        (location) => {
          if (!mountedRef.current) return;
          const next = toMapPosition(location);
          setPosition(next);
          onUpdate?.(next);
        },
      );
      if (mountedRef.current) setStatus("tracking");
    } catch (err) {
      if (mountedRef.current) {
        setStatus("error");
        setError(err as Error);
      }
      onError?.(err as Error);
    } finally {
      startInFlightRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accuracy, distanceInterval, timeInterval, permission, shouldRequestPermission]);

  useEffect(() => {
    // `start` subscribes to an external system (the device's location
    // provider) -- exactly what effects are for. It does set state along
    // the way (permission/status/position), which the stricter
    // set-state-in-effect rule can't distinguish from a derived-state
    // anti-pattern; suppressing here is deliberate, not a bypass of a
    // real issue.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (autoStart) start();
  }, [autoStart, start]);

  return {
    position,
    coordinate: position?.coordinate ?? null,
    heading: position?.heading ?? null,
    speed: position?.speed ?? null,
    accuracy: position?.accuracy ?? null,
    timestamp: position?.timestamp ?? null,
    status,
    permission,
    error,
    start,
    stop,
    requestPermission: requestPermissionFn,
  };
}

export interface UseCurrentPositionOptions {
  enabled?: boolean;
  accuracy?: LocationAccuracy;
}

/** A one-shot + auto-updating current position, replacing MapLibre's own useCurrentPosition (which had no Mapbox equivalent). */
export function useCurrentPosition(options: UseCurrentPositionOptions = {}): MapPosition | undefined {
  const { enabled = true, accuracy } = options;
  const { position } = useLocationTracking({ autoStart: enabled, accuracy });
  return position ?? undefined;
}

/** Just the permission state/request, for callers that don't need ongoing tracking. */
export function useLocationPermission(): { permission: LocationPermissionState; request: () => Promise<boolean> } {
  const [permission, setPermission] = useState<LocationPermissionState>("undetermined");

  const request = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setPermission(granted ? "granted" : "denied");
    return granted;
  }, []);

  return { permission, request };
}
