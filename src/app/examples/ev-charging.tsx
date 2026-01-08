import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker } from "@/components/ui/map";
import { ArrowLeftIcon, Zap } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function EVChargingExample() {
  const chargingStations: Array<{ coordinate: [number, number]; status: string }> = [
    { coordinate: [-122.4194, 37.7749], status: "available" },
    { coordinate: [-122.4083, 37.7849], status: "in-use" },
    { coordinate: [-122.4294, 37.7649], status: "offline" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "in-use":
        return "bg-amber-500";
      case "offline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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
              EV Charging Stations
            </Text>
            <Text className="text-lg text-muted-foreground">
              Find charging stations with real-time availability status
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              {chargingStations.map((station, idx) => (
                <MapMarker
                  key={idx}
                  coordinate={station.coordinate}
                  label={station.status}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${getStatusColor(
                      station.status
                    )}`}
                  >
                    <Zap size={20} className="text-white" />
                  </View>
                </MapMarker>
              ))}
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Status Legend</Text>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-green-500 rounded-full" />
                <Text className="text-base text-foreground">Available</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-amber-500 rounded-full" />
                <Text className="text-base text-foreground">In Use</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-red-500 rounded-full" />
                <Text className="text-base text-foreground">Offline</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
