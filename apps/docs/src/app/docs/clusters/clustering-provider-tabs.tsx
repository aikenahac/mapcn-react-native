"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { DocsCode, DocsLink } from "../_components/docs";

type Provider = "maplibre" | "mapbox";

const providers: Array<{ id: Provider; label: string }> = [
  { id: "maplibre", label: "MapLibre" },
  { id: "mapbox", label: "Mapbox" },
];

type ClusteringProviderTabsProps = {
  mapLibreExample: ReactNode;
  mapboxExample: ReactNode;
};

export function ClusteringProviderTabs({
  mapLibreExample,
  mapboxExample,
}: ClusteringProviderTabsProps) {
  const [activeProvider, setActiveProvider] = useState<Provider>("maplibre");

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-2 h-12">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => setActiveProvider(provider.id)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              activeProvider === provider.id
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80"
            )}
            aria-pressed={activeProvider === provider.id}
          >
            {provider.label}
          </button>
        ))}
      </div>

      <div className="p-5 text-muted-foreground leading-7 space-y-5 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2">
        {activeProvider === "maplibre" ? (
          <MapLibreContent example={mapLibreExample} />
        ) : (
          <MapboxContent example={mapboxExample} />
        )}
      </div>
    </div>
  );
}

function MapLibreContent({ example }: { example: ReactNode }) {
  return (
    <>
      <p>
        For clustered datasets, provide a point{" "}
        <DocsCode>FeatureCollection</DocsCode> through a{" "}
        <DocsCode>GeoJSONSource</DocsCode>/<DocsCode>ShapeSource</DocsCode>,
        turn on source clustering, then render clustered and unclustered
        features with separate native layers. Upstream MapLibre React Native
        exposes clustering controls like <DocsCode>cluster</DocsCode>,{" "}
        <DocsCode>clusterRadius</DocsCode>, <DocsCode>clusterMinPoints</DocsCode>,{" "}
        <DocsCode>clusterMaxZoomLevel</DocsCode>, and{" "}
        <DocsCode>clusterProperties</DocsCode>, plus helper methods like{" "}
        <DocsCode>getClusterExpansionZoom</DocsCode>,{" "}
        <DocsCode>getClusterLeaves</DocsCode>, and{" "}
        <DocsCode>getClusterChildren</DocsCode> for zooming into or inspecting
        a cluster after a press event.
      </p>
      <p>
        mapcn-react-native does not wrap that API today, but you can build it
        directly with the same low-level GeoJSON layering approach shown in the{" "}
        <DocsLink href="/docs/advanced-usage#example-markers-via-layers">
          Advanced Usage GeoJSON layers example
        </DocsLink>{" "}
        and the upstream{" "}
        <DocsLink
          href="https://maplibre.org/maplibre-react-native/docs/components/sources/shape-source/"
          external
        >
          ShapeSource documentation
        </DocsLink>
        .
      </p>

      <p className="font-medium text-foreground">Possible with GeoJSON datasets</p>
      <ul>
        <li>Cluster point features when they are provided through a GeoJSON or shape source.</li>
        <li>Style clustered and unclustered output with native layers such as circle and symbol layers.</li>
        <li>Aggregate cluster metadata with <DocsCode>clusterProperties</DocsCode>.</li>
        <li>Respond to taps with source <DocsCode>onPress</DocsCode> and inspect clusters with the cluster query methods above.</li>
        <li>Tap individual unclustered GeoJSON points and read <DocsCode>event.features[0].properties</DocsCode>.</li>
        <li>Branch between cluster expansion and point selection in the same source.</li>
        <li>Trigger app actions like drawers, bottom sheets, modals, or navigation from tapped point properties.</li>
        <li>Render large point datasets more efficiently than many individual <DocsCode>MapMarker</DocsCode> components.</li>
        <li>Use GeoJSON for lines and polygons too, as rendered layers rather than clustered markers.</li>
      </ul>

      <p className="font-medium text-foreground">Minimal example</p>
      {example}

      <p className="font-medium text-foreground">Not possible or not provided here</p>
      <ul>
        <li>No first-class <DocsCode>MapClusterLayer</DocsCode> abstraction in mapcn&apos;s exported API.</li>
        <li>No automatic clustering for <DocsCode>MapMarker</DocsCode> components.</li>
        <li>No clustering for non-point GeoJSON geometries; clustering applies to point shapes.</li>
        <li>No built-in drawer, modal, bottom sheet, or router abstraction for layer-based GeoJSON points.</li>
        <li>No <DocsCode>MarkerPopup</DocsCode>, <DocsCode>MarkerLabel</DocsCode>, or arbitrary React Native marker subtree inside layer-based clusters.</li>
        <li>No per-feature React component tree or <DocsCode>MapMarker</DocsCode>-style popup behavior for source-rendered points.</li>
      </ul>
    </>
  );
}

