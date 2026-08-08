import { cn } from "@/lib/utils";
import { Marker } from "@maplibre/maplibre-react-native";
import { createContext, useId, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export interface MarkerContextValue {
  coordinate: [number, number];
}

export const MarkerContext = createContext<MarkerContextValue | null>(null);

function anchorObjectToAnchorString(anchor: { x: number; y: number }) {
  const horizontal = anchor.x <= 0.25 ? "left" : anchor.x >= 0.75 ? "right" : "center";
  const vertical = anchor.y <= 0.25 ? "top" : anchor.y >= 0.75 ? "bottom" : "center";

  if (horizontal === "center" && vertical === "center") return "center";
  if (horizontal === "center") return vertical;
  if (vertical === "center") return horizontal;

  return `${vertical}-${horizontal}` as "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export type MapMarkerProps = {
  children?: ReactNode;
  label?: string;
  /** Anchor point for the marker (0.0 to 1.0). Default is center (0.5, 0.5) */
  anchor?: { x: number; y: number };
  /** Allow marker to overlap with other markers. MapLibre has no native equivalent -- documented as a no-op here (see MAP_CAPABILITIES on the Mapbox side, which honors it). */
  allowOverlap?: boolean;
  /** Callback when marker is pressed */
  onPress?: () => void;
} & (
  | { coordinate: [number, number]; longitude?: never; latitude?: never }
  | { longitude: number; latitude: number; coordinate?: never }
);

/** A native marker view pinned to a coordinate. Prefer `MapGeoJSON`/`MapClusterLayer` above ~100 markers. */
export function MapMarker({
  children,
  label,
  anchor = { x: 0.5, y: 0.5 },
  allowOverlap: _allowOverlap = false,
  onPress,
  ...positionProps
}: MapMarkerProps) {
  const id = useId();

  const coordinate: [number, number] =
    "coordinate" in positionProps && positionProps.coordinate
      ? positionProps.coordinate
      : [positionProps.longitude, positionProps.latitude];

  return (
    <MarkerContext value={{ coordinate }}>
      <Marker id={id} lngLat={coordinate} anchor={anchorObjectToAnchorString(anchor)}>
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

export type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

export function MarkerContent({ children, className }: MarkerContentProps) {
  return <View className={cn("items-center justify-center", className)}>{children || <DefaultMarkerIcon />}</View>;
}

function DefaultMarkerIcon() {
  return <View className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md" style={{ elevation: 5 }} />;
}

export type MarkerLabelProps = {
  children: ReactNode;
  className?: string;
  classNameText?: string;
  position?: "top" | "bottom";
};

export function MarkerLabel({ children, className, classNameText, position = "top" }: MarkerLabelProps) {
  return (
    <View
      className={cn(
        "absolute left-1/2 translate-x-[-50%]",
        position === "top" ? "mb-1 bottom-full" : "mt-1 top-full",
        className,
      )}
    >
      <Text className={cn("text-[10px] font-semibold text-foreground", classNameText)}>{children}</Text>
    </View>
  );
}
