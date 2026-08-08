import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map, MapMarker, MapRoute } from "@/components/ui/mapcn";

interface RouteDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function RouteDemo({ onScrollEnabledChange }: RouteDemoProps) {
  const routeCoordinates: Array<[number, number]> = [
    [-122.4194, 37.7749],
    [-122.4183, 37.7799],
    [-122.4083, 37.7849],
    [-122.4094, 37.7899],
    [-122.4294, 37.7949],
  ];

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border relative"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7849] }}>
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
            <Text className="text-base font-semibold text-foreground">
              3.2 km
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted-foreground mb-1">Duration</Text>
            <Text className="text-base font-semibold text-foreground">
              12 min
            </Text>
          </View>
          <View>
            <Text className="text-xs text-muted-foreground mb-1">Points</Text>
            <Text className="text-base font-semibold text-foreground">
              {routeCoordinates.length}
            </Text>
          </View>
        </View>
      </View>
    </ScrollViewMapWrapper>
  );
}
