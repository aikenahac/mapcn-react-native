import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker, MapRoute } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function RouteExample() {
  const routeCoordinates: Array<[number, number]> = [
    [-122.4194, 37.7749],
    [-122.4183, 37.7799],
    [-122.4083, 37.7849],
    [-122.4094, 37.7899],
    [-122.4294, 37.7949],
  ];

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
              Polyline Routes
            </Text>
            <Text className="text-lg text-muted-foreground">
              Draw routes between points with custom styling and waypoints
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={12} center={[-122.4194, 37.7849]}>
              <MapRoute coordinates={routeCoordinates} color="#3b82f6" width={4} />
              <MapMarker coordinate={routeCoordinates[0]}>
                <View className="w-8 h-8 bg-green-500 rounded-full border-2 border-background items-center justify-center">
                  <Text className="text-white text-xs font-bold">A</Text>
                </View>
              </MapMarker>
              <MapMarker coordinate={routeCoordinates[routeCoordinates.length - 1]}>
                <View className="w-8 h-8 bg-red-500 rounded-full border-2 border-background items-center justify-center">
                  <Text className="text-white text-xs font-bold">B</Text>
                </View>
              </MapMarker>
            </Map>

            <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
              <View className="flex-row justify-between">
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Distance</Text>
                  <Text className="text-base font-semibold text-foreground">3.2 km</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Duration</Text>
                  <Text className="text-base font-semibold text-foreground">12 min</Text>
                </View>
                <View>
                  <Text className="text-xs text-muted-foreground mb-1">Points</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {routeCoordinates.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Custom Line Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Configure route color, width, and visual appearance
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Multiple Waypoints
              </Text>
              <Text className="text-sm text-muted-foreground">
                Support for routes with multiple intermediate points
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
