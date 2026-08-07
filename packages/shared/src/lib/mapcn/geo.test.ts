import { describe, expect, it } from "vitest";
import {
  bboxOf,
  circlePolygon,
  coordinateEquals,
  destinationPoint,
  distance,
  precomputeValues,
  stepsForRadius,
  viewportEquals,
} from "./geo";
import type { Coordinate, MapViewport } from "./types";

describe("distance", () => {
  it("returns ~0 for identical points", () => {
    const p: Coordinate = [-122.4194, 37.7749];
    expect(distance(p, p)).toBeCloseTo(0, 3);
  });

  it("matches a known great-circle distance (SF to NY, ~4130km)", () => {
    const sf: Coordinate = [-122.4194, 37.7749];
    const ny: Coordinate = [-74.006, 40.7128];
    const km = distance(sf, ny) / 1000;
    expect(km).toBeGreaterThan(4100);
    expect(km).toBeLessThan(4160);
  });
});

describe("destinationPoint", () => {
  it("moving north increases latitude and keeps longitude ~constant", () => {
    const origin: Coordinate = [0, 0];
    const [lon, lat] = destinationPoint(origin, 10_000, 0);
    expect(lat).toBeGreaterThan(0);
    expect(Math.abs(lon)).toBeLessThan(0.01);
  });

  it("round-trips distance: destinationPoint(origin, d, bearing) is ~d from origin", () => {
    const origin: Coordinate = [10, 45];
    for (const bearing of [0, 45, 90, 180, 270]) {
      const dest = destinationPoint(origin, 5000, bearing);
      expect(distance(origin, dest)).toBeCloseTo(5000, -1);
    }
  });

  it("normalizes longitude across the antimeridian", () => {
    const origin: Coordinate = [179.9, 0];
    const [lon] = destinationPoint(origin, 50_000, 90);
    expect(lon).toBeGreaterThanOrEqual(-180);
    expect(lon).toBeLessThanOrEqual(180);
  });
});

describe("stepsForRadius", () => {
  it("uses 64 steps below 100km", () => {
    expect(stepsForRadius(500)).toBe(64);
    expect(stepsForRadius(99_999)).toBe(64);
  });

  it("uses 128 steps above 100km", () => {
    expect(stepsForRadius(100_001)).toBe(128);
  });

  it("respects an explicit override", () => {
    expect(stepsForRadius(1_000_000, 32)).toBe(32);
  });
});

describe("circlePolygon", () => {
  it("produces a closed ring with the requested vertex count", () => {
    const feature = circlePolygon([0, 0], 1000, 16);
    const ring = feature.geometry.coordinates[0] as Coordinate[];
    expect(ring).toHaveLength(17); // 16 + closing point
    expect(coordinateEquals(ring[0] as Coordinate, ring[ring.length - 1] as Coordinate)).toBe(true);
  });

  it("every ring point is ~radius from the center", () => {
    const center: Coordinate = [-122.4194, 37.7749];
    const radius = 2000;
    const feature = circlePolygon(center, radius, 32);
    const ring = feature.geometry.coordinates[0] as Coordinate[];
    for (const point of ring.slice(0, -1)) {
      expect(distance(center, point)).toBeCloseTo(radius, 0);
    }
  });

  it("carries through the provided properties", () => {
    const feature = circlePolygon([0, 0], 100, 8, { id: "abc" });
    expect(feature.properties).toEqual({ id: "abc" });
  });
});

describe("bboxOf", () => {
  it("computes the bbox of a FeatureCollection", () => {
    const bbox = bboxOf({
      type: "FeatureCollection",
      features: [
        { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [1, 2] } },
        { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [-3, 4] } },
      ],
    });
    expect(bbox).toEqual([-3, 2, 1, 4]);
  });

  it("computes the bbox of a bare geometry", () => {
    expect(bboxOf({ type: "Point", coordinates: [5, 5] })).toEqual([5, 5, 5, 5]);
  });

  it("throws on empty input", () => {
    expect(() => bboxOf({ type: "FeatureCollection", features: [] })).toThrow();
  });
});

describe("viewportEquals", () => {
  const base: MapViewport = { center: [-122.4194, 37.7749], zoom: 12, bearing: 0, pitch: 0 };

  it("treats fields absent from the partial as equal", () => {
    expect(viewportEquals(base, { zoom: 12 })).toBe(true);
    expect(viewportEquals(base, {})).toBe(true);
  });

  it("detects a real center change", () => {
    expect(viewportEquals(base, { center: [0, 0] })).toBe(false);
  });

  it("detects a real zoom change", () => {
    expect(viewportEquals(base, { zoom: 13 })).toBe(false);
  });

  it("tolerates float noise from the native bridge round-trip", () => {
    expect(viewportEquals(base, { center: [-122.41940000001, 37.77489999999], zoom: 12.0000001 })).toBe(true);
  });
});

describe("precomputeValues", () => {
  it("adds a computed property without mutating the original", () => {
    const data = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: { pop: 100, area: 10 },
          geometry: { type: "Point" as const, coordinates: [0, 0] },
        },
      ],
    };
    const result = precomputeValues(data, (f) => (f.properties!.pop as number) / (f.properties!.area as number), "density");
    expect(result.features[0]!.properties!.density).toBe(10);
    expect(data.features[0]!.properties).not.toHaveProperty("density");
  });
});
