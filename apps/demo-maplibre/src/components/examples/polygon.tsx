import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";
import { Map, MapPolygon } from "@/components/ui/mapcn";
import type { Position } from "geojson";

// Irregular geofence boundary around SF (not a rectangle)
const serviceAreaRing: Array<Position> = [
  [-122.4294, 37.7849], // top-left
  [-122.4194, 37.7949], // top
  [-122.4094, 37.7849], // top-right
  [-122.4144, 37.7749], // right
  [-122.4094, 37.7649], // bottom-right
  [-122.4194, 37.7549], // bottom
  [-122.4294, 37.7649], // bottom-left
  [-122.4244, 37.7749], // left
  [-122.4294, 37.7849], // close ring (same as first)
];

interface PolygonDemoProps {
  onScrollEnabledChange: (enabled: boolean) => void;
}

export function PolygonDemo({ onScrollEnabledChange }: PolygonDemoProps) {
  return (
    <ScrollViewMapWrapper
      onScrollEnabledChange={onScrollEnabledChange}
      className="h-[500px] rounded-xl overflow-hidden border border-border"
    >
      <Map defaultViewport={{ zoom: 13, center: [-122.4194, 37.7749] }}>
        <MapPolygon
          coordinates={[serviceAreaRing]}
          fill={{ color: "#22c55e", opacity: 0.25 }}
          stroke={{ color: "#16a34a", width: 2 }}
        />
      </Map>
    </ScrollViewMapWrapper>
  );
}
