import { View, Text } from "react-native";
import { ReactNode } from "react";

export function Map({ children }: { children?: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center bg-muted">
      <Text className="text-muted-foreground">
        Maps are not supported on web. Please run on iOS or Android.
      </Text>
    </View>
  );
}

export function MapMarker() {
  return null;
}

export function MapRoute() {
  return null;
}

export function MapControls() {
  return null;
}

export function MapUserLocation() {
  return null;
}

export function MarkerContent() {
  return null;
}

export function MarkerLabel() {
  return null;
}

export function MarkerPopup() {
  return null;
}

export function useMap() {
  return {
    mapRef: { current: null },
    cameraRef: { current: null },
    isLoaded: false,
    theme: "light" as const,
  };
}

export function useCurrentPosition() {
  return null;
}

export const LocationManager = {
  requestPermissions: async () => false,
};
