import {
  DocsCode,
  DocsLayout,
  DocsLink,
  DocsSection,
} from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { PackageManagerCodeBlock } from "../_components/package-manager-code-block";
import { Metadata } from "next";

const installMapboxMapCode = `npx mapcn-rn add --provider=mapbox`;
const installMaptilerMapCode = `npx mapcn-rn add --provider=maptiler`;

const mapboxApiKeyCode = `# .env
EXPO_PUBLIC_MAPBOX_API_KEY=pk...
`;

const maptilerApiKeyCode = `# .env
EXPO_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key_here
`;

export const metadata: Metadata = {
  title: "Commercial Use",
};

export default function InstallationPage() {
  return (
    <DocsLayout
      title="Commercial use"
      description="How to setup your project for commercial use."
      prev={{ title: "CLI", href: "/docs/cli" }}
      next={{ title: "API Reference", href: "/docs/api-reference" }}
    >
      <DocsSection title="CARTO Basemaps">
        <p>If you have a commercial license for CARTO basemaps, you can disregard this.</p>
      </DocsSection>

      <DocsSection title="Mapbox based component">
        <p>Run the following command to add the mapbox-based map component:</p>
        <PackageManagerCodeBlock command={installMapboxMapCode} />

        <p>Get a Mapbox API key from <DocsLink href="https://console.mapbox.com/account/access-tokens" external>console.mapbox.com/account/access-token</DocsLink>.</p>

        <p>Mapbox pricing (Maps SDK):</p>
        <ul className="list-disc list-inside mb-4">
          <li>Free tier: 25.000 Monthly Active Users</li>
          <li>Additional pricing info is available at: <DocsLink href="https://www.mapbox.com/pricing" external>Mapbox Pricing</DocsLink></li>
        </ul>

        <p>Add the API key to your environment variables:</p>
        <CodeBlock code={mapboxApiKeyCode} language="bash" />

        <p>
          This will add the mapbox-based map component to{" "}
          <DocsCode>components/ui/map.tsx</DocsCode> in your project.
        </p>
      </DocsSection>

      <DocsSection title="Maptiler based component">
        <p>Run the following command to add the map component:</p>
        <PackageManagerCodeBlock command={installMaptilerMapCode} />

        <p>Get a Maptiler API key from the <DocsLink href="https://cloud.maptiler.com/account/keys" external>Maptiler</DocsLink> website.</p>

        <p>Maptiler pricing:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Free tier: 100,000 requests/month</li>
          <li>Additional pricing info is available at: <DocsLink href="https://www.maptiler.com/cloud/pricing" external>Maptiler Pricing</DocsLink></li>
        </ul>

        <p>Add the API key to your environment variables:</p>
        <CodeBlock code={maptilerApiKeyCode} language="bash" />

        <p>
          This will add the maptiler-based map component to{" "}
          <DocsCode>components/ui/map.tsx</DocsCode> in your project.
        </p>
      </DocsSection>
    </DocsLayout>
  );
}
