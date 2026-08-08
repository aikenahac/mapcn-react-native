import { describe, expect, it } from "vitest";
import { resolveTransitive, RegistryGraphError, topologicalSort } from "./graph";
import type { ComponentDefinition } from "./manifest";

function shared(name: string, deps: Array<string> = []): ComponentDefinition {
  return { name, title: name, description: "", category: "test", source: "shared", files: [], registryDependencies: deps };
}

describe("topologicalSort", () => {
  it("orders dependencies before dependents", () => {
    const a = shared("a");
    const b = shared("b", ["a"]);
    const c = shared("c", ["b"]);
    const sorted = topologicalSort([c, b, a]).map((x) => x.name);
    expect(sorted).toEqual(["a", "b", "c"]);
  });

  it("throws with the cycle path when components depend on each other circularly", () => {
    const a = shared("a", ["b"]);
    const b = shared("b", ["a"]);
    expect(() => topologicalSort([a, b])).toThrow(RegistryGraphError);
    try {
      topologicalSort([a, b]);
    } catch (error) {
      expect((error as Error).message).toContain("a -> b -> a");
    }
  });

  it("throws on a self-cycle", () => {
    const a = shared("a", ["a"]);
    expect(() => topologicalSort([a])).toThrow(/a -> a/);
  });

  it("throws when a registryDependency doesn't exist", () => {
    const a = shared("a", ["nonexistent"]);
    expect(() => topologicalSort([a])).toThrow(/Unresolved registryDependency/);
  });

  it("is stable for components with no dependencies", () => {
    const a = shared("a");
    const b = shared("b");
    expect(topologicalSort([a, b]).map((x) => x.name)).toEqual(["a", "b"]);
  });
});

describe("resolveTransitive", () => {
  it("pulls in the full transitive dependency set, sorted", () => {
    const core = shared("core");
    const geojson = shared("geojson", ["core"]);
    const cluster = shared("cluster", ["geojson", "core"]);
    const resolved = resolveTransitive([core, geojson, cluster], ["cluster"]).map((x) => x.name);
    expect(resolved).toEqual(["core", "geojson", "cluster"]);
  });

  it("does not pull in unrelated components", () => {
    const core = shared("core");
    const unrelated = shared("unrelated");
    const resolved = resolveTransitive([core, unrelated], ["core"]).map((x) => x.name);
    expect(resolved).toEqual(["core"]);
  });

  it("throws for an unknown requested component", () => {
    const core = shared("core");
    expect(() => resolveTransitive([core], ["nonexistent"])).toThrow(RegistryGraphError);
  });
});
