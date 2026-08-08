import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MAPCN_SCHEMA_VERSION, MapcnConfigError, readMapcnConfig, requireMapcnConfig, writeMapcnConfig } from "./mapcn-config.js";
import type { MapcnConfig } from "../types.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapcn-config-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function baseConfig(): MapcnConfig {
  return {
    $schema: "s",
    schemaVersion: MAPCN_SCHEMA_VERSION,
    renderer: "maplibre",
    provider: { id: "carto", envKey: null },
    styling: "uniwind",
    aliases: { ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks", components: "@/components" },
    components: {},
  };
}

describe("readMapcnConfig", () => {
  it("returns null when no mapcn.json exists", () => {
    expect(readMapcnConfig(dir)).toBeNull();
  });

  it("round-trips through writeMapcnConfig", () => {
    const config = baseConfig();
    writeMapcnConfig(dir, config);
    expect(readMapcnConfig(dir)).toEqual(config);
  });

  it("throws when the file was written by a newer, unsupported schema version", () => {
    writeMapcnConfig(dir, { ...baseConfig(), schemaVersion: MAPCN_SCHEMA_VERSION + 1 });
    expect(() => readMapcnConfig(dir)).toThrow(MapcnConfigError);
  });
});

describe("requireMapcnConfig", () => {
  it("throws a helpful error when mapcn.json is missing", () => {
    expect(() => requireMapcnConfig(dir)).toThrow(/mapcn-rn init/);
  });

  it("returns the config when present", () => {
    writeMapcnConfig(dir, baseConfig());
    expect(requireMapcnConfig(dir).renderer).toBe("maplibre");
  });
});
