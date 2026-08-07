import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fetchComponentItem, fetchManifest, RegistryError } from "./registry-client.js";
import type { RegistryItem, RegistryManifest } from "../types.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapcn-registry-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function writeJson(filename: string, value: unknown) {
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(value));
}

describe("fetchManifest (local filesystem registry)", () => {
  it("reads index.json from a local directory", async () => {
    const manifest: RegistryManifest = { version: "1", schemaVersion: 1, components: [] };
    writeJson("index.json", manifest);
    expect(await fetchManifest(dir)).toEqual(manifest);
  });

  it("throws a RegistryError when index.json is missing", async () => {
    await expect(fetchManifest(dir)).rejects.toThrow(RegistryError);
  });
});

describe("fetchComponentItem", () => {
  const item: RegistryItem = {
    $schema: "s",
    name: "map",
    type: "registry:ui",
    title: "Map",
    description: "",
    dependencies: [],
    devDependencies: [],
    registryDependencies: [],
    files: [],
  };

  it("fetches <name>.json for the default (first-listed) renderer", async () => {
    writeJson("map.json", item);
    const result = await fetchComponentItem(dir, {
      name: "map",
      title: "Map",
      description: "",
      category: "core",
      source: "per-renderer",
      renderers: ["maplibre", "mapbox"],
      registryDependencies: [],
      env: [],
      permissions: { ios: [], android: [] },
      expoPlugins: {},
      contentHash: "sha256-0",
    }, "maplibre");
    expect(result).toEqual(item);
  });

  it("fetches <name>.<renderer>.json for a non-default renderer", async () => {
    writeJson("map.mapbox.json", { ...item, name: "map" });
    const result = await fetchComponentItem(dir, {
      name: "map",
      title: "Map",
      description: "",
      category: "core",
      source: "per-renderer",
      renderers: ["maplibre", "mapbox"],
      registryDependencies: [],
      env: [],
      permissions: { ios: [], android: [] },
      expoPlugins: {},
      contentHash: "sha256-0",
    }, "mapbox");
    expect(result.name).toBe("map");
  });

  it("fetches <name>.json for a 'shared' entry regardless of renderer", async () => {
    writeJson("core.json", { ...item, name: "core" });
    const result = await fetchComponentItem(dir, {
      name: "core",
      title: "Core",
      description: "",
      category: "core",
      source: "shared",
      renderers: "any",
      registryDependencies: [],
      env: [],
      permissions: { ios: [], android: [] },
      expoPlugins: [],
      contentHash: "sha256-0",
    }, "maplibre");
    expect(result.name).toBe("core");
  });

  it("throws when a component doesn't support the requested renderer", async () => {
    await expect(
      fetchComponentItem(dir, {
        name: "map",
        title: "Map",
        description: "",
        category: "core",
        source: "per-renderer",
        renderers: ["maplibre"],
        registryDependencies: [],
        env: [],
        permissions: { ios: [], android: [] },
        expoPlugins: {},
        contentHash: "sha256-0",
      }, "mapbox"),
    ).rejects.toThrow(RegistryError);
  });
});
