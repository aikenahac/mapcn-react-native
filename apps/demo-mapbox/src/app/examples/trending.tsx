import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker } from "@/components/ui/map";
import { ArrowLeftIcon, TrendingUp } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function TrendingExample() {
  const trendingLocations: Array<{ coordinate: [number, number]; count: number }> = [
    { coordinate: [-122.4194, 37.7749], count: 1240 },
    { coordinate: [-122.4083, 37.7849], count: 980 },
    { coordinate: [-122.4294, 37.7649], count: 756 },
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
              Trending Locations
            </Text>
            <Text className="text-lg text-muted-foreground">
              Display popular spots with engagement metrics and labels
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              {trendingLocations.map((loc, idx) => (
                <MapMarker
                  key={idx}
                  coordinate={loc.coordinate}
                  label={`${loc.count} visits`}
                >
                  <View className="items-center gap-1">
                    <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                      <TrendingUp size={20} className="text-white" />
                    </View>
                  </View>
                </MapMarker>
              ))}
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Marker Labels
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display text labels below markers for additional context
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Icon Markers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Use Lucide icons inside custom marker components
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
