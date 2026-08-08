import { Text, View } from "react-native";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";

interface LayerMarkersDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function LayerMarkersDemo({
  onScrollEnabledChange,
}: LayerMarkersDemoProps) {
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
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border relative"
    >
      <Map defaultViewport={{ zoom: 13, center: [-122.4083, 37.802] }}>
        <GeoJSONSource id="layer-markers-source" data={geojson}>
          <Layer
            id="layer-markers-circles"
            type="circle"
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
          <Layer
            id="layer-markers-labels"
            type="symbol"
            style={{
              textField: ["get", "title"],
              textSize: 12,
              textColor: "#ffffff",
              textHaloColor: "#000000",
              textHaloWidth: 1,
              textOffset: [0, 2],
            }}
          />
        </GeoJSONSource>
      </Map>

      <View className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg">
        <Text className="text-sm font-medium text-foreground mb-2">
          Features:
        </Text>
        <Text className="text-sm text-muted-foreground">
          • Circle size based on count property{"\n"}• Automatic label
          positioning{"\n"}• Efficient rendering for large datasets
        </Text>
      </View>
    </ScrollViewMapWrapper>
  );
}
