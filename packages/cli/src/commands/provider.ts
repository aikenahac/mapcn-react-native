import path from "node:path";
import { cancel, confirm, intro, isCancel, log, note, outro } from "@clack/prompts";
import { execa } from "execa";
import { requireMapcnConfig, writeMapcnConfig } from "../core/mapcn-config.js";
import { detectPackageManager, installCommand } from "../core/detect-package-manager.js";
import { fetchManifest, fetchComponentItem } from "../core/registry-client.js";
import { readAppJson, writeAppJson, removePlugin, ensurePlugin } from "../core/app-json.js";
import { planProviderSwitch } from "../core/provider-switch.js";
import { runCommand } from "../utils/exec-command.js";
import { PROVIDERS } from "../core/providers.js";
import { ensureEnvKeyPlaceholder } from "../core/env-file.js";
import { installComponentFiles, toInstalledComponent } from "../core/file-writer.js";
import { detectProject } from "../core/detect-project.js";
import type { ProviderId } from "../types.js";

export interface ProviderOptions {
  projectRoot: string;
  registry: string;
  target: string;
  yes: boolean;
  force: boolean;
}

function uninstallCommand(manager: string, pkg: string): string[] {
  switch (manager) {
    case "pnpm":
      return ["pnpm", "remove", pkg];
    case "yarn":
      return ["yarn", "remove", pkg];
    case "bun":
      return ["bun", "remove", pkg];
    case "npm":
      return ["npm", "uninstall", pkg];
    default:
      return [];
  }
}

/** Switches renderer or basemap provider, rewriting only the renderer-specific adapter files. */
export async function runProviderCommand(options: ProviderOptions): Promise<void> {
  intro("mapcn-rn provider");

  const config = requireMapcnConfig(options.projectRoot);

  // Validate target
  if (!(options.target in PROVIDERS)) {
    const validProviders = Object.keys(PROVIDERS).join(", ");
    throw new Error(`Unknown provider "${options.target}". Valid options: ${validProviders}`);
  }

  const plan = planProviderSwitch({ renderer: config.renderer, provider: config.provider.id }, options.target as ProviderId);

  // Print plan
  const details = [
    `From: ${config.renderer} / ${PROVIDERS[config.provider.id].label}`,
    `To:   ${plan.toRenderer} / ${PROVIDERS[plan.toProvider].label}`,
  ];

  if (plan.removeNpmPackage) {
    details.push(`Remove package: ${plan.removeNpmPackage}`);
  }
  details.push(`Add package: ${plan.addNpmPackage}`);

  if (plan.removePlugin) {
    details.push(`Remove Expo plugin: ${plan.removePlugin}`);
  }
  details.push(`Add Expo plugin: ${plan.addPlugin}`);

  if (plan.removeEnvKey && plan.addEnvKey) {
    details.push(`Change env key: ${plan.removeEnvKey} → ${plan.addEnvKey}`);
  } else if (plan.removeEnvKey) {
    details.push(`Remove env key: ${plan.removeEnvKey}`);
  } else if (plan.addEnvKey) {
    details.push(`Add env key: ${plan.addEnvKey}`);
  }

  if (plan.capabilityNotes.length > 0) {
    details.push("", "Capability changes:");
    plan.capabilityNotes.forEach((note) => details.push(`  • ${note}`));
  }

  note(details.join("\n"));

  // Confirm
  if (!options.yes) {
    const proceed = await confirm({ message: "Continue?" });
    if (isCancel(proceed) || !proceed) {
      cancel("Cancelled.");
      return;
    }
  }

  // Git safety check
  try {
    const result = await execa("git", ["status", "--porcelain"], { cwd: options.projectRoot });
    if (result.stdout.trim()) {
      if (!options.force) {
        cancel("Working tree has uncommitted changes. Commit or stash first, or pass --force to override.");
        return;
      }
      log.warn("Working tree has uncommitted changes. Proceeding with --force.");
    }
  } catch {
    // Not a git repo or git not installed — proceed
  }

  // Package manager swap
  const packageManager = detectPackageManager(options.projectRoot);
  if (plan.removeNpmPackage) {
    const uninstall = uninstallCommand(packageManager, plan.removeNpmPackage);
    await runCommand(uninstall[0]!, uninstall.slice(1), options.projectRoot);
  }

  const install = installCommand(packageManager, [plan.addNpmPackage]);
  await runCommand(install[0]!, install.slice(1), options.projectRoot);

  // app.json: remove and add plugins
  const appJson = readAppJson(options.projectRoot);
  if (appJson) {
    if (plan.removePlugin) {
      removePlugin(appJson.config, plan.removePlugin);
    }
    ensurePlugin(appJson.config, plan.addPlugin);
    writeAppJson(appJson.path, appJson.config);
  }

  // Env: only ensure placeholder in .env.example, never touch .env
  if (plan.addEnvKey) {
    const envExamplePath = path.join(options.projectRoot, ".env.example");
    ensureEnvKeyPlaceholder(envExamplePath, plan.addEnvKey, `Get a key for ${PROVIDERS[plan.toProvider].label}`);
    if (plan.removeEnvKey) {
      note(
        `Update your .env:\n  • Remove ${plan.removeEnvKey}\n  • Add ${plan.addEnvKey} (if using ${PROVIDERS[plan.toProvider].label})`,
        "Manual action required",
      );
    } else {
      note(`Set ${plan.addEnvKey} in your .env before running the app.`, "Action required");
    }
  }

  // Rewrite renderer-specific files if renderer changed
  if (plan.rendererChanged) {
    const detection = detectProject(options.projectRoot);
    const manifest = await fetchManifest(options.registry);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    for (const componentName of ["map", "marker", "location-puck"]) {
      if (config.components[componentName]) {
        const entry = manifest.components.find((c) => c.name === componentName);
        if (entry) {
          const item = await fetchComponentItem(options.registry, entry, plan.toRenderer);
          const results = installComponentFiles(options.projectRoot, detection.srcDir, item, config.components[componentName], {
            overwrite: true,
            timestamp,
          });
          config.components[componentName] = toInstalledComponent(item, results.results, manifest.version);
        }
      }
    }
  }

  // Update config
  config.renderer = plan.toRenderer;
  config.provider = { id: plan.toProvider, envKey: plan.addEnvKey };
  writeMapcnConfig(options.projectRoot, config);

  // Print notes and final instructions
  if (plan.capabilityNotes.length > 0) {
    log.warn("Capability notes:");
    plan.capabilityNotes.forEach((n) => log.warn(`  • ${n}`));
  }

  const nextSteps = [
    "npx expo prebuild --clean",
    "Rebuild your dev client (required after renderer or basemap switch)",
    "Verify rendering on both iOS and Android",
  ];

  outro(`Done. Next steps:\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`);
}
