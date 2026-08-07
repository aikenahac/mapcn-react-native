import { Metadata } from "next";
import { DocsCode, DocsLayout, DocsSection } from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { SourceInstallation } from "../_components/source-installation";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "MapTiler Map Source",
};

export default async function SourceMaptilerPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/registry/map-maptiler.txt"),
    "utf-8",
  );

  return (
    <DocsLayout
      title="MapTiler Map Source"
      description="Full copyable source for the MapLibre + MapTiler map component."
      prev={{ title: "Default Map Source", href: "/docs/source-default" }}
      next={{ title: "Mapbox Map Source", href: "/docs/source-mapbox" }}
    >
      <DocsSection>
        <p>
          This variant keeps the MapLibre-based API but swaps the basemap provider to MapTiler.
          It is the version to use when you want a provider-backed commercial path without moving
          to the Mapbox SDK.
        </p>
      </DocsSection>

      <SourceInstallation variant="maptiler" />

      <DocsSection title="Full component source">
        <p>
          Copy this file into <DocsCode>components/ui/map.tsx</DocsCode>.
        </p>
        <CodeBlock code={source} language="tsx" />
      </DocsSection>
    </DocsLayout>
  );
}
