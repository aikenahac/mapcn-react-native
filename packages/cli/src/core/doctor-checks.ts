import fs from "node:fs";
import path from "node:path";
import { detectProject, ProjectDetectionError } from "./detect-project.js";
import { detectPackageManager } from "./detect-package-manager.js";
import { readMapcnConfig } from "./mapcn-config.js";
import { PROVIDERS } from "./providers.js";
import { readAppJson } from "./app-json.js";
import { readEnvValue } from "./env-file.js";
import { readPackageJson } from "./detect-project.js";
import { normalizeContent, contentHash } from "./hash.js";
import type { RegistryManifest } from "../types.js";

export type DoctorCheck = {
  id: string;
  level: "ok" | "warn" | "error" | "info";
  message: string;
  fix?: string;
};

export async function runDoctorChecks(projectRoot: string, manifest?: RegistryManifest): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];

  // 1. React Native / Expo project detected
  try {
    const detection = detectProject(projectRoot);
    if (detection.isExpo) {
      checks.push({ id: "expo-project", level: "ok", message: "Expo project detected" });
    } else {
      checks.push({
        id: "expo-project",
        level: "warn",
        message: "No `expo` dependency detected -- mapcn-rn is built and tested against Expo. Bare React Native may work but isn't verified.",
      });
    }
  } catch (error) {
    if (error instanceof ProjectDetectionError) {
      checks.push({
        id: "expo-project",
        level: "error",
        message: error.message,
      });
      return checks;
    }
    throw error;
  }

  // 2. Package manager detected
  try {
    const packageManager = detectPackageManager(projectRoot);
    const lockfiles = ["pnpm-lock.yaml", "bun.lock", "bun.lockb", "yarn.lock", "package-lock.json"];
    const hasLockfile = lockfiles.some((f) => fs.existsSync(path.join(projectRoot, f)));
    if (hasLockfile) {
      checks.push({ id: "package-manager", level: "ok", message: `Package manager: ${packageManager}` });
    } else {
      checks.push({
        id: "package-manager",
        level: "warn",
        message: `Package manager: ${packageManager} (no lockfile detected)`,
      });
    }
  } catch (error) {
    checks.push({
      id: "package-manager",
      level: "error",
      message: `Failed to detect package manager: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 3. mapcn.json present
  let config = null;
  try {
    config = readMapcnConfig(projectRoot);
  } catch (error) {
    checks.push({
      id: "mapcn-config",
      level: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  if (!config) {
    checks.push({
      id: "mapcn-config",
      level: "error",
      message: "No mapcn.json found. Run `npx mapcn-rn init` first, or `npx mapcn-rn migrate` if this is a v1 project.",
    });

    // Run legacy v1 detection only if config is missing
    try {
      const detection = detectProject(projectRoot);
      const v1FilePath = path.join(projectRoot, detection.srcDir, "components/ui/map.tsx");
      if (fs.existsSync(v1FilePath)) {
        checks.push({
          id: "legacy-v1-install",
          level: "info",
          message: "Legacy v1 installation detected (components/ui/map.tsx exists, no mapcn.json) — run `npx mapcn-rn migrate` to upgrade.",
        });
      }
    } catch {
      // Ignore detection errors when checking for v1
    }

    return checks;
  }

  // 4. Renderer package installed
  try {
    const pkg = readPackageJson(projectRoot);
    const deps = pkg ? { ...(pkg.dependencies as Record<string, string>), ...(pkg.devDependencies as Record<string, string>) } : {};
    const expectedPackage = config.renderer === "maplibre" ? "@maplibre/maplibre-react-native" : "@rnmapbox/maps";
    if (deps?.[expectedPackage]) {
      checks.push({ id: "renderer-package", level: "ok", message: `${expectedPackage} installed` });
    } else {
      checks.push({
        id: "renderer-package",
        level: "error",
        message: `${expectedPackage} not found in package.json dependencies`,
      });
    }
  } catch (error) {
    checks.push({
      id: "renderer-package",
      level: "error",
      message: `Failed to check renderer package: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 5. Both maplibre AND mapbox not simultaneously present
  try {
    const pkg = readPackageJson(projectRoot);
    const deps = pkg ? { ...(pkg.dependencies as Record<string, string>), ...(pkg.devDependencies as Record<string, string>) } : {};
    const hasMaplibre = Boolean(deps?.["@maplibre/maplibre-react-native"]);
    const hasMapbox = Boolean(deps?.["@rnmapbox/maps"]);
    if (hasMaplibre && hasMapbox) {
      checks.push({
        id: "conflicting-renderers",
        level: "error",
        message: "Both @maplibre/maplibre-react-native and @rnmapbox/maps found in dependencies — these cannot coexist in one Expo app. Remove the one you're not using.",
      });
    }
  } catch (error) {
    checks.push({
      id: "conflicting-renderers",
      level: "error",
      message: `Failed to check for conflicting renderers: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 6. Expo config plugin present
  try {
    const appJson = readAppJson(projectRoot);
    const pluginName = config.renderer === "maplibre" ? "@maplibre/maplibre-react-native" : "@rnmapbox/maps";
    if (!appJson) {
      checks.push({
        id: "expo-plugin",
        level: "warn",
        message: `No app.json found — add the Expo config plugin manually: ${pluginName}`,
      });
    } else {
      const hasPlugin = (appJson.config.expo?.plugins ?? []).some((p) => {
        const name = Array.isArray(p) ? p[0] : p;
        return name === pluginName;
      });
      if (hasPlugin) {
        checks.push({ id: "expo-plugin", level: "ok", message: `Expo plugin "${pluginName}" present in app.json` });
      } else {
        checks.push({
          id: "expo-plugin",
          level: "error",
          message: `Expo plugin "${pluginName}" not found in app.json plugins`,
        });
      }
    }
  } catch (error) {
    checks.push({
      id: "expo-plugin",
      level: "error",
      message: `Failed to check Expo plugin: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 7. Mapbox DOWNLOADS_TOKEN
  if (config.renderer === "mapbox") {
    try {
      const buildEnvKey = "MAPBOX_DOWNLOADS_TOKEN";
      const hasEnv = Boolean(process.env[buildEnvKey]) || Boolean(readEnvValue(projectRoot, buildEnvKey));
      if (!hasEnv) {
        checks.push({
          id: "mapbox-downloads-token",
          level: "warn",
          message: `${buildEnvKey} not set in environment or .env — required for building with Mapbox`,
        });
      }
    } catch (error) {
      checks.push({
        id: "mapbox-downloads-token",
        level: "error",
        message: `Failed to check ${config.renderer} downloads token: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  // 8. Basemap provider configured
  try {
    const provider = PROVIDERS[config.provider.id];
    if (provider) {
      checks.push({ id: "provider-configured", level: "ok", message: `Basemap provider: ${provider.label}` });
    } else {
      checks.push({
        id: "provider-configured",
        level: "error",
        message: `Unknown provider: ${config.provider.id}`,
      });
    }
  } catch (error) {
    checks.push({
      id: "provider-configured",
      level: "error",
      message: `Failed to check provider: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 9. Required public env key present
  try {
    const provider = PROVIDERS[config.provider.id];
    if (provider && provider.requiresKey && config.provider.envKey) {
      const envKey = config.provider.envKey;
      const hasValue = Boolean(process.env[envKey]) || Boolean(readEnvValue(projectRoot, envKey));
      if (hasValue) {
        checks.push({ id: "provider-env-key", level: "ok", message: `${envKey} is set` });
      } else {
        checks.push({
          id: "provider-env-key",
          level: "error",
          message: `${envKey} not found in environment or .env — required for ${provider.label}`,
        });
      }
    }
  } catch (error) {
    checks.push({
      id: "provider-env-key",
      level: "error",
      message: `Failed to check provider env key: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 10 & 11. Location permissions (iOS and Android)
  try {
    const hasLocationComponent = Boolean(config.components["location"] || config.components["location-puck"]);
    if (hasLocationComponent) {
      const appJson = readAppJson(projectRoot);
      if (appJson) {
        const hasIOSPermission = Boolean(appJson.config.expo?.ios?.infoPlist?.NSLocationWhenInUseUsageDescription);
        if (!hasIOSPermission) {
          checks.push({
            id: "ios-location-permission",
            level: "error",
            message: "NSLocationWhenInUseUsageDescription not found in app.json ios.infoPlist (required for location components)",
          });
        }

        const androidPerms = appJson.config.expo?.android?.permissions ?? [];
        const hasAndroidPermissions = androidPerms.includes("ACCESS_FINE_LOCATION") && androidPerms.includes("ACCESS_COARSE_LOCATION");
        if (!hasAndroidPermissions) {
          checks.push({
            id: "android-location-permissions",
            level: "error",
            message: "Missing ACCESS_FINE_LOCATION and/or ACCESS_COARSE_LOCATION in app.json android.permissions (required for location components)",
          });
        }
      }
    }
  } catch (error) {
    checks.push({
      id: "location-permissions",
      level: "error",
      message: `Failed to check location permissions: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 13. Local modifications
  try {
    const detection = detectProject(projectRoot);
    const modifiedFiles: string[] = [];
    for (const [componentName, component] of Object.entries(config.components)) {
      for (const file of component.files) {
        const targetPath = path.join(projectRoot, detection.srcDir, file.path);
        if (!fs.existsSync(targetPath)) {
          modifiedFiles.push(`${componentName}/${file.path} (missing)`);
          continue;
        }
        const currentContent = normalizeContent(fs.readFileSync(targetPath, "utf8"));
        const currentHash = contentHash(currentContent);
        if (currentHash !== file.hash) {
          modifiedFiles.push(`${componentName}/${file.path}`);
        }
      }
    }
    if (modifiedFiles.length > 0) {
      checks.push({
        id: "local-modifications",
        level: "info",
        message: `${modifiedFiles.length} component file(s) have local modifications: ${modifiedFiles.join(", ")} — this is fine, just tracked for \`provider\`/\`migrate\` safety.`,
      });
    }
  } catch (error) {
    checks.push({
      id: "local-modifications",
      level: "error",
      message: `Failed to check for local modifications: ${error instanceof Error ? error.message : String(error)}`,
    });
  }

  // 14. Missing registry dependencies
  if (manifest) {
    try {
      for (const [componentName] of Object.entries(config.components)) {
        const entry = manifest.components.find((c) => c.name === componentName);
        if (entry) {
          for (const depName of entry.registryDependencies) {
            if (!config.components[depName]) {
              checks.push({
                id: "missing-dependencies",
                level: "error",
                message: `Component "${componentName}" depends on "${depName}" which is not installed`,
              });
            }
          }
        }
      }
    } catch (error) {
      checks.push({
        id: "missing-dependencies",
        level: "error",
        message: `Failed to check registry dependencies: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  return checks;
}
