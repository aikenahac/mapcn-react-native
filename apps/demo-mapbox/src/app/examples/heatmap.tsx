import { useMemo } from "react";
import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapHeatmap } from "@/components/ui/mapcn";
import { SEQUENTIAL_RAMPS } from "@/lib/mapcn/colors";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { FeatureCollection } from "geojson";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateHeatmapData(): FeatureCollection {
  const rng = mulberry32(42);
  const centerLat = 37.7749;
  const centerLng = -122.4194;
  const radius = 0.05;

  const features = Array.from({ length: 300 }, () => {
    const angle = rng() * Math.PI * 2;
    const distance = rng() * radius;
    const lat = centerLat + Math.cos(angle) * distance;
    const lng = centerLng + Math.sin(angle) * distance;
    const magnitude = 1 + rng() * rng() * 5;

    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [lng, lat] as [number, number],
      },
      properties: { magnitude },
    };
  });

  return { type: "FeatureCollection" as const, features };
}

export default function HeatmapExample() {
  const heatmapData = useMemo(() => generateHeatmapData(), []);

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
              Heatmap
            </Text>
            <Text className="text-lg text-muted-foreground">
              Density visualization for incident data
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
              <MapHeatmap
                data={heatmapData}
                weight="magnitude"
                weightRange={[1, 6]}
                radius={[
                  { zoom: 10, value: 15 },
                  { zoom: 15, value: 35 },
                ]}
                intensity={1}
                colors={SEQUENTIAL_RAMPS.reds}
              />
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Weight & Range Normalization
              </Text>
              <Text className="text-sm text-muted-foreground">
                Weight property scaling with custom min/max bounds normalizes
                your incident data
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Zoom-stop Arrays
              </Text>
              <Text className="text-sm text-muted-foreground">
                Radius and intensity adapt to zoom level with zoom,value pair
                arrays
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Color Ramps
              </Text>
              <Text className="text-sm text-muted-foreground">
                Use predefined color scales (blues, greens, oranges, reds,
                purples)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
