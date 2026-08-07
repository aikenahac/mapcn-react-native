import { intro, log, outro } from "@clack/prompts";
import { runDoctorChecks } from "../core/doctor-checks.js";
import { fetchManifest } from "../core/registry-client.js";
import { readMapcnConfig } from "../core/mapcn-config.js";
import type { RegistryManifest } from "../types.js";

export interface DoctorOptions {
  projectRoot: string;
  registry: string;
  json: boolean;
  verbose: boolean;
}

export async function runDoctorCommand(options: DoctorOptions): Promise<void> {
  const { projectRoot, registry, json, verbose } = options;

  // Try to fetch manifest for check #14
  let manifest: RegistryManifest | undefined;
  const config = readMapcnConfig(projectRoot);
  if (config) {
    try {
      manifest = await fetchManifest(registry);
    } catch {
      // Network unavailable or registry error — just skip check #14
    }
  }

  const checks = await runDoctorChecks(projectRoot, manifest);

  if (json) {
    const ok = checks.filter((c) => c.level === "ok").length;
    const warn = checks.filter((c) => c.level === "warn").length;
    const error = checks.filter((c) => c.level === "error").length;
    const info = checks.filter((c) => c.level === "info").length;
    console.log(JSON.stringify({ checks, summary: { ok, warn, error, info } }, null, 2));
    process.exitCode = checks.some((c) => c.level === "error") ? 1 : 0;
    return;
  }

  intro("mapcn-rn doctor");

  for (const check of checks) {
    if (check.level === "ok") {
      if (verbose) {
        log.success(check.message);
      }
    } else if (check.level === "warn") {
      log.warn(check.message);
    } else if (check.level === "error") {
      log.error(check.message);
    } else if (check.level === "info") {
      log.info(check.message);
    }
  }

  const ok = checks.filter((c) => c.level === "ok").length;
  const warn = checks.filter((c) => c.level === "warn").length;
  const error = checks.filter((c) => c.level === "error").length;
  const hasErrors = error > 0;

  const summary = hasErrors ? `${error} error(s), ${warn} warning(s) found` : warn > 0 ? `${warn} warning(s) found` : "All checks passed.";

  outro(summary);

  if (hasErrors) {
    process.exitCode = 1;
  }
}
