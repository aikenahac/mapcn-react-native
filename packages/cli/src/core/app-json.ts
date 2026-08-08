import fs from "node:fs";
import path from "node:path";

export interface ExpoConfig {
  expo?: {
    plugins?: Array<unknown>;
    android?: { permissions?: Array<string> };
    ios?: { infoPlist?: Record<string, unknown> };
    [key: string]: unknown;
  };
}

function pluginName(entry: unknown): string {
  return Array.isArray(entry) ? (entry[0] as string) : (entry as string);
}

export function readAppJson(projectRoot: string): { path: string; config: ExpoConfig } | null {
  const appJsonPath = path.join(projectRoot, "app.json");
  if (!fs.existsSync(appJsonPath)) return null;
  return { path: appJsonPath, config: JSON.parse(fs.readFileSync(appJsonPath, "utf8")) as ExpoConfig };
}

export function writeAppJson(appJsonPath: string, config: ExpoConfig): void {
  fs.writeFileSync(appJsonPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

/** Adds a plugin entry if not already present (by plugin name, so re-running is a no-op). Mutates and returns `config`. */
export function ensurePlugin(config: ExpoConfig, entry: unknown): boolean {
  config.expo ??= {};
  config.expo.plugins ??= [];
  const name = pluginName(entry);
  if (config.expo.plugins.some((p) => pluginName(p) === name)) return false;
  config.expo.plugins.push(entry);
  return true;
}

export function removePlugin(config: ExpoConfig, name: string): boolean {
  if (!config.expo?.plugins) return false;
  const before = config.expo.plugins.length;
  config.expo.plugins = config.expo.plugins.filter((p) => pluginName(p) !== name);
  return config.expo.plugins.length !== before;
}

/** Adds Android permission strings if missing. Mutates and returns `config`. */
export function ensureAndroidPermissions(config: ExpoConfig, permissions: Array<string>): boolean {
  if (permissions.length === 0) return false;
  config.expo ??= {};
  config.expo.android ??= {};
  config.expo.android.permissions ??= [];
  let changed = false;
  for (const permission of permissions) {
    if (!config.expo.android.permissions.includes(permission)) {
      config.expo.android.permissions.push(permission);
      changed = true;
    }
  }
  return changed;
}

/**
 * Default copy for the iOS usage-description keys the registry declares. Apple
 * rejects builds that use a capability without a description string, so an
 * installed component needs a value here, not just the key.
 */
export const IOS_PERMISSION_DESCRIPTIONS: Record<string, string> = {
  NSLocationWhenInUseUsageDescription: "Show your location on the map.",
  NSLocationAlwaysAndWhenInUseUsageDescription: "Show your location on the map, including in the background.",
};

/**
 * Adds iOS `infoPlist` usage descriptions for `keys` that aren't set yet.
 * Never overwrites an existing description -- the user's wording wins, and
 * App Review sees whatever they wrote. Mutates `config`.
 */
export function ensureInfoPlistEntries(config: ExpoConfig, keys: Array<string>): boolean {
  if (keys.length === 0) return false;
  config.expo ??= {};
  config.expo.ios ??= {};
  config.expo.ios.infoPlist ??= {};
  let changed = false;
  for (const key of keys) {
    if (config.expo.ios.infoPlist[key] !== undefined) continue;
    config.expo.ios.infoPlist[key] = IOS_PERMISSION_DESCRIPTIONS[key] ?? "Required by mapcn-rn.";
    changed = true;
  }
  return changed;
}

/** Checks (without mutating) whether both renderer plugins are present -- the documented "cannot have both" conflict. */
export function hasConflictingRendererPlugins(config: ExpoConfig): boolean {
  const names = new Set((config.expo?.plugins ?? []).map(pluginName));
  return names.has("@maplibre/maplibre-react-native") && names.has("@rnmapbox/maps");
}
