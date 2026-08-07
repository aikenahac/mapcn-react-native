import { Metadata } from "next";
import { DocsCode, DocsLayout, DocsSection } from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { SourceInstallation } from "../_components/source-installation";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Mapbox Map Source",
};

export default async function SourceMapboxPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/registry/map-mapbox.txt"),
    "utf-8",
  );

  return (
    <DocsLayout
      title="Mapbox Map Source"
      description="Full copyable source for the @rnmapbox/maps-based map component."
      prev={{ title: "MapTiler Map Source", href: "/docs/source-maptiler" }}
    >
      <DocsSection>
        <p>
          This variant switches the underlying native implementation to <DocsCode>@rnmapbox/maps</DocsCode>
          while keeping the public component API close to the default version. Use it when you need
          Mapbox-specific infrastructure, pricing, or SDK behavior.
        </p>
      </DocsSection>

      <SourceInstallation variant="mapbox" />

      <DocsSection title="Full component source">
        <p>
          Copy this file into <DocsCode>components/ui/map.tsx</DocsCode>.
        </p>
        <CodeBlock code={source} language="tsx" />
      </DocsSection>
    </DocsLayout>
  );
}
