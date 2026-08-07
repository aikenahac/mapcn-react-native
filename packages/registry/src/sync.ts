// Registry sync/check entrypoint.
//
// Populated in Phase 3 (registry manifest, sync, check, CI): reads
// registry.config.ts, materializes packages/shared sources into
// apps/demo-maplibre and apps/demo-mapbox, emits apps/docs/public/r/*.json,
// and runs the validators described in the plan (§5.4). `--check` runs the
// same pipeline without writing and fails on drift.
const isCheck = process.argv.includes("--check");
console.log(
  `[registry:${isCheck ? "check" : "sync"}] not yet implemented — see plan §5 (Phase 3)`,
);
process.exit(1);
