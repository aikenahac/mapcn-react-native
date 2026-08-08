import fs from "node:fs";
import path from "node:path";
import type { PackageManager } from "../types.js";

const LOCKFILES: Array<[string, PackageManager]> = [
  ["pnpm-lock.yaml", "pnpm"],
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
];

/** Detects the package manager from the nearest lockfile -- never assumed, matches feedback recorded from the v1 CLI. */
export function detectPackageManager(projectRoot: string): PackageManager {
  for (const [lockfile, manager] of LOCKFILES) {
    if (fs.existsSync(path.join(projectRoot, lockfile))) return manager;
  }
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as { packageManager?: string };
    if (pkg.packageManager) {
      const name = pkg.packageManager.split("@")[0];
      if (name === "pnpm" || name === "yarn" || name === "bun" || name === "npm") return name;
    }
  }
  return "npm";
}

export function installCommand(manager: PackageManager, packages: Array<string>, dev = false): Array<string> {
  if (packages.length === 0) return [];
  switch (manager) {
    case "pnpm":
      return ["pnpm", "add", ...(dev ? ["-D"] : []), ...packages];
    case "yarn":
      return ["yarn", "add", ...(dev ? ["-D"] : []), ...packages];
    case "bun":
      return ["bun", "add", ...(dev ? ["-d"] : []), ...packages];
    case "npm":
      return ["npm", "install", ...(dev ? ["-D"] : []), ...packages];
    default:
      throw new Error(`Unknown package manager: ${manager}`);
  }
}

export function execCommand(manager: PackageManager, args: Array<string>): Array<string> {
  switch (manager) {
    case "pnpm":
      return ["pnpm", "exec", ...args];
    case "yarn":
      return ["yarn", ...args];
    case "bun":
      return ["bunx", ...args];
    case "npm":
      return ["npx", ...args];
    default:
      throw new Error(`Unknown package manager: ${manager}`);
  }
}
