import { Metadata } from "next";
import {
  DocsCode,
  DocsLayout,
  DocsLink,
  DocsNote,
  DocsSection,
} from "../_components/docs";
import { PackageManagerCodeBlock } from "../_components/package-manager-code-block";

const interactiveInstallCommand = "npx mapcn-rn add";
const cartoInstallCommand = "npx mapcn-rn add --provider=carto";
const maptilerInstallCommand = "npx mapcn-rn add --provider=maptiler";
const mapboxInstallCommand = "npx mapcn-rn add --provider=mapbox";

export const metadata: Metadata = {
  title: "CLI",
  description:
    "Use the mapcn-rn CLI to install the React Native map component with the provider you want.",
};

export default function CliPage() {
  return (
    <DocsLayout
      title="CLI"
      description="Install mapcn with a single command and choose your provider when you need it."
      prev={{ title: "Installation", href: "/docs/installation" }}
      next={{ title: "Commercial use", href: "/docs/commercial-use" }}
    >
      <DocsSection>
        <p>
          <DocsCode>mapcn-rn</DocsCode> is a thin wrapper around the React Native
          Reusables CLI. It asks for your map provider, resolves the correct
          registry URL, and installs the component into{" "}
          <DocsCode>components/ui/map.tsx</DocsCode>.
        </p>
      </DocsSection>

      <DocsSection title="Interactive install">
        <p>
          Run the CLI with no flags if you want to choose the provider
          interactively.
        </p>
        <PackageManagerCodeBlock command={interactiveInstallCommand} />
      </DocsSection>

      <DocsSection title="Pick a provider up front">
        <p>
          If you already know which provider you want, pass it directly and skip
          the prompt.
        </p>

        <h3 className="font-semibold text-foreground">CARTO</h3>
        <PackageManagerCodeBlock command={cartoInstallCommand} />

        <h3 className="font-semibold text-foreground">MapTiler</h3>
        <PackageManagerCodeBlock command={maptilerInstallCommand} />

        <h3 className="font-semibold text-foreground">Mapbox</h3>
        <PackageManagerCodeBlock command={mapboxInstallCommand} />
      </DocsSection>

      <DocsSection title="Provider notes">
        <ul>
          <li>
            <DocsCode>carto</DocsCode> uses the default MapLibre-based component
            with CARTO basemaps.
          </li>
          <li>
            <DocsCode>maptiler</DocsCode> keeps the MapLibre setup and switches
            the basemap provider.
          </li>
          <li>
            <DocsCode>mapbox</DocsCode> switches the native implementation to{" "}
            <DocsCode>@rnmapbox/maps</DocsCode>.
          </li>
        </ul>
      </DocsSection>

      <DocsNote>
        Native setup still matters after install. For permissions and Expo
        configuration, see the{" "}
        <DocsLink href="/docs/installation">installation guide</DocsLink>. For
        provider-specific keys and commercial guidance, see{" "}
        <DocsLink href="/docs/commercial-use">commercial use</DocsLink>.
      </DocsNote>
    </DocsLayout>
  );
}
