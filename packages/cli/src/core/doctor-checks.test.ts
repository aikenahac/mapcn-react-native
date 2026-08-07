import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runDoctorChecks } from "./doctor-checks.js";

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "mapcn-doctor-checks-test-"));
});

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

describe("runDoctorChecks", () => {
  it("errors when no package.json is found", async () => {
    const checks = await runDoctorChecks(dir);
    const projectCheck = checks.find((c) => c.id === "expo-project");
    expect(projectCheck).toBeDefined();
    expect(projectCheck?.level).toBe("error");
  });

  it("detects mapcn.json is missing and recommends init or migrate", async () => {
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { expo: "1.0.0" } }));
    const checks = await runDoctorChecks(dir);
    const configCheck = checks.find((c) => c.id === "mapcn-config");
    expect(configCheck).toBeDefined();
    expect(configCheck?.level).toBe("error");
    expect(configCheck?.message).toMatch(/mapcn-rn init|mapcn-rn migrate/);
  });

  it("detects package manager from lockfile", async () => {
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { expo: "1.0.0" } }));
    fs.writeFileSync(path.join(dir, "pnpm-lock.yaml"), "");
    const checks = await runDoctorChecks(dir);
    const pmCheck = checks.find((c) => c.id === "package-manager");
    expect(pmCheck).toBeDefined();
    expect(pmCheck?.level).toBe("ok");
    expect(pmCheck?.message).toContain("pnpm");
  });

  it("warns when no lockfile is present", async () => {
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { expo: "1.0.0" } }));
    const checks = await runDoctorChecks(dir);
    const pmCheck = checks.find((c) => c.id === "package-manager");
    expect(pmCheck?.level).toBe("warn");
    expect(pmCheck?.message).toMatch(/no lockfile/i);
  });

  it("detects legacy v1 installation when mapcn.json is missing", async () => {
    fs.mkdirSync(path.join(dir, "src/components/ui"), { recursive: true });
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ dependencies: { expo: "1.0.0" } }));
    fs.writeFileSync(
      path.join(dir, "src/components/ui/map.tsx"),
      "export function Map() {} export function MapMarker() {} export function MapControls() {} export function MapRoute() {} export function MapUserLocation() {} export function useMap() {}",
    );
    const checks = await runDoctorChecks(dir);
    const v1Check = checks.find((c) => c.id === "legacy-v1-install");
    expect(v1Check).toBeDefined();
    expect(v1Check?.level).toBe("info");
    expect(v1Check?.message).toMatch(/migrate/i);
  });
});
