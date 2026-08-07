import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker, MapRoute } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DeliveryExample() {
  const deliveryRoute: Array<[number, number]> = [
    [-122.4194, 37.7749],
    [-122.4083, 37.7849],
    [-122.4294, 37.7649],
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
              Delivery Route Tracking
            </Text>
            <Text className="text-lg text-muted-foreground">
              Track delivery routes with custom markers and line paths
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
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
                  <Text className="text-xs text-muted-foreground mb-1">Next Stop</Text>
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
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">Route Lines</Text>
              <Text className="text-sm text-muted-foreground">
                Draw paths between points with customizable colors and width
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Numbered Markers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Custom marker content with sequential numbering for stops
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
