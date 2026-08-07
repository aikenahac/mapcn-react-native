import { Metadata } from "next";
import { DocsCode, DocsLayout, DocsSection } from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { SourceInstallation } from "../_components/source-installation";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Default Map Source",
};

export default async function SourceDefaultPage() {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/registry/map.txt"),
    "utf-8",
  );

  return (
    <DocsLayout
      title="Default Map Source"
      description="Full copyable source for the default MapLibre + CARTO map component."
      prev={{ title: "Gotchas", href: "/docs/gotchas" }}
      next={{ title: "MapTiler Map Source", href: "/docs/source-maptiler" }}
    >
      <DocsSection>
        <p>
          This is the direct source for the default <DocsCode>components/ui/map.tsx</DocsCode>
          file. Use it if you want to audit the implementation, copy it manually, or fork it
          into your own component system.
        </p>
      </DocsSection>

      <SourceInstallation variant="default" />

      <DocsSection title="Full component source">
        <p>
          Copy this file into <DocsCode>components/ui/map.tsx</DocsCode>.
        </p>
        <CodeBlock code={source} language="tsx" />
      </DocsSection>
    </DocsLayout>
  );
}
