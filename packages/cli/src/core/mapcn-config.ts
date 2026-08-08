import fs from "node:fs";
import path from "node:path";
import type { MapcnConfig } from "../types.js";

export const MAPCN_CONFIG_FILENAME = "mapcn.json";
export const MAPCN_SCHEMA_VERSION = 2;

export class MapcnConfigError extends Error {}

export function mapcnConfigPath(projectRoot: string): string {
  return path.join(projectRoot, MAPCN_CONFIG_FILENAME);
}

export function readMapcnConfig(projectRoot: string): MapcnConfig | null {
  const configPath = mapcnConfigPath(projectRoot);
  if (!fs.existsSync(configPath)) return null;
  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as MapcnConfig;
  if (config.schemaVersion > MAPCN_SCHEMA_VERSION) {
    throw new MapcnConfigError(
      `mapcn.json was written by a newer version of mapcn-rn (schemaVersion ${config.schemaVersion} > ${MAPCN_SCHEMA_VERSION} supported here). Upgrade mapcn-rn.`,
    );
  }
  return config;
}

export function writeMapcnConfig(projectRoot: string, config: MapcnConfig): void {
  const serialized = JSON.stringify(config, null, 2) + "\n";
  fs.writeFileSync(mapcnConfigPath(projectRoot), serialized, "utf8");
}

export function requireMapcnConfig(projectRoot: string): MapcnConfig {
  const config = readMapcnConfig(projectRoot);
  if (!config) {
    throw new MapcnConfigError("No mapcn.json found. Run `npx mapcn-rn init` first.");
  }
  return config;
}
