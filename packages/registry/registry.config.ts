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
    defineComponent({
      name: "marker",
      title: "Marker",
      description: "MapMarker, MarkerContent and MarkerLabel -- native-anchored markers with custom content and text labels.",
      category: "core",
      docsSlug: "markers",
      source: "per-renderer",
      renderers: ["maplibre", "mapbox"],
      registryDependencies: ["map"],
      filesByRenderer: {
        maplibre: [{ path: "components/ui/map-marker.tsx" }],
        mapbox: [{ path: "components/ui/map-marker.tsx" }],
      },
      capabilities: {
        maplibre: { note: "allowOverlap has no MapLibre equivalent; accepted but a no-op." },
      },
    }),
    defineComponent({
      name: "popup",
      title: "Popup",
      description: "MapPopup anchors to any coordinate via the renderer's native marker mechanism; MarkerPopup is a convenience wrapper for the common per-marker case.",
      category: "core",
      docsSlug: "popups",
      source: "shared",
      registryDependencies: ["core", "map", "marker"],
      files: [{ from: "components/ui/map-popup.tsx", to: "@ui/map-popup.tsx" }],
    }),
    defineComponent({
      name: "controls",
      title: "Controls",
      description: "Zoom and locate-me controls, rendered through Map's overlay mechanism so the same file works unchanged on both renderers.",
      category: "core",
      docsSlug: "controls",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/map-controls.tsx", to: "@ui/map-controls.tsx" }],
      dependencies: ["expo-location"],
      permissions: {
        ios: ["NSLocationWhenInUseUsageDescription"],
        android: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      },
    }),
    defineComponent({
      name: "route",
      title: "Route",
      description: "Renders a LineString as a styled route/path, built on the same MapSource/MapLayer primitives MapGeoJSON uses.",
      category: "data",
      docsSlug: "routes",
      source: "shared",
      registryDependencies: ["map"],
      files: [{ from: "components/ui/map-route.tsx", to: "@ui/map-route.tsx" }],
    }),
  ],
});
