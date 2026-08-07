import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapControls, MapMarker, MapUserLocation, useMap } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import * as Location from "expo-location";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
      {hasPermission && <MapUserLocation />}
      <MapControls showLocate={hasPermission} onLocate={handleLocate} />
    </>
  );
}

export default function MapControlsExample() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  return (
    <ScreenContainer className="flex-1 bg-background">
      <Header
        leftContent={
          <Link href="/" asChild>
            <Pressable className="p-2 rounded active:bg-muted">
              <ArrowLeftIcon size={20} className="text-muted-foreground" />
            </Pressable>
          </Link>
        }
      />
      <ScrollView className="flex-1">
        <View className="px-6 py-8 w-full gap-6">
          <View>
            <Text className="text-3xl font-bold text-foreground mb-2">Map Controls</Text>
            <Text className="text-lg text-muted-foreground">
              Built-in zoom and location controls with user location display
            </Text>
          </View>

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

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              <MapContent hasPermission={hasPermission} />
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Zoom Controls
              </Text>
              <Text className="text-sm text-muted-foreground">
                Built-in zoom in/out buttons for easy map navigation
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Location Centering
              </Text>
              <Text className="text-sm text-muted-foreground">
                Tap the locate button to center map on user location
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Permission Handling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Automatic location permission request and handling
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
