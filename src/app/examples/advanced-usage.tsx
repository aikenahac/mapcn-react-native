import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker, MapRoute } from "@/components/ui/map";
import { ArrowLeftIcon, TrendingUp, Zap } from "@/lib/icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function AdvancedUsageExample() {
  const [showRoute, setShowRoute] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  const route: Array<[number, number]> = [
    [-122.4194, 37.7749],
    [-122.4083, 37.7849],
    [-122.4294, 37.7649],
  ];

  const markers = [
    {
      coordinate: [-122.4194, 37.7749] as [number, number],
      type: "trending",
      color: "bg-orange-500",
    },
    {
      coordinate: [-122.4083, 37.7849] as [number, number],
      type: "charging",
      color: "bg-green-500",
    },
    {
      coordinate: [-122.4294, 37.7649] as [number, number],
      type: "trending",
      color: "bg-orange-500",
    },
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
              Advanced Usage
            </Text>
            <Text className="text-lg text-muted-foreground">
              Dynamic layer toggling and mixed content with state management
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              {showRoute && <MapRoute coordinates={route} color="#3b82f6" width={4} />}
              {showMarkers &&
                markers.map((marker, idx) => (
                  <MapMarker key={idx} coordinate={marker.coordinate}>
                    <View
                      className={`w-10 h-10 ${marker.color} rounded-full items-center justify-center`}
                    >
                      {marker.type === "trending" ? (
                        <TrendingUp size={20} className="text-white" />
                      ) : (
                        <Zap size={20} className="text-white" />
                      )}
                    </View>
                  </MapMarker>
                ))}
            </Map>

            <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg gap-2">
              <Pressable
                onPress={() => setShowRoute(!showRoute)}
                className={`${
                  showRoute ? "bg-blue-500" : "bg-muted"
                } rounded-lg p-3 items-center active:opacity-70`}
              >
                <Text
                  className={`${showRoute ? "text-white" : "text-foreground"} font-medium`}
                >
                  {showRoute ? "Hide" : "Show"} Route
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowMarkers(!showMarkers)}
                className={`${
                  showMarkers ? "bg-orange-500" : "bg-muted"
                } rounded-lg p-3 items-center active:opacity-70`}
              >
                <Text
                  className={`${showMarkers ? "text-white" : "text-foreground"} font-medium`}
                >
                  {showMarkers ? "Hide" : "Show"} Markers
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Dynamic Layers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Toggle visibility of routes and markers with state management
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Mixed Content
              </Text>
              <Text className="text-sm text-muted-foreground">
                Combine routes, markers, and custom icons in a single map
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
