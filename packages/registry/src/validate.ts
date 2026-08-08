import fs from "node:fs";
import path from "node:path";
import type { ComponentDefinition, RegistryManifest, Renderer } from "./manifest";
import { APP_SRC, resolveAliasPath, SHARED_SRC } from "./paths";
import { fileExists, readFileNormalized } from "./fs-utils";
import { topologicalSort } from "./graph";

export interface ValidationIssue {
  level: "error" | "warning";
  component: string;
  message: string;
}

/**
 * Aliases that resolve to files owned by the base shadcn/RNR install this
 * registry is layered on top of, not by any mapcn component -- flagging
 * these as "unresolved" would be a false positive, not a real finding.
 */
const EXTERNAL_ALIASES = new Set(["@/lib/utils"]);

const RENDERERS: Array<Renderer> = ["maplibre", "mapbox"];

function componentOwnedTargets(manifest: RegistryManifest): Map<string, Set<string>> {
  // component name -> set of "@ui/x.tsx"-style targets it provides.
  const owned = new Map<string, Set<string>>();
  for (const component of manifest.components) {
    const targets = new Set<string>();
    if (component.source === "shared") {
      component.files.forEach((f) => targets.add(f.to));
    } else {
      for (const renderer of component.renderers) {
        component.filesByRenderer[renderer]?.forEach((f) =>
          targets.add(f.to ?? `@ui/${path.basename(f.path)}`),
        );
      }
    }
    owned.set(component.name, targets);
  }
  return owned;
}

export function extractImportSpecifiers(source: string): Array<string> {
  const specifiers: Array<string> = [];
  const importRe = /(?:^|\n)\s*import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = importRe.exec(source))) specifiers.push(match[1] as string);
  return specifiers;
}

export function extractExportedNames(source: string): Array<string> {
  const names = new Set<string>();
  for (const match of source.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)) names.add(match[1] as string);
  for (const match of source.matchAll(/export\s+(?:const|let)\s+([A-Za-z0-9_]+)/g)) names.add(match[1] as string);
  for (const match of source.matchAll(/export\s+type\s+\{([^}]+)\}/g)) {
    (match[1] as string).split(",").forEach((n) => names.add(n.trim().split(/\s+as\s+/).pop()!.trim()));
  }
  for (const match of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    (match[1] as string).split(",").forEach((n) => {
      const trimmed = n.trim();
      if (trimmed) names.add(trimmed.split(/\s+as\s+/).pop()!.trim());
    });
  }
  return [...names].sort();
}

/** V1/V2: every declared source file exists, for every renderer that's supposed to have it. */
function validateFilesExist(manifest: RegistryManifest): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = [];
  for (const component of manifest.components) {
    if (component.source === "shared") {
      for (const file of component.files) {
        if (!fileExists(path.join(SHARED_SRC, file.from))) {
          issues.push({ level: "error", component: component.name, message: `Missing shared source file: packages/shared/src/${file.from}` });
        }
      }
    } else {
      if (!RENDERERS.every((r) => component.renderers.includes(r))) {
        // Intentionally single-renderer components are allowed; nothing to flag here.
      }
      for (const renderer of component.renderers) {
        const files = component.filesByRenderer[renderer];
        if (!files || files.length === 0) {
          issues.push({ level: "error", component: component.name, message: `Declares renderer "${renderer}" but has no files for it` });
          continue;
        }
        for (const file of files) {
          if (!fileExists(path.join(APP_SRC[renderer], file.path))) {
            issues.push({ level: "error", component: component.name, message: `Missing ${renderer} source file: apps/demo-${renderer}/src/${file.path}` });
          }
        }
      }
    }
  }
  return issues;
}

