import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectPackageManager } from "./detect-package-manager.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapcn-package-manager-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("detectPackageManager", () => {
  it("finds the workspace lockfile from a nested app", () => {
    const appDir = path.join(dir, "apps", "demo");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(path.join(appDir, "package.json"), JSON.stringify({ name: "demo" }));
    fs.writeFileSync(path.join(dir, "pnpm-lock.yaml"), "");

    expect(detectPackageManager(appDir)).toBe("pnpm");
  });

  it("prefers a nested project's packageManager over an ancestor marker", () => {
    const appDir = path.join(dir, "apps", "demo");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(path.join(appDir, "package.json"), JSON.stringify({ packageManager: "bun@1.2.19" }));
    fs.writeFileSync(path.join(dir, "pnpm-lock.yaml"), "");

    expect(detectPackageManager(appDir)).toBe("bun");
  });

  it("prefers the nearest lockfile", () => {
    const appDir = path.join(dir, "apps", "demo");
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(path.join(appDir, "package-lock.json"), "");
    fs.writeFileSync(path.join(dir, "pnpm-lock.yaml"), "");

    expect(detectPackageManager(appDir)).toBe("npm");
  });
});
