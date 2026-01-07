import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsParagraph, DocsCode } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { Map, MapRoute, MapMarker } from "@/components/ui/map";

const routeCode = `import { Map, MapRoute, MapMarker } from "@/components/ui/map";

const routeCoordinates = [
  [-122.4194, 37.7749],
  [-122.4083, 37.7849],
  [-122.4294, 37.7649],
];

export default function RouteExample() {
  return (
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      <MapRoute
        coordinates={routeCoordinates}
        color="#3b82f6"
        width={4}
      />
      {routeCoordinates.map((coord, idx) => (
        <MapMarker key={idx} coordinate={coord} />
      ))}
    </Map>
  );
}`;

export default function RoutesPage() {
  const routeCoordinates: [number, number][] = [
    [-122.4194, 37.7749],
    [-122.4083, 37.7849],
    [-122.4294, 37.7649],
  ];

  return (
    <View>
      <DocsHeader
        title="Routes"
        description="Visualize paths, routes, and polylines on your map with the MapRoute component."
      />

      <DocsSection title="Basic Route">
        <DocsParagraph>
          Use <DocsCode>MapRoute</DocsCode> to draw lines connecting multiple coordinates:
        </DocsParagraph>

        <ComponentPreview code={routeCode}>
          <View className="h-[400px] rounded-lg overflow-hidden">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              <MapRoute coordinates={routeCoordinates} color="#3b82f6" width={4} />
              {routeCoordinates.map((coord, idx) => (
                <MapMarker key={idx} coordinate={coord} />
              ))}
            </Map>
          </View>
        </ComponentPreview>
      </DocsSection>

      <DocsSection title="Props">
        <View className="gap-4">
          <View>
            <Text className="font-mono text-sm text-foreground mb-1">
              coordinates (required)
            </Text>
            <Text className="text-sm text-muted-foreground">
              Array of <DocsCode>[longitude, latitude]</DocsCode> points defining the route
            </Text>
            <CodeBlock
              code={`coordinates={[
  [-122.4194, 37.7749],
  [-122.4083, 37.7849],
  [-122.4294, 37.7649]
]}`}
            />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">color</Text>
            <Text className="text-sm text-muted-foreground">
              Line color (default: "#3b82f6")
            </Text>
            <CodeBlock code={`color="#ef4444"`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">width</Text>
            <Text className="text-sm text-muted-foreground">
              Line width in pixels (default: 3)
            </Text>
            <CodeBlock code={`width={5}`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">opacity</Text>
            <Text className="text-sm text-muted-foreground">
              Line opacity 0-1 (default: 1)
            </Text>
            <CodeBlock code={`opacity={0.7}`} />
          </View>
        </View>
      </DocsSection>

      <DocsSection title="Styled Routes">
        <DocsParagraph>Customize routes with different colors and widths:</DocsParagraph>

        <CodeBlock
          code={`<MapRoute
  coordinates={coordinates}
  color="#10b981"
  width={6}
  opacity={0.8}
/>`}
        />
      </DocsSection>

      <DocsSection title="Multiple Routes">
        <DocsParagraph>Display multiple routes on the same map:</DocsParagraph>

        <CodeBlock
          code={`const routes = [
  { id: 1, coordinates: route1, color: "#3b82f6" },
  { id: 2, coordinates: route2, color: "#ef4444" },
  { id: 3, coordinates: route3, color: "#10b981" },
];

<Map zoom={12} center={[-122.4194, 37.7749]}>
  {routes.map(route => (
    <MapRoute
      key={route.id}
      coordinates={route.coordinates}
      color={route.color}
      width={4}
    />
  ))}
</Map>`}
        />
      </DocsSection>

      <DocsSection title="Navigation Routes">
        <DocsParagraph>
          Combine routes with markers to create navigation visualizations:
        </DocsParagraph>

        <CodeBlock
          code={`<Map zoom={12} center={start}>
  <MapRoute coordinates={navigationPath} color="#3b82f6" width={5} />

  <MapMarker coordinate={start} label="Start">
    <View className="w-6 h-6 bg-green-500 rounded-full" />
  </MapMarker>

  <MapMarker coordinate={end} label="Destination">
    <View className="w-6 h-6 bg-red-500 rounded-full" />
  </MapMarker>
</Map>`}
        />
      </DocsSection>
    </View>
  );
}
