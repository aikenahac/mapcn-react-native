import { describe, expect, it } from "vitest";
import manifest from "../registry.config";
import { emitRegistry } from "./emit";
import { DOCS_REGISTRY_OUT } from "./paths";
import fs from "node:fs";
import path from "node:path";

describe("emitRegistry", () => {
  it("is idempotent -- a second run with no source changes writes nothing", () => {
    emitRegistry(manifest); // settle any pending drift first
    const secondRun = emitRegistry(manifest);
    expect(secondRun).toEqual([]);
  });

  it("never leaks an absolute local filesystem path into files[].path", () => {
    emitRegistry(manifest);
    const mapItem = JSON.parse(fs.readFileSync(path.join(DOCS_REGISTRY_OUT, "map.json"), "utf8"));
    for (const file of mapItem.files) {
      expect(path.isAbsolute(file.path)).toBe(false);
      expect(file.path).not.toContain(process.env.HOME ?? "<no-home>");
    }
  });

  it("emits valid JSON for every generated file", () => {
    emitRegistry(manifest);
    for (const filename of fs.readdirSync(DOCS_REGISTRY_OUT)) {
      expect(() => JSON.parse(fs.readFileSync(path.join(DOCS_REGISTRY_OUT, filename), "utf8"))).not.toThrow();
    }
  });
});
