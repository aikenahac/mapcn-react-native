import { readMapcnConfig } from "../core/mapcn-config.js";
import { fetchManifest } from "../core/registry-client.js";

export interface ListOptions {
  projectRoot: string;
  registry: string;
}

export async function runListCommand(options: ListOptions): Promise<void> {
  const config = readMapcnConfig(options.projectRoot);
  const manifest = await fetchManifest(options.registry);

  const installed = new Set(Object.keys(config?.components ?? {}));

  console.log(`mapcn-rn registry (v${manifest.version})\n`);
  for (const entry of manifest.components) {
    const marker = installed.has(entry.name) ? "✓" : " ";
    const renderers = entry.renderers === "any" ? "any renderer" : entry.renderers.join(", ");
    console.log(`  [${marker}] ${entry.name.padEnd(16)} ${entry.title} (${renderers})`);
  }

  if (!config) {
    console.log("\nNo mapcn.json found -- run `mapcn-rn init` to get started.");
  } else {
    console.log(`\n✓ installed   renderer: ${config.renderer}, provider: ${config.provider.id}`);
  }
}
