import { cancel, confirm, intro, isCancel, log, outro } from "@clack/prompts";
import { detectPackageManager, installCommand } from "../core/detect-package-manager.js";
import { detectProject } from "../core/detect-project.js";
import { readMapcnConfig, writeMapcnConfig } from "../core/mapcn-config.js";
import { fetchComponentItem, fetchManifest } from "../core/registry-client.js";
import { resolveTransitive } from "../core/resolve.js";
import { allComponentNames } from "../core/component-selection.js";
import { installComponentFiles, toInstalledComponent } from "../core/file-writer.js";
import {
  ensureAndroidPermissions,
  ensureInfoPlistEntries,
  ensurePlugin,
  hasConflictingRendererPlugins,
  readAppJson,
  writeAppJson,
} from "../core/app-json.js";
import { runCommand } from "../utils/exec-command.js";
import { runInitCommand } from "./init.js";
import type { MapcnConfig, ProviderId, RegistryManifestEntry, Renderer } from "../types.js";

export interface AddOptions {
  components: Array<string>;
  projectRoot: string;
  registry: string;
  renderer?: Renderer;
  overwrite: boolean;
  yes: boolean;
  /** Install every component available for the active renderer. */
  all?: boolean;
  /** Only used when `add` has to run init first. */
  provider?: ProviderId;
  /** Internal: set by callers that just wrote mapcn.json, so add doesn't re-run init. */
  skipInitCheck?: boolean;
}

/** Resolves and installs the requested components plus their transitive registry dependencies. */
export async function runAddCommand(options: AddOptions): Promise<void> {
  intro(`mapcn-rn add ${options.all ? "--all" : options.components.join(" ")}`.trim());

  const { projectRoot } = options;

  const config = await loadOrInitConfig(options);
  if (!config) return;

  const renderer = options.renderer ?? config.renderer;
  const { srcDir } = detectProject(projectRoot);

  const manifest = await fetchManifest(options.registry);
  const requested = options.all ? allComponentNames(manifest, renderer) : options.components;
  const resolved = resolveTransitive(manifest, requested);

  const alreadyRequested = new Set(requested);
  const transitiveExtras = resolved.filter((e) => !alreadyRequested.has(e.name));
  if (transitiveExtras.length > 0) {
    log.info(`Also installing required dependencies: ${transitiveExtras.map((e) => e.name).join(", ")}`);
  }

  if (!options.yes) {
    const proceed = await confirm({ message: `Install ${resolved.map((e) => e.name).join(", ")}?` });
    if (isCancel(proceed) || !proceed) {
      cancel("Cancelled.");
      return;
    }
  }

  const npmDeps = new Set<string>();
  let anyConflict = false;

  for (const entry of resolved) {
    const item = await fetchComponentItem(options.registry, entry, renderer);
    const existing = config.components[entry.name];
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const { results } = installComponentFiles(projectRoot, srcDir, item, existing, {
      overwrite: options.overwrite,
      timestamp,
    });

    for (const result of results) {
      const relative = result.targetPath.replace(projectRoot + "/", "");
      if (result.status === "written") log.success(`  ${relative}`);
      else if (result.status === "overwritten") log.warn(`  ${relative} (backed up, then overwritten)`);
      else if (result.status === "unchanged") log.message(`  ${relative} (unchanged)`);
      else if (result.status === "conflict") {
        anyConflict = true;
        log.warn(`  ${relative} has local modifications -- new version written to ${result.sidecarPath}. Review with \`mapcn-rn diff ${entry.name}\`, or re-run with --overwrite.`);
      }
    }

    config.components[entry.name] = toInstalledComponent(item, results);
    item.dependencies.forEach((d) => npmDeps.add(d));
  }

  writeMapcnConfig(projectRoot, config);

  applyAppJsonRequirements(projectRoot, resolved, renderer);

  if (npmDeps.size > 0) {
    const packageManager = detectPackageManager(projectRoot);
    const install = installCommand(packageManager, [...npmDeps]);
    await runCommand(install[0]!, install.slice(1), projectRoot);
  }

  if (anyConflict) {
    outro("Done, with conflicts -- see warnings above.");
  } else {
    outro("Done.");
  }
}

