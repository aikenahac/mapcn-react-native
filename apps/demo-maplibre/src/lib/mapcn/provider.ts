import type { MapRenderer } from "./types";

export type MapProviderId = "maptiler" | "carto" | "custom" | "mapbox";

export interface MapStyleDefinition {
  id: string;
  label: string;
  /** Resolved lazily so the API key is read at call time, not module init. */
  url: (ctx: { apiKey?: string }) => string;
  colorScheme?: "light" | "dark";
}

export interface MapProviderDefinition {
  id: MapProviderId;
  renderer: MapRenderer;
  label: string;
  /** Public runtime env var name. null = no key required (CARTO). */
  envKey: string | null;
  /** Extra secret needed at *build* time (Mapbox Android downloads token). */
  buildEnvKey?: string;
  requiresKey: boolean;
  attribution: string;
  docsUrl: string;
  styles: Record<string, MapStyleDefinition>;
  defaultStyle: { light: string; dark: string };
}

const carto: MapProviderDefinition = {
  id: "carto",
  renderer: "maplibre",
  label: "CARTO",
  envKey: null,
  requiresKey: false,
  attribution: "© CARTO",
  docsUrl: "https://docs.carto.com/faqs/carto-basemaps",
  styles: {
    light: {
      id: "light",
      label: "Light",
      url: () => "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    },
    dark: {
      id: "dark",
      label: "Dark",
      url: () => "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    },
    streets: {
      id: "streets",
      label: "Streets",
      url: () => "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    },
  },
  defaultStyle: { light: "light", dark: "dark" },
};

const maptiler: MapProviderDefinition = {
  id: "maptiler",
  renderer: "maplibre",
  label: "MapTiler",
  envKey: "EXPO_PUBLIC_MAPTILER_API_KEY",
  requiresKey: true,
  attribution: "© MapTiler © OpenStreetMap contributors",
  docsUrl: "https://cloud.maptiler.com/account/keys/",
  styles: {
    streets: { id: "streets", label: "Streets", url: mapTilerStyle("streets-v2") },
    light: { id: "light", label: "Light", url: mapTilerStyle("basic-v2") },
    dark: { id: "dark", label: "Dark", url: mapTilerStyle("dataviz-dark") },
    satellite: { id: "satellite", label: "Satellite", url: mapTilerStyle("satellite") },
    hybrid: { id: "hybrid", label: "Hybrid", url: mapTilerStyle("hybrid") },
    outdoors: { id: "outdoors", label: "Outdoors", url: mapTilerStyle("outdoor-v2") },
    topo: { id: "topo", label: "Topo", url: mapTilerStyle("topo-v2") },
  },
  defaultStyle: { light: "light", dark: "dark" },
};

function mapTilerStyle(styleId: string) {
  return ({ apiKey }: { apiKey?: string }) => {
    if (!apiKey) {
      throw new Error(
        `[mapcn] MapTiler style "${styleId}" requested but EXPO_PUBLIC_MAPTILER_API_KEY is not set. ` +
          "Get a free key at https://cloud.maptiler.com/account/keys/",
      );
    }
    return `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`;
  };
}

const mapbox: MapProviderDefinition = {
  id: "mapbox",
  renderer: "mapbox",
  label: "Mapbox",
  envKey: "EXPO_PUBLIC_MAPBOX_TOKEN",
  buildEnvKey: "MAPBOX_DOWNLOADS_TOKEN",
  requiresKey: true,
  attribution: "© Mapbox © OpenStreetMap contributors",
  docsUrl: "https://account.mapbox.com/access-tokens/",
  styles: {
    streets: { id: "streets", label: "Streets", url: () => "mapbox://styles/mapbox/streets-v12" },
    light: { id: "light", label: "Light", url: () => "mapbox://styles/mapbox/light-v11" },
    dark: { id: "dark", label: "Dark", url: () => "mapbox://styles/mapbox/dark-v11" },
    satellite: { id: "satellite", label: "Satellite", url: () => "mapbox://styles/mapbox/satellite-v9" },
    satelliteStreets: {
      id: "satelliteStreets",
      label: "Satellite Streets",
      url: () => "mapbox://styles/mapbox/satellite-streets-v12",
    },
    outdoors: { id: "outdoors", label: "Outdoors", url: () => "mapbox://styles/mapbox/outdoors-v12" },
    standard: { id: "standard", label: "Standard", url: () => "mapbox://styles/mapbox/standard" },
  },
  defaultStyle: { light: "light", dark: "dark" },
};

export const PROVIDERS: Record<MapProviderId, MapProviderDefinition> = {
  carto,
  maptiler,
  mapbox,
  custom: {
    id: "custom",
    renderer: "maplibre",
    label: "Custom",
    envKey: null,
    requiresKey: false,
    attribution: "",
    docsUrl: "",
    styles: {},
    defaultStyle: { light: "light", dark: "dark" },
  },
};

export function providersForRenderer(renderer: MapRenderer): MapProviderDefinition[] {
  return Object.values(PROVIDERS).filter((p) => p.renderer === renderer);
}

export function resolveStyleUrl(
  provider: MapProviderDefinition,
  styleId: string,
  apiKey?: string,
): string {
  const style = provider.styles[styleId];
  if (!style) {
    throw new Error(
      `[mapcn] Unknown style "${styleId}" for provider "${provider.id}". ` +
        `Available styles: ${Object.keys(provider.styles).join(", ")}`,
    );
  }
  return style.url({ apiKey });
}
