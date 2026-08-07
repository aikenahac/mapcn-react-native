import { DocsLayout, DocsSection, DocsCode } from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Map",
};

export default function BasicMapPage() {
  const basicMapSource = getExampleSource("basic-map-example");

  return (
    <DocsLayout
      title="Basic Map"
      description="The simplest way to add a map to your React Native application."
      prev={{ title: "Companion App", href: "/docs/companion" }}
      next={{ title: "Map Controls", href: "/docs/controls" }}
    >
      <DocsSection>
        <p>
          The <DocsCode>Map</DocsCode> component handles MapLibre React Native setup,
          theming, and provides context for child components. Use the{" "}
          <DocsCode>center</DocsCode> and <DocsCode>zoom</DocsCode> props to set
          the initial map position.
        </p>
      </DocsSection>

      <ComponentPreview code={basicMapSource} screenshotName="basic-map.png" qrCodeName="basic-map.png" />
    </DocsLayout>
  );
}
