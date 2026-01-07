import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsParagraph, DocsCode } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { Map, MapControls, MapUserLocation } from "@/components/ui/map";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

const controlsCode = `import { Map, MapControls } from "@/components/ui/map";

export default function ControlsExample() {
  return (
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      <MapControls />
    </Map>
  );
}`;

export default function ControlsPage() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  return (
    <View>
      <DocsHeader
        title="Map Controls"
        description="Add zoom controls and location features to enhance map interactivity."
      />

      <DocsSection title="Zoom Controls">
        <DocsParagraph>
          The <DocsCode>MapControls</DocsCode> component provides zoom in/out buttons and a
          location button:
        </DocsParagraph>

        <ComponentPreview code={controlsCode}>
          <View className="h-[400px] rounded-lg overflow-hidden">
            <Map zoom={12} center={[-122.4194, 37.7749]}>
              <MapControls />
            </Map>
          </View>
        </ComponentPreview>
      </DocsSection>

      <DocsSection title="MapControls Props">
        <View className="gap-4">
          <View>
            <Text className="font-mono text-sm text-foreground mb-1">position</Text>
            <Text className="text-sm text-muted-foreground">
              Control position: "top-left", "top-right", "bottom-left", "bottom-right"
            </Text>
            <CodeBlock code={`<MapControls position="top-right" />`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">showZoom</Text>
            <Text className="text-sm text-muted-foreground">
              Show zoom in/out buttons (default: true)
            </Text>
            <CodeBlock code={`<MapControls showZoom={false} />`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">showLocation</Text>
            <Text className="text-sm text-muted-foreground">
              Show location button (default: true)
            </Text>
            <CodeBlock code={`<MapControls showLocation={false} />`} />
          </View>
        </View>
      </DocsSection>

      <DocsSection title="User Location">
        <DocsParagraph>
          Display the user's current location on the map with{" "}
          <DocsCode>MapUserLocation</DocsCode>:
        </DocsParagraph>

        {hasPermission && (
          <ComponentPreview
            code={`import { Map, MapUserLocation } from "@/components/ui/map";

export default function UserLocationExample() {
  return (
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      <MapUserLocation />
    </Map>
  );
}`}
          >
            <View className="h-[400px] rounded-lg overflow-hidden">
              <Map zoom={12} center={[-122.4194, 37.7749]}>
                <MapUserLocation />
              </Map>
            </View>
          </ComponentPreview>
        )}

        <DocsParagraph>
          Location permissions must be requested before using MapUserLocation:
        </DocsParagraph>

        <CodeBlock
          code={`import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function MyMap() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  return (
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      {hasPermission && <MapUserLocation />}
    </Map>
  );
}`}
        />
      </DocsSection>

      <DocsSection title="Custom Controls">
        <DocsParagraph>
          Create custom controls using the <DocsCode>useMap()</DocsCode> hook to access camera
          methods:
        </DocsParagraph>

        <CodeBlock
          code={`import { useMap } from "@/components/ui/map";
import { Pressable, Text, View } from "react-native";

function CustomControl() {
  const { cameraRef } = useMap();

  const zoomIn = () => {
    cameraRef.current?.zoomTo(
      (cameraRef.current?.getZoom() || 0) + 1,
      500
    );
  };

  return (
    <View className="absolute top-4 right-4 bg-white rounded-lg shadow">
      <Pressable
        onPress={zoomIn}
        className="px-4 py-2 active:bg-gray-100"
      >
        <Text className="font-semibold">Zoom In</Text>
      </Pressable>
    </View>
  );
}

<Map zoom={12} center={[-122.4194, 37.7749]}>
  <CustomControl />
</Map>`}
        />
      </DocsSection>
    </View>
  );
}
