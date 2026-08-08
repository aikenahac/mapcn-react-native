import { describe, expect, it } from "vitest";
import { PROVIDERS, providersForRenderer, resolveStyleUrl } from "./provider";

describe("providersForRenderer", () => {
  it("returns only maplibre providers for the maplibre renderer", () => {
    const providers = providersForRenderer("maplibre");
    expect(providers.map((p) => p.id).sort()).toEqual(["carto", "custom", "maptiler"]);
  });

  it("returns only the mapbox provider for the mapbox renderer", () => {
    const providers = providersForRenderer("mapbox");
    expect(providers.map((p) => p.id)).toEqual(["mapbox"]);
  });
});

describe("resolveStyleUrl", () => {
  it("resolves a CARTO style with no key required", () => {
    expect(resolveStyleUrl(PROVIDERS.carto, "dark")).toContain("dark-matter-gl-style");
  });

  it("resolves a MapTiler style when a key is provided", () => {
    const url = resolveStyleUrl(PROVIDERS.maptiler, "streets", "test-key");
    expect(url).toContain("streets-v2");
    expect(url).toContain("key=test-key");
  });

  it("throws when a MapTiler style is requested without a key", () => {
    expect(() => resolveStyleUrl(PROVIDERS.maptiler, "streets")).toThrow(/EXPO_PUBLIC_MAPTILER_API_KEY/);
  });

  it("resolves a Mapbox style URI", () => {
    expect(resolveStyleUrl(PROVIDERS.mapbox, "dark")).toBe("mapbox://styles/mapbox/dark-v11");
  });

  it("throws on an unknown style id", () => {
    expect(() => resolveStyleUrl(PROVIDERS.carto, "nonexistent")).toThrow(/Unknown style/);
  });
});
