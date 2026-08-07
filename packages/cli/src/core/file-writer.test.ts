import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeComponentFile } from "./file-writer.js";
import { contentHash } from "./hash.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapcn-cli-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("writeComponentFile", () => {
  it("writes a new file when nothing exists at the target", () => {
    const target = path.join(dir, "components/ui/map.tsx");
    const result = writeComponentFile(dir, target, "export const x = 1;", undefined, { overwrite: false, timestamp: "t" });
    expect(result.status).toBe("written");
    expect(fs.readFileSync(target, "utf8")).toBe("export const x = 1;\n");
  });

  it("reports 'unchanged' when the on-disk file already matches the new content and is unmodified", () => {
    const target = path.join(dir, "map.tsx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, "export const x = 1;\n");
    const hash = contentHash("export const x = 1;");
    const result = writeComponentFile(dir, target, "export const x = 1;", hash, { overwrite: false, timestamp: "t" });
    expect(result.status).toBe("unchanged");
  });

  it("upgrades silently when the file is unmodified since install but the registry content changed", () => {
    const target = path.join(dir, "map.tsx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, "export const x = 1;\n");
    const oldHash = contentHash("export const x = 1;");
    const result = writeComponentFile(dir, target, "export const x = 2;", oldHash, { overwrite: false, timestamp: "t" });
    expect(result.status).toBe("written");
    expect(fs.readFileSync(target, "utf8")).toBe("export const x = 2;\n");
  });

  it("never overwrites a user-modified file without --overwrite -- writes a .new sidecar instead", () => {
    const target = path.join(dir, "map.tsx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, "export const x = 999; // user edit\n");
    const oldHash = contentHash("export const x = 1;"); // recorded hash from install time, doesn't match current disk content
    const result = writeComponentFile(dir, target, "export const x = 2;", oldHash, { overwrite: false, timestamp: "t" });
    expect(result.status).toBe("conflict");
    expect(result.sidecarPath).toBe(path.join(dir, "map.new.tsx"));
    expect(fs.readFileSync(target, "utf8")).toBe("export const x = 999; // user edit\n"); // untouched
    expect(fs.readFileSync(result.sidecarPath!, "utf8")).toBe("export const x = 2;\n");
  });

  it("backs up then overwrites a user-modified file when --overwrite is set", () => {
    const target = path.join(dir, "map.tsx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, "export const x = 999; // user edit\n");
    const oldHash = contentHash("export const x = 1;");
    const result = writeComponentFile(dir, target, "export const x = 2;", oldHash, { overwrite: true, timestamp: "2024-01-01" });
    expect(result.status).toBe("overwritten");
    expect(fs.readFileSync(target, "utf8")).toBe("export const x = 2;\n");
    const backupPath = path.join(dir, ".mapcn-backup", "2024-01-01", "map.tsx");
    expect(fs.readFileSync(backupPath, "utf8")).toBe("export const x = 999; // user edit\n");
  });

  it("treats an untracked pre-existing file (no previousHash) the same as a modified file", () => {
    const target = path.join(dir, "map.tsx");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(target, "// not installed by mapcn\n");
    const result = writeComponentFile(dir, target, "export const x = 1;", undefined, { overwrite: false, timestamp: "t" });
    expect(result.status).toBe("conflict");
    expect(fs.readFileSync(target, "utf8")).toBe("// not installed by mapcn\n");
  });
});
