import { View, Text, ScrollView } from "react-native";
import { DocsHeader, DocsSection } from "@/components/docs/docs-components";

function PropTable({
  props,
}: {
  props: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
  }>;
}) {
  return (
    <View className="border border-border rounded-lg overflow-hidden mb-6">
      {props.map((prop, idx) => (
        <View
          key={prop.name}
          className={`p-4 ${idx !== props.length - 1 ? "border-b border-border" : ""} ${
            idx % 2 === 0 ? "bg-muted/20" : "bg-background"
          }`}
        >
          <View className="flex flex-row items-start justify-between mb-2">
            <Text className="font-mono text-sm font-semibold text-foreground">{prop.name}</Text>
            <Text className="font-mono text-xs text-muted-foreground">{prop.type}</Text>
          </View>
          {prop.default && (
            <Text className="text-xs text-muted-foreground mb-1">
              Default: <Text className="font-mono">{prop.default}</Text>
            </Text>
          )}
          <Text className="text-sm text-muted-foreground">{prop.description}</Text>
        </View>
      ))}
    </View>
  );
}

export default function APIReferencePage() {
  return (
    <View>
      <DocsHeader
        title="API Reference"
        description="Complete reference for all components, props, and hooks."
      />

      <DocsSection title="Map">
        <Text className="text-muted-foreground mb-4">
          Main container component for rendering MapLibre maps with context provider.
        </Text>

        <PropTable
          props={[
            {
              name: "center",
              type: "[number, number]",
              description: "Initial center coordinates as [longitude, latitude]",
            },
            {
              name: "zoom",
              type: "number",
              default: "10",
              description: "Initial zoom level (0-22)",
            },
            {
              name: "styles",
              type: "{ light: string; dark: string }",
              description: "Custom map style URLs for light and dark themes",
            },
            {
              name: "className",
              type: "string",
              description: "Additional Tailwind classes for the container",
            },
            {
              name: "children",
              type: "ReactNode",
              description: "Child components (markers, controls, routes, etc.)",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="MapMarker">
        <Text className="text-muted-foreground mb-4">
          Component for displaying markers on the map with optional labels and custom content.
        </Text>

        <PropTable
          props={[
            {
              name: "coordinate",
              type: "[number, number]",
              description: "Marker position as [longitude, latitude]",
            },
            {
              name: "label",
              type: "string",
              description: "Optional label text displayed below the marker",
            },
            {
              name: "children",
              type: "ReactNode",
              description: "Custom content to render as the marker",
            },
            {
              name: "anchor",
              type: "'center' | 'top' | 'bottom' | 'left' | 'right'",
              default: "'center'",
              description: "Anchor point for positioning the marker",
            },
            {
              name: "allowOverlap",
              type: "boolean",
              default: "true",
              description: "Whether markers can overlap each other",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="MapRoute">
        <Text className="text-muted-foreground mb-4">
          Component for rendering polylines and routes connecting multiple coordinates.
        </Text>

        <PropTable
          props={[
            {
              name: "coordinates",
              type: "Array<[number, number]>",
              description: "Array of [longitude, latitude] points defining the route",
            },
            {
              name: "color",
              type: "string",
              default: "'#3b82f6'",
              description: "Line color as hex or CSS color",
            },
            {
              name: "width",
              type: "number",
              default: "3",
              description: "Line width in pixels",
            },
            {
              name: "opacity",
              type: "number",
              default: "1",
              description: "Line opacity from 0 to 1",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="MapControls">
        <Text className="text-muted-foreground mb-4">
          Pre-built control buttons for zoom and location functionality.
        </Text>

        <PropTable
          props={[
            {
              name: "position",
              type: "'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
              default: "'bottom-right'",
              description: "Position of the controls on the map",
            },
            {
              name: "showZoom",
              type: "boolean",
              default: "true",
              description: "Show zoom in/out buttons",
            },
            {
              name: "showLocation",
              type: "boolean",
              default: "true",
              description: "Show location button",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="MapUserLocation">
        <Text className="text-muted-foreground mb-4">
          Component for displaying the user's current location on the map.
        </Text>

        <PropTable
          props={[
            {
              name: "showsUserHeadingIndicator",
              type: "boolean",
              default: "false",
              description: "Show device heading direction",
            },
            {
              name: "animated",
              type: "boolean",
              default: "true",
              description: "Animate position updates",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="useMap">
        <Text className="text-muted-foreground mb-4">
          Hook for accessing map context (refs, state, theme) from any child component.
        </Text>

        <PropTable
          props={[
            {
              name: "mapRef",
              type: "RefObject<MapViewRef>",
              description: "Reference to the MapView instance",
            },
            {
              name: "cameraRef",
              type: "RefObject<CameraRef>",
              description: "Reference to the Camera instance for animations",
            },
            {
              name: "isLoaded",
              type: "boolean",
              description: "Whether the map has finished loading",
            },
            {
              name: "theme",
              type: "'light' | 'dark'",
              description: "Current theme mode",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Types">
        <Text className="text-base font-semibold text-foreground mb-3">Coordinate</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Type alias for [longitude, latitude] tuples
        </Text>
        <View className="bg-muted/30 p-4 rounded-lg mb-6">
          <Text className="font-mono text-sm text-foreground">
            type Coordinate = [number, number]
          </Text>
        </View>

        <Text className="text-base font-semibold text-foreground mb-3">MapStyles</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Interface for custom map style URLs
        </Text>
        <View className="bg-muted/30 p-4 rounded-lg">
          <Text className="font-mono text-sm text-foreground">
            {`interface MapStyles {
  light: string;
  dark: string;
}`}
          </Text>
        </View>
      </DocsSection>
    </View>
  );
}
