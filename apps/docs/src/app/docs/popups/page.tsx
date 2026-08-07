import { DocsLayout, DocsSection, DocsCode, DocsNote } from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popups",
};

export default function PopupsPage() {
  const popupSource = getExampleSource("popup-example");

  return (
    <DocsLayout
      title="Popups"
      description="Display information popups when markers are pressed."
      prev={{ title: "Markers", href: "/docs/markers" }}
      next={{ title: "Routes", href: "/docs/routes" }}
    >
      <DocsSection>
        <p>
          Use <DocsCode>MarkerPopup</DocsCode> inside a{" "}
          <DocsCode>MapMarker</DocsCode> to display callouts when the marker is
          pressed. Popups are implemented using MapLibre&apos;s native Callout
          component and can contain custom React Native components.
        </p>
      </DocsSection>

      <DocsNote>
        <strong>React Native Note:</strong> Unlike the web version, standalone{" "}
        <DocsCode>MapPopup</DocsCode> components are not available in React
        Native. All popups must be attached to markers via{" "}
        <DocsCode>MarkerPopup</DocsCode>.
      </DocsNote>

      <DocsSection title="Rich Popups">
        <p>
          Build complex popups with React Native components like View, Text,
          Image, and Pressable for interactive elements. Press a marker to see
          the popup with detailed information and actions.
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
