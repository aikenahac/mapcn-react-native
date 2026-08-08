import fs from "node:fs";
import path from "node:path";
import { cancel, confirm, intro, isCancel, log, note, select } from "@clack/prompts";
import { detectProject } from "../core/detect-project.js";
import { detectV1Installation } from "../core/v1-detect.js";
import { readMapcnConfig, writeMapcnConfig, MAPCN_SCHEMA_VERSION } from "../core/mapcn-config.js";
import { readAliases } from "../core/aliases.js";
import { detectStyling } from "../core/detect-styling.js";
import { PROVIDERS, providersForRenderer } from "../core/providers.js";
import { runAddCommand } from "./add.js";
import { runDoctorCommand } from "./doctor.js";
import type { MapcnConfig, ProviderId, Renderer } from "../types.js";

export interface MigrateOptions {
  projectRoot: string;
  registry: string;
  yes: boolean;
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

/** Assists a v1 -> v2 upgrade: preserves the v1 file, installs the equivalent v2 components, and reports manual review items. */
export async function runMigrateCommand(options: MigrateOptions): Promise<void> {
  intro("mapcn-rn migrate");

  // Check if already migrated
  if (readMapcnConfig(options.projectRoot)) {
    log.warn("mapcn.json already exists — this project is already on v2. Use `mapcn-rn doctor` instead.");
    return;
  }

  const detection = detectProject(options.projectRoot);
  const v1 = detectV1Installation(options.projectRoot, detection.srcDir);

  if (!v1.detected) {
    log.warn("No v1 installation detected (no components/ui/map.tsx found).");
    return;
  }

  // Determine renderer and provider
  const renderer = v1.renderer ?? (await promptRenderer());
  const provider = v1.provider ?? (renderer === "mapbox" ? "mapbox" : await promptProvider(renderer));

  note(
    [`Detected v1 installation:`, `Renderer: ${renderer}`, `Provider: ${provider}`].join("\n"),
    "V1 detection",
  );

  if (v1.customized) {
    log.warn("This components/ui/map.tsx has local customizations — it will be backed up, not deleted.");
  }

  if (!options.yes) {
    const proceed = await confirm({ message: "Continue with migration?" });
    if (isCancel(proceed) || !proceed) {
      cancel("Cancelled.");
      return;
    }
  }

  // Back up v1 file
  const v1FilePath = path.join(options.projectRoot, detection.srcDir, "components/ui/map.tsx");
  const backupPath = path.join(options.projectRoot, detection.srcDir, "components/ui/map.v1.tsx.bak");
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.renameSync(v1FilePath, backupPath);
  log.success("Backed up v1 components/ui/map.tsx → map.v1.tsx.bak");

  // Create fresh mapcn.json
  const aliases = readAliases(options.projectRoot);
  const styling = detectStyling(options.projectRoot);

  const config: MapcnConfig = {
    $schema: "https://mapcn-rn.dev/schema/mapcn.json",
    schemaVersion: MAPCN_SCHEMA_VERSION,
    renderer,
    provider: { id: provider, envKey: PROVIDERS[provider].envKey },
    styling,
    aliases,
    components: {},
  };

  writeMapcnConfig(options.projectRoot, config);
  log.success("Created mapcn.json with v2 structure");

  // Install v2 components
  try {
    await runAddCommand({
      components: ["map", "marker", "popup", "controls", "route", "location", "location-puck"],
      projectRoot: options.projectRoot,
      registry: options.registry,
      renderer,
      overwrite: false,
      yes: true,
    });
    log.success("Installed v2 components");
  } catch (error) {
    log.warn(`Failed to install components: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Analyze v1 file for API changes
  const v1Content = fs.readFileSync(backupPath, "utf8");
  const lines = v1Content.split("\n");
  const patterns = [
    { regex: /cameraRef\.current\.\w+/, message: "useMap().flyTo/moveTo/etc — cameraRef.current.X(...) is now map.X(...)" },
    { regex: /MapUserLocation/, message: "MapUserLocation is deprecated — rename to MapLocationPuck (props: showHeading→bearing, showAccuracy→accuracyRing, animated→pulsing, autoRequestPermission→requestPermission)" },
    { regex: /MarkerPopup/, message: "MarkerPopup is now overlay-based (not native Callout) — review positioning/styling" },
    { regex: /EXPO_PUBLIC_MAPBOX_API_KEY/, message: "Env var renamed: EXPO_PUBLIC_MAPBOX_API_KEY → EXPO_PUBLIC_MAPBOX_TOKEN" },
    { regex: /LocationManager/, message: "LocationManager is no longer re-exported from map.tsx — import it directly from @maplibre/maplibre-react-native, or better, migrate to useLocationTracking" },
    { regex: /useCurrentPosition/, message: "useCurrentPosition now returns MapPosition (coordinate: [lng,lat]) instead of a raw GeolocationPosition — update coords.longitude/coords.latitude call sites" },
  ];

  let foundAny = false;
  const issues: Array<{ line: number; message: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    for (const p of patterns) {
      if (p.regex.test(line)) {
        issues.push({ line: i + 1, message: p.message });
        foundAny = true;
        break;
      }
    }
  }

  if (foundAny) {
    const report = issues.map((issue) => `${backupPath}:${issue.line} — ${issue.message}`).join("\n");
    note(report, "Manual review required");
  } else {
    note("No known v1 API usages detected in the backed-up file — spot-check anyway.", "Manual review");
  }

  // Run doctor
  await runDoctorCommand({ projectRoot: options.projectRoot, registry: options.registry, json: false, verbose: false });

  // Print final checklist
  note(
    `□ Review components/ui/map.v1.tsx.bak and the manual-review report above
□ Review .mapcn-backup/ if this run touched any existing files
□ Update Map center/zoom usage -> defaultViewport (or adopt controlled viewport)
□ npx expo prebuild --clean && rebuild your dev client
□ Verify rendering on iOS and Android`,
    "Final checklist",
  );
}
