import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsParagraph, DocsCode } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";

export default function AdvancedUsagePage() {
  return (
    <View>
      <DocsHeader
        title="Advanced Usage"
        description="Advanced patterns and techniques for complex mapping scenarios."
      />

      <DocsSection title="Camera Control">
        <DocsParagraph>
          Access camera methods directly through the <DocsCode>useMap()</DocsCode> hook:
        </DocsParagraph>

        <CodeBlock
          code={`import { useMap } from "@/components/ui/map";

function MapController() {
  const { cameraRef } = useMap();

  const flyToLocation = () => {
    cameraRef.current?.flyTo(
      [-122.4194, 37.7749],
      1000
    );
  };

  const animateCamera = () => {
    cameraRef.current?.setCamera({
      centerCoordinate: [-122.4194, 37.7749],
      zoomLevel: 15,
      pitch: 60,
      heading: 45,
      animationDuration: 2000
    });
  };

  return (
    <View className="absolute top-4 left-4 gap-2">
      <Button onPress={flyToLocation} label="Fly To SF" />
      <Button onPress={animateCamera} label="Animate Camera" />
    </View>
  );
}`}
        />
      </DocsSection>

      <DocsSection title="Map Events">
        <DocsParagraph>
          Handle map interaction events:
        </DocsParagraph>

        <CodeBlock
          code={`<Map
  zoom={12}
  center={[-122.4194, 37.7749]}
  onPress={(event) => {
    const { coordinates } = event.geometry;
    console.log("Map pressed at:", coordinates);
  }}
  onLongPress={(event) => {
    console.log("Long press:", event.geometry.coordinates);
  }}
  onRegionDidChange={() => {
    console.log("Region changed");
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Custom Layers">
        <DocsParagraph>
          Add custom MapLibre layers for advanced visualization:
        </DocsParagraph>

        <CodeBlock
          code={`import {
  ShapeSource,
  FillLayer,
  LineLayer
} from "@maplibre/maplibre-react-native";

const polygonData = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[
      [-122.43, 37.78],
      [-122.41, 37.78],
      [-122.41, 37.76],
      [-122.43, 37.76],
      [-122.43, 37.78]
    ]]
  }
};

<Map zoom={12} center={[-122.4194, 37.7749]}>
  <ShapeSource id="polygon" shape={polygonData}>
    <FillLayer
      id="polygon-fill"
      style={{
        fillColor: "#3b82f6",
        fillOpacity: 0.3
      }}
    />
    <LineLayer
      id="polygon-outline"
      style={{
        lineColor: "#3b82f6",
        lineWidth: 2
      }}
    />
  </ShapeSource>
</Map>`}
        />
      </DocsSection>

      <DocsSection title="Performance Optimization">
        <DocsParagraph>Tips for optimizing map performance:</DocsParagraph>

        <View className="gap-3">
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Use clustering</Text> for large
              numbers of markers (50+)
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Memoize marker components</Text>{" "}
              with React.memo to prevent unnecessary re-renders
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Use ShapeSource</Text> instead of
              individual markers for static data
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Limit re-renders</Text> by keeping
              map state outside of frequently updating components
            </Text>
          </View>
        </View>

        <CodeBlock
          code={`import { memo } from "react";

const MemoizedMarker = memo(({ coordinate, label }) => (
  <MapMarker coordinate={coordinate} label={label} />
));

<Map zoom={12} center={center}>
  {markers.map(marker => (
    <MemoizedMarker
      key={marker.id}
      coordinate={marker.coordinate}
      label={marker.label}
    />
  ))}
</Map>`}
        />
      </DocsSection>

      <DocsSection title="Offline Maps">
        <DocsParagraph>
          Configure offline map packs for use without network connectivity:
        </DocsParagraph>

        <CodeBlock
          code={`import { OfflineManager } from "@maplibre/maplibre-react-native";

async function downloadOfflineMap() {
  const bounds = [
    [-122.5, 37.7],
    [-122.3, 37.8]
  ];

  const pack = await OfflineManager.createPack({
    name: "san-francisco",
    styleURL: "https://your-style-url",
    bounds,
    minZoom: 10,
    maxZoom: 16
  });

  console.log("Downloaded:", pack);
}`}
        />
      </DocsSection>

      <DocsSection title="Testing">
        <DocsParagraph>
          Tips for testing components that use maps:
        </DocsParagraph>

        <CodeBlock
          code={`import { render } from "@testing-library/react-native";

jest.mock("@maplibre/maplibre-react-native", () => ({
  MapView: "MapView",
  Camera: "Camera",
  MarkerView: "MarkerView",
  ShapeSource: "ShapeSource",
}));

test("renders map with marker", () => {
  const { getByText } = render(
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      <MapMarker
        coordinate={[-122.4194, 37.7749]}
        label="Test Location"
      />
    </Map>
  );

  expect(getByText("Test Location")).toBeTruthy();
});`}
        />
      </DocsSection>
    </View>
  );
}
