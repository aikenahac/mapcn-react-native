import { useCallback, useId, useRef, type ReactNode } from "react";
import type { Feature } from "geojson";
import type { NativeSyntheticEvent } from "react-native";
import { MapLayer, MapSource, type MapSourceRef } from "./map-renderer";
import { useMap } from "./map";
import { circlePaintFrom, clusterStepExpression, type ClusterStep } from "@/lib/mapcn/style";
import type { Coordinate, Expression, GeoJSONInput, MapFeaturePressEvent, PointStyle } from "@/lib/mapcn/types";

export type { ClusterStep };

export interface MapClusterLayerProps {
  id?: string;
  data: GeoJSONInput;

  radius?: number;
  maxZoom?: number;
  /** MapLibre only -- see MAP_CAPABILITIES.clusterMinPoints. */
  minPoints?: number;
  clusterProperties?: Record<string, unknown>;

  cluster?: {
    color?: string;
    radius?: number;
    steps?: Array<ClusterStep>;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
  };
  count?: { color?: string; size?: number } | false;
  point?: PointStyle | false;

  onClusterPress?: (cluster: Feature, leaves: () => Promise<Array<Feature>>) => void;
  onPointPress?: (feature: Feature, event: MapFeaturePressEvent) => void;
  /** Default true: tapping a cluster eases to its expansion zoom. */
  expandOnPress?: boolean;

  beforeId?: string;
  clusterStyle?: Record<string, unknown>;
  countStyle?: Record<string, unknown>;
  pointStyle?: Record<string, unknown>;
  children?: ReactNode;
}

const DEFAULT_CLUSTER_COLOR = "#4285F4";
const DEFAULT_CLUSTER_RADIUS = 18;
const DEFAULT_POINT_STYLE: PointStyle = { color: "#4285F4", radius: 5, strokeColor: "#ffffff", strokeWidth: 1.5 };

const HAS_POINT_COUNT: Expression = ["has", "point_count"];
const NOT_HAS_POINT_COUNT: Expression = ["!", HAS_POINT_COUNT];

/**
 * Native point clustering (plan §7.4) -- one clustering GeoJSON source,
 * a cluster circle layer, a count label layer, and an unclustered-point
 * layer. Favors native clustering/layers over RN marker views entirely on
 * purpose (plan §14 performance guidance): this renders correctly at
 * 10k+ points, thousands of RN <MapMarker> views would not.
 */
export function MapClusterLayer({
  id,
  data,
  radius = 50,
  maxZoom = 14,
  minPoints,
  clusterProperties,
  cluster = {},
  count = {},
  point = DEFAULT_POINT_STYLE,
  onClusterPress,
  onPointPress,
  expandOnPress = true,
  beforeId,
  clusterStyle,
  countStyle,
  pointStyle,
  children,
}: MapClusterLayerProps) {
  const autoId = useId();
  const sourceId = id ?? `cluster-${autoId}`;
  const sourceRef = useRef<MapSourceRef | null>(null);
  const map = useMap();

  const clusterColor = cluster.steps
    ? clusterStepExpression(cluster.steps, "color", cluster.color ?? DEFAULT_CLUSTER_COLOR)
    : cluster.color ?? DEFAULT_CLUSTER_COLOR;
  const clusterRadius = cluster.steps
    ? clusterStepExpression(cluster.steps, "radius", cluster.radius ?? DEFAULT_CLUSTER_RADIUS)
    : cluster.radius ?? DEFAULT_CLUSTER_RADIUS;

  const getLeaves = useCallback(
    (clusterFeature: Feature) => async () => {
      if (!sourceRef.current) return [];
      return sourceRef.current.getClusterExpansionZoom(clusterFeature).then(() => sourceRef.current!.getClusterLeaves(clusterFeature, 1000, 0));
    },
    [],
  );

  const handlePress = useCallback(
     
    async (event: NativeSyntheticEvent<any>) => {
      const payload = event.nativeEvent;
      const feature: Feature | undefined = payload.features?.[0] ?? payload.feature;
      if (!feature) return;

      const isCluster = feature.properties?.cluster === true || feature.properties?.point_count !== undefined;
      const coordinate = (feature.geometry as { coordinates?: Coordinate }).coordinates ?? [0, 0];

      if (isCluster) {
        if (expandOnPress && sourceRef.current) {
          const zoom = await sourceRef.current.getClusterExpansionZoom(feature);
          map.flyTo(coordinate, { zoom, duration: 500 });
        }
        onClusterPress?.(feature, getLeaves(feature));
      } else {
        const point2 = payload.point ? { x: payload.point[0], y: payload.point[1] } : { x: 0, y: 0 };
        onPointPress?.(feature, { coordinate, point: point2, features: payload.features ?? [feature] });
      }
    },
    [expandOnPress, map, onClusterPress, onPointPress, getLeaves],
  );

  return (
    <MapSource
      ref={sourceRef}
      id={sourceId}
      data={data}
      cluster
      clusterRadius={radius}
      clusterMaxZoom={maxZoom}
      clusterMinPoints={minPoints}
      clusterProperties={clusterProperties}
      onPress={handlePress}
    >
      <MapLayer
        id={`${sourceId}-clusters`}
        type="circle"
        beforeId={beforeId}
        filter={HAS_POINT_COUNT}
        style={{
          circleColor: clusterColor,
          circleRadius: clusterRadius,
          circleOpacity: cluster.opacity ?? 0.85,
          ...(cluster.strokeColor ? { circleStrokeColor: cluster.strokeColor } : {}),
          ...(cluster.strokeWidth ? { circleStrokeWidth: cluster.strokeWidth } : {}),
          ...clusterStyle,
        }}
      />
      {count !== false && (
        <MapLayer
          id={`${sourceId}-count`}
          type="symbol"
          beforeId={beforeId}
          filter={HAS_POINT_COUNT}
          style={{
            textField: ["get", "point_count_abbreviated"],
            textSize: count.size ?? 12,
            textColor: count.color ?? "#ffffff",
            textAllowOverlap: true,
            textIgnorePlacement: true,
            ...countStyle,
          }}
        />
      )}
      {point !== false && (
        <MapLayer
          id={`${sourceId}-points`}
          type="circle"
          beforeId={beforeId}
          filter={NOT_HAS_POINT_COUNT}
          style={{ ...circlePaintFrom(point), ...pointStyle }}
        />
      )}
      {children}
    </MapSource>
  );
}
