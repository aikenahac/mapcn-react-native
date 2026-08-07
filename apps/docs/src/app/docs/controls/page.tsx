import { DocsLayout, DocsSection, DocsCode, DocsNote } from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map Controls",
};

export default function ControlsPage() {
  const controlsSource = getExampleSource("map-controls-example");

  return (
    <DocsLayout
      title="Map Controls"
      description="Add interactive controls to your map for zoom and user location."
      prev={{ title: "Basic Map", href: "/docs/basic-map" }}
      next={{ title: "Markers", href: "/docs/markers" }}
    >
      <DocsSection>
        <p>
          The <DocsCode>MapControls</DocsCode> component provides interactive
          controls that can be positioned on any corner of the map. Available
          controls include zoom in/out buttons and a locate button to find the
          user&apos;s current location.
        </p>
      </DocsSection>

      <DocsNote>
        <strong>Location Permissions:</strong> The locate button requires location
        permissions. Make sure you&apos;ve configured permissions in your
        Info.plist (iOS) and AndroidManifest.xml (Android). See the{" "}
        <DocsCode>MapUserLocation</DocsCode> component for automatic permission
        handling.
      </DocsNote>

      <ComponentPreview code={controlsSource} screenshotName="map-controls.png" qrCodeName="map-controls.png" />

      <DocsSection title="User Location">
        <p>
          Use the <DocsCode>MapUserLocation</DocsCode> component to show the
          user&apos;s current location on the map with automatic permission
          handling:
        </p>
        <HorizontalScrollArea className="mt-4 rounded-lg bg-muted">
          <pre className="p-4 text-sm">
            <code>{`<Map center={[0, 0]} zoom={12}>
  <MapUserLocation
    visible={true}
    showAccuracy={true}
    autoRequestPermission={true}
  />
  <MapControls showZoom showLocate />
</Map>`}</code>
          </pre>
        </HorizontalScrollArea>
      </DocsSection>
    </DocsLayout>
  );
}
