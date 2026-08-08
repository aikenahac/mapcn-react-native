import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapMarker } from "@/components/ui/map-marker";
import { MapRoute } from "@/components/ui/map-route";

interface DeliveryDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function DeliveryDemo({ onScrollEnabledChange }: DeliveryDemoProps) {
  const deliveryRoute: Array<[number, number]> = [
    [-122.4194, 37.7749],
    [-122.4083, 37.7849],
    [-122.4294, 37.7649],
  ];

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border relative"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
        <MapRoute coordinates={deliveryRoute} color="#3b82f6" width={4} />
        {deliveryRoute.map((coord, idx) => (
          <MapMarker key={idx} coordinate={coord}>
            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center border-2 border-background">
              <Text className="text-xs font-bold text-white">{idx + 1}</Text>
            </View>
          </MapMarker>
        ))}
      </Map>

      <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-muted-foreground mb-1">
              Next Stop
            </Text>
            <Text className="text-base font-semibold text-foreground">
              Stop 2 of 3
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted-foreground mb-1">ETA</Text>
            <Text className="text-base font-semibold text-blue-500">8 min</Text>
          </View>
        </View>
      </View>
    </ScrollViewMapWrapper>
  );
}
