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
  version: "2.0.0",
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
        { from: "lib/mapcn/style.ts", to: "@lib/mapcn/style.ts" },
        { from: "components/ui/mapcn/map-types.ts", to: "@ui/map-types.ts" },
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
          { path: "components/ui/mapcn/map.tsx" },
          { path: "components/ui/mapcn/map-renderer.tsx", internal: true },
        ],
        mapbox: [
          { path: "components/ui/mapcn/map.tsx" },
          { path: "components/ui/mapcn/map-renderer.tsx", internal: true },
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
        maplibre: [{ path: "components/ui/mapcn/map-marker.tsx" }],
        mapbox: [{ path: "components/ui/mapcn/map-marker.tsx" }],
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
      files: [{ from: "components/ui/mapcn/map-popup.tsx", to: "@ui/map-popup.tsx" }],
    }),
    defineComponent({
      name: "controls",
      title: "Controls",
      description: "Zoom and locate-me controls, rendered through Map's overlay mechanism so the same file works unchanged on both renderers.",
      category: "core",
      docsSlug: "controls",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/mapcn/map-controls.tsx", to: "@ui/map-controls.tsx" }],
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
      files: [{ from: "components/ui/mapcn/map-route.tsx", to: "@ui/map-route.tsx" }],
    }),
    defineComponent({
      name: "geojson",
      title: "GeoJSON",
      description: "The foundational GeoJSON rendering primitive: one native source, up to three geometry-filtered layers (fill/line/point), selection highlighting, and feature press events.",
      category: "data",
      docsSlug: "geojson",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/mapcn/map-geojson.tsx", to: "@ui/map-geojson.tsx" }],
    }),
    defineComponent({
      name: "circle",
      title: "Circle",
      description: "An intent-based circle/radius primitive (search radius, delivery zone, geofence preview) using real-world units and a geodesically-accurate polygon, not a pixel-radius circle layer.",
      category: "data",
      docsSlug: "circles",
      source: "shared",
      registryDependencies: ["core", "map", "geojson"],
      files: [{ from: "components/ui/mapcn/map-circle.tsx", to: "@ui/map-circle.tsx" }],
    }),
    defineComponent({
      name: "polygon",
      title: "Polygon",
      description: "An intent-level polygon primitive accepting raw rings or GeoJSON geometry, supporting holes and MultiPolygons via the underlying native source.",
      category: "data",
      docsSlug: "polygons",
      source: "shared",
      registryDependencies: ["core", "map", "geojson"],
      files: [{ from: "components/ui/mapcn/map-polygon.tsx", to: "@ui/map-polygon.tsx" }],
    }),
    defineComponent({
      name: "cluster",
      title: "Cluster",
      description: "Native point clustering with cluster/count/unclustered-point styling, tap-to-expand, and lazy cluster-leaves queries. Renders through native layers, never RN marker views, so it stays correct at 10k+ points.",
      category: "data",
      docsSlug: "clustering",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/mapcn/map-cluster-layer.tsx", to: "@ui/map-cluster-layer.tsx" }],
      capabilities: {
        mapbox: { note: "minPoints has no equivalent on Mapbox's ShapeSource; accepted but ignored." },
      },
    }),
    defineComponent({
      name: "heatmap",
      title: "Heatmap",
      description: "A high-level heatmap primitive: 5 concepts (weight, radius, intensity, opacity, colors) instead of raw heatmap-* paint properties, with the transparent-density-0 stop and weight normalization handled automatically.",
      category: "data",
      docsSlug: "heatmaps",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/mapcn/map-heatmap.tsx", to: "@ui/map-heatmap.tsx" }],
    }),
    defineComponent({
      name: "choropleth",
      title: "Choropleth",
      description: "A choropleth abstraction built on native step/interpolate expression evaluation, with quantize/quantile/threshold/linear scales computed once in JS and normalized legend data emitted via onLegendChange.",
      category: "data",
      docsSlug: "choropleths",
      source: "shared",
      registryDependencies: ["core", "map", "geojson"],
      files: [{ from: "components/ui/mapcn/map-choropleth.tsx", to: "@ui/map-choropleth.tsx" }],
    }),
    defineComponent({
      name: "legend",
      title: "Legend",
      description: "A reusable legend driven entirely by plain MapLegendData -- categorical, discrete-steps, or continuous-gradient -- never coupled to a specific rendering component.",
      category: "data",
      docsSlug: "legend",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/mapcn/map-legend.tsx", to: "@ui/map-legend.tsx" }],
    }),
    defineComponent({
      name: "location",
      title: "Location tracking",
      description: "useLocationTracking/useCurrentPosition/useLocationPermission, built on expo-location for both renderers. Foreground-only; mode is reserved for future background support.",
      category: "location",
      docsSlug: "location-tracking",
      source: "shared",
      registryDependencies: ["core"],
      files: [{ from: "hooks/use-location-tracking.ts", to: "@hooks/use-location-tracking.ts" }],
      dependencies: ["expo-location"],
      permissions: {
        ios: ["NSLocationWhenInUseUsageDescription"],
        android: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      },
    }),
    defineComponent({
      name: "location-puck",
      title: "Location puck",
      description: "The location puck shown on the map. Capability-gated: pulsing/scale/images are Mapbox-only, onPress/custom children are MapLibre-only -- documented, not faked.",
      category: "location",
      docsSlug: "location-puck",
      source: "per-renderer",
      renderers: ["maplibre", "mapbox"],
      registryDependencies: ["core", "map", "location"],
      filesByRenderer: {
        maplibre: [{ path: "components/ui/mapcn/map-location-puck.tsx" }],
        mapbox: [{ path: "components/ui/mapcn/map-location-puck.tsx" }],
      },
      dependencies: ["expo-location"],
      permissions: {
        ios: ["NSLocationWhenInUseUsageDescription"],
        android: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      },
      capabilities: {
        mapbox: { note: "pulsing/scale/images have no MapLibre equivalent." },
        maplibre: { note: "onPress and custom JS-rendered children have no Mapbox equivalent." },
      },
    }),
    defineComponent({
      name: "style-switcher",
      title: "Style switcher",
      description: "MapStyleSwitcher reads its style list from the configured basemap provider -- works standalone or nested inside MapControls via position=\"none\".",
      category: "styling",
      docsSlug: "style-switcher",
      source: "shared",
      registryDependencies: ["core", "map"],
      files: [{ from: "components/ui/mapcn/map-style-switcher.tsx", to: "@ui/map-style-switcher.tsx" }],
    }),
  ],
});
