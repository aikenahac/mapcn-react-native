import { Map, MapMarker, MapControls } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Image, View, Text, ScrollView } from "react-native";
import { Link, type Href } from "expo-router";
import { ArrowRightIcon, BookOpenIcon } from "@/lib/icons";

export default function HomeScreen() {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(status === "granted");
      } catch (error) {
        console.error("Error requesting location permissions:", error);
      }
    })();
  }, []);

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-20 max-w-5xl mx-auto w-full gap-12">
        <View className="items-center gap-6">
          <View className="w-full">
            <Image
              source={require("@/assets/images/logo_dark.png")}
              style={{ width: "100%", height: 150 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-4xl md:text-6xl font-bold text-center text-foreground">
            MapLibre for{"\n"}React Native
          </Text>

          <Text className="text-lg text-center text-muted-foreground max-w-2xl">
            A complete React Native wrapper for MapLibre GL with built-in location services,
            powerful map controls, and a clean component API.
          </Text>

          <View className="flex flex-row gap-3 flex-wrap justify-center">
            <Link href={"/docs" as Href} asChild>
              <Button variant="default" size="lg" className="flex-row gap-2">
                <BookOpenIcon size={18} className="text-primary-foreground" />
                <Text className="text-primary-foreground font-medium text-base">
                  Get Started
                </Text>
              </Button>
            </Link>

            <Link href={"/examples" as Href} asChild>
              <Button variant="outline" size="lg" className="flex-row gap-2">
                <Text className="text-foreground font-medium text-base">View Examples</Text>
                <ArrowRightIcon size={18} className="text-foreground" />
              </Button>
            </Link>
          </View>
        </View>

        <View className="h-[400px] rounded-xl overflow-hidden border border-border shadow-lg">
          <Map zoom={12} center={[-122.4194, 37.7749]}>
            <MapMarker coordinate={[-122.4194, 37.7749]} label="San Francisco" />
            {hasLocationPermission && <MapControls />}
          </Map>
        </View>

        <View className="gap-6">
          <Text className="text-2xl font-bold text-foreground text-center">Key Features</Text>

          <View className="gap-4">
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Context-based API
              </Text>
              <Text className="text-muted-foreground">
                Access map and camera refs from any child component using the useMap() hook
              </Text>
            </View>

            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Theme-aware styling
              </Text>
              <Text className="text-muted-foreground">
                Automatic light/dark mode switching with Carto basemaps included
              </Text>
            </View>

            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Location services
              </Text>
              <Text className="text-muted-foreground">
                Built-in permission handling and user location display components
              </Text>
            </View>

            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-lg font-semibold text-foreground mb-2">
                Flexible markers
              </Text>
              <Text className="text-muted-foreground">
                Support for labels, popups, and custom React Native components as markers
              </Text>
            </View>
          </View>
        </View>

        <View className="p-6 bg-muted/30 rounded-lg border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">
            ⚠️ MapLibre v11 Alpha Required
          </Text>
          <Text className="text-sm text-muted-foreground">
            This library requires @maplibre/maplibre-react-native v11 (currently in alpha) and
            React Native's New Architecture. Make sure your project has the New Architecture
            enabled before installation.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
