import fs from "node:fs";
import path from "node:path";

export interface ProjectDetection {
  isExpo: boolean;
  isTypeScript: boolean;
  srcDir: string;
  hasAppJson: boolean;
}

/** Reads package.json without throwing if it's missing or malformed. */
export function readPackageJson(projectRoot: string): Record<string, unknown> | null {
  const pkgPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch {
    return null;
  }
}

export class ProjectDetectionError extends Error {}

export function detectProject(projectRoot: string): ProjectDetection {
  const pkg = readPackageJson(projectRoot);
  if (!pkg) {
    throw new ProjectDetectionError(`No package.json found in ${projectRoot}. Run this inside a React Native / Expo project.`);
  }

  const deps = { ...(pkg.dependencies as Record<string, string> | undefined), ...(pkg.devDependencies as Record<string, string> | undefined) };
  const isExpo = Boolean(deps?.expo);
  const isTypeScript = fs.existsSync(path.join(projectRoot, "tsconfig.json"));
  const hasAppJson = fs.existsSync(path.join(projectRoot, "app.json")) || fs.existsSync(path.join(projectRoot, "app.config.js")) || fs.existsSync(path.join(projectRoot, "app.config.ts"));

  const srcDir = fs.existsSync(path.join(projectRoot, "src")) ? "src" : ".";

  return { isExpo, isTypeScript, srcDir, hasAppJson };
}
