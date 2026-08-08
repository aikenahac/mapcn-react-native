import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map, useMap, MapControls, MapLocationPuck, MapMarker } from "@/components/ui/mapcn";
import * as Location from "expo-location";

function MapContent({ hasPermission }: { hasPermission: boolean }) {
  const { cameraRef } = useMap();

  const handleLocate = async () => {
    if (cameraRef.current) {
      const location = await Location.getCurrentPositionAsync({});
      cameraRef.current.flyTo({
        center: [location.coords.longitude, location.coords.latitude],
        zoom: 15,
        duration: 1500,
      });
    }
  };

  return (
    <>
      <MapMarker coordinate={[-122.4194, 37.7749]} label="Downtown">
        <View className="w-6 h-6 bg-purple-500 rounded-full border-2 border-background" />
      </MapMarker>
      {hasPermission && <MapLocationPuck />}
      <MapControls showLocate={hasPermission} onLocate={handleLocate} />
    </>
  );
}

interface MapControlsDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function MapControlsDemo({
  onScrollEnabledChange,
}: MapControlsDemoProps) {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  return (
    <>
      {!hasPermission && (
        <View className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <Text className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">
            Location Permission Required
          </Text>
          <Text className="text-sm text-muted-foreground">
            Grant location permission to see user location on the map.
          </Text>
        </View>
      )}

      <ScrollViewMapWrapper
        onScrollEnabledChange={onScrollEnabledChange}
        className="h-[500px] rounded-xl overflow-hidden border border-border"
      >
        <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
          <MapContent hasPermission={hasPermission} />
        </Map>
      </ScrollViewMapWrapper>
    </>
  );
}
