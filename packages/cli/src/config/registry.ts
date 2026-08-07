export const PROVIDERS = ["carto", "maptiler", "mapbox"] as const;

export type Provider = (typeof PROVIDERS)[number];

// Keep URL selection centralized so future provider-specific or shared URL
// changes happen in one place.
const REGISTRY_URLS: Record<Provider, string> = {
  carto: "https://mapcn-rn.dev/maps/map.json",
  maptiler: "https://mapcn-rn.dev/maps/map-maptiler.json",
  mapbox: "https://mapcn-rn.dev/maps/map-mapbox.json",
};

export function resolveRegistryUrl(provider: Provider): string {
  return REGISTRY_URLS[provider];
}
