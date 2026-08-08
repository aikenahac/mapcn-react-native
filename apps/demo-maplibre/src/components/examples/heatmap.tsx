import { useMemo } from "react";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map } from "@/components/ui/map";
import { MapHeatmap } from "@/components/ui/map-heatmap";
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

function generateHeatmapData(): FeatureCollection {
  const rng = mulberry32(42);
  const center: [number, number] = [-122.4194, 37.7749];
  const pointCount = 300;
  const spread = 0.05;

  const features = Array.from({ length: pointCount }, () => ({
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [
        center[0] + (rng() - 0.5) * 2 * spread,
        center[1] + (rng() - 0.5) * 2 * spread,
      ] as [number, number],
    },
    properties: {
      magnitude: 1 + rng() * rng() * 5,
    },
  }));

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

interface HeatmapDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function HeatmapDemo({ onScrollEnabledChange }: HeatmapDemoProps) {
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 12, center: [-122.4194, 37.7749] }}>
        <MapHeatmap
          data={heatmapData}
          weight="magnitude"
          weightRange={[1, 6]}
          radius={[
            { zoom: 10, value: 15 },
            { zoom: 15, value: 35 },
          ]}
          intensity={0.4}
          colors={[
            { at: 0.2, color: "rgba(252,187,161,0.35)" },
            { at: 0.4, color: "rgba(251,106,74,0.45)" },
            { at: 0.6, color: "rgba(203,24,29,0.55)" },
            { at: 0.8, color: "rgba(153,18,22,0.65)" },
            { at: 1, color: "rgba(103,0,13,0.75)" },
          ]}
        />
      </Map>
    </ScrollViewMapWrapper>
  );
}
