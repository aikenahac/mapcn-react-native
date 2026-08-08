import { describe, expect, it } from "vitest";
import { barrelContent } from "./barrel.js";
import type { RegistryManifest, RegistryManifestEntry } from "../types.js";

function entry(name: string, barrelModules: Array<string>): RegistryManifestEntry {
  return {
    name,
    title: name,
    description: "",
    category: "core",
    source: "shared",
    renderers: "any",
    registryDependencies: [],
    env: [],
    permissions: { ios: [], android: [] },
    expoPlugins: [],
    barrelModules,
    contentHash: "sha256-0000000000000000",
  };
}

const manifest: RegistryManifest = {
  version: "0.0.0",
  schemaVersion: 2,
  components: [
    entry("core", []),
    entry("map", ["./map"]),
    entry("cluster", ["./map-cluster-layer"]),
    entry("location", ["@/hooks/use-location-tracking"]),
  ],
};

describe("barrelContent", () => {
  it("exports only what is installed", () => {
    const content = barrelContent(manifest, ["core", "map"]);
    expect(content).toContain('export * from "./map";');
    expect(content).not.toContain("map-cluster-layer");
  });

  it("contributes nothing for type-only components", () => {
    expect(barrelContent(manifest, ["core"])).not.toContain("export *");
  });

  it("re-exports the location hook from outside the folder", () => {
    expect(barrelContent(manifest, ["location"])).toContain('export * from "@/hooks/use-location-tracking";');
  });

  it("is deterministic and deduped regardless of input order", () => {
    expect(barrelContent(manifest, ["map", "core", "map"])).toBe(barrelContent(manifest, ["core", "map"]));
  });

  it("still emits a valid module when nothing is installed", () => {
    const content = barrelContent(manifest, []);
    expect(content).not.toContain("export *");
    expect(content.startsWith("//")).toBe(true);
  });
});
