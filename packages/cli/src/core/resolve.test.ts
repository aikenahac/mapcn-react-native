import { describe, expect, it } from "vitest";
import { resolveTransitive, ResolveError, topologicalSort } from "./resolve.js";
import type { RegistryManifest, RegistryManifestEntry } from "../types.js";

function entry(name: string, deps: Array<string> = []): RegistryManifestEntry {
  return {
    name,
    title: name,
    description: "",
    category: "test",
    source: "shared",
    renderers: "any",
    registryDependencies: deps,
    env: [],
    permissions: { ios: [], android: [] },
    expoPlugins: [],
    contentHash: "sha256-0000000000000000",
  };
}

describe("topologicalSort", () => {
  it("orders dependencies before dependents", () => {
    const a = entry("a");
    const b = entry("b", ["a"]);
    const c = entry("c", ["b"]);
    expect(topologicalSort([c, b, a]).map((x) => x.name)).toEqual(["a", "b", "c"]);
  });

  it("throws with the cycle path on a circular dependency", () => {
    const a = entry("a", ["b"]);
    const b = entry("b", ["a"]);
    expect(() => topologicalSort([a, b])).toThrow(/a -> b -> a/);
  });
});

describe("resolveTransitive", () => {
  it("pulls in the full transitive set for `add cluster`-style requests", () => {
    const core = entry("core");
    const geojson = entry("geojson", ["core"]);
    const cluster = entry("cluster", ["geojson", "core"]);
    const manifest: RegistryManifest = { version: "1", schemaVersion: 1, components: [core, geojson, cluster] };
    expect(resolveTransitive(manifest, ["cluster"]).map((x) => x.name)).toEqual(["core", "geojson", "cluster"]);
  });

  it("throws a helpful error for an unknown component name", () => {
    const manifest: RegistryManifest = { version: "1", schemaVersion: 1, components: [entry("core")] };
    expect(() => resolveTransitive(manifest, ["nonexistent"])).toThrow(ResolveError);
  });
});
