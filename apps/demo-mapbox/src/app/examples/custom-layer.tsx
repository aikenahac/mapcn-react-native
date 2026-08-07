import { Header } from "@/components/header";
import { ScreenContainer } from "@/components/screen-container";
import { Map } from "@/components/ui/map";
import { ArrowLeftIcon } from "@/lib/icons";
import Mapbox from "@rnmapbox/maps";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function CustomLayerExample() {
  const geojson = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: { name: "Golden Gate Park" },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [-122.511, 37.7694],
              [-122.454, 37.7694],
              [-122.454, 37.7744],
              [-122.511, 37.7744],
              [-122.511, 37.7694],
            ],
          ],
        },
      },
      {
        type: "Feature" as const,
        properties: { name: "Mission District" },
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [-122.4294, 37.7549],
              [-122.4094, 37.7549],
              [-122.4094, 37.7649],
              [-122.4294, 37.7649],
              [-122.4294, 37.7549],
            ],
          ],
        },
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
              Custom GeoJSON Layer
            </Text>
            <Text className="text-lg text-muted-foreground">
              Render polygons and shapes from GeoJSON data with custom styling
            </Text>
          </View>

          <View className="h-[500px] rounded-xl overflow-hidden border border-border relative">
            <Map zoom={12} center={[-122.4394, 37.7649]}>
              <Mapbox.ShapeSource id="custom-layer-source" shape={geojson}>
                <Mapbox.FillLayer
                  id="custom-layer-fill"
                  style={{
                    fillColor: "#3b82f6",
                    fillOpacity: 0.3,
                    fillOutlineColor: "#1d4ed8",
                  }}
                />
              </Mapbox.ShapeSource>
            </Map>

            <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
              <Text className="text-sm font-medium text-foreground mb-2">Areas Shown:</Text>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-4 h-4 bg-blue-500 opacity-30 rounded" />
                  <Text className="text-sm text-muted-foreground">Golden Gate Park</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <View className="w-4 h-4 bg-blue-500 opacity-30 rounded" />
                  <Text className="text-sm text-muted-foreground">Mission District</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-semibold text-foreground">Features</Text>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                GeoJSON Support
              </Text>
              <Text className="text-sm text-muted-foreground">
                Import and render standard GeoJSON polygon data
              </Text>
            </View>
            <View className="p-4 bg-card border border-border rounded-lg">
              <Text className="text-base font-medium text-foreground mb-1">
                Custom Styling
              </Text>
              <Text className="text-sm text-muted-foreground">
                Configure fill color, opacity, and outline styling
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
