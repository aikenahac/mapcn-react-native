import type { ComponentDefinition } from "./manifest";

export class RegistryGraphError extends Error {}

/**
 * Topologically sorts components so dependencies always precede dependents,
 * and detects cycles (reporting the actual cycle path, per plan §5.4).
 */
export function topologicalSort(components: Array<ComponentDefinition>): Array<ComponentDefinition> {
  const byName = new Map(components.map((c) => [c.name, c]));
  const visited = new Set<string>();
  const inProgress: Array<string> = [];
  const sorted: Array<ComponentDefinition> = [];

  function visit(name: string) {
    if (visited.has(name)) return;
    if (inProgress.includes(name)) {
      const cycle = [...inProgress.slice(inProgress.indexOf(name)), name];
      throw new RegistryGraphError(`Circular registryDependencies: ${cycle.join(" -> ")}`);
    }
    const component = byName.get(name);
    if (!component) {
      throw new RegistryGraphError(`Unresolved registryDependency "${name}" (referenced by ${inProgress[inProgress.length - 1] ?? "<root>"})`);
    }
    inProgress.push(name);
    for (const dep of component.registryDependencies ?? []) visit(dep);
    inProgress.pop();
    visited.add(name);
    sorted.push(component);
  }

  for (const component of components) visit(component.name);
  return sorted;
}

/** All registryDependencies of `names`, transitively, topologically sorted, `names` included. */
export function resolveTransitive(
  components: Array<ComponentDefinition>,
  names: Array<string>,
): Array<ComponentDefinition> {
  const byName = new Map(components.map((c) => [c.name, c]));
  const needed = new Set<string>();

  function collect(name: string) {
    if (needed.has(name)) return;
    const component = byName.get(name);
    if (!component) throw new RegistryGraphError(`Unknown component "${name}"`);
    needed.add(name);
    for (const dep of component.registryDependencies ?? []) collect(dep);
  }
  names.forEach(collect);

  return topologicalSort(components.filter((c) => needed.has(c.name)));
}
