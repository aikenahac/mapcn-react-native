import { fileURLToPath } from "node:url";
import path from "node:path";

// packages/registry/src/paths.ts -> repo root is three levels up.
export const REPO_ROOT = path.resolve(fileURLToPath(new URL("../../../", import.meta.url)));

export const SHARED_SRC = path.join(REPO_ROOT, "packages/shared/src");
export const DOCS_REGISTRY_OUT = path.join(REPO_ROOT, "apps/docs/public/r");

export const APP_SRC: Record<"maplibre" | "mapbox", string> = {
  maplibre: path.join(REPO_ROOT, "apps/demo-maplibre/src"),
  mapbox: path.join(REPO_ROOT, "apps/demo-mapbox/src"),
};

const ALIAS_PREFIXES: Array<[string, string]> = [
  ["@ui/", "components/ui/"],
  ["@hooks/", "hooks/"],
  ["@lib/", "lib/"],
  ["@components/", "components/"],
];

/** Resolves a components.json-style alias ("@ui/map.tsx") to a path relative to an app's src/. */
export function resolveAliasPath(to: string): string {
  for (const [prefix, replacement] of ALIAS_PREFIXES) {
    if (to.startsWith(prefix)) return replacement + to.slice(prefix.length);
  }
  throw new Error(`[registry] Unrecognized alias in target path "${to}". Known prefixes: ${ALIAS_PREFIXES.map(([p]) => p).join(", ")}`);
}
