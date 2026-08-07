import fs from "node:fs";
import path from "node:path";
import type { Styling } from "../types.js";
import { readPackageJson } from "./detect-project.js";

/** Uniwind vs NativeWind vs neither -- read from actual config, never assumed. */
export function detectStyling(projectRoot: string): Styling {
  const metroConfigPath = path.join(projectRoot, "metro.config.js");
  if (fs.existsSync(metroConfigPath)) {
    const content = fs.readFileSync(metroConfigPath, "utf8");
    if (content.includes("withUniwindConfig") || content.includes("uniwind/metro")) return "uniwind";
    if (content.includes("withNativeWind") || content.includes("nativewind/metro")) return "nativewind";
  }

  const pkg = readPackageJson(projectRoot);
  const deps = { ...(pkg?.dependencies as Record<string, string> | undefined), ...(pkg?.devDependencies as Record<string, string> | undefined) };
  if (deps?.uniwind) return "uniwind";
  if (deps?.nativewind) return "nativewind";

  return "none";
}
