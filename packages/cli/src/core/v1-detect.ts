import fs from "node:fs";
import path from "node:path";
import type { ProviderId, Renderer } from "../types.js";

export interface V1Detection {
  detected: boolean;
  renderer?: Renderer;
  provider?: ProviderId;
  mapFilePath?: string;
  customized: boolean;
}

export function detectV1Installation(projectRoot: string, srcDir: string): V1Detection {
  const mapFilePath = path.join(projectRoot, srcDir, "components/ui/map.tsx");

  if (!fs.existsSync(mapFilePath)) {
    return { detected: false, customized: false };
  }

  const content = fs.readFileSync(mapFilePath, "utf8");

  // Detect renderer
  let renderer: Renderer | undefined;
  if (content.includes("@rnmapbox/maps") || content.includes("Mapbox")) {
    renderer = "mapbox";
  } else if (content.includes("@maplibre/maplibre-react-native")) {
    renderer = "maplibre";
  }

  // Detect provider (only for maplibre)
  let provider: ProviderId | undefined;
  if (renderer === "maplibre") {
    if (content.includes("cartodb.com") || content.includes("cartocdn.com")) {
      provider = "carto";
    } else if (content.includes("api.maptiler.com") || content.includes("MAPTILER")) {
      provider = "maptiler";
    } else {
      provider = "custom";
    }
  } else if (renderer === "mapbox") {
    provider = "mapbox";
  }

  // Check if customized: file should contain all expected v1 exports
  const expectedExports = ["Map", "MapMarker", "MapControls", "MapRoute", "MapUserLocation", "useMap"];
  const customized = !expectedExports.every((name) => content.includes(name));

  return { detected: true, renderer, provider, mapFilePath, customized };
}
