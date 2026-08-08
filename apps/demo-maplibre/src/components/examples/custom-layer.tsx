import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";

interface CustomLayerDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function CustomLayerDemo({
  onScrollEnabledChange,
}: CustomLayerDemoProps) {
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
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border relative"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4394, 37.7649] }}>
        <GeoJSONSource id="custom-layer-source" data={geojson}>
          <Layer
            id="custom-layer-fill"
            type="fill"
            style={{
              fillColor: "#3b82f6",
              fillOpacity: 0.3,
              fillOutlineColor: "#1d4ed8",
            }}
          />
        </GeoJSONSource>
      </Map>

      <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
        <Text className="text-sm font-medium text-foreground mb-2">
          Areas Shown:
        </Text>
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 bg-blue-500 opacity-30 rounded" />
            <Text className="text-sm text-muted-foreground">
              Golden Gate Park
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="w-4 h-4 bg-blue-500 opacity-30 rounded" />
            <Text className="text-sm text-muted-foreground">
              Mission District
            </Text>
          </View>
        </View>
      </View>
    </ScrollViewMapWrapper>
  );
}
