import type { Feature, FeatureCollection, Geometry, GeoJsonProperties, Polygon } from "geojson";
import type { Bounds, Coordinate, GeoJSONInput, MapViewport, PartialViewport } from "./types";

/** Mean Earth radius in meters (same constant Turf.js uses). */
const EARTH_RADIUS_METERS = 6_371_008.8;

export type DistanceUnit = "meters" | "kilometers" | "miles" | "feet";

const UNIT_TO_METERS: Record<DistanceUnit, number> = {
  meters: 1,
  kilometers: 1000,
  miles: 1609.344,
  feet: 0.3048,
};

export function toMeters(distance: number, unit: DistanceUnit = "meters"): number {
  return distance * UNIT_TO_METERS[unit];
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Great-circle destination point given a start coordinate, a bearing (degrees
 * clockwise from north) and a distance in meters.
 */
export function destinationPoint(
  origin: Coordinate,
  distanceMeters: number,
  bearingDegrees: number,
): Coordinate {
  const [lon, lat] = origin;
  const delta = distanceMeters / EARTH_RADIUS_METERS;
  const bearing = toRadians(bearingDegrees);
  const lat1 = toRadians(lat);
  const lon1 = toRadians(lon);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(delta) + Math.cos(lat1) * Math.sin(delta) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(delta) * Math.cos(lat1),
      Math.cos(delta) - Math.sin(lat1) * Math.sin(lat2),
    );

  // Normalize longitude to [-180, 180] so circles crossing the antimeridian
  // don't produce out-of-range coordinates.
  const normalizedLon = (((toDegrees(lon2) + 540) % 360) - 180);

  return [normalizedLon, toDegrees(lat2)];
}

/** Great-circle distance between two coordinates, in meters. */
export function distance(a: Coordinate, b: Coordinate): number {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(rLat1) * Math.cos(rLat2) * sinDLon * sinDLon;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function coordinateEquals(a: Coordinate, b: Coordinate, epsilon = 1e-9): boolean {
  return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
}

const COORDINATE_EPSILON = 1e-7;
const DEGREE_EPSILON = 1e-3;

/**
 * Compares a full viewport against a (possibly partial) one within the
 * tolerances `Map` uses to suppress camera echo -- see plan §7.1 ("loop
 * prevention"). Fields absent from `partial` are treated as equal (a
 * `{ zoom: 12 }` update should not be considered "different" just because
 * `center` wasn't specified).
 */
export function viewportEquals(a: MapViewport, partial: PartialViewport, epsilon = COORDINATE_EPSILON): boolean {
  if (partial.center && !coordinateEquals(a.center, partial.center, epsilon)) return false;
  if (partial.zoom !== undefined && Math.abs(a.zoom - partial.zoom) >= DEGREE_EPSILON) return false;
  if (partial.bearing !== undefined && Math.abs(a.bearing - partial.bearing) >= DEGREE_EPSILON) return false;
  if (partial.pitch !== undefined && Math.abs(a.pitch - partial.pitch) >= DEGREE_EPSILON) return false;
  return true;
}

/**
 * Picks a polygon resolution that stays visually smooth regardless of
 * radius: small circles don't need many points, very large ones need more
 * to avoid faceting at high zoom.
 */
export function stepsForRadius(radiusMeters: number, requested?: number): number {
  if (requested !== undefined) return requested;
  if (radiusMeters > 100_000) return 128;
  return 64;
}

/**
 * Generates a real-world-accurate circle polygon around `center`. Uses the
 * great-circle destination formula rather than a native `circle` layer
 * because circle-layer radii are in screen pixels and don't represent a
 * true geographic radius (see plan §7.8).
 *
 * Distortion near the poles and antimeridian-crossing circles (rendered as
 * a MultiPolygon) are inherent to any planar/Mercator rendering of a
 * geodesic circle and are documented, not "fixed", here.
 */
export function circlePolygon(
  center: Coordinate,
  radiusMeters: number,
  steps?: number,
  properties: GeoJsonProperties = {},
): Feature<Polygon> {
  const resolvedSteps = stepsForRadius(radiusMeters, steps);
  const ring: Array<Coordinate> = [];

  for (let i = 0; i < resolvedSteps; i++) {
    const bearing = (i * 360) / resolvedSteps;
    ring.push(destinationPoint(center, radiusMeters, bearing));
  }
  ring.push(ring[0] as Coordinate);

  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Polygon",
      coordinates: [ring],
    },
  };
}

function eachCoordinate(geometry: Geometry, visit: (coord: Coordinate) => void): void {
  switch (geometry.type) {
    case "Point":
      visit(geometry.coordinates as Coordinate);
      return;
    case "MultiPoint":
    case "LineString":
      geometry.coordinates.forEach((c) => visit(c as Coordinate));
      return;
    case "MultiLineString":
    case "Polygon":
      geometry.coordinates.forEach((ring) => ring.forEach((c) => visit(c as Coordinate)));
      return;
    case "MultiPolygon":
      geometry.coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach((c) => visit(c as Coordinate))));
      return;
    case "GeometryCollection":
      geometry.geometries.forEach((g) => eachCoordinate(g, visit));
      return;
  }
}

function eachFeature(input: GeoJSONInput, visit: (feature: Feature) => void): void {
  const data = typeof input === "string" ? (JSON.parse(input) as GeoJSONInput) : input;
  if (typeof data === "string") return;

  if (data.type === "FeatureCollection") {
    (data as FeatureCollection).features.forEach(visit);
  } else if (data.type === "Feature") {
    visit(data as Feature);
  } else {
    visit({ type: "Feature", properties: {}, geometry: data as Geometry });
  }
}

/** Bounding box of arbitrary GeoJSON input, as `[west, south, east, north]`. */
export function bboxOf(input: GeoJSONInput): Bounds {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  eachFeature(input, (feature) => {
    eachCoordinate(feature.geometry, ([lon, lat]) => {
      if (lon < west) west = lon;
      if (lon > east) east = lon;
      if (lat < south) south = lat;
      if (lat > north) north = lat;
    });
  });

  if (!Number.isFinite(west)) {
    throw new Error("bboxOf: input contains no coordinates");
  }

  return [west, south, east, north];
}

/** Alias kept for readability at call sites that think in "bounds", not "bbox". */
export const boundsOf = bboxOf;

/**
 * Computes a numeric property on every feature in a collection, returning a
 * new collection (features are shallow-cloned; original is not mutated).
 * This is the documented alternative to a runtime value-accessor callback
 * for `MapChoropleth` (see plan §7.6) — native style evaluation can't call
 * back into JS per-frame, so the value must be precomputed once.
 */
export function precomputeValues<P extends GeoJsonProperties = GeoJsonProperties>(
  data: FeatureCollection<Geometry, P>,
  compute: (feature: Feature<Geometry, P>) => number | null,
  property: string,
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: data.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        [property]: compute(feature),
      },
    })),
  };
}
