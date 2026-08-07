import { cancel, confirm, intro, isCancel, log, outro } from "@clack/prompts";
import { detectPackageManager, installCommand } from "../core/detect-package-manager.js";
import { detectProject } from "../core/detect-project.js";
import { requireMapcnConfig, writeMapcnConfig } from "../core/mapcn-config.js";
import { fetchComponentItem, fetchManifest } from "../core/registry-client.js";
import { resolveTransitive } from "../core/resolve.js";
import { installComponentFiles, toInstalledComponent } from "../core/file-writer.js";
import { runCommand } from "../utils/exec-command.js";
import type { Renderer } from "../types.js";

export interface AddOptions {
  components: Array<string>;
  projectRoot: string;
  registry: string;
  renderer?: Renderer;
  overwrite: boolean;
  yes: boolean;
}

export async function runAddCommand(options: AddOptions): Promise<void> {
  intro(`mapcn-rn add ${options.components.join(" ")}`);

  const { projectRoot } = options;
  const config = requireMapcnConfig(projectRoot);
  const renderer = options.renderer ?? config.renderer;
  const { srcDir } = detectProject(projectRoot);

  const manifest = await fetchManifest(options.registry);
  const resolved = resolveTransitive(manifest, options.components);

  const alreadyRequested = new Set(options.components);
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
