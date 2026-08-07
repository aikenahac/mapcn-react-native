// Canonical, renderer-independent mapcn source.
//
// This package is never published or imported at runtime by consumer apps.
// packages/registry materializes these files into apps/demo-maplibre and
// apps/demo-mapbox, and emits them into the CLI registry — see
// packages/registry/registry.config.ts once it exists.
//
// components/ (renderer-independent high-level primitives: map-geojson,
// map-cluster-layer, map-heatmap, map-choropleth, map-circle, map-polygon,
// map-legend, map-route, map-controls, map-style-switcher) lands in
// Phases 6-9.
export * from "./lib/mapcn/types";
export * from "./lib/mapcn/geo";
export * from "./lib/mapcn/colors";
export * from "./lib/mapcn/scale";
export * from "./lib/mapcn/provider";
export * from "./components/ui/map-types";
