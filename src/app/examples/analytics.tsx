import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function AnalyticsExample() {
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
              Real-time Activity Map
            </Text>
            <Text className="text-lg text-muted-foreground">
              Visualize active users with animated markers and overlaid statistics
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              <MapMarker coordinate={[-122.4194, 37.7749]}>
                <View className="w-4 h-4 bg-emerald-500 rounded-full">
                  <View className="w-4 h-4 bg-emerald-500 rounded-full opacity-50 absolute animate-ping" />
                </View>
              </MapMarker>
              <MapMarker coordinate={[-122.4083, 37.7849]}>
                <View className="w-4 h-4 bg-emerald-500 rounded-full">
                  <View className="w-4 h-4 bg-emerald-500 rounded-full opacity-50 absolute animate-ping" />
                </View>
              </MapMarker>
              <MapMarker coordinate={[-122.4294, 37.7649]}>
                <View className="w-4 h-4 bg-emerald-500 rounded-full">
                  <View className="w-4 h-4 bg-emerald-500 rounded-full opacity-50 absolute animate-ping" />
                </View>
              </MapMarker>
            </Map>

            <View className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
              <Text className="text-xs text-muted-foreground mb-1">Active Users</Text>
              <Text className="text-3xl font-bold text-emerald-500">2,547</Text>
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Animated Markers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Pulsing animation effect to indicate real-time activity
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Overlay Statistics
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display key metrics directly on the map with custom components
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
