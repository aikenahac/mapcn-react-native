import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapMarker } from "@/components/ui/map-marker";

interface AnalyticsDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function AnalyticsDemo({ onScrollEnabledChange }: AnalyticsDemoProps) {
  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border relative"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
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
    </ScrollViewMapWrapper>
  );
}
