import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsParagraph, DocsCode } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { Map } from "@/components/ui/map";

const basicMapCode = `import { Map } from "@/components/ui/map";
import { View } from "react-native";

export default function BasicMap() {
  return (
    <View className="flex-1">
      <Map
        zoom={12}
        center={[-122.4194, 37.7749]}
      />
    </View>
  );
}`;

export default function BasicMapPage() {
  return (
    <View>
      <DocsHeader
        title="Basic Map"
        description="Learn how to create and configure a basic map with MapLibre React Native."
      />

      <DocsSection title="Simple Map">
        <DocsParagraph>
          The <DocsCode>Map</DocsCode> component is the main container for your map. It provides
          automatic theme detection and uses Carto basemaps by default.
        </DocsParagraph>

        <ComponentPreview code={basicMapCode}>
          <View className="h-[400px] rounded-lg overflow-hidden">
            <Map zoom={12} center={[-122.4194, 37.7749]} />
          </View>
        </ComponentPreview>
      </DocsSection>

      <DocsSection title="Props">
        <View className="gap-4">
          <View>
            <Text className="font-mono text-sm text-foreground mb-1">center</Text>
            <Text className="text-sm text-muted-foreground">
              Initial center coordinates as <DocsCode>[longitude, latitude]</DocsCode>
            </Text>
            <CodeBlock code={`center={[-122.4194, 37.7749]}`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">zoom</Text>
            <Text className="text-sm text-muted-foreground">
              Initial zoom level (0-22). Higher values show more detail.
            </Text>
            <CodeBlock code={`zoom={12}`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">styles</Text>
            <Text className="text-sm text-muted-foreground">
              Custom map style URLs for light and dark themes. Defaults to Carto basemaps.
            </Text>
            <CodeBlock
              code={`styles={{
  light: "https://your-style-url/light",
  dark: "https://your-style-url/dark"
}}`}
            />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">className</Text>
            <Text className="text-sm text-muted-foreground">
              Additional Tailwind classes for styling the map container.
            </Text>
            <CodeBlock code={`className="rounded-xl border border-border"`} />
          </View>
        </View>
      </DocsSection>

      <DocsSection title="Custom Styles">
        <DocsParagraph>
          You can provide your own map style URLs for custom basemaps:
        </DocsParagraph>

        <CodeBlock
          code={`<Map
  zoom={12}
  center={[-122.4194, 37.7749]}
  styles={{
    light: "https://tiles.openfreemap.org/styles/positron",
    dark: "https://tiles.openfreemap.org/styles/dark-matter"
  }}
/>`}
        />
      </DocsSection>

      <DocsSection title="Accessing Map Context">
        <DocsParagraph>
          Use the <DocsCode>useMap()</DocsCode> hook to access the map and camera refs from any
          child component:
        </DocsParagraph>

        <CodeBlock
          code={`import { useMap } from "@/components/ui/map";

function MyMapControl() {
  const { mapRef, cameraRef, isLoaded, theme } = useMap();

  const flyToLocation = () => {
    cameraRef.current?.flyTo(
      [-122.4194, 37.7749],
      1000
    );
  };

  return (
    <Button onPress={flyToLocation} label="Fly to SF" />
  );
}`}
        />
      </DocsSection>

      <DocsSection title="Theme Support">
        <DocsParagraph>
          The map automatically switches between light and dark styles based on the device's color
          scheme. The current theme is available via the <DocsCode>useMap()</DocsCode> hook.
        </DocsParagraph>
      </DocsSection>
    </View>
  );
}
