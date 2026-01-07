import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsParagraph, DocsCode } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { Map, MapMarker } from "@/components/ui/map";

const markerCode = `import { Map, MapMarker } from "@/components/ui/map";

export default function MarkerExample() {
  return (
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      <MapMarker
        coordinate={[-122.4194, 37.7749]}
        label="San Francisco"
      />
    </Map>
  );
}`;

export default function MarkersPage() {
  return (
    <View>
      <DocsHeader
        title="Markers"
        description="Add interactive markers to your map with labels, popups, and custom content."
      />

      <DocsSection title="Basic Marker">
        <DocsParagraph>
          Use the <DocsCode>MapMarker</DocsCode> component to place markers on your map:
        </DocsParagraph>

        <ComponentPreview code={markerCode}>
          <View className="h-[400px] rounded-lg overflow-hidden">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              <MapMarker coordinate={[-122.4194, 37.7749]} label="San Francisco" />
            </Map>
          </View>
        </ComponentPreview>
      </DocsSection>

      <DocsSection title="Props">
        <View className="gap-4">
          <View>
            <Text className="font-mono text-sm text-foreground mb-1">coordinate (required)</Text>
            <Text className="text-sm text-muted-foreground">
              Marker position as <DocsCode>[longitude, latitude]</DocsCode>
            </Text>
            <CodeBlock code={`coordinate={[-122.4194, 37.7749]}`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">label</Text>
            <Text className="text-sm text-muted-foreground">
              Optional label text displayed below the marker
            </Text>
            <CodeBlock code={`label="San Francisco"`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">children</Text>
            <Text className="text-sm text-muted-foreground">
              Custom React Native components to render as the marker content
            </Text>
            <CodeBlock
              code={`<MapMarker coordinate={[-122.4194, 37.7749]}>
  <View className="w-8 h-8 bg-red-500 rounded-full" />
</MapMarker>`}
            />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">anchor</Text>
            <Text className="text-sm text-muted-foreground">
              Anchor point for positioning: "center", "top", "bottom", "left", "right"
            </Text>
            <CodeBlock code={`anchor="bottom"`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">allowOverlap</Text>
            <Text className="text-sm text-muted-foreground">
              Allow markers to overlap (default: true)
            </Text>
            <CodeBlock code={`allowOverlap={false}`} />
          </View>
        </View>
      </DocsSection>

      <DocsSection title="Custom Marker Content">
        <DocsParagraph>
          You can render any React Native component as marker content:
        </DocsParagraph>

        <CodeBlock
          code={`<MapMarker coordinate={[-122.4194, 37.7749]}>
  <View className="bg-blue-500 px-3 py-2 rounded-full">
    <Text className="text-white font-semibold">
      Custom Marker
    </Text>
  </View>
</MapMarker>`}
        />
      </DocsSection>

      <DocsSection title="Multiple Markers">
        <DocsParagraph>
          Render multiple markers by mapping over an array of coordinates:
        </DocsParagraph>

        <CodeBlock
          code={`const locations = [
  { id: 1, coordinate: [-122.4194, 37.7749], label: "SF" },
  { id: 2, coordinate: [-122.4083, 37.7849], label: "North Beach" },
  { id: 3, coordinate: [-122.4294, 37.7649], label: "Mission" },
];

<Map zoom={12} center={[-122.4194, 37.7749]}>
  {locations.map(location => (
    <MapMarker
      key={location.id}
      coordinate={location.coordinate}
      label={location.label}
    />
  ))}
</Map>`}
        />
      </DocsSection>

      <DocsSection title="Interactive Markers">
        <DocsParagraph>
          Make markers interactive by wrapping content in a Pressable:
        </DocsParagraph>

        <CodeBlock
          code={`import { Pressable, Alert } from "react-native";

<MapMarker coordinate={[-122.4194, 37.7749]}>
  <Pressable
    onPress={() => Alert.alert("Marker pressed!")}
    className="bg-red-500 p-3 rounded-full active:opacity-70"
  >
    <MapPin color="white" size={20} />
  </Pressable>
</MapMarker>`}
        />
      </DocsSection>
    </View>
  );
}
