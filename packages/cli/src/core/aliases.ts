import fs from "node:fs";
import path from "node:path";
import type { MapcnConfig } from "../types.js";

type Aliases = MapcnConfig["aliases"];

const DEFAULT_ALIASES: Aliases = {
  ui: "@/components/ui",
  lib: "@/lib",
  hooks: "@/hooks",
  components: "@/components",
};

/** Reads components.json (shadcn convention) if present, else falls back to the standard mapcn defaults. */
export function readAliases(projectRoot: string): Aliases {
  const componentsJsonPath = path.join(projectRoot, "components.json");
  if (fs.existsSync(componentsJsonPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(componentsJsonPath, "utf8")) as { aliases?: Partial<Aliases> };
      return { ...DEFAULT_ALIASES, ...config.aliases };
    } catch {
      // fall through to defaults
    }
  }
  return DEFAULT_ALIASES;
}

/**
 * Resolves an alias-relative target ("@/components/ui/map.tsx") to a path
 * relative to the project's srcDir, given the project's actual "@/*" ->
 * tsconfig path mapping (almost always "./src/*" or "./*").
 */
export function resolveTargetPath(target: string, srcDir: string, projectRoot: string): string {
  const relative = target.startsWith("@/") ? target.slice(2) : target;
  return path.join(projectRoot, srcDir, relative);
}
