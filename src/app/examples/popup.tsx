import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapMarker } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PopupExample() {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(0);

  const locations = [
    {
      coordinate: [-122.4194, 37.7749] as [number, number],
      title: "Ferry Building",
      description: "Historic landmark and marketplace",
      rating: "4.5",
    },
    {
      coordinate: [-122.4183, 37.8099] as [number, number],
      title: "Fisherman's Wharf",
      description: "Popular tourist attraction",
      rating: "4.3",
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
              Rich Popups
            </Text>
            <Text className="text-lg text-muted-foreground">
              Interactive markers with detailed content and information
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              {locations.map((loc, idx) => (
                <MapMarker key={idx} coordinate={loc.coordinate}>
                  <Pressable onPress={() => setSelectedMarker(idx)}>
                    <View
                      className={cn(
                        "w-8 h-8 bg-red-500 rounded-full border-2 items-center justify-center",
                        selectedMarker === idx
                          ? "border-blue-500"
                          : "border-background",
                      )}
                    >
                      <Text className="text-white text-xs font-bold">
                        {idx + 1}
                      </Text>
                    </View>
                  </Pressable>
                </MapMarker>
              ))}
            </Map>

            {selectedMarker !== null && (
              <View className="absolute bottom-4 left-4 right-4 bg-background rounded-lg p-4 border border-border shadow-xl">
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-xl font-bold text-foreground flex-1">
                    {locations[selectedMarker].title}
                  </Text>
                  <Pressable onPress={() => setSelectedMarker(null)}>
                    <Text className="text-muted-foreground text-lg">×</Text>
                  </Pressable>
                </View>
                <Text className="text-sm text-muted-foreground mb-2">
                  {locations[selectedMarker].description}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-amber-500">★</Text>
                  <Text className="text-sm font-medium text-foreground">
                    {locations[selectedMarker].rating}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Interactive Markers
              </Text>
              <Text className="text-sm text-muted-foreground">
                Tap markers to display detailed information popups
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Rich Content
              </Text>
              <Text className="text-sm text-muted-foreground">
                Display titles, descriptions, ratings, and custom content
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
