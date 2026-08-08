import type { ProviderId, Renderer } from "../types.js";

export interface ProviderMeta {
  id: ProviderId;
  renderer: Renderer;
  label: string;
  hint: string;
  envKey: string | null;
  buildEnvKey?: string;
  requiresKey: boolean;
  npmPackage: string;
  npmVersionRange: string;
  expoPlugin: string;
}

/**
 * CLI-local mirror of packages/shared's lib/mapcn/provider.ts style
 * catalogue -- kept intentionally minimal (no style URL resolution, that's
 * runtime behavior for the shipped `Map` component, not something the CLI
 * needs). The CLI is never a runtime dependency of a consumer project
 * (plan §2 D4), so this is duplicated rather than imported.
 */
export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  carto: {
    id: "carto",
    renderer: "maplibre",
    label: "CARTO",
    hint: "no API key, non-commercial use",
    envKey: null,
    requiresKey: false,
    npmPackage: "@maplibre/maplibre-react-native",
    npmVersionRange: "^11.3.6",
    expoPlugin: "@maplibre/maplibre-react-native",
  },
  maptiler: {
    id: "maptiler",
    renderer: "maplibre",
    label: "MapTiler",
    hint: "free tier, commercial-friendly, satellite + terrain",
    envKey: "EXPO_PUBLIC_MAPTILER_API_KEY",
    requiresKey: true,
    npmPackage: "@maplibre/maplibre-react-native",
    npmVersionRange: "^11.3.6",
    expoPlugin: "@maplibre/maplibre-react-native",
  },
  custom: {
    id: "custom",
    renderer: "maplibre",
    label: "Custom",
    hint: "bring your own style URLs",
    envKey: null,
    requiresKey: false,
    npmPackage: "@maplibre/maplibre-react-native",
    npmVersionRange: "^11.3.6",
    expoPlugin: "@maplibre/maplibre-react-native",
  },
  mapbox: {
    id: "mapbox",
    renderer: "mapbox",
    label: "Mapbox",
    hint: "richer location puck, commercial terms",
    envKey: "EXPO_PUBLIC_MAPBOX_TOKEN",
    buildEnvKey: "MAPBOX_DOWNLOADS_TOKEN",
    requiresKey: true,
    npmPackage: "@rnmapbox/maps",
    npmVersionRange: "^10.3.5",
    expoPlugin: "@rnmapbox/maps",
  },
};

export function providersForRenderer(renderer: Renderer): Array<ProviderMeta> {
  return Object.values(PROVIDERS).filter((p) => p.renderer === renderer);
}