/** V3: renderer values valid, no duplicate component names, no duplicate output targets within a component. */
function validateStructure(manifest: RegistryManifest): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = [];
  const seenNames = new Set<string>();

  for (const component of manifest.components) {
    if (seenNames.has(component.name)) {
      issues.push({ level: "error", component: component.name, message: "Duplicate component name in manifest" });
    }
    seenNames.add(component.name);

    if (component.source === "per-renderer") {
      for (const renderer of component.renderers) {
        if (!RENDERERS.includes(renderer)) {
          issues.push({ level: "error", component: component.name, message: `Invalid renderer value "${renderer}"` });
        }
      }
      for (const renderer of component.renderers) {
        const targets = new Set<string>();
        for (const file of component.filesByRenderer[renderer] ?? []) {
          const to = file.to ?? `@ui/${path.basename(file.path)}`;
          if (targets.has(to)) {
            issues.push({ level: "error", component: component.name, message: `Duplicate output target "${to}" for renderer "${renderer}"` });
          }
          targets.add(to);
        }
      }
    } else {
      const targets = new Set<string>();
      for (const file of component.files) {
        if (targets.has(file.to)) {
          issues.push({ level: "error", component: component.name, message: `Duplicate output target "${file.to}"` });
        }
        targets.add(file.to);
      }
    }
  }
  return issues;
}

/** V4: registryDependencies resolve and the graph is acyclic (throws are caught by the caller). */
function validateDependencyGraph(manifest: RegistryManifest): Array<ValidationIssue> {
  try {
    topologicalSort(manifest.components);
    return [];
  } catch (error) {
    return [{ level: "error", component: "<graph>", message: (error as Error).message }];
  }
}

/** V5/V6: every alias import resolves to a registry-owned file (or an external allowlist entry). */
function validateImportCoverage(manifest: RegistryManifest): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = [];
  const owned = componentOwnedTargets(manifest);

  function stripExtension(target: string): string {
    return target.replace(/\.tsx?$/, "");
  }

  function allowedTargets(componentName: string): Set<string> {
    const component = manifest.components.find((c) => c.name === componentName)!;
    const deps = new Set<string>([componentName, ...(component.registryDependencies ?? [])]);
    // registryDependencies aren't transitively expanded here on purpose --
    // a component must declare every dependency it directly needs, not
    // rely on one of its deps' own deps happening to provide a file.
    const targets = new Set<string>();
    for (const dep of deps) for (const t of owned.get(dep) ?? []) targets.add(stripExtension(t));
    return targets;
  }

  function checkFile(component: ComponentDefinition, absPath: string, label: string) {
    if (!fileExists(absPath)) return; // already reported by validateFilesExist
    const source = readFileNormalized(absPath);
    const allowed = allowedTargets(component.name);
    for (const specifier of extractImportSpecifiers(source)) {
      if (specifier.startsWith(".")) continue; // sibling import, always fine
      if (!specifier.startsWith("@/")) continue; // bare npm specifier, not this validator's concern
      if (EXTERNAL_ALIASES.has(specifier)) continue;

      const normalized = stripExtension(
        specifier
          .replace("@/components/ui/", "@ui/")
          .replace("@/lib/", "@lib/")
          .replace("@/hooks/", "@hooks/")
          .replace("@/components/", "@components/"),
      );
      if (!allowed.has(normalized)) {
        issues.push({
          level: "error",
          component: component.name,
          message: `${label} imports "${specifier}" which isn't provided by "${component.name}" or its declared registryDependencies`,
        });
      }
    }
  }

  for (const component of manifest.components) {
    if (component.source === "shared") {
      for (const file of component.files) {
        checkFile(component, path.join(SHARED_SRC, file.from), `packages/shared/src/${file.from}`);
      }
    } else {
      for (const renderer of component.renderers) {
        for (const file of component.filesByRenderer[renderer] ?? []) {
          checkFile(component, path.join(APP_SRC[renderer], file.path), `apps/demo-${renderer}/src/${file.path}`);
        }
      }
    }
  }
  return issues;
}

/** V7: materialized copies in both apps are byte-identical to packages/shared (source: "shared" only). */
function validateMaterialization(manifest: RegistryManifest): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = [];
  for (const component of manifest.components) {
    if (component.source !== "shared") continue;
    for (const file of component.files) {
      const sourcePath = path.join(SHARED_SRC, file.from);
      if (!fileExists(sourcePath)) continue; // reported elsewhere
      const sourceContent = readFileNormalized(sourcePath);
      for (const renderer of RENDERERS) {
        const targetPath = path.join(APP_SRC[renderer], resolveAliasPath(file.to));
        if (!fileExists(targetPath)) {
          issues.push({ level: "error", component: component.name, message: `Not materialized into apps/demo-${renderer}: ${file.to} (run pnpm registry:sync)` });
          continue;
        }
        if (readFileNormalized(targetPath) !== sourceContent) {
          issues.push({ level: "error", component: component.name, message: `apps/demo-${renderer}${resolvePathForMessage(file.to)} is stale vs packages/shared/src/${file.from} (run pnpm registry:sync)` });
        }
      }
    }
  }
  return issues;
}

