import { defineComponent, defineRegistry } from "./src/manifest";

/**
 * The mapcn-rn component registry. Two components exist today because two
 * components have actually been built (Phase 2) -- `marker`/`popup`/
 * `controls`/`route`/`geojson`/`cluster`/... land here as Phases 5-9 split
 * them out of map.tsx and build them for the first time. This file is
 * never allowed to describe a component that doesn't exist on disk yet
 * (registry:check's "missing source files" validator enforces that).
 */
export default defineRegistry({
  version: "2.0.0-alpha.0",
  schemaVersion: 2,
  homepage: "https://mapcn-rn.dev",
  components: [
    defineComponent({
      name: "core",
      title: "Core",
      description: "Renderer-independent types, geo/scale/color utilities, and the provider registry that every other mapcn component depends on.",
      category: "core",
      docsSlug: "core",
      source: "shared",
      files: [
        { from: "lib/mapcn/types.ts", to: "@lib/mapcn/types.ts" },
        { from: "lib/mapcn/geo.ts", to: "@lib/mapcn/geo.ts" },
        { from: "lib/mapcn/colors.ts", to: "@lib/mapcn/colors.ts" },
        { from: "lib/mapcn/scale.ts", to: "@lib/mapcn/scale.ts" },
        { from: "lib/mapcn/provider.ts", to: "@lib/mapcn/provider.ts" },
        { from: "components/ui/map-types.ts", to: "@ui/map-types.ts" },
      ],
      devDependencies: ["@types/geojson@^7946.0.0"],
    }),
    defineComponent({
      name: "map",
      title: "Map",
      description: "The core map container: controlled/uncontrolled viewport, provider-based styling, and the useMap() imperative camera API.",
      category: "core",
      docsSlug: "map",
      source: "per-renderer",
      renderers: ["maplibre", "mapbox"],
      registryDependencies: ["core"],
      filesByRenderer: {
        maplibre: [
          { path: "components/ui/map.tsx" },
          { path: "components/ui/map-renderer.tsx", internal: true },
        ],
        mapbox: [
          { path: "components/ui/map.tsx" },
          { path: "components/ui/map-renderer.tsx", internal: true },
        ],
      },
      dependenciesByRenderer: {
        maplibre: ["@maplibre/maplibre-react-native@^11.3.6"],
        mapbox: ["@rnmapbox/maps@^10.3.5"],
      },
      expoPluginsByRenderer: {
        maplibre: ["@maplibre/maplibre-react-native"],
        mapbox: ["@rnmapbox/maps"],
      },
      capabilities: {
        mapbox: {
          note: "MapView cannot render arbitrary RN children as overlays; Map uses an internal overlay-portal context for that on Mapbox only.",
        },
      },
      // useCurrentPosition/LocationManager are still re-exported from
      // MapLibre's map.tsx for v1 backward compatibility. Phase 8 replaces
      // both with useLocationTracking/useCurrentPosition built on
      // expo-location for both renderers (plan §7.12, §9.1 item 13) --
      // tracked here, not silently ignored.
      parityExceptions: {
        maplibre: ["useCurrentPosition", "LocationManager"],
      },
    }),
  ],
});
