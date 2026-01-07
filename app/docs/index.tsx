import { View, Text } from "react-native";
import { Link, type Href } from "expo-router";
import { DocsHeader, DocsSection, DocsNote, DocsParagraph } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";
import { ArrowRightIcon } from "@/lib/icons";
import { Pressable } from "react-native";

export default function DocsIndex() {
  return (
    <View>
      <DocsHeader
        title="Getting Started"
        description="A complete React Native wrapper for MapLibre GL with built-in location services and powerful map controls."
      />

      <DocsNote>
        <Text className="text-sm font-semibold text-foreground mb-2">
          ⚠️ Important: MapLibre v11 Alpha Required
        </Text>
        <Text className="text-sm text-muted-foreground">
          This library is built specifically for{" "}
          <Text className="font-mono text-foreground">@maplibre/maplibre-react-native v11</Text>
          , which is currently in alpha and requires React Native's New Architecture to be enabled.
          Make sure you have the New Architecture enabled in your project before installation.
        </Text>
      </DocsNote>

      <DocsSection title="Overview">
        <DocsParagraph>
          This React Native map component library provides a declarative, context-based API
          for integrating MapLibre GL into your mobile applications. Built on top of{" "}
          @maplibre/maplibre-react-native v11, it offers a clean component interface with
          automatic theme support and powerful location features.
        </DocsParagraph>
      </DocsSection>

      <DocsSection title="Key Features">
        <View className="gap-3">
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Context-based API</Text> - Access
              map and camera refs from any child component using useMap()
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Theme-aware styling</Text> -
              Automatic light/dark mode with Carto basemaps
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Location services</Text> - Built-in
              permission handling and user location display
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Flexible markers</Text> - Support
              for labels, popups, and custom content
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Route visualization</Text> - Easy
              LineString rendering for paths and routes
            </Text>
          </View>
          <View className="flex flex-row items-start gap-3">
            <Text className="text-foreground font-bold">•</Text>
            <Text className="flex-1 text-muted-foreground">
              <Text className="font-semibold text-foreground">Map controls</Text> - Zoom buttons
              and location controls out of the box
            </Text>
          </View>
        </View>
      </DocsSection>

      <DocsSection title="Quick Example">
        <CodeBlock
          code={`import { Map, MapMarker, MapControls } from "@/components/ui/map";

export default function MyMap() {
  return (
    <Map zoom={12} center={[-122.4194, 37.7749]}>
      <MapMarker
        coordinate={[-122.4194, 37.7749]}
        label="San Francisco"
      />
      <MapControls />
    </Map>
  );
}`}
        />
      </DocsSection>

      <DocsSection title="Requirements">
        <View className="gap-2 mb-4">
          <View className="flex flex-row items-center gap-2">
            <Text className="text-foreground">•</Text>
            <Text className="text-muted-foreground">
              React Native with <Text className="font-mono text-foreground">New Architecture</Text>{" "}
              enabled
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-foreground">•</Text>
            <Text className="text-muted-foreground">
              <Text className="font-mono text-foreground">@maplibre/maplibre-react-native</Text>{" "}
              v11.0.0-alpha or higher
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-foreground">•</Text>
            <Text className="text-muted-foreground">
              <Text className="font-mono text-foreground">expo-location</Text> (for location
              features)
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2">
            <Text className="text-foreground">•</Text>
            <Text className="text-muted-foreground">
              iOS 13.4+ / Android 6.0+
            </Text>
          </View>
        </View>
      </DocsSection>

      <DocsSection>
        <Link href={"/docs/installation" as Href} asChild>
          <Pressable className="flex flex-row items-center gap-2 bg-primary px-6 py-3 rounded-lg active:opacity-70">
            <Text className="text-primary-foreground font-medium">
              Continue to Installation
            </Text>
            <ArrowRightIcon size={16} className="text-primary-foreground" />
          </Pressable>
        </Link>
      </DocsSection>
    </View>
  );
}
