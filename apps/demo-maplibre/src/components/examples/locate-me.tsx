import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map, useMap, MapControls, MapLocationPuck } from "@/components/ui/mapcn";
import * as Location from "expo-location";

function MapContent({ hasPermission }: { hasPermission: boolean }) {
  const { cameraRef } = useMap();

  const handleLocate = useCallback(async () => {
    if (cameraRef.current) {
      const location = await Location.getCurrentPositionAsync({});
      cameraRef.current.flyTo({
        center: [location.coords.longitude, location.coords.latitude],
        zoom: 15,
        duration: 1500,
      });
    }
  }, [cameraRef]);

  useEffect(() => {
    handleLocate();
  }, [handleLocate]);

  return (
    <>
      <MapLocationPuck />
      <MapControls showLocate={hasPermission} onLocate={handleLocate} />
    </>
  );
}

interface LocateMeDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function LocateMeDemo({ onScrollEnabledChange }: LocateMeDemoProps) {
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
            Please grant location permission to see this example in action.
          </Text>
        </View>
      )}

      <ScrollViewMapWrapper
        onScrollEnabledChange={onScrollEnabledChange}
        className="h-[500px] rounded-xl overflow-hidden border border-border"
      >
        <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
          {hasPermission && <MapContent hasPermission={hasPermission} />}
        </Map>
      </ScrollViewMapWrapper>
    </>
  );
}
