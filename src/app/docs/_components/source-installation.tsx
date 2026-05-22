import { DocsCode, DocsLink, DocsNote, DocsSection } from "./docs";
import { CodeBlock } from "./code-block";
import { PackageManagerCodeBlock } from "./package-manager-code-block";

interface SourceInstallationProps {
  variant: "default" | "maptiler" | "mapbox";
}

const installCommands = {
  default: "npx mapcn-rn add",
  maptiler: "npx mapcn-rn add --provider=maptiler",
  mapbox: "npx mapcn-rn add --provider=mapbox",
};

const dependencies = {
  default: "npx expo install @maplibre/maplibre-react-native expo-location",
  maptiler: "npx expo install @maplibre/maplibre-react-native expo-location",
  mapbox: "npx expo install @rnmapbox/maps expo-location",
};

const expoConfig = {
  default: `{
  "expo": {
    "newArchEnabled": true,
    "ios": {
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        },
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to show you on the map.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs access to your location to show you on the map."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      "@maplibre/maplibre-react-native"
    ]
  }
}`,
  maptiler: `{
  "expo": {
    "newArchEnabled": true,
    "ios": {
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        },
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to show you on the map.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs access to your location to show you on the map."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      "@maplibre/maplibre-react-native"
    ]
  }
}`,
  mapbox: `{
  "expo": {
    "newArchEnabled": true,
    "ios": {
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        },
        "NSLocationWhenInUseUsageDescription": "This app needs access to your location to show you on the map.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs access to your location to show you on the map."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      "@rnmapbox/maps"
    ]
  }
}`,
};

const envVars = {
  maptiler: "EXPO_PUBLIC_MAPTILER_API_KEY=your_maptiler_key",
  mapbox: "EXPO_PUBLIC_MAPBOX_API_KEY=your_mapbox_token",
};

export async function SourceInstallation({ variant }: SourceInstallationProps) {
  return (
    <>
      {variant === "default" && (
        <DocsNote>
          <strong>Default basemap:</strong> This variant uses MapLibre React Native with CARTO
          basemaps. It is easy to drop in, but CARTO basemap licensing may not fit every
          commercial deployment. If you need a provider-backed commercial setup, use the
          MapTiler (uses maplibre base) or Mapbox variants instead.
        </DocsNote>
      )}

      {variant === "maptiler" && (
        <DocsNote>
          <strong>MapTiler key required:</strong> This variant reads <DocsCode>EXPO_PUBLIC_MAPTILER_API_KEY</DocsCode>
          at runtime. Without it, the component deliberately renders no provider style and
          warns in the console.
        </DocsNote>
      )}

      {variant === "mapbox" && (
        <DocsNote>
          <strong>Mapbox token required:</strong> This variant reads <DocsCode>EXPO_PUBLIC_MAPBOX_API_KEY</DocsCode>
          and calls <DocsCode>Mapbox.setAccessToken(...)</DocsCode> during module init.
          It also swaps the underlying implementation from MapLibre to <DocsCode>@rnmapbox/maps</DocsCode>.
        </DocsNote>
      )}

      <DocsSection title="Install via CLI">
        <p>
          If you just want the generated file in your app, use{" "}
          <DocsCode>mapcn-rn</DocsCode>. It resolves the right registry entry and
          writes the component to <DocsCode>components/ui/map.tsx</DocsCode> for you.
        </p>
        <PackageManagerCodeBlock command={installCommands[variant]} />
      </DocsSection>

      <DocsSection title="Required dependencies">
        <p>
          If you are copying the source manually instead of using the CLI, install the runtime
          packages first.
        </p>
        <PackageManagerCodeBlock command={dependencies[variant]} />
      </DocsSection>

      {(variant === "maptiler" || variant === "mapbox") && (
        <DocsSection title="Environment variables">
          <p>
            Add this to your <DocsCode>.env</DocsCode> or Expo environment configuration.
          </p>
          <CodeBlock code={envVars[variant]} language="bash" />
        </DocsSection>
      )}

      <DocsSection title="Expo config">
        <p>
          These components require a development build, not Expo Go. Make sure your Expo config
          includes location permissions and the correct native plugin.
        </p>
        <CodeBlock code={expoConfig[variant]} language="json" />
        <p>
          For more context on native setup, see the <DocsLink href="/docs/installation">installation guide</DocsLink>.
        </p>
      </DocsSection>
    </>
  );
}
