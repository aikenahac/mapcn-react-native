import { describe, expect, it } from "vitest";
import { ensureAndroidPermissions, ensurePlugin, hasConflictingRendererPlugins, removePlugin, type ExpoConfig } from "./app-json.js";

describe("ensurePlugin", () => {
  it("adds a plugin that isn't present", () => {
    const config: ExpoConfig = { expo: {} };
    expect(ensurePlugin(config, "@maplibre/maplibre-react-native")).toBe(true);
    expect(config.expo?.plugins).toEqual(["@maplibre/maplibre-react-native"]);
  });

  it("is idempotent -- running twice doesn't duplicate", () => {
    const config: ExpoConfig = { expo: { plugins: ["@maplibre/maplibre-react-native"] } };
    expect(ensurePlugin(config, "@maplibre/maplibre-react-native")).toBe(false);
    expect(config.expo?.plugins).toEqual(["@maplibre/maplibre-react-native"]);
  });

  it("matches by plugin name even when the existing entry is a [name, options] tuple", () => {
    const config: ExpoConfig = { expo: { plugins: [["expo-location", { foo: "bar" }]] } };
    expect(ensurePlugin(config, "expo-location")).toBe(false);
  });
});

describe("removePlugin", () => {
  it("removes a plugin by name, tuple or bare string", () => {
    const config: ExpoConfig = { expo: { plugins: ["@rnmapbox/maps", ["expo-location", {}]] } };
    expect(removePlugin(config, "@rnmapbox/maps")).toBe(true);
    expect(config.expo?.plugins).toEqual([["expo-location", {}]]);
  });

  it("returns false when the plugin isn't present", () => {
    const config: ExpoConfig = { expo: { plugins: ["expo-router"] } };
    expect(removePlugin(config, "@rnmapbox/maps")).toBe(false);
  });
});

describe("hasConflictingRendererPlugins", () => {
  it("detects both renderer plugins present", () => {
    const config: ExpoConfig = { expo: { plugins: ["@maplibre/maplibre-react-native", "@rnmapbox/maps"] } };
    expect(hasConflictingRendererPlugins(config)).toBe(true);
  });

  it("is false with only one renderer plugin", () => {
    const config: ExpoConfig = { expo: { plugins: ["@maplibre/maplibre-react-native"] } };
    expect(hasConflictingRendererPlugins(config)).toBe(false);
  });
});

describe("ensureAndroidPermissions", () => {
  it("adds missing permissions without duplicating existing ones", () => {
    const config: ExpoConfig = { expo: { android: { permissions: ["ACCESS_FINE_LOCATION"] } } };
    expect(ensureAndroidPermissions(config, ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"])).toBe(true);
    expect(config.expo?.android?.permissions).toEqual(["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"]);
  });

  it("returns false for an empty permissions list", () => {
    const config: ExpoConfig = { expo: {} };
    expect(ensureAndroidPermissions(config, [])).toBe(false);
  });
});