function resolvePathForMessage(to: string): string {
  return "/src/" + resolveAliasPath(to);
}

/** V8: per-renderer components export the same public names on both renderers. */
function validateApiParity(manifest: RegistryManifest): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = [];
  for (const component of manifest.components) {
    if (component.source !== "per-renderer" || component.renderers.length < 2) continue;

    const exportsByRenderer: Partial<Record<Renderer, Array<string>>> = {};
    for (const renderer of component.renderers) {
      const names = new Set<string>();
      for (const file of component.filesByRenderer[renderer] ?? []) {
        if (file.internal) continue; // adapter internals are allowed to differ per renderer
        const absPath = path.join(APP_SRC[renderer], file.path);
        if (!fileExists(absPath)) continue;
        extractExportedNames(readFileNormalized(absPath)).forEach((n) => names.add(n));
      }
      exportsByRenderer[renderer] = [...names].sort();
    }

    const [first, ...rest] = component.renderers;
    const baseline = exportsByRenderer[first as Renderer] ?? [];
    for (const renderer of rest) {
      const exceptions = new Set([
        ...(component.parityExceptions?.[first as "maplibre" | "mapbox"] ?? []),
        ...(component.parityExceptions?.[renderer as "maplibre" | "mapbox"] ?? []),
      ]);
      const current = (exportsByRenderer[renderer] ?? []).filter((n) => !exceptions.has(n));
      const baselineFiltered = baseline.filter((n) => !exceptions.has(n));
      const missing = baselineFiltered.filter((n) => !current.includes(n));
      const extra = current.filter((n) => !baselineFiltered.includes(n));
      if (missing.length) {
        issues.push({ level: "error", component: component.name, message: `${renderer} is missing exports present on ${first}: ${missing.join(", ")}` });
      }
      if (extra.length) {
        issues.push({ level: "warning", component: component.name, message: `${renderer} exports extra names not present on ${first}: ${extra.join(", ")} (fine if intentional/renderer-specific)` });
      }
    }
  }
  return issues;
}

/** V9 (metadata): declared npm dependency major.minor matches what the owning app actually has installed. */
function validateDependencyVersions(manifest: RegistryManifest): Array<ValidationIssue> {
  const issues: Array<ValidationIssue> = [];
  for (const component of manifest.components) {
    if (component.source !== "per-renderer" || !component.dependenciesByRenderer) continue;
    for (const renderer of component.renderers) {
      const declared: Array<string> = component.dependenciesByRenderer[renderer] ?? [];
      const pkgJsonPath = path.join(path.dirname(APP_SRC[renderer]), "package.json");
      if (!fileExists(pkgJsonPath)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8")) as { dependencies?: Record<string, string> };
      for (const spec of declared) {
        const at: number = spec.lastIndexOf("@");
        const name = spec.slice(0, at);
        const range = spec.slice(at + 1);
        const installed = pkgJson.dependencies?.[name];
        if (!installed) {
          issues.push({ level: "error", component: component.name, message: `Declares npm dependency "${name}" not installed in apps/demo-${renderer}` });
          continue;
        }
        const declaredMinor = range.replace(/^[\^~]/, "").split(".").slice(0, 2).join(".");
        const installedMinor = installed.replace(/^[\^~]/, "").split(".").slice(0, 2).join(".");
        if (declaredMinor !== installedMinor) {
          issues.push({
            level: "warning",
            component: component.name,
            message: `Declared "${name}@${range}" but apps/demo-${renderer} has ${installed} -- registry.config.ts may be stale`,
          });
        }
      }
    }
  }
  return issues;
}

export function validateRegistry(manifest: RegistryManifest): Array<ValidationIssue> {
  return [
    ...validateStructure(manifest),
    ...validateFilesExist(manifest),
    ...validateDependencyGraph(manifest),
    ...validateImportCoverage(manifest),
    ...validateMaterialization(manifest),
    ...validateApiParity(manifest),
    ...validateDependencyVersions(manifest),
  ];
}
