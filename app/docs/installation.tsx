import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsNote, DocsParagraph } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";

export default function InstallationPage() {
  return (
    <View>
      <DocsHeader
        title="Installation"
        description="Set up MapLibre React Native with the New Architecture in your Expo or React Native project."
      />

      <DocsNote>
        <Text className="text-sm font-semibold text-foreground mb-2">
          Prerequisites
        </Text>
        <Text className="text-sm text-muted-foreground">
          This guide assumes you already have an Expo or React Native project set up with the New
          Architecture enabled. MapLibre v11 requires the New Architecture and will not work with
          the old architecture.
        </Text>
      </DocsNote>

      <DocsSection title="Step 1: Enable New Architecture">
        <DocsParagraph>
          If you haven't already enabled the New Architecture, you'll need to do so first.
        </DocsParagraph>

        <Text className="text-sm font-semibold text-foreground mb-2">For Expo (SDK 51+):</Text>
        <CodeBlock
          language="json"
          code={`// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": true
          },
          "android": {
            "newArchEnabled": true
          }
        }
      ]
    ]
  }
}`}
        />

        <Text className="text-sm font-semibold text-foreground mb-2 mt-6">
          For bare React Native:
        </Text>
        <CodeBlock
          language="bash"
          code={`# iOS
RCT_NEW_ARCH_ENABLED=1 pod install

# Android
echo "newArchEnabled=true" >> android/gradle.properties`}
        />
      </DocsSection>

      <DocsSection title="Step 2: Install MapLibre">
        <DocsParagraph>
          Install the MapLibre React Native v11 alpha package:
        </DocsParagraph>

        <CodeBlock
          language="bash"
          code={`npm install @maplibre/maplibre-react-native@next`}
        />

        <DocsParagraph>
          Or with yarn:
        </DocsParagraph>

        <CodeBlock
          language="bash"
          code={`yarn add @maplibre/maplibre-react-native@next`}
        />
      </DocsSection>

      <DocsSection title="Step 3: Install Location Services">
        <DocsParagraph>
          If you want to use location features, install expo-location:
        </DocsParagraph>

        <CodeBlock
          language="bash"
          code={`npx expo install expo-location`}
        />
      </DocsSection>

      <DocsSection title="Step 4: Configure Native Permissions">
        <DocsParagraph>
          Add the required permissions to your app.json:
        </DocsParagraph>

        <CodeBlock
          language="json"
          code={`// app.json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to show you on the map.",
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      "expo-location"
    ]
  }
}`}
        />

        <DocsNote>
          <Text className="text-sm text-foreground">
            <Text className="font-semibold">Note:</Text> NSAppTransportSecurity is required for
            loading map tiles. The New Architecture and permission changes require a rebuild:
          </Text>
          <CodeBlock
            language="bash"
            code={`npx expo prebuild --clean
npx expo run:ios
npx expo run:android`}
          />
        </DocsNote>
      </DocsSection>

      <DocsSection title="Step 5: Copy Map Components">
        <DocsParagraph>
          Copy the map component wrapper from the repository to your project:
        </DocsParagraph>

        <CodeBlock
          language="bash"
          code={`# Create the components directory if it doesn't exist
mkdir -p components/ui

# Copy the map component
# (Download from your repository or copy manually)`}
        />

        <DocsParagraph>
          The map.tsx file provides a React-friendly wrapper with context-based API, theme
          support, and reusable subcomponents.
        </DocsParagraph>
      </DocsSection>

      <DocsSection title="Verify Installation">
        <DocsParagraph>
          Create a simple test to verify everything is working:
        </DocsParagraph>

        <CodeBlock
          code={`import { Map } from "@/components/ui/map";
import { View } from "react-native";

export default function TestMap() {
  return (
    <View className="flex-1">
      <Map zoom={10} center={[-122.4194, 37.7749]} />
    </View>
  );
}`}
        />

        <DocsParagraph>
          If you see a map displayed, you're all set! Continue to the Basic Map guide to learn
          more about using the components.
        </DocsParagraph>
      </DocsSection>
    </View>
  );
}
