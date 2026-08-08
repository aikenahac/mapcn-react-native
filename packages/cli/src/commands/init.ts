import path from "node:path";
import { cancel, confirm, groupMultiselect, intro, isCancel, log, note, outro, select, spinner } from "@clack/prompts";
import { detectProject, ProjectDetectionError } from "../core/detect-project.js";
import { detectPackageManager, installCommand } from "../core/detect-package-manager.js";
import { detectStyling } from "../core/detect-styling.js";
import { readAliases } from "../core/aliases.js";
import { PROVIDERS, providersForRenderer } from "../core/providers.js";
import { MAPCN_SCHEMA_VERSION, mapcnConfigPath, readMapcnConfig, writeMapcnConfig } from "../core/mapcn-config.js";
import { ensurePlugin, hasConflictingRendererPlugins, readAppJson, writeAppJson } from "../core/app-json.js";
import { ensureEnvKeyPlaceholder } from "../core/env-file.js";
import { fetchManifest } from "../core/registry-client.js";
import { allComponentNames, componentsForRenderer, groupByCategory, MINIMAL_COMPONENTS, shortHint } from "../core/component-selection.js";
import { runCommand } from "../utils/exec-command.js";
import { runAddCommand } from "./add.js";
import type { MapcnConfig, ProviderId, RegistryManifest, Renderer } from "../types.js";

export interface InitOptions {
  registry: string;
  renderer?: Renderer;
  provider?: ProviderId;
  yes: boolean;
  projectRoot: string;
  /** Install every component available for the chosen renderer. */
  all?: boolean;
  /** Explicit component list, bypassing the picker. */
  components?: Array<string>;
  /** Defaults to true. `add` sets this false when it auto-inits and will install its own list. */
  installComponents?: boolean;
}

/** Sets up renderer, provider, config, and the base `map` component for a fresh project. */
export async function runInitCommand(options: InitOptions): Promise<void> {
  intro("mapcn-rn init");

  const { projectRoot } = options;

  const existing = readMapcnConfig(projectRoot);
  if (existing && !options.yes) {
    const proceed = await confirm({
      message: `${path.relative(process.cwd(), mapcnConfigPath(projectRoot))} already exists (renderer: ${existing.renderer}). Re-run init anyway?`,
      initialValue: false,
    });
    if (isCancel(proceed) || !proceed) {
      cancel("Nothing to do -- use `mapcn-rn add <component>` to install more components.");
      return;
    }
  }

  let detection;
  try {
    detection = detectProject(projectRoot);
  } catch (error) {
    if (error instanceof ProjectDetectionError) {
      cancel(error.message);
      process.exit(1);
    }
    throw error;
  }

  if (!detection.isExpo) {
    log.warn("No `expo` dependency detected -- mapcn-rn is built and tested against Expo. Bare React Native may work but isn't verified.");
  }

  // `--yes` means "don't ask me anything", so it has to supply defaults for the
  // renderer and provider too -- MapLibre + CARTO, the pair that needs no API key.
  const renderer = options.renderer ?? (options.yes ? "maplibre" : await promptRenderer());
  const providerId =
    options.provider ?? (renderer === "mapbox" ? "mapbox" : options.yes ? "carto" : await promptProvider(renderer));
  const provider = PROVIDERS[providerId];

  const packageManager = detectPackageManager(projectRoot);
  const styling = detectStyling(projectRoot);
  const aliases = readAliases(projectRoot);

  const installComponents = options.installComponents ?? true;
  const selected = installComponents ? await selectComponents(options, renderer) : [];

  note(
    [
      `Renderer:         ${renderer}`,
      `Basemap provider: ${provider.label}`,
      `Package manager:  ${packageManager}`,
      `Styling:          ${styling}`,
      ...(installComponents ? [`Components:       ${selected.length > 0 ? selected.join(", ") : "none"}`] : []),
    ].join("\n"),
    "Detected configuration",
  );

  if (!options.yes) {
    const proceed = await confirm({ message: "Continue with this configuration?" });
    if (isCancel(proceed) || !proceed) {
      cancel("Cancelled.");
      return;
    }
  }

  const config: MapcnConfig = {
    $schema: "https://mapcn-rn.dev/schema/mapcn.json",
    schemaVersion: MAPCN_SCHEMA_VERSION,
    renderer,
    provider: { id: provider.id, envKey: provider.envKey },
    styling,
    aliases,
    components: existing?.components ?? {},
  };
  writeMapcnConfig(projectRoot, config);
  log.success("Wrote mapcn.json");

  const installSpinner = spinner();
  installSpinner.start(`Installing ${provider.npmPackage}`);
  const install = installCommand(packageManager, [`${provider.npmPackage}@${provider.npmVersionRange}`]);
  await runCommand(install[0]!, install.slice(1), projectRoot);
  installSpinner.stop(`Installed ${provider.npmPackage}`);

  const appJson = readAppJson(projectRoot);
  if (appJson) {
    let changed = ensurePlugin(appJson.config, provider.expoPlugin);
    if (hasConflictingRendererPlugins(appJson.config)) {
      log.warn(
        "app.json now lists both @maplibre/maplibre-react-native and @rnmapbox/maps -- these cannot coexist. Remove the one you're not using.",
      );
    }
    if (changed) {
      writeAppJson(appJson.path, appJson.config);
      log.success(`Added "${provider.expoPlugin}" to app.json plugins`);
    }
  } else {
    log.warn("No app.json found -- add the Expo config plugin manually: " + provider.expoPlugin);
  }

  if (provider.requiresKey && provider.envKey) {
    const envExamplePath = path.join(projectRoot, ".env.example");
    if (ensureEnvKeyPlaceholder(envExamplePath, provider.envKey, `Get a free key: see mapcn-rn docs for ${provider.label}`)) {
      log.success(`Added ${provider.envKey} to .env.example`);
    }
    note(`Set ${provider.envKey} in your .env file before running the app.`, "Action required");
  }

  if (installComponents && selected.length > 0) {
    await runAddCommand({
      components: selected,
      projectRoot,
      registry: options.registry,
      renderer,
      overwrite: false,
      yes: true,
      skipInitCheck: true,
    });
  }

  const nextSteps = [
    provider.requiresKey && provider.envKey ? `1. Set ${provider.envKey} in .env` : null,
    "2. npx expo prebuild --clean",
    "3. Rebuild your dev client (mapcn-rn requires a custom dev build, not Expo Go)",
  ].filter((step): step is string => step !== null);

  outro(`Done. Next steps:\n${nextSteps.join("\n")}`);
}

