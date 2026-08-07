# Canonical shared component sources

These `.tsx` files are the canonical, edit-here source for mapcn's
renderer-independent high-level components (map-popup, map-controls,
map-route, and later map-geojson, map-cluster-layer, map-heatmap, ...).

They're intentionally excluded from `packages/shared`'s own `tsc` run
(see `../../tsconfig.json`): each one imports app-local aliases
(`@/lib/utils`, `./map-renderer`, `./map-marker`) and relies on each app's
Uniwind `className` type augmentation, neither of which exist inside
`packages/shared` itself. The authoritative typecheck happens after
`pnpm registry:sync` materializes a byte-identical copy into
`apps/demo-maplibre` and `apps/demo-mapbox`, which do have both -- that's
also exactly where the code actually runs.

`map-types.ts` and everything under `../../lib/mapcn/` have no such
app-local dependency and are fully typechecked in place.
