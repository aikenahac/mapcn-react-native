import { useId, useMemo } from "react";
import type { Feature, GeoJsonProperties, MultiPolygon, Polygon, Position } from "geojson";
import { MapGeoJSON } from "./map-geojson";
import type { FillStyle, LineStyle, MapFeaturePressEvent } from "@/lib/mapcn/types";

export interface MapPolygonProps {
  id?: string;
  /** Ring array (Polygon.coordinates or MultiPolygon.coordinates), or ready GeoJSON geometry/feature. */
  coordinates?: Array<Array<Position>> | Array<Array<Array<Position>>>;
  geometry?: Polygon | MultiPolygon | Feature<Polygon | MultiPolygon>;

  fill?: FillStyle | false;
  stroke?: LineStyle | false;
  selected?: boolean;
  selectedStyle?: { fill?: FillStyle; stroke?: LineStyle };
  onPress?: (event: MapFeaturePressEvent) => void;

  properties?: GeoJsonProperties;
  beforeId?: string;
}

const DEFAULT_FILL: FillStyle = { color: "#4285F4", opacity: 0.3 };
const DEFAULT_STROKE: LineStyle = { color: "#4285F4", width: 2 };

function isMultiPolygonRings(coordinates: Array<Array<Position>> | Array<Array<Array<Position>>>): coordinates is Array<Array<Array<Position>>> {
  // A Polygon's rings are Array<Position> (each ring is [ [lng,lat], ... ]);
  // a MultiPolygon's are one level deeper (Array<Array<Position>> per polygon).
  const first = coordinates[0];
  return Array.isArray(first) && Array.isArray(first[0]) && Array.isArray((first[0] as unknown as Array<unknown>)[0]);
}

/**
 * An intent-level polygon primitive (plan §7.9) -- accepts either raw
 * rings (the ergonomic case) or a ready geometry/feature (the interop
 * case, including geometry produced by MapDrawing once that ships).
 * Internally a MapGeoJSON with fill+line, so holes and MultiPolygons work
 * for free via the underlying native source.
 */
export function MapPolygon({
  id,
  coordinates,
  geometry,
  fill = DEFAULT_FILL,
  stroke = DEFAULT_STROKE,
  selected = false,
  selectedStyle,
  onPress,
  properties,
  beforeId,
}: MapPolygonProps) {
  const autoId = useId();
  const sourceId = id ?? `polygon-${autoId}`;

  const feature = useMemo<Feature<Polygon | MultiPolygon>>(() => {
    if (geometry) {
      return geometry.type === "Feature" ? geometry : { type: "Feature", properties: properties ?? {}, geometry };
    }
    if (!coordinates) {
      throw new Error("MapPolygon requires either `coordinates` or `geometry`.");
    }
    const isMulti = isMultiPolygonRings(coordinates);
    return {
      type: "Feature",
      properties: properties ?? {},
      geometry: isMulti
        ? { type: "MultiPolygon", coordinates: coordinates as Array<Array<Array<Position>>> }
        : { type: "Polygon", coordinates: coordinates as Array<Array<Position>> },
    };
     
  }, [coordinates, geometry, properties]);

  const resolvedFill = selected && selectedStyle?.fill ? selectedStyle.fill : fill;
  const resolvedStroke = selected && selectedStyle?.stroke ? selectedStyle.stroke : stroke;

  return (
    <MapGeoJSON
      id={sourceId}
      data={feature}
      point={false}
      line={resolvedStroke}
      fill={resolvedFill}
      beforeId={beforeId}
      onFeaturePress={onPress}
    />
  );
}
