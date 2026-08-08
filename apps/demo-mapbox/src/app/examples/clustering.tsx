import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map, MapClusterLayer } from "@/components/ui/mapcn";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMemo, useState } from "react";
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

function generateClusterData(): FeatureCollection {
  const rng = mulberry32(42);
  const centerLat = 37.7749;
  const centerLng = -122.4194;
  const radius = 0.15;

  const features = Array.from({ length: 5000 }, (_, i) => {
    const angle = rng() * Math.PI * 2;
    const distance = rng() * radius;
    const lat = centerLat + Math.cos(angle) * distance;
    const lng = centerLng + Math.sin(angle) * distance;

    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [lng, lat] as [number, number],
      },
      properties: { id: i },
    };
  });

  return { type: "FeatureCollection" as const, features };
}

export default function ClusteringExample() {
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const clusterData = useMemo(() => generateClusterData(), []);

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
              Point Clustering
            </Text>
            <Text className="text-lg text-muted-foreground">
              Cluster thousands of points with native performance
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border">
            <Map
              defaultViewport={{
                zoom: 11,
                center: [-122.4194, 37.7749],
              }}
            >
              <MapClusterLayer
                data={clusterData}
                cluster={{
                  steps: [
                    { at: 0, color: "#60a5fa", radius: 16 },
                    { at: 50, color: "#3b82f6", radius: 22 },
                    { at: 200, color: "#1d4ed8", radius: 28 },
                  ],
                }}
                count={{ color: "#ffffff" }}
                expandOnPress
                onPointPress={(feature) => {
                  setSelectedPointId(String(feature.properties?.id ?? "unknown"));
                }}
              />
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Native Clustering
              </Text>
              <Text className="text-sm text-muted-foreground">
                5,000+ point performance without lag using native clustering
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Zoom & Expand
              </Text>
              <Text className="text-sm text-muted-foreground">
                expandOnPress automatically zooms clusters on tap
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Point Selection
              </Text>
              <Text className="text-sm text-muted-foreground">
                Selected point: {selectedPointId ?? "none — tap an unclustered point"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
