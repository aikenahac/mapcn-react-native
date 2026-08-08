import path from "node:path";
import type { ComponentDefinition, RegistryManifest, Renderer } from "./manifest";
import { APP_SRC, DOCS_REGISTRY_OUT, REPO_ROOT, resolveAliasPath, SHARED_SRC } from "./paths";
import { contentHash, readFileNormalized, stableStringify, writeFileIfChanged } from "./fs-utils";
import { topologicalSort } from "./graph";
import { barrelModulesFor } from "./materialize";

interface RegistryItemFile {
  path: string;
  content: string;
  type: string;
  target: string;
}

interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies: Array<string>;
  devDependencies: Array<string>;
  registryDependencies: Array<string>;
  files: Array<RegistryItemFile>;
}

function fileEntryFor(sourcePath: string, to: string): RegistryItemFile {
  return {
    // Repo-relative, not the local machine's absolute path -- this is
    // distributed to consumers, so it must never leak `/Users/<you>/...`.
    path: path.relative(REPO_ROOT, sourcePath),
    content: readFileNormalized(sourcePath),
    type: "registry:ui",
    target: resolveAliasPath(to),
  };
}

function buildRegistryItem(component: ComponentDefinition, renderer: Renderer | null): RegistryItem {
  const files: Array<RegistryItemFile> =
    component.source === "shared"
      ? component.files.map((f) => fileEntryFor(path.join(SHARED_SRC, f.from), f.to))
      : (component.filesByRenderer[renderer as Renderer] ?? []).map((f) =>
          fileEntryFor(path.join(APP_SRC[renderer as Renderer], f.path), f.to ?? `@ui/${path.basename(f.path)}`),
        );

  const dependencies =
    component.source === "shared"
      ? component.dependencies ?? []
      : component.dependenciesByRenderer?.[renderer as Renderer] ?? [];

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: component.name,
    type: "registry:ui",
    title: component.title,
    description: component.description,
    dependencies,
    devDependencies: component.source === "shared" ? component.devDependencies ?? [] : [],
    registryDependencies: component.registryDependencies ?? [],
    files,
  };
}

interface ManifestEntry {
  name: string;
  title: string;
  description: string;
  category: string;
  docsSlug?: string;
  source: "shared" | "per-renderer";
  renderers: Array<Renderer> | "any";
  registryDependencies: Array<string>;
  env: Array<string>;
  permissions: { ios: Array<string>; android: Array<string> };
  expoPlugins: Array<string> | Partial<Record<Renderer, Array<string>>>;
  capabilities?: Record<string, unknown>;
  /** Import specifiers this component contributes to the components/ui/mapcn barrel. */
  barrelModules: Array<string>;
  contentHash: string;
}

function manifestEntryFor(component: ComponentDefinition): ManifestEntry {
  const files =
    component.source === "shared"
      ? component.files.map((f) => readFileNormalized(path.join(SHARED_SRC, f.from)))
      : component.renderers.flatMap((r) => (component.filesByRenderer[r] ?? []).map((f) => readFileNormalized(path.join(APP_SRC[r], f.path))));

  return {
    name: component.name,
    title: component.title,
    description: component.description,
    category: component.category,
    docsSlug: component.docsSlug,
    source: component.source,
    renderers: component.source === "per-renderer" ? component.renderers : "any",
    registryDependencies: component.registryDependencies ?? [],
    env: component.env ?? [],
    permissions: { ios: component.permissions?.ios ?? [], android: component.permissions?.android ?? [] },
    expoPlugins: component.source === "per-renderer" ? component.expoPluginsByRenderer ?? {} : [],
    capabilities: component.capabilities,
    barrelModules: barrelModulesFor(component),
    contentHash: contentHash(files.join("\0")),
  };
}

/**
 * Emits, deterministically:
 *   apps/docs/public/r/<name>.json               -- MapLibre variant (or the only variant)
 *   apps/docs/public/r/<name>.mapbox.json         -- Mapbox variant, when it differs
 *   apps/docs/public/r/index.json                 -- full mapcn manifest (what the CLI reads)
 *   apps/docs/public/r/registry.json              -- shadcn registry index
 * Returns the list of paths written (empty on a no-op re-run).
 */
export function emitRegistry(manifest: RegistryManifest): Array<string> {
  const written: Array<string> = [];
  const sorted = topologicalSort(manifest.components);

  const shadcnIndex: Array<{ name: string; type: string }> = [];

  for (const component of sorted) {
    if (component.source === "shared") {
      const item = buildRegistryItem(component, null);
      if (writeFileIfChanged(path.join(DOCS_REGISTRY_OUT, `${component.name}.json`), stableStringify(item))) {
        written.push(`apps/docs/public/r/${component.name}.json`);
      }
      shadcnIndex.push({ name: component.name, type: item.type });
    } else {
      for (const renderer of component.renderers) {
        const item = buildRegistryItem(component, renderer);
        const isDefault = renderer === component.renderers[0];
        const filename = isDefault ? `${component.name}.json` : `${component.name}.${renderer}.json`;
        if (writeFileIfChanged(path.join(DOCS_REGISTRY_OUT, filename), stableStringify(item))) {
          written.push(`apps/docs/public/r/${filename}`);
        }
      }
      shadcnIndex.push({ name: component.name, type: "registry:ui" });
    }
  }

  const index = {
    version: manifest.version,
    schemaVersion: manifest.schemaVersion,
    components: sorted.map(manifestEntryFor),
  };
  if (writeFileIfChanged(path.join(DOCS_REGISTRY_OUT, "index.json"), stableStringify(index))) {
    written.push("apps/docs/public/r/index.json");
  }

  const registryJson = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "mapcn-rn",
    homepage: manifest.homepage,
    items: shadcnIndex,
  };
  if (writeFileIfChanged(path.join(DOCS_REGISTRY_OUT, "registry.json"), stableStringify(registryJson))) {
    written.push("apps/docs/public/r/registry.json");
  }

  return written;
}
