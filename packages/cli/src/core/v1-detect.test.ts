import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectV1Installation } from "./v1-detect.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapcn-v1-detect-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("detectV1Installation", () => {
  it("returns detected: false when map.tsx doesn't exist", () => {
    const result = detectV1Installation(dir, "src");
    expect(result.detected).toBe(false);
    expect(result.customized).toBe(false);
  });

  it("detects maplibre + carto v1 installation", () => {
    const mapDir = path.join(dir, "src/components/ui");
    fs.mkdirSync(mapDir, { recursive: true });
    fs.writeFileSync(
      path.join(mapDir, "map.tsx"),
      `
import { Map } from '@maplibre/maplibre-react-native';
const styleUrl = 'https://cartodb.com/style.json';
export function Map() {}
export function MapMarker() {}
export function MapControls() {}
export function MapRoute() {}
export function MapUserLocation() {}
export function useMap() {}
      `,
    );

    const result = detectV1Installation(dir, "src");
    expect(result.detected).toBe(true);
    expect(result.renderer).toBe("maplibre");
    expect(result.provider).toBe("carto");
    expect(result.customized).toBe(false);
    expect(result.mapFilePath).toBe(path.join(mapDir, "map.tsx"));
  });

  it("detects maplibre + maptiler v1 installation", () => {
    const mapDir = path.join(dir, "src/components/ui");
    fs.mkdirSync(mapDir, { recursive: true });
    fs.writeFileSync(
      path.join(mapDir, "map.tsx"),
      `
import { Map } from '@maplibre/maplibre-react-native';
const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_API_KEY;
export function Map() {}
export function MapMarker() {}
export function MapControls() {}
export function MapRoute() {}
export function MapUserLocation() {}
export function useMap() {}
      `,
    );

    const result = detectV1Installation(dir, "src");
    expect(result.detected).toBe(true);
    expect(result.renderer).toBe("maplibre");
    expect(result.provider).toBe("maptiler");
  });

  it("detects mapbox v1 installation", () => {
    const mapDir = path.join(dir, "src/components/ui");
    fs.mkdirSync(mapDir, { recursive: true });
    fs.writeFileSync(
      path.join(mapDir, "map.tsx"),
      `
import MapboxGL from '@rnmapbox/maps';
export function Map() {}
export function MapMarker() {}
export function MapControls() {}
export function MapRoute() {}
export function MapUserLocation() {}
export function useMap() {}
      `,
    );

    const result = detectV1Installation(dir, "src");
    expect(result.detected).toBe(true);
    expect(result.renderer).toBe("mapbox");
    expect(result.provider).toBe("mapbox");
  });

  it("detects customized: true when missing an expected export", () => {
    const mapDir = path.join(dir, "src/components/ui");
    fs.mkdirSync(mapDir, { recursive: true });
    fs.writeFileSync(
      path.join(mapDir, "map.tsx"),
      `
export function Map() {}
export function MapMarker() {}
export function MapControls() {}
export function MapRoute() {}
export function useMap() {}
      `,
    );

    const result = detectV1Installation(dir, "src");
    expect(result.detected).toBe(true);
    expect(result.customized).toBe(true); // Missing MapUserLocation
  });

  it("works with . as srcDir", () => {
    const mapDir = path.join(dir, "components/ui");
    fs.mkdirSync(mapDir, { recursive: true });
    fs.writeFileSync(
      path.join(mapDir, "map.tsx"),
      `
export function Map() {}
export function MapMarker() {}
export function MapControls() {}
export function MapRoute() {}
export function MapUserLocation() {}
export function useMap() {}
      `,
    );

    const result = detectV1Installation(dir, ".");
    expect(result.detected).toBe(true);
  });
});
