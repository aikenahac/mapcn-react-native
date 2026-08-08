import { useId } from "react";
import { MapLayer, MapSource } from "./map-renderer";

export type MapRouteProps = {
  coordinates: Array<[number, number]>;
  color?: string;
  width?: number;
  opacity?: number;
  dashArray?: [number, number];
  beforeId?: string;
};

/** Renders a static polyline through `coordinates` as a native line layer. */
export function MapRoute({ coordinates, color = "#4285F4", width = 3, opacity = 0.8, dashArray, beforeId }: MapRouteProps) {
  const id = useId();
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;

  if (coordinates.length < 2) return null;

  const shape = {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates },
  };

  return (
    <MapSource id={sourceId} data={shape}>
      <MapLayer
        id={layerId}
        type="line"
        beforeId={beforeId}
        style={{
          lineColor: color,
          lineWidth: width,
          lineOpacity: opacity,
          ...(dashArray && { lineDasharray: dashArray }),
          lineJoin: "round",
          lineCap: "round",
        }}
      />
    </MapSource>
  );
}
