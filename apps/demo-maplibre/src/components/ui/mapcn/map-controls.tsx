import { cn } from "@/lib/utils";
import * as Location from "expo-location";
import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useMap, useOverlay } from "./map";

export type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showLocate?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

/**
 * Renders through the overlay mechanism (see map.tsx's OverlayContext) so
 * this file is byte-identical on both renderers -- MapLibre happens to
 * support plain children directly, Mapbox doesn't, and the overlay portal
 * is what makes that difference invisible here.
 */
export function MapControls({ position = "bottom-right", showZoom = true, showLocate = false, className, onLocate }: MapControlsProps) {
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      const coords = { longitude: location.coords.longitude, latitude: location.coords.latitude };
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
    [position],
  );

  const controlsElement = useMemo(
    () => (
      <View className={cn("absolute gap-1.5", className)} style={positionStyle}>
        {showZoom && (
          <View className="rounded border border-border bg-card shadow-sm overflow-hidden" style={{ elevation: 2 }}>
            <ControlButton onPress={handleZoomIn} label="Zoom in">
              <Text className="text-lg font-semibold text-foreground">+</Text>
            </ControlButton>
            <View className="h-[1px] bg-border" />
            <ControlButton onPress={handleZoomOut} label="Zoom out">
              <Text className="text-lg font-semibold text-foreground">−</Text>
            </ControlButton>
          </View>
        )}
        {showLocate && (
          <View className="rounded border border-border bg-card shadow-sm overflow-hidden" style={{ elevation: 2 }}>
            <ControlButton onPress={handleLocate} label="Locate me" disabled={waitingForLocation}>
              {waitingForLocation ? <ActivityIndicator size="small" /> : <Text className="text-base text-foreground">📍</Text>}
            </ControlButton>
          </View>
        )}
      </View>
    ),
    [className, positionStyle, showZoom, showLocate, handleZoomIn, handleZoomOut, handleLocate, waitingForLocation],
  );

  useEffect(() => {
    if (!isLoaded) return;
    registerOverlay(overlayId, controlsElement);
    return () => unregisterOverlay(overlayId);
  }, [isLoaded, overlayId, registerOverlay, unregisterOverlay, controlsElement]);

  return null;
}

function ControlButton({ onPress, label, children, disabled = false }: { onPress: () => void; label: string; children: ReactNode; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-8 h-8 justify-center items-center active:bg-muted"
      style={disabled ? { opacity: 0.5 } : undefined}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {children}
    </Pressable>
  );
}
