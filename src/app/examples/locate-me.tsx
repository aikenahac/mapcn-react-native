import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapControls, MapUserLocation, useMap } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import * as Location from "expo-location";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
  }, [cameraRef])

  useEffect(() => {
    handleLocate();
  }, [handleLocate])

  return (
    <>
      <MapUserLocation />
      <MapControls showLocate={hasPermission} onLocate={handleLocate} />
    </>
  );
}

export default function LocateMeExample() {
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
            <Text className="text-3xl font-bold text-foreground mb-2">
              User Location
            </Text>
            <Text className="text-lg text-muted-foreground">
              Display user location with built-in permission handling and
              controls
            </Text>
          </View>

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

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              {hasPermission && <MapContent hasPermission={hasPermission} />}
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                User Location Display
              </Text>
              <Text className="text-sm text-muted-foreground">
                Show the user&apos;s current location with a marker on the map
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Map Controls
              </Text>
              <Text className="text-sm text-muted-foreground">
                Zoom and location centering controls with permission handling
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
