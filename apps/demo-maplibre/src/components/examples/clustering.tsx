import { useMemo } from "react";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapClusterLayer } from "@/components/ui/map-cluster-layer";
import type { FeatureCollection } from "geojson";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateClusterData(): FeatureCollection {
  const rng = mulberry32(42);
  const center: [number, number] = [-122.4194, 37.7749];
  const pointCount = 5000;
  const spread = 0.15;

  const features = Array.from({ length: pointCount }, (_, i) => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [
        center[0] + (rng() - 0.5) * 2 * spread,
        center[1] + (rng() - 0.5) * 2 * spread,
      ] as [number, number],
    },
    properties: {
      id: i,
    },
  }));

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

interface ClusteringDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
  onPointSelect?: (id: string | null) => void;
}

export function ClusteringDemo({
  onScrollEnabledChange,
  onPointSelect,
}: ClusteringDemoProps) {
  const clusterData = useMemo(() => generateClusterData(), []);

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 11, center: [-122.4194, 37.7749] }}>
        <MapClusterLayer
          data={clusterData}
          cluster={{
            steps: [
              { at: 0, color: "#60a5fa", radius: 16 },
              { at: 50, color: "#3b82f6", radius: 22 },
              { at: 200, color: "#1d4ed8", radius: 28 },
            ],
          }}
          count={{ color: "#ffffff" }}
          expandOnPress
          onPointPress={(feature) =>
            onPointSelect?.(String(feature.properties?.id ?? "unknown"))
          }
        />
      </Map>
    </ScrollViewMapWrapper>
  );
}