/**
 * Resolves which components to install. Explicit flags win, then `--all`, then
 * `--yes` (minimal); otherwise it prompts.
 */
async function selectComponents(options: InitOptions, renderer: Renderer): Promise<Array<string>> {
  if (options.components && options.components.length > 0) return options.components;

  let manifest: RegistryManifest;
  try {
    manifest = await fetchManifest(options.registry);
  } catch (error) {
    // A registry that's unreachable shouldn't sink the whole setup -- config,
    // renderer package, and app.json wiring are still worth writing.
    log.warn(`Could not reach the registry (${error instanceof Error ? error.message : String(error)}) -- skipping component install.`);
    return [];
  }

  if (options.all) return allComponentNames(manifest, renderer);
  if (options.yes) return MINIMAL_COMPONENTS;

  const available = componentsForRenderer(manifest, renderer);

  const preset = await select({
    message: "What do you want to install?",
    options: [
      { value: "minimal", label: "Minimal", hint: MINIMAL_COMPONENTS.join(", ") },
      { value: "all", label: "Everything", hint: `all ${available.length} components` },
      { value: "choose", label: "Let me choose", hint: "pick from a list" },
    ],
  });
  if (isCancel(preset)) {
    cancel("Cancelled.");
    process.exit(1);
  }

  if (preset === "minimal") return MINIMAL_COMPONENTS;
  if (preset === "all") return available.map((entry) => entry.name);

  const grouped = groupByCategory(available);
  const picked = await groupMultiselect({
    message: "Select components",
    options: Object.fromEntries(
      Object.entries(grouped).map(([category, entries]) => [
        category,
        entries.map((entry) => ({ value: entry.name, label: entry.name, hint: shortHint(entry.description) })),
      ]),
    ),
    initialValues: MINIMAL_COMPONENTS,
    selectableGroups: true,
    required: false,
  });
  if (isCancel(picked)) {
    cancel("Cancelled.");
    process.exit(1);
  }
  return picked;
}

async function promptRenderer(): Promise<Renderer> {
  const value = await select({
    message: "Which renderer?",
    options: [
      { value: "maplibre", label: "MapLibre", hint: "open source, no vendor lock-in" },
      { value: "mapbox", label: "Mapbox", hint: "richer location puck, commercial terms" },
    ],
  });
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(1);
  }
  return value as Renderer;
}

async function promptProvider(renderer: Renderer): Promise<ProviderId> {
  const options = providersForRenderer(renderer).map((p) => ({ value: p.id, label: p.label, hint: p.hint }));
  const value = await select({ message: "Which basemap provider?", options });
  if (isCancel(value)) {
    cancel("Cancelled.");
    process.exit(1);
  }
  return value as ProviderId;
}
