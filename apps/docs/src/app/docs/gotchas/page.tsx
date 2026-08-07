import { DocsLayout, DocsSection, DocsCode, DocsLink, DocsNote } from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gotchas",
};

const mapInScrollViewCode = `import { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { Map } from "@/components/ui/map";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";

export function MapInScrollView() {
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <ScrollView className="flex-1" scrollEnabled={scrollEnabled}>
      <View className="px-6 py-8 w-full gap-6">
        <View>
          <Text className="text-3xl font-bold mb-2">Map in ScrollView</Text>
          <Text className="text-muted-foreground">
            Scroll the page outside the map, pan and zoom inside the map.
          </Text>
        </View>

        <ScrollViewMapWrapper
          onScrollEnabledChange={setScrollEnabled}
          className="h-[500px] rounded-xl overflow-hidden border border-border"
        >
          <Map zoom={12} center={[-122.4194, 37.7749]} />
        </ScrollViewMapWrapper>
      </View>
    </ScrollView>
  );
}`;

const scrollViewWrapperCode = `import React, { useCallback, ReactNode } from "react";
import { View, ViewStyle } from "react-native";

interface ScrollViewMapWrapperProps {
  children: ReactNode;
  onScrollEnabledChange?: (enabled: boolean) => void;
  style?: ViewStyle;
  className?: string;
}

// Helper for using map components inside a ScrollView without gesture conflicts
export function ScrollViewMapWrapper({
  children,
  onScrollEnabledChange,
  style,
  className,
}: ScrollViewMapWrapperProps) {
  const handleTouchStart = useCallback(() => {
    onScrollEnabledChange?.(false);
  }, [onScrollEnabledChange]);

  const handleTouchEnd = useCallback(() => {
    onScrollEnabledChange?.(true);
  }, [onScrollEnabledChange]);

  return (
    <View
      style={style}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </View>
  );
}`;

export default function GotchasPage() {
  return (
    <DocsLayout
      title="Gotchas"
      description="Platform-specific behavior and common pitfalls when using mapcn-react-native."
      prev={{ title: "Advanced Usage", href: "/docs/advanced-usage" }}
    >
      <DocsSection title="Using Maps Inside a ScrollView (Android)">
        <p>
          On Android, embedding a <DocsCode>Map</DocsCode> inside a React Native <DocsCode>ScrollView</DocsCode>
          can cause gesture conflicts. Vertical scroll gestures from the parent ScrollView often &quot;win&quot;
          over map pan and zoom, so the map flickers while the screen scrolls.
        </p>
      </DocsSection>

      <DocsNote>
        <strong>Scope:</strong> This pattern is only needed when a map is rendered inside a <DocsCode>ScrollView</DocsCode>.
        If your map fills the screen (no parent ScrollView), you do not need any special handling.
      </DocsNote>

      <DocsSection title="Solution: ScrollView Gesture Wrapper">
        <p>
          The simplest fix is to temporarily disable the parent ScrollView while the user is interacting
          with the map area. You can do this with a small wrapper component that notifies the parent when
          touch events start and end.
        </p>

        <p>
          In the example app, this helper is implemented as <DocsCode>ScrollViewMapWrapper</DocsCode> and
          used around all maps inside a ScrollView. It is kept local to the example app and is not part of
          the public library API.
        </p>
      </DocsSection>

      <DocsSection title="Example: ScrollView Wrapper Pattern">
        <p>
          This example shows the core pattern using a dedicated wrapper around the map container. The
          ScrollView uses a <DocsCode>scrollEnabled</DocsCode> state that is toggled based on touch events
          on the map area.
        </p>

        {/* Server component with syntax highlighting + copy button */}
        <CodeBlock code={mapInScrollViewCode} />
      </DocsSection>

      <DocsSection title="Wrapper Implementation (Example App)">
        <p>
          This is the implementation used in the example app. You can copy this into your project and
          adapt it as needed. It works for both MapLibre and Mapbox versions of the components.
        </p>

        <CodeBlock code={scrollViewWrapperCode} />
      </DocsSection>

      <DocsSection title="Notes and Best Practices">
        <ul>
          <li>
            Set a fixed height for the map container when used inside a ScrollView (for example,
            <DocsCode>h-[400px]</DocsCode> or <DocsCode>h-[500px]</DocsCode>).
          </li>
          <li>
            Always re-enable scrolling in both <DocsCode>onTouchEnd</DocsCode> and
            <DocsCode>onTouchCancel</DocsCode> to avoid leaving the ScrollView disabled after an
            interrupted gesture.
          </li>
          <li>
            Wrap the immediate parent of the map rather than the entire screen, so only the map area
            controls the scroll locking behavior.
          </li>
          <li>
            Test on physical Android devices where gesture behavior is most noticeable. iOS generally
            behaves better with nested gestures, but using this pattern keeps behavior consistent across
            platforms.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Related Examples">
        <p>
          The example app applies this pattern to all map screens that are rendered inside a ScrollView,
          including <DocsLink href="/docs/routes">Routes</DocsLink>, <DocsLink href="/docs/markers">Markers</DocsLink>,
          and <DocsLink href="/docs/advanced-usage">Advanced Usage</DocsLink>.
        </p>
      </DocsSection>
    </DocsLayout>
  );
}
