import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function MarkersExample() {
  const locations = [
    { coordinate: [-122.4194, 37.7749] as [number, number], label: "San Francisco" },
    { coordinate: [-122.4083, 37.7849] as [number, number], label: "North Beach" },
    { coordinate: [-122.4294, 37.7649] as [number, number], label: "Mission District" },
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
              Multiple Markers
            </Text>
            <Text className="text-lg text-muted-foreground">
              Display markers with labels across different locations
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              {locations.map((loc, idx) => (
                <MapMarker key={idx} coordinate={loc.coordinate} label={loc.label}>
                  <View className="w-6 h-6 bg-blue-500 rounded-full border-2 border-background" />
                </MapMarker>
              ))}
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Custom Marker Content
              </Text>
              <Text className="text-sm text-muted-foreground">
                Use any React Native component as marker content
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Marker Labels
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display text labels below markers for additional context
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