/**
 * Reads mapcn.json, running `init` first when the project has none. Returns
 * null when the user backs out of init, in which case the caller should stop.
 */
async function loadOrInitConfig(options: AddOptions): Promise<MapcnConfig | null> {
  const existing = readMapcnConfig(options.projectRoot);
  if (existing) return existing;

  if (options.skipInitCheck) {
    cancel("No mapcn.json found. Run `npx mapcn-rn init` first.");
    return null;
  }

  log.info("No mapcn.json found -- setting up mapcn-rn first.");
  await runInitCommand({
    projectRoot: options.projectRoot,
    registry: options.registry,
    renderer: options.renderer,
    provider: options.provider,
    yes: options.yes,
    // The caller already said what it wants installed; skip init's picker.
    installComponents: false,
  });

  const created = readMapcnConfig(options.projectRoot);
  if (!created) {
    cancel("Setup did not complete -- nothing was installed.");
    return null;
  }
  return created;
}

/** Expo config plugins declared by an entry, for the renderer in use. */
function pluginsFor(entry: RegistryManifestEntry, renderer: Renderer): Array<string> {
  if (Array.isArray(entry.expoPlugins)) return entry.expoPlugins;
  return entry.expoPlugins[renderer] ?? [];
}

/**
 * Writes the config plugins and native permissions the installed components
 * declare into app.json, so a fresh install passes `mapcn-rn doctor` without
 * hand-editing. Existing entries are left alone.
 */
function applyAppJsonRequirements(projectRoot: string, entries: Array<RegistryManifestEntry>, renderer: Renderer): void {
  const plugins = new Set<string>();
  const androidPermissions = new Set<string>();
  const iosPermissions = new Set<string>();

  for (const entry of entries) {
    pluginsFor(entry, renderer).forEach((p) => plugins.add(p));
    entry.permissions.android.forEach((p) => androidPermissions.add(p));
    entry.permissions.ios.forEach((p) => iosPermissions.add(p));
  }

  if (plugins.size === 0 && androidPermissions.size === 0 && iosPermissions.size === 0) return;

  const appJson = readAppJson(projectRoot);
  if (!appJson) {
    const required = [
      plugins.size > 0 ? `plugins: ${[...plugins].join(", ")}` : null,
      androidPermissions.size > 0 ? `android.permissions: ${[...androidPermissions].join(", ")}` : null,
      iosPermissions.size > 0 ? `ios.infoPlist: ${[...iosPermissions].join(", ")}` : null,
    ].filter((line): line is string => line !== null);
    log.warn(`No app.json found -- add these manually:\n  ${required.join("\n  ")}`);
    return;
  }

  let changed = false;
  for (const plugin of plugins) {
    if (ensurePlugin(appJson.config, plugin)) {
      changed = true;
      log.success(`Added "${plugin}" to app.json plugins`);
    }
  }
  if (ensureAndroidPermissions(appJson.config, [...androidPermissions])) {
    changed = true;
    log.success(`Added Android permissions: ${[...androidPermissions].join(", ")}`);
  }
  if (ensureInfoPlistEntries(appJson.config, [...iosPermissions])) {
    changed = true;
    log.success(`Added iOS usage descriptions: ${[...iosPermissions].join(", ")}`);
  }

  if (hasConflictingRendererPlugins(appJson.config)) {
    log.warn(
      "app.json now lists both @maplibre/maplibre-react-native and @rnmapbox/maps -- these cannot coexist. Remove the one you're not using.",
    );
  }

  if (changed) writeAppJson(appJson.path, appJson.config);
}
