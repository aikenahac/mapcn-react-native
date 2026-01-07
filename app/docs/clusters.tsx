import { View, Text } from "react-native";
import { DocsHeader, DocsSection, DocsParagraph, DocsCode, DocsNote } from "@/components/docs/docs-components";
import { CodeBlock } from "@/components/docs/code-block";

export default function ClustersPage() {
  return (
    <View>
      <DocsHeader
        title="Marker Clustering"
        description="Group nearby markers into clusters for better performance and cleaner visualization."
      />

      <DocsNote>
        <Text className="text-sm text-foreground">
          Clustering functionality requires custom implementation using MapLibre's GeoJSON source
          and cluster properties. The examples below show how to implement clustering with the
          underlying MapLibre API.
        </Text>
      </DocsNote>

      <DocsSection title="Basic Clustering">
        <DocsParagraph>
          Create a clustered marker layer using GeoJSON source:
        </DocsParagraph>

        <CodeBlock
          code={`import { ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";

const geojsonData = {
  type: "FeatureCollection",
  features: markers.map(marker => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: marker.coordinate
    },
    properties: marker.properties
  }))
};

<Map zoom={10} center={[-122.4194, 37.7749]}>
  <ShapeSource
    id="markers"
    cluster
    clusterRadius={50}
    clusterMaxZoom={14}
    shape={geojsonData}
  >
    <SymbolLayer
      id="clusters"
      filter={["has", "point_count"]}
      style={{
        textField: "{point_count_abbreviated}",
        textSize: 14,
        textColor: "#ffffff",
        iconImage: "cluster-icon"
      }}
    />

    <SymbolLayer
      id="unclustered"
      filter={["!", ["has", "point_count"]]}
      style={{
        iconImage: "marker-icon",
        iconSize: 1
      }}
    />
  </ShapeSource>
</Map>`}
        />
      </DocsSection>

      <DocsSection title="Cluster Properties">
        <View className="gap-4">
          <View>
            <Text className="font-mono text-sm text-foreground mb-1">cluster</Text>
            <Text className="text-sm text-muted-foreground">
              Enable clustering (default: false)
            </Text>
            <CodeBlock code={`cluster={true}`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">clusterRadius</Text>
            <Text className="text-sm text-muted-foreground">
              Radius of each cluster in pixels (default: 50)
            </Text>
            <CodeBlock code={`clusterRadius={75}`} />
          </View>

          <View>
            <Text className="font-mono text-sm text-foreground mb-1">clusterMaxZoom</Text>
            <Text className="text-sm text-muted-foreground">
              Max zoom to cluster points on (default: 14)
            </Text>
            <CodeBlock code={`clusterMaxZoom={16}`} />
          </View>
        </View>
      </DocsSection>

      <DocsSection title="Custom Cluster Styling">
        <DocsParagraph>
          Style clusters based on point count with circle layers:
        </DocsParagraph>

        <CodeBlock
          code={`import { CircleLayer } from "@maplibre/maplibre-react-native";

<ShapeSource
  id="markers"
  cluster
  clusterRadius={50}
  shape={geojsonData}
>
  <CircleLayer
    id="clusters"
    filter={["has", "point_count"]}
    style={{
      circleColor: [
        "step",
        ["get", "point_count"],
        "#51bbd6", 10,
        "#f1f075", 30,
        "#f28cb1"
      ],
      circleRadius: [
        "step",
        ["get", "point_count"],
        20, 10,
        30, 30,
        40
      ]
    }}
  />

  <SymbolLayer
    id="cluster-count"
    filter={["has", "point_count"]}
    style={{
      textField: "{point_count_abbreviated}",
      textSize: 12,
      textColor: "#ffffff"
    }}
  />
</ShapeSource>`}
        />
      </DocsSection>

      <DocsSection title="Cluster Click Events">
        <DocsParagraph>
          Handle cluster clicks to zoom in or expand:
        </DocsParagraph>

        <CodeBlock
          code={`import { OnPressEvent } from "@maplibre/maplibre-react-native";

const handleClusterPress = async (event: OnPressEvent) => {
  const feature = event.features[0];
  if (feature.properties?.cluster) {
    const clusterId = feature.properties.cluster_id;
    const zoom = await mapRef.current?.getClusterExpansionZoom(
      "markers",
      clusterId
    );

    cameraRef.current?.flyTo(
      feature.geometry.coordinates,
      zoom,
      1000
    );
  }
};

<ShapeSource
  id="markers"
  cluster
  shape={geojsonData}
  onPress={handleClusterPress}
>
  {/* layers */}
</ShapeSource>`}
        />
      </DocsSection>
    </View>
  );
}
