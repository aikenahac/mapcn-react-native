import type { RegistryManifest, RegistryManifestEntry, Renderer } from "../types.js";

/**
 * What `init` installs when the user picks "Minimal", and what `--yes` selects
 * with no explicit component list. `core` is omitted on purpose -- it arrives
 * as a transitive dependency via `resolveTransitive`.
 */
export const MINIMAL_COMPONENTS: Array<string> = ["map", "marker", "popup", "controls"];

/**
 * Manifest entries installable with `renderer`. `fetchComponentItem` throws for
 * a component that has no variant for the active renderer, so anything that
 * expands to "everything" has to filter rather than pass every name blindly.
 */
export function componentsForRenderer(manifest: RegistryManifest, renderer: Renderer): Array<RegistryManifestEntry> {
  return manifest.components.filter((entry) => entry.renderers === "any" || entry.renderers.includes(renderer));
}

/** Every installable component name for `renderer` -- the expansion of `--all`. */
export function allComponentNames(manifest: RegistryManifest, renderer: Renderer): Array<string> {
  return componentsForRenderer(manifest, renderer).map((entry) => entry.name);
}

/** Groups entries by manifest category, preserving manifest order within each group. */
export function groupByCategory(entries: Array<RegistryManifestEntry>): Record<string, Array<RegistryManifestEntry>> {
  const groups: Record<string, Array<RegistryManifestEntry>> = {};
  for (const entry of entries) {
    (groups[entry.category] ??= []).push(entry);
  }
  return groups;
}

/**
 * Squeezes a registry description down to something that fits on one line next
 * to a checkbox -- registry descriptions run to 200+ characters, which wraps
 * unreadably across a 16-row list.
 */
export function shortHint(description: string, maxLength = 64): string {
  const firstSentence = description.split(". ")[0]?.trim() ?? "";
  const text = firstSentence.replace(/\.$/, "");
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

/** Parses a `--components a,b,c` value into trimmed, deduped names. */
export function parseComponentList(value: string): Array<string> {
  const names = value
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
  return [...new Set(names)];
}
