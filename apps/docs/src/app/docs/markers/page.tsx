import {
  DocsLayout,
  DocsSection,
  DocsCode,
  DocsNote,
  DocsLink,
} from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markers",
};

export default function MarkersPage() {
  const markersSource = getExampleSource("markers-example");
  const popupSource = getExampleSource("popup-example");

  return (
    <DocsLayout
      title="Markers"
      description="Add interactive markers to your map with labels and popups."
      prev={{ title: "Map Controls", href: "/docs/controls" }}
      next={{ title: "Popups", href: "/docs/popups" }}
    >
      <DocsSection>
        <p>
          Use <DocsCode>MapMarker</DocsCode> to place markers on the map. Each
          marker can have custom content, labels, and popups that open when pressed.
        </p>
        <p className="mt-4">
          Markers accept coordinates in two formats:{" "}
          <DocsCode>coordinate=&#123;[lng, lat]&#125;</DocsCode> or separate{" "}
          <DocsCode>longitude</DocsCode> and <DocsCode>latitude</DocsCode> props.
        </p>
      </DocsSection>

      <DocsNote>
        <strong>Performance tip:</strong> <DocsCode>MapMarker</DocsCode> uses
        native MapLibre markers and works well for hundreds of markers. For very
        large datasets (1000+), see the{" "}
        <DocsLink href="/docs/advanced-usage#example-markers-via-layers">
          GeoJSON layers example
        </DocsLink>{" "}
        for better performance.
      </DocsNote>

      <DocsSection title="Basic Example">
        <p>
          Simple markers with labels and popups showing location information.
          Press a marker to see its popup.
        </p>
      </DocsSection>

      <ComponentPreview code={markersSource} screenshotName="markers.png" qrCodeName="markers.png" />

      <DocsSection title="Rich Popups">
        <p>
          Build complex popups with React Native components like View, Text,
          Image, and Pressable for interactive elements.
        </p>
      </DocsSection>

      <ComponentPreview
        code={popupSource}
        screenshotName="popup.png"
        qrCodeName="popup.png"
        className="h-[500px]"
      />
    </DocsLayout>
  );
}
