import { cn } from "@/lib/utils";
import { use, useId, type ReactNode } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { MapMarkerAnchor } from "./map-renderer";
import { MarkerContext } from "./map-marker";
import type { Coordinate } from "@/lib/mapcn/types";

/**
 * Anchors to any coordinate -- a GeoJSON feature, a cluster, a polygon
 * centroid, or an arbitrary map press (plan §7.10). Built on
 * `MapMarkerAnchor` (native marker/annotation positioning) rather than a
 * manually re-projected overlay, so it never drifts or lags during pan/
 * zoom -- the tradeoff documented in the plan's risk list is styling/
 * z-ordering are bounded by what the renderer's marker view supports,
 * which in practice is "any RN view", so this is a non-issue in practice.
 */
export interface MapPopupProps {
  coordinate: Coordinate;
  visible?: boolean;
  onClose?: () => void;
  closeButton?: boolean;
  arrow?: boolean;
  maxWidth?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** A popup overlay anchored to a map coordinate. */
export function MapPopup({
  coordinate,
  visible = true,
  onClose,
  closeButton = true,
  arrow = true,
  maxWidth = 260,
  className,
  style,
  children,
}: MapPopupProps) {
  const id = useId();

  if (!visible) return null;

  return (
    <MapMarkerAnchor id={id} coordinate={coordinate}>
      <View className="items-center">
        <View className={cn("bg-popover border border-border rounded-lg shadow-lg p-3", className)} style={[{ maxWidth }, style]}>
          {closeButton && onClose && (
            <Pressable
              onPress={onClose}
              className="absolute top-1 right-1 w-5 h-5 items-center justify-center"
              accessibilityLabel="Close popup"
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text className="text-muted-foreground text-xs">✕</Text>
            </Pressable>
          )}
          {children}
        </View>
        {arrow && <View className="w-3 h-3 bg-popover border border-border rotate-45 -mt-1.5" />}
      </View>
    </MapMarkerAnchor>
  );
}

/**
 * Convenience wrapper for the common case of "a popup for this marker".
 * Recommended usage is as a *sibling* of the `MapMarker` it belongs to
 * (toggled by selection state), with an explicit `coordinate` -- MapPopup
 * renders its own independent marker-anchor, so nesting `<MarkerPopup>`
 * literally inside `<MapMarker>` would create a marker-inside-a-marker.
 * The `MarkerContext` fallback below covers simple cases where that's
 * rendered anyway, but isn't the documented pattern.
 */
export interface MarkerPopupProps extends Omit<MapPopupProps, "coordinate"> {
  coordinate?: Coordinate;
  /** Title text shown above the popup content. */
  title?: string;
}

/** A `MapPopup` that defaults its coordinate to the enclosing `MapMarker`'s. */
export function MarkerPopup({ coordinate, title, children, ...props }: MarkerPopupProps) {
  const marker = use(MarkerContext);
  const resolvedCoordinate = coordinate ?? marker?.coordinate;
  if (!resolvedCoordinate) {
    throw new Error("MarkerPopup needs a `coordinate` prop, or must be rendered where a MapMarker's MarkerContext is available.");
  }
  return (
    <MapPopup coordinate={resolvedCoordinate} {...props}>
      {title && <Text className="font-semibold text-foreground mb-1">{title}</Text>}
      {children}
    </MapPopup>
  );
}
