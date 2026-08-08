import { useMemo, useState } from "react";
import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map, MapChoropleth, MapLegend } from "@/components/ui/mapcn";
import type { FeatureCollection } from "geojson";
import type { MapLegendData } from "@/lib/mapcn/types";

function generateNeighborhoodData(): FeatureCollection {
  const centerLng = -122.4194;
  const centerLat = 37.7749;
  const size = 0.02; // ~0.02 degrees per neighborhood

  const neighborhoods: FeatureCollection = {
    type: "FeatureCollection",
    features: [
      // Top-left
      {
        type: "Feature",
        properties: { id: "1", name: "Downtown", density: 9500 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng - size, centerLat + size],
              [centerLng, centerLat + size],
              [centerLng, centerLat],
              [centerLng - size, centerLat],
              [centerLng - size, centerLat + size],
            ],
          ],
        },
      },
      // Top-center
      {
        type: "Feature",
        properties: { id: "2", name: "Marina", density: 7800 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng, centerLat + size],
              [centerLng + size, centerLat + size],
              [centerLng + size, centerLat],
              [centerLng, centerLat],
              [centerLng, centerLat + size],
            ],
          ],
        },
      },
      // Top-right
      {
        type: "Feature",
        properties: { id: "3", name: "Presidio", density: 3200 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng + size, centerLat + size],
              [centerLng + size * 2, centerLat + size],
              [centerLng + size * 2, centerLat],
              [centerLng + size, centerLat],
              [centerLng + size, centerLat + size],
            ],
          ],
        },
      },
      // Bottom-left
      {
        type: "Feature",
        properties: { id: "4", name: "Mission", density: 8900 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng - size, centerLat],
              [centerLng, centerLat],
              [centerLng, centerLat - size],
              [centerLng - size, centerLat - size],
              [centerLng - size, centerLat],
            ],
          ],
        },
      },
      // Bottom-center
      {
        type: "Feature",
        properties: { id: "5", name: "Sunset", density: 5400 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng, centerLat],
              [centerLng + size, centerLat],
              [centerLng + size, centerLat - size],
              [centerLng, centerLat - size],
              [centerLng, centerLat],
            ],
          ],
        },
      },
      // Bottom-right
      {
        type: "Feature",
        properties: { id: "6", name: "Richmond", density: 800 },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [centerLng + size, centerLat],
              [centerLng + size * 2, centerLat],
              [centerLng + size * 2, centerLat - size],
              [centerLng + size, centerLat - size],
              [centerLng + size, centerLat],
            ],
          ],
        },
      },
    ],
  };

  return neighborhoods;
}

interface ChoroplethDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function ChoroplethDemo({ onScrollEnabledChange }: ChoroplethDemoProps) {
  const [legend, setLegend] = useState<MapLegendData | null>(null);
  const neighborhoods = useMemo(() => generateNeighborhoodData(), []);

  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border relative"
    >
      <Map defaultViewport={{ zoom: 13, center: [-122.4194, 37.7749] }}>
        <MapChoropleth
          data={neighborhoods}
          value="density"
          scale={{ type: "quantize", steps: 5 }}
          onLegendChange={setLegend}
        />
        {legend && (
          <MapLegend data={legend} title="Density" position="bottom-right" />
        )}
      </Map>
    </ScrollViewMapWrapper>
  );
}
