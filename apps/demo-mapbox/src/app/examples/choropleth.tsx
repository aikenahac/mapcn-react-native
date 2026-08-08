import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map } from "@/components/ui/map";
import { MapChoropleth } from "@/components/ui/map-choropleth";
import { MapLegend } from "@/components/ui/map-legend";
import { ArrowLeftIcon } from "@/lib/icons";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useMemo, useState } from "react";
import type { FeatureCollection } from "geojson";
import type { MapLegendData } from "@/lib/mapcn/types";

function generateNeighborhoodData(): FeatureCollection {
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        id: "1",
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [-122.44, 37.79],
            [-122.42, 37.79],
            [-122.42, 37.77],
            [-122.44, 37.77],
            [-122.44, 37.79],
          ]],
        },
        properties: {
          id: "1",
          name: "Downtown",
          density: 8500,
        },
      },
      {
        type: "Feature" as const,
        id: "2",
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [-122.42, 37.79],
            [-122.40, 37.79],
            [-122.40, 37.77],
            [-122.42, 37.77],
            [-122.42, 37.79],
          ]],
        },
        properties: {
          id: "2",
          name: "Marina",
          density: 6200,
        },
      },
      {
        type: "Feature" as const,
        id: "3",
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [-122.44, 37.77],
            [-122.42, 37.77],
            [-122.42, 37.75],
            [-122.44, 37.75],
            [-122.44, 37.77],
          ]],
        },
        properties: {
          id: "3",
          name: "Mission",
          density: 9500,
        },
      },
      {
        type: "Feature" as const,
        id: "4",
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [-122.42, 37.77],
            [-122.40, 37.77],
            [-122.40, 37.75],
            [-122.42, 37.75],
            [-122.42, 37.77],
          ]],
        },
        properties: {
          id: "4",
          name: "Castro",
          density: 4100,
        },
      },
      {
        type: "Feature" as const,
        id: "5",
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [-122.44, 37.75],
            [-122.42, 37.75],
            [-122.42, 37.73],
            [-122.44, 37.73],
            [-122.44, 37.75],
          ]],
        },
        properties: {
          id: "5",
          name: "Sunset",
          density: 2300,
        },
      },
      {
        type: "Feature" as const,
        id: "6",
        geometry: {
          type: "Polygon" as const,
          coordinates: [[
            [-122.42, 37.75],
            [-122.40, 37.75],
            [-122.40, 37.73],
            [-122.42, 37.73],
            [-122.42, 37.75],
          ]],
        },
        properties: {
          id: "6",
          name: "Richmond",
          density: 800,
        },
      },
    ],
  };
}

export default function ChoroplethExample() {
  const [legend, setLegend] = useState<MapLegendData | null>(null);
  const neighborhoods = useMemo(() => generateNeighborhoodData(), []);

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
              Choropleth + Legend
            </Text>
            <Text className="text-lg text-muted-foreground">
              Color regions by value with a synced legend
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map defaultViewport={{ zoom: 13, center: [-122.4194, 37.7749] }}>
              <MapChoropleth
                data={neighborhoods}
                value="density"
                scale={{ type: "quantize", steps: 5 }}
                onLegendChange={setLegend}
              />
              {legend && (
                <MapLegend
                  data={legend}
                  title="Density"
                  position="bottom-right"
                />
              )}
            </Map>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">
              Features
            </Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Quantize/Quantile/Threshold Scales
              </Text>
              <Text className="text-sm text-muted-foreground">
                Flexible color bucketing strategies for numeric data
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Legend Sync
              </Text>
              <Text className="text-sm text-muted-foreground">
                onLegendChange wires legend data to MapLegend component
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Native Step Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Per-region colors via data-driven expressions
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
