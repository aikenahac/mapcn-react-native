// Canonical, renderer-independent mapcn source.
//
// Populated in Phase 1 (shared contracts, geo/scale lib, renderer adapter):
//   - lib/mapcn/types.ts   — Coordinate, MapViewport, GeoJSONInput, style types
//   - lib/mapcn/geo.ts     — circlePolygon, bboxOf, boundsOf, distance
//   - lib/mapcn/scale.ts   — quantize/quantile/threshold/linear scales, expression builders
//   - lib/mapcn/colors.ts  — built-in color ramps
//   - lib/mapcn/provider.ts — provider/style registry
//   - components/          — renderer-independent high-level primitives (map-geojson, map-cluster-layer, ...)
//
// This package is never published or imported at runtime by consumer apps.
// packages/registry materializes these files into apps/demo-maplibre and
// apps/demo-mapbox, and emits them into the CLI registry — see
// packages/registry/registry.config.ts once it exists.
export {};
