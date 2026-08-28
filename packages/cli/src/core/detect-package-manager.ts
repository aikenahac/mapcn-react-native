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

function parentDirectories(projectRoot: string): Array<string> {
  const directories: Array<string> = [];
  let directory = path.resolve(projectRoot);

  while (true) {
    directories.push(directory);
    const parent = path.dirname(directory);
    if (parent === directory) return directories;
    directory = parent;
  }
}

export function hasPackageManagerLockfile(projectRoot: string): boolean {
  return parentDirectories(projectRoot).some((directory) =>
    LOCKFILES.some(([lockfile]) => fs.existsSync(path.join(directory, lockfile))),
  );
}

/**
 * Detects the package manager from the nearest lockfile or packageManager
 * declaration. Walking ancestors is important for apps inside a monorepo,
 * where those files normally live at the workspace root.
 */
export function detectPackageManager(projectRoot: string): PackageManager {
  for (const directory of parentDirectories(projectRoot)) {
    for (const [lockfile, manager] of LOCKFILES) {
      if (fs.existsSync(path.join(directory, lockfile))) return manager;
    }

    const packageJsonPath = path.join(directory, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as { packageManager?: string };
        if (pkg.packageManager) {
          const name = pkg.packageManager.split("@")[0];
          if (name === "pnpm" || name === "yarn" || name === "bun" || name === "npm") return name;
        }
      } catch {
        // Project validation reports malformed package.json separately. Keep
        // looking for a package-manager marker at the workspace root.
      }
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
