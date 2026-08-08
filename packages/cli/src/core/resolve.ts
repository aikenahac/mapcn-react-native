import type { RegistryManifest, RegistryManifestEntry } from "../types.js";

export class ResolveError extends Error {}

/** Topologically sorts manifest entries (dependencies before dependents), throwing on cycles or unknown names. */
export function topologicalSort(entries: Array<RegistryManifestEntry>): Array<RegistryManifestEntry> {
  const byName = new Map(entries.map((e) => [e.name, e]));
  const visited = new Set<string>();
  const inProgress: Array<string> = [];
  const sorted: Array<RegistryManifestEntry> = [];

  function visit(name: string) {
    if (visited.has(name)) return;
    if (inProgress.includes(name)) {
      throw new ResolveError(`Circular registry dependency: ${[...inProgress.slice(inProgress.indexOf(name)), name].join(" -> ")}`);
    }
    const entry = byName.get(name);
    if (!entry) throw new ResolveError(`Unknown component "${name}"`);
    inProgress.push(name);
    for (const dep of entry.registryDependencies) visit(dep);
    inProgress.pop();
    visited.add(name);
    sorted.push(entry);
  }

  entries.forEach((e) => visit(e.name));
  return sorted;
}

/** All registryDependencies of `names`, transitively, topologically sorted, `names` included. */
export function resolveTransitive(manifest: RegistryManifest, names: Array<string>): Array<RegistryManifestEntry> {
  const byName = new Map(manifest.components.map((c) => [c.name, c]));
  const needed = new Set<string>();

  function collect(name: string) {
    if (needed.has(name)) return;
    const entry = byName.get(name);
    if (!entry) throw new ResolveError(`Unknown component "${name}". Run \`mapcn-rn list\` to see what's available.`);
    needed.add(name);
    entry.registryDependencies.forEach(collect);
  }
  names.forEach(collect);

  return topologicalSort(manifest.components.filter((c) => needed.has(c.name)));
}
