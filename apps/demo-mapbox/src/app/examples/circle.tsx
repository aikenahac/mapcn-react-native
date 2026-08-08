import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map } from "@/components/ui/map";
import { MapCircle } from "@/components/ui/map-circle";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";

export default function CircleExample() {
  const [center, setCenter] = useState<[number, number]>([
    -122.4194, 37.7749,
  ]);
  const [radius, setRadius] = useState(2000);

  const decreaseRadius = () => {
    setRadius((prev) => Math.max(500, prev - 500));
  };

  const increaseRadius = () => {
    setRadius((prev) => Math.min(10000, prev + 500));
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
              Search Radius
            </Text>
            <Text className="text-lg text-muted-foreground">
              Interactive circle for search areas
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map
              defaultViewport={{ zoom: 13, center }}
              onPress={(e) => setCenter(e.coordinate)}
            >
              <MapCircle center={center} radius={radius} />
            </Map>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              onPress={decreaseRadius}
            >
              <Text className="text-base font-semibold text-foreground">−</Text>
            </Button>
            <Text className="text-lg font-semibold text-foreground flex-1 text-center">
              {radius.toLocaleString()} m
            </Text>
            <Button
              variant="outline"
              size="icon"
              onPress={increaseRadius}
            >
              <Text className="text-base font-semibold text-foreground">+</Text>
            </Button>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Geodesic Radius
              </Text>
              <Text className="text-sm text-muted-foreground">
                Real-world meter-based circles, not screen pixels
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Tap-to-Recenter
              </Text>
              <Text className="text-sm text-muted-foreground">
                onPress on Map updates center instantly
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Adjustable Control
              </Text>
              <Text className="text-sm text-muted-foreground">
                −/+ buttons for dynamic radius exploration
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
