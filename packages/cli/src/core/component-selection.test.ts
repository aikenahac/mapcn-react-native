import { describe, expect, it } from "vitest";
import {
  allComponentNames,
  componentsForRenderer,
  groupByCategory,
  MINIMAL_COMPONENTS,
  parseComponentList,
  selectableComponents,
  shortHint,
} from "./component-selection.js";
import type { RegistryManifest, RegistryManifestEntry, Renderer } from "../types.js";

function entry(
  name: string,
  category = "core",
  renderers: Array<Renderer> | "any" = "any",
): RegistryManifestEntry {
  return {
    name,
    title: name,
    description: "",
    category,
    source: renderers === "any" ? "shared" : "per-renderer",
    renderers,
    registryDependencies: [],
    env: [],
    permissions: { ios: [], android: [] },
    expoPlugins: [],
    contentHash: "sha256-0000000000000000",
  };
}

function manifest(entries: Array<RegistryManifestEntry>): RegistryManifest {
  return { version: "2.0.0-alpha.0", schemaVersion: 2, components: entries };
}

describe("componentsForRenderer", () => {
  it("keeps renderer-independent entries and entries listing the renderer", () => {
    const m = manifest([entry("popup"), entry("map", "core", ["maplibre", "mapbox"]), entry("puck", "location", ["mapbox"])]);
    expect(componentsForRenderer(m, "maplibre").map((e) => e.name)).toEqual(["popup", "map"]);
    expect(componentsForRenderer(m, "mapbox").map((e) => e.name)).toEqual(["popup", "map", "puck"]);
  });

  it("preserves manifest order", () => {
    const m = manifest([entry("c"), entry("a"), entry("b")]);
    expect(allComponentNames(m, "maplibre")).toEqual(["c", "a", "b"]);
  });
});

describe("selectableComponents", () => {
  it("hides core, which is always installed as a transitive dependency", () => {
    const m = manifest([entry("core"), entry("map"), entry("legend", "data")]);
    expect(selectableComponents(m, "maplibre").map((e) => e.name)).toEqual(["map", "legend"]);
  });

  it("still applies the renderer filter", () => {
    const m = manifest([entry("core"), entry("puck", "location", ["mapbox"])]);
    expect(selectableComponents(m, "maplibre")).toEqual([]);
  });
});

describe("groupByCategory", () => {
  it("buckets entries by category, keeping order within each bucket", () => {
    const grouped = groupByCategory([
      entry("map", "core"),
      entry("route", "data"),
      entry("marker", "core"),
      entry("legend", "data"),
    ]);
    expect(Object.keys(grouped)).toEqual(["core", "data"]);
    expect(grouped.core?.map((e) => e.name)).toEqual(["map", "marker"]);
    expect(grouped.data?.map((e) => e.name)).toEqual(["route", "legend"]);
  });
});

describe("parseComponentList", () => {
  it("trims, drops empties, and dedupes", () => {
    expect(parseComponentList(" map, marker ,,map,popup ")).toEqual(["map", "marker", "popup"]);
  });

  it("returns an empty list for an empty string", () => {
    expect(parseComponentList("")).toEqual([]);
  });
});

describe("shortHint", () => {
  it("keeps a short description as-is, without a trailing period", () => {
    expect(shortHint("Native point clustering.")).toBe("Native point clustering");
  });

  it("takes the first sentence and truncates on a word boundary", () => {
    const hint = shortHint(
      "A high-level heatmap primitive: 5 concepts instead of raw paint properties. Weight normalization is automatic.",
    );
    expect(hint.length).toBeLessThanOrEqual(67);
    expect(hint.endsWith("...")).toBe(true);
    expect(hint).not.toContain("Weight normalization");
  });

  it("returns an empty string for an empty description", () => {
    expect(shortHint("")).toBe("");
  });
});

describe("MINIMAL_COMPONENTS", () => {
  it("omits core, which arrives as a transitive dependency", () => {
    expect(MINIMAL_COMPONENTS).not.toContain("core");
  });
});
