import {
  DocsCode,
  DocsLayout,
  DocsLink,
  DocsNote,
  DocsSection,
} from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { PackageManagerCodeBlock } from "../_components/package-manager-code-block";
import { Metadata } from "next";
import { StructuredData } from "@/components/structured-data";
import {
  getTechArticleSchema,
  getBreadcrumbSchema,
  getHowToSchema,
} from "@/lib/structured-data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const installMapCode = `npx mapcn-rn add`;
const installMapboxMapCode = `npx mapcn-rn add --provider=mapbox`;
const installMaptilerMapCode = `npx mapcn-rn add --provider=maptiler`;
const expoRunIosCode = `npx expo run:ios`;
const expoRunAndroidCode = `npx expo run:android`;

const setupPermissionsExpo = `<!-- app.json -->
{
  "expo": {
    ...
    "newArchEnabled": true,
    "ios": {
      ...
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
      ...
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      ...
      // this will show a warning for no valid plugin, but it is required
      "@maplibre/maplibre-react-native" // "@rnmapbox/maps" if using mapbox version
    ],
    ...
  }
}
`;

const setupPermissionsIOS = `<!-- ios/YourApp/Info.plist -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show it on the map</string>`;

const setupPermissionsAndroid = `<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />`;

const usageCode = `import { Map } from "@/components/ui/map";
import { View } from "react-native";

export default function BasicMapExample() {
  return (
    <View className="h-[500px] rounded-xl overflow-hidden border border-border">
      <Map zoom={12} center={[-122.4194, 37.7749]} />
    </View>
  );
}`;

export const metadata: Metadata = {
  title: "Installation",
  description:
    "Complete installation guide for mapcn-react-native. Learn how to add beautiful map components to your React Native and Expo projects.",
  keywords: [
    "react native map installation",
    "maplibre react native setup",
    "expo maps",
    "react native reusables",
    "shadcn react native",
    "nativewind/unwind maps",
  ],
  openGraph: {
    title: "Installation - mapcn-react-native",
    description:
      "Complete installation guide for mapcn-react-native. Learn how to add beautiful map components to your React Native and Expo projects.",
    type: "article",
  },
};

export default function InstallationPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", item: "/" },
    { name: "Documentation", item: "/docs" },
    { name: "Installation", item: "/docs/installation" },
  ]);

  const article = getTechArticleSchema(
    "Installation Guide - mapcn-react-native",
    "Complete installation guide for mapcn-react-native. Learn how to add beautiful map components to your React Native and Expo projects.",
    "/docs/installation"
  );

  const howTo = getHowToSchema(
    "How to Install mapcn-react-native",
    "Step-by-step guide to install and set up mapcn map components in your React Native or Expo project",
    [
      {
        name: "Install Dependencies",
        text: "Install MapLibre React Native and Expo Location packages using npx expo install",
      },
      {
        name: "Install Map Component",
        text: "Add the map component to your project using the mapcn-rn installer CLI",
      },
      {
        name: "Configure Permissions",
        text: "Set up location permissions for iOS and Android in your app configuration",
      },
      {
        name: "Use the Component",
        text: "Import and use the Map component in your React Native screens",
      },
    ]
  );

  return (
    <>
      <StructuredData data={[breadcrumbs, article, howTo]} />
      <DocsLayout
        title="Installation"
        description="How to install and set up mapcn in your React Native project."
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "CLI", href: "/docs/cli" }}
      >
      <DocsNote>
        <strong>Expo Development Client:</strong> MapLibre React Native (and Mabpox) require
        a{" "}
        <DocsLink
          href="https://docs.expo.dev/develop/development-builds/introduction/"
          external
        >
          development build
        </DocsLink>
        . They will not work with Expo Go.
      </DocsNote>

      <DocsSection title="Run a development build">
        <p>
          Use a development build to run the native map SDK on a simulator or
          device.
        </p>
        <PackageManagerCodeBlock command={expoRunIosCode} />
        <PackageManagerCodeBlock command={expoRunAndroidCode} />
      </DocsSection>

      <DocsSection title="Prerequisites">
        <p>
          A React Native project with{" "}
          <DocsLink href="https://expo.dev" external>
            Expo
          </DocsLink>{" "}
          or bare React Native. This component library works best with Expo and requires{" "}
          <DocsLink href="https://www.nativewind.dev/" external>
            NativeWind/Uniwind
          </DocsLink>{" "}
          for styling. The component code is the same for both.
        </p>
      </DocsSection>

      <DocsNote>
        <strong>Note:</strong> The map uses CARTO basemap tiles by default, which are only free for NON-COMMERCIAL use.
        For cheaper commercial use, check out the {" "}<DocsLink href="/docs/commercial-use">
            Mapbox/Maptiler based version of the component
          </DocsLink>.{" "}
        Tiles automatically switch between light and dark
        themes based on your app&apos;s color scheme.
      </DocsNote>

      <DocsSection title="Install Map Component">
        <p>There are three versions of the component:</p>
        <ul className="list-disc list-inside mb-4">
          <li>using maplibre with CARTO Basemaps (enterprise pricing for commercial use, free for non-commercial)</li>
          <li>using mapbox (free tier - pay after reaching limit)</li>
          <li>using maplibre with maptiler maps (free tier - pay after reaching limit)</li>
        </ul>
        <h2 className="font-bold text-lg">Install CARTO Basemaps-based map:</h2>
        <PackageManagerCodeBlock command={installMapCode} />

        <div className="flex flex-row items-center justify-between gap-2">
          <h2 className="font-bold text-lg">Install mapbox-based map:</h2>
          <Badge asChild>
            <Link href="/docs/commercial-use">Additionial setup</Link>
          </Badge>
        </div>
        <PackageManagerCodeBlock command={installMapboxMapCode} />

        <div className="flex flex-row items-center justify-between gap-2">
          <h2 className="font-bold text-lg">Install maptiler map (uses maplibre base):</h2>
          <Badge asChild>
            <Link href="/docs/commercial-use">Additionial setup</Link>
          </Badge>
        </div>
        <PackageManagerCodeBlock command={installMaptilerMapCode} />
        <p>
          This will add the map component to{" "}
          <DocsCode>components/ui/map.tsx</DocsCode> in your project.
        </p>

        <p>
          Check out the <DocsLink href="/docs/commercial-use">commercial use page</DocsLink> for more information and additional setup steps.
        </p>
        <p>
          For the full wrapper CLI flow, including provider selection, see the{" "}
          <DocsLink href="/docs/cli">CLI page</DocsLink>.
        </p>
      </DocsSection>

      <DocsSection title="Configure Permissions">
        <p>Under plugins, you cannot have both maplibre and rnmapbox packages, and it will throw an error if both are inside the app.</p>
        <p>
          If you plan to use location features, configure permissions for iOS and
          Android:
        </p>

        <h4 className="font-semibold mt-6 mb-3 text-sm">Expo (app.json)</h4>
        <CodeBlock code={setupPermissionsExpo} language="json" />

        <h3 className="font-semibold mt-6 mb-3">Using Bare React Native</h3>

        <h4 className="font-semibold mt-6 mb-3 text-sm">iOS (Info.plist)</h4>
        <CodeBlock code={setupPermissionsIOS} language="xml" />

        <h4 className="font-semibold mt-6 mb-3 text-sm">Android (AndroidManifest.xml)</h4>
        <CodeBlock code={setupPermissionsAndroid} language="xml" />
      </DocsSection>

      <DocsSection title="Usage">
        <p>Import and use the map component in your screens:</p>
        <CodeBlock code={usageCode} />
      </DocsSection>
      </DocsLayout>
    </>
  );
}
