import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import Mapbox from "@rnmapbox/maps";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function LayerMarkersExample() {
  const geojson = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { title: "Ferry Building", count: 1240 },
        geometry: { type: "Point" as const, coordinates: [-122.3937, 37.7955] },
      },
      {
        type: "Feature" as const,
        properties: { title: "Pier 39", count: 980 },
        geometry: { type: "Point" as const, coordinates: [-122.4098, 37.8086] },
      },
      {
        type: "Feature" as const,
        properties: { title: "Coit Tower", count: 756 },
        geometry: { type: "Point" as const, coordinates: [-122.4058, 37.8024] },
      },
      {
        type: "Feature" as const,
        properties: { title: "Ghirardelli Square", count: 654 },
        geometry: { type: "Point" as const, coordinates: [-122.4227, 37.8056] },
      },
    ],
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
              GeoJSON Markers
            </Text>
            <Text className="text-lg text-muted-foreground">
              Efficient marker rendering with data-driven styling and clustering
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={13} center={[-122.4083, 37.802]}>
              <Mapbox.ShapeSource id="layer-markers-source" shape={geojson}>
                <Mapbox.CircleLayer
                  id="layer-markers-circles"
                  style={{
                    circleRadius: [
                      "interpolate",
                      ["linear"],
                      ["get", "count"],
                      500,
                      15,
                      1500,
                      25,
                    ],
                    circleColor: "#f59e0b",
                    circleOpacity: 0.7,
                    circleStrokeWidth: 2,
                    circleStrokeColor: "#ffffff",
                  }}
                />
                <Mapbox.SymbolLayer
                  id="layer-markers-labels"
                  style={{
                    textField: ["get", "title"],
                    textSize: 12,
                    textColor: "#ffffff",
                    textHaloColor: "#000000",
                    textHaloWidth: 1,
                    textOffset: [0, 2],
                  }}
                />
              </Mapbox.ShapeSource>
            </Map>

            <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
              <Text className="text-sm font-medium text-foreground mb-2">Features:</Text>
              <Text className="text-sm text-muted-foreground">
                • Circle size based on count property{"\n"}• Automatic label positioning{"\n"}
                • Efficient rendering for large datasets
              </Text>
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Data-Driven Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Marker size and appearance automatically adjust based on data properties
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                High Performance
              </Text>
              <Text className="text-sm text-muted-foreground">
                Optimized for rendering thousands of markers efficiently
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