function MapboxContent({ example }: { example: ReactNode }) {
  return (
    <>
      <p>
        For the Mapbox variant, provide a point{" "}
        <DocsCode>FeatureCollection</DocsCode> to{" "}
        <DocsCode>Mapbox.ShapeSource</DocsCode>, enable source clustering, then
        render clustered and unclustered features with layers such as{" "}
        <DocsCode>CircleLayer</DocsCode> and <DocsCode>SymbolLayer</DocsCode>.
        Upstream <DocsCode>@rnmapbox/maps</DocsCode> exposes clustering
        controls like <DocsCode>cluster</DocsCode>,{" "}
        <DocsCode>clusterRadius</DocsCode>,{" "}
        <DocsCode>clusterMaxZoomLevel</DocsCode>,{" "}
        <DocsCode>clusterProperties</DocsCode>, and source{" "}
        <DocsCode>onPress</DocsCode>, plus helper methods like{" "}
        <DocsCode>getClusterExpansionZoom</DocsCode>,{" "}
        <DocsCode>getClusterLeaves</DocsCode>, and{" "}
        <DocsCode>getClusterChildren</DocsCode> for expanding or inspecting a
        cluster.
      </p>
      <p>
        mapcn&apos;s Mapbox wrapper does not provide a first-class cluster API
        either, so clustering still needs to be built directly on top of{" "}
        <DocsCode>ShapeSource</DocsCode>. The best upstream references are the{" "}
        <DocsLink
          href="https://rnmapbox.github.io/docs/components/ShapeSource"
          external
        >
          ShapeSource documentation
        </DocsLink>{" "}
        and the{" "}
        <DocsLink
          href="https://rnmapbox.github.io/docs/examples/SymbolCircleLayer/Earthquakes"
          external
        >
          Earthquakes clustering example
        </DocsLink>
        . In a real app, the deep-link example can be swapped for Expo Router
        or React Navigation.
      </p>

      <p className="font-medium text-foreground">Possible with GeoJSON datasets</p>
      <ul>
        <li>Cluster point features when they are provided through <DocsCode>Mapbox.ShapeSource</DocsCode>.</li>
        <li>Style clustered and unclustered output with native layers such as <DocsCode>CircleLayer</DocsCode> and <DocsCode>SymbolLayer</DocsCode>.</li>
        <li>Aggregate cluster metadata with <DocsCode>clusterProperties</DocsCode>.</li>
        <li>Respond to taps with source <DocsCode>onPress</DocsCode> and inspect clusters with <DocsCode>getClusterExpansionZoom</DocsCode>, <DocsCode>getClusterLeaves</DocsCode>, and <DocsCode>getClusterChildren</DocsCode>.</li>
        <li>Tap individual unclustered GeoJSON points and read <DocsCode>event.features[0].properties</DocsCode>.</li>
        <li>Branch between cluster expansion and point selection in the same source.</li>
        <li>Trigger app actions like drawers, bottom sheets, modals, or navigation from tapped point properties.</li>
        <li>Render large point datasets more efficiently than many individual <DocsCode>MapMarker</DocsCode> components.</li>
        <li>Use GeoJSON for lines and polygons too, as rendered layers rather than clustered markers.</li>
      </ul>

      <p className="font-medium text-foreground">Minimal example</p>
      {example}

      <p className="font-medium text-foreground">Not possible or not provided here</p>
      <ul>
        <li>No first-class <DocsCode>MapClusterLayer</DocsCode> abstraction in mapcn&apos;s exported Mapbox API.</li>
        <li>No automatic clustering for <DocsCode>MapMarker</DocsCode> components.</li>
        <li>No clustering for non-point GeoJSON geometries; clustering applies to point shapes.</li>
        <li>No built-in drawer, modal, bottom sheet, or router abstraction for layer-based GeoJSON points.</li>
        <li>No <DocsCode>MarkerPopup</DocsCode>, <DocsCode>MarkerLabel</DocsCode>, or arbitrary React Native marker subtree inside layer-based clusters.</li>
        <li>No per-feature React component tree or <DocsCode>MapMarker</DocsCode>-style popup behavior for source-rendered points.</li>
      </ul>
    </>
  );
}
