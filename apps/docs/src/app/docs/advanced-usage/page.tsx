import {
  DocsLayout,
  DocsSection,
  DocsCode,
  DocsLink,
  DocsNote,
} from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { CodeBlock } from "../_components/code-block";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Usage",
};

const useMapCode = `import { Map, useMap } from "@/components/ui/map";
import { View } from "react-native";
import { useEffect } from "react";

// For child components inside Map, use the useMap hook
function MapContent() {
  const { mapRef, cameraRef, isLoaded } = useMap();

  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const handleRegionChange = () => {
      mapRef.current?.getCenter().then((center) => {
        console.log("Map center:", center);
      });
    };

    // Access MapLibre methods via mapRef
    handleRegionChange();
  }, [mapRef, isLoaded]);

  return null;
}

// Usage
<Map center={[-74.006, 40.7128]} zoom={10}>
  <MapContent />
</Map>`;

export default function AdvancedPage() {
  const advancedSource = getExampleSource("advanced-usage-example");
  const customLayerSource = getExampleSource("custom-layer-example");
  const layerMarkersSource = getExampleSource("layer-markers-example");

  return (
    <DocsLayout
      title="Advanced Usage"
      description="Access the underlying MapLibre GL instance for advanced customization."
      prev={{ title: "Clusters", href: "/docs/clusters" }}
    >
      <DocsSection>
        <p>
          Access the underlying MapLibre map instance to use any feature from
          the MapLibre React Native API.
        </p>
      </DocsSection>

      <DocsNote>
        <strong>Tip:</strong> Check the{" "}
        <DocsLink
          href="https://maplibre.org/maplibre-react-native/"
          external
        >
          MapLibre React Native documentation
        </DocsLink>{" "}
        for the full list of available methods and events.
      </DocsNote>

      <DocsSection title="Using the Hook">
        <p>
          For child components rendered inside <DocsCode>Map</DocsCode>, use the{" "}
          <DocsCode>useMap</DocsCode> hook to access the map instance and listen
          to events.
        </p>
        <CodeBlock code={useMapCode} />
      </DocsSection>

      <DocsSection title="Example: Dynamic Layer Toggling">
        <p>
          This example shows how to toggle map layers dynamically with React
          state. Control which routes and markers are visible on the map.
        </p>
      </DocsSection>

      <ComponentPreview
        code={advancedSource}
        screenshotName="advanced-usage.png"
        qrCodeName="advanced-usage.png"
      />

      <DocsSection title="Example: Custom GeoJSON Layer">
        <p>
          Add custom GeoJSON data as layers with fill and outline styles using
          MapLibre&apos;s native layer system.
        </p>
      </DocsSection>

      <ComponentPreview
        code={customLayerSource}
        screenshotName="custom-layer.png"
        qrCodeName="custom-layer.png"
      />

      <DocsSection title="Example: Markers via Layers">
        <p>
          When displaying hundreds or thousands of markers, use GeoJSON layers
          with <DocsCode>CircleLayer</DocsCode> and <DocsCode>SymbolLayer</DocsCode>{" "}
          instead of <DocsCode>MapMarker</DocsCode> components for better performance.
        </p>
      </DocsSection>

      <ComponentPreview
        code={layerMarkersSource}
        screenshotName="layer-markers.png"
        qrCodeName="layer-markers.png"
      />

      <DocsSection title="Extend to Build">
        <p>You can extend this to build custom features like:</p>
        <ul>
          <li>
            <strong>Real-time tracking</strong> - Live location updates for
            delivery, rides, or fleet management
          </li>
          <li>
            <strong>Geofencing</strong> - Trigger actions when users enter or
            leave specific areas
          </li>
          <li>
            <strong>Heatmaps</strong> - Visualize density data like population,
            crime, or activity hotspots
          </li>
          <li>
            <strong>Drawing tools</strong> - Let users draw polygons, lines, or
            place markers for custom areas
          </li>
          <li>
            <strong>3D buildings</strong> - Extrude building footprints for
            urban visualization
          </li>
          <li>
            <strong>Animations</strong> - Animate markers along routes or create
            fly-through experiences
          </li>
          <li>
            <strong>Custom data layers</strong> - Overlay weather, traffic, or
            satellite imagery
          </li>
        </ul>
      </DocsSection>
    </DocsLayout>
  );
}
