import {
  DocsLayout,
  DocsSection,
  DocsCode,
  DocsNote,
} from "../_components/docs";
import { CodeBlock } from "../_components/code-block";
import { getExampleSource } from "@/lib/get-example-source";
import { Metadata } from "next";
import { ClusteringProviderTabs } from "./clustering-provider-tabs";

export const metadata: Metadata = {
  title: "Clusters",
};

export default async function ClustersPage() {
  const mapLibreExampleSource = getExampleSource("geojson-tap-maplibre-example");
  const mapboxExampleSource = getExampleSource("geojson-tap-mapbox-example");

  return (
    <DocsLayout
      title="Clusters"
      description="Clustering large datasets on React Native maps."
      prev={{ title: "Routes", href: "/docs/routes" }}
      next={{ title: "Advanced Usage", href: "/docs/advanced-usage" }}
    >
      <DocsNote>
        <strong>Wrapper limitation:</strong> The <DocsCode>MapClusterLayer</DocsCode>{" "}
        component from the web version is not exposed by mapcn&apos;s wrappers.
        Clustering is still possible in both the MapLibre and Mapbox variants
        when you drop down to their raw GeoJSON source and layer APIs.
      </DocsNote>

      <DocsSection title="GeoJSON Clustering">
        <ClusteringProviderTabs
          mapLibreExample={
            <CodeBlock code={mapLibreExampleSource} language="tsx" />
          }
          mapboxExample={<CodeBlock code={mapboxExampleSource} language="tsx" />}
        />
      </DocsSection>
    </DocsLayout>
  );
}
