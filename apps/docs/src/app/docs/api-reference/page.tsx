import {
  DocsLayout,
  DocsSection,
  DocsCode,
  DocsLink,
  DocsNote,
  DocsPropTable,
} from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference",
  description:
    "Complete API reference for all mapcn-react-native components: Map, MapMarker, MapControls, MapRoute, and more. Includes props, types, and examples.",
  keywords: [
    "react native map api",
    "maplibre api reference",
    "react native map props",
    "map component documentation",
    "marker api",
    "map controls",
  ],
  openGraph: {
    title: "API Reference - mapcn-react-native",
    description:
      "Complete API reference for all mapcn-react-native components with props, types, and usage examples.",
    type: "article",
  },
};

const anatomyCode = `<Map>
  <MapMarker coordinate={[lng, lat]}>
    <MarkerContent>
      <MarkerLabel />
    </MarkerContent>
    <MarkerPopup />
  </MapMarker>

  <MapRoute coordinates={...} />
  <MapControls />
  <MapUserLocation />
</Map>`;

const useMapCode = `const { mapRef, cameraRef, isLoaded, theme } = useMap();

// Access map instance
const center = await mapRef.current?.getCenter();`;

export default function ApiReferencePage() {
  return (
    <DocsLayout
      title="API Reference"
      description="Complete reference for all React Native map components and their props."
      prev={{ title: "Installation", href: "/docs/installation" }}
      next={{ title: "Companion App", href: "/docs/companion" }}
    >
      <DocsNote>
        <strong>Note:</strong> This library is built on top of{" "}
        <DocsLink href="https://maplibre.org/maplibre-react-native/" external>
          MapLibre React Native
        </DocsLink>
        . Components use React Native primitives (View, Text, Pressable) and
        StyleSheet for styling. Refer to the{" "}
        <DocsLink
          href="https://maplibre.org/maplibre-react-native/docs/setup/getting-started"
          external
        >
          MapLibre React Native API
        </DocsLink>{" "}
        for additional options.
      </DocsNote>

      <DocsSection title="Component Anatomy">
        <p>
          All parts of the component that you can use and combine to build your
          map.
        </p>
        <CodeBlock code={anatomyCode} showCopyButton={false} />
      </DocsSection>

      {/* Map */}
      <DocsSection title="Map">
        <p>
          The root container component that initializes MapLibre React Native
          and provides context to child components. Automatically handles theme
          switching between light and dark modes based on the device color
          scheme.
        </p>
        <DocsPropTable
          props={[
            {
              name: "children",
              type: "ReactNode",
              description:
                "Child components (markers, popups, controls, routes).",
            },
            {
              name: "center",
              type: "[number, number]",
              default: "[0, 0]",
              description:
                "Initial center coordinate [longitude, latitude].",
            },
            {
              name: "zoom",
              type: "number",
              default: "10",
              description: "Initial zoom level (0-20).",
            },
            {
              name: "styles",
              type: "{ light?: string | object; dark?: string | object }",
              description:
                "Custom map styles for light and dark themes. Overrides the default CARTO basemap tiles.",
            },
            {
              name: "className",
              type: "string",
              description: "Container style (tailwindcss).",
            },
            {
              name: "showLoader",
              type: "boolean",
              default: "true",
              description: "Show loading indicator while map initializes.",
            },
          ]}
        />
      </DocsSection>

      {/* useMap */}
      <DocsSection title="useMap">
        <p>
          A hook that provides access to the MapLibre map and camera refs, plus
          loading state and theme. Must be used within a{" "}
          <DocsCode>Map</DocsCode> component.
        </p>
        <CodeBlock code={useMapCode} language="tsx" showCopyButton={false} />
        <p>Returns an object with:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <DocsCode>mapRef</DocsCode> - Ref to MapLibre{" "}
            <DocsLink
              href="https://maplibre.org/maplibre-react-native/docs/components/general/map-view"
              external
            >
              MapView
            </DocsLink>
          </li>
          <li>
            <DocsCode>cameraRef</DocsCode> - Ref to MapLibre Camera for
            programmatic movement
          </li>
          <li>
            <DocsCode>isLoaded</DocsCode> - Boolean indicating if map is loaded
            and ready
          </li>
          <li>
            <DocsCode>theme</DocsCode> - Current theme (&quot;light&quot; or
            &quot;dark&quot;)
          </li>
        </ul>
      </DocsSection>

      {/* MapControls */}
      <DocsSection title="MapControls">
        <p>
          Renders map control buttons (zoom in/out and locate). Must be used
          inside <DocsCode>Map</DocsCode>.
        </p>
        <DocsPropTable
          props={[
            {
              name: "position",
              type: '"top-left" | "top-right" | "bottom-left" | "bottom-right"',
              default: '"bottom-right"',
              description: "Position of the controls on the map.",
            },
            {
              name: "showZoom",
              type: "boolean",
              default: "true",
              description: "Show zoom in/out buttons.",
            },
            {
              name: "showLocate",
              type: "boolean",
              default: "false",
              description:
                "Show locate button to find user's location. Requires location permissions.",
            },
            {
              name: "className",
              type: "string",
              description: "Additional styles for the controls container. (tailwindcss)",
            },
            {
              name: "onLocate",
              type: "(coords: { longitude: number; latitude: number }) => void",
              description: "Callback with user coordinates when located.",
            },
          ]}
        />
      </DocsSection>

      {/* MapMarker */}
      <DocsSection title="MapMarker">
        <p>
          A container for marker-related components. Provides context for its
          children and handles marker positioning.
        </p>
        <DocsPropTable
          props={[
            {
              name: "coordinate",
              type: "[number, number]",
              description:
                "Marker position as [longitude, latitude]. Alternative to using longitude/latitude props separately.",
            },
            {
              name: "longitude",
              type: "number",
              description:
                "Longitude coordinate. Use with latitude prop, or use coordinate instead.",
            },
            {
              name: "latitude",
              type: "number",
              description:
                "Latitude coordinate. Use with longitude prop, or use coordinate instead.",
            },
            {
              name: "children",
              type: "ReactNode",
              description:
                "Marker subcomponents (MarkerContent, MarkerPopup, MarkerLabel).",
            },
            {
              name: "label",
              type: "string",
              description:
                "Quick shorthand to add a label without using MarkerLabel component.",
            },
            {
              name: "anchor",
              type: "{ x: number; y: number }",
              default: "{ x: 0.5, y: 0.5 }",
              description:
                "Anchor point for the marker (0.0 to 1.0). Default is center.",
            },
            {
              name: "allowOverlap",
              type: "boolean",
              default: "false",
              description: "Allow marker to overlap with other markers.",
            },
            {
              name: "onPress",
              type: "() => void",
              description: "Callback when marker is pressed.",
            },
          ]}
        />
      </DocsSection>

      {/* MarkerContent */}
      <DocsSection title="MarkerContent">
        <p>
          Renders the visual content of a marker. Must be used inside{" "}
          <DocsCode>MapMarker</DocsCode>. If no children provided, renders a
          default blue dot marker.
        </p>
        <DocsPropTable
          props={[
            {
              name: "children",
              type: "ReactNode",
              description:
                "Custom marker content. Defaults to a blue dot. Can contain any React Native components.",
            },
            {
              name: "className",
              type: "string",
              description: "Additional styles for the marker container. (tailwindcss)",
            },
          ]}
        />
      </DocsSection>

      {/* MarkerPopup */}
      <DocsSection title="MarkerPopup">
        <p>
          Renders a popup (callout) attached to the marker that opens when the
          marker is pressed. Must be used inside <DocsCode>MapMarker</DocsCode>.
          Uses MapLibre&apos;s native Callout component.
        </p>
        <DocsPropTable
          props={[
            {
              name: "children",
              type: "ReactNode",
              description:
                "Popup content. Can contain any React Native components.",
            },
            {
              name: "title",
              type: "string",
              description: "Optional title text for the callout.",
            },
            {
              name: "className",
              type: "string",
              description: "Additional styles for the popup container. (tailwindcss)",
            },
          ]}
        />
      </DocsSection>

      {/* MarkerLabel */}
      <DocsSection title="MarkerLabel">
        <p>
          Renders a text label above or below the marker. Must be used inside{" "}
          <DocsCode>MarkerContent</DocsCode>.
        </p>
        <DocsPropTable
          props={[
            {
              name: "children",
              type: "ReactNode",
              description: "Label text content.",
            },
            {
              name: "className",
              type: "string",
              description: "Additional styles for the label container. (tailwindcss)",
            },
            {
              name: "classNameText",
              type: "string",
              description: "Text styles (tailwindcss)",
            },
            {
              name: "position",
              type: '"top" | "bottom"',
              default: '"top"',
              description: "Position of the label relative to the marker.",
            },
          ]}
        />
      </DocsSection>

      {/* MapRoute */}
      <DocsSection title="MapRoute">
        <p>
          Renders a polyline on the map connecting coordinate points. Must be
          used inside <DocsCode>Map</DocsCode>. Drawn using native MapLibre
          layers for optimal performance.
        </p>
        <DocsPropTable
          props={[
            {
              name: "coordinates",
              type: "Array<[number, number]>",
              description:
                "Array of [longitude, latitude] coordinate pairs defining the route.",
            },
            {
              name: "color",
              type: "string",
              default: '"#4285F4"',
              description: "Line color (CSS color value).",
            },
            {
              name: "width",
              type: "number",
              default: "3",
              description: "Line width in pixels.",
            },
            {
              name: "opacity",
              type: "number",
              default: "0.8",
              description: "Line opacity (0 to 1).",
            },
            {
              name: "dashArray",
              type: "[number, number]",
              description:
                "Dash pattern [dash length, gap length] for dashed lines.",
            },
          ]}
        />
      </DocsSection>

      {/* MapUserLocation */}
      <DocsSection title="MapUserLocation">
        <p>
          Shows the user&apos;s current location on the map with automatic
          permission handling. Must be used inside <DocsCode>Map</DocsCode>.
        </p>
        <DocsNote>
          <strong>Permissions Required:</strong> Make sure you&apos;ve
          configured location permissions in your Info.plist (iOS) and
          AndroidManifest.xml (Android). See the{" "}
          <DocsLink href="/docs/installation#configure-permissions">
            Installation guide
          </DocsLink>
          .
        </DocsNote>
        <DocsPropTable
          props={[
            {
              name: "visible",
              type: "boolean",
              default: "true",
              description: "Show user location on the map.",
            },
            {
              name: "showAccuracy",
              type: "boolean",
              default: "true",
              description: "Show accuracy circle around user location.",
            },
            {
              name: "showHeading",
              type: "boolean",
              default: "false",
              description:
                "Show heading arrow indicating device direction.",
            },
            {
              name: "animated",
              type: "boolean",
              default: "true",
              description:
                "Whether the location marker is animated between updates.",
            },
            {
              name: "minDisplacement",
              type: "number",
              description:
                "Minimum delta in meters for location updates. Helps save battery.",
            },
            {
              name: "onPress",
              type: "() => void",
              description: "Callback when user location marker is pressed.",
            },
            {
              name: "autoRequestPermission",
              type: "boolean",
              default: "true",
              description:
                "Automatically request location permissions if not granted.",
            },
          ]}
        />
      </DocsSection>

      {/* useCurrentPosition */}
      <DocsSection title="useCurrentPosition">
        <p>
          A hook re-exported from MapLibre React Native that provides the
          user&apos;s current location.
        </p>
        <CodeBlock
          code={`import { useCurrentPosition } from "@/components/ui/map";

const position = useCurrentPosition();

// position contains:
// - coords: { longitude, latitude, altitude, accuracy, ... }
// - timestamp: number`}
          language="tsx"
          showCopyButton={false}
        />
      </DocsSection>

      {/* Location Permissions */}
      <DocsSection title="Location Permissions">
        <p>
          For manual location permission handling, use <DocsCode>expo-location</DocsCode> directly.
          This is the recommended approach and is used internally by{" "}
          <DocsCode>MapUserLocation</DocsCode>.
        </p>
        <CodeBlock
          code={`import * as Location from "expo-location";
import { useEffect, useState } from "react";

function MyComponent() {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Get current position
  const getCurrentLocation = async () => {
    if (hasPermission) {
      const location = await Location.getCurrentPositionAsync({});
      console.log(location.coords.longitude, location.coords.latitude);
    }
  };

  return (
    <Map center={[-122.4194, 37.7749]} zoom={12}>
      {hasPermission && <MapUserLocation />}
    </Map>
  );
}`}
          language="tsx"
          showCopyButton={false}
        />
      </DocsSection>

      <DocsSection title="Styling">
        <p>
          All components accept <DocsCode>className</DocsCode> string props for additional
          styling using Tailwind CSS classes (via NativeWind/Uniwind). The code is
          the same for both. This allows easy customization of layout, colors,
          spacing, and more using utility-first CSS directly in your JSX.
        </p>
      </DocsSection>
    </DocsLayout>
  );
}
