import { describe, expect, it } from "vitest";
import { planProviderSwitch } from "./provider-switch.js";

describe("planProviderSwitch", () => {
  it("plans switching from maplibre+carto to mapbox", () => {
    const plan = planProviderSwitch({ renderer: "maplibre", provider: "carto" }, "mapbox");
    expect(plan.fromRenderer).toBe("maplibre");
    expect(plan.toRenderer).toBe("mapbox");
    expect(plan.fromProvider).toBe("carto");
    expect(plan.toProvider).toBe("mapbox");
    expect(plan.rendererChanged).toBe(true);
    expect(plan.removeNpmPackage).toBe("@maplibre/maplibre-react-native");
    expect(plan.addNpmPackage).toContain("@rnmapbox/maps");
    expect(plan.capabilityNotes.some((n) => n.includes("minPoints on MapClusterLayer"))).toBe(true);
  });

  it("plans switching from mapbox to maplibre+maptiler", () => {
    const plan = planProviderSwitch({ renderer: "mapbox", provider: "mapbox" }, "maptiler");
    expect(plan.fromRenderer).toBe("mapbox");
    expect(plan.toRenderer).toBe("maplibre");
    expect(plan.rendererChanged).toBe(true);
    expect(plan.removeNpmPackage).toBe("@rnmapbox/maps");
    expect(plan.addNpmPackage).toContain("@maplibre/maplibre-react-native");
    expect(plan.capabilityNotes.some((n) => n.includes("MapLocationPuck"))).toBe(true);
  });

  it("plans switching from maplibre+carto to maplibre+maptiler (same renderer)", () => {
    const plan = planProviderSwitch({ renderer: "maplibre", provider: "carto" }, "maptiler");
    expect(plan.fromRenderer).toBe("maplibre");
    expect(plan.toRenderer).toBe("maplibre");
    expect(plan.rendererChanged).toBe(false);
    expect(plan.removeNpmPackage).toBeUndefined();
    expect(plan.addNpmPackage).toContain("@maplibre/maplibre-react-native");
    expect(plan.capabilityNotes.length).toBe(0);
  });

  it("throws when switching to the same provider", () => {
    expect(() => {
      planProviderSwitch({ renderer: "maplibre", provider: "carto" }, "carto");
    }).toThrow(/no-op/i);
  });

  it("emits appropriate capability notes for each switch direction", () => {
    // Switching to mapbox always mentions minPoints
    const toMapbox = planProviderSwitch({ renderer: "maplibre", provider: "carto" }, "mapbox");
    expect(toMapbox.capabilityNotes.some((n) => n.includes("minPoints"))).toBe(true);

    // Switching from mapbox to maplibre mentions location puck changes
    const fromMapbox = planProviderSwitch({ renderer: "mapbox", provider: "mapbox" }, "maptiler");
    expect(fromMapbox.capabilityNotes.some((n) => n.includes("MapLocationPuck"))).toBe(true);
  });
});
