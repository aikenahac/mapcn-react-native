import path from "node:path";
import type { RegistryManifest } from "./manifest";
import { APP_SRC, resolveAliasPath, SHARED_SRC } from "./paths";
import { readFileNormalized, writeFileIfChanged } from "./fs-utils";

const RENDERERS: Array<"maplibre" | "mapbox"> = ["maplibre", "mapbox"];

const GENERATED_HEADER_EXTENSIONS = new Set([".ts"]);

/**
 * Copies every `source: "shared"` component's files from packages/shared
 * into both apps' src/ trees. Returns the list of files actually written
 * (unchanged files are left untouched so mtimes/git status stay quiet).
 */
export function materializeSharedComponents(manifest: RegistryManifest): Array<string> {
  const written: Array<string> = [];
  for (const component of manifest.components) {
    if (component.source !== "shared") continue;
    for (const file of component.files) {
      const sourcePath = path.join(SHARED_SRC, file.from);
      const content = readFileNormalized(sourcePath);
      for (const renderer of RENDERERS) {
        const targetPath = path.join(APP_SRC[renderer], resolveAliasPath(file.to));
        if (writeFileIfChanged(targetPath, content)) {
          written.push(`apps/demo-${renderer}/src/${resolveAliasPath(file.to)}`);
        }
      }
    }
  }
  return written;
}

export function isGeneratedExtension(filePath: string): boolean {
  return GENERATED_HEADER_EXTENSIONS.has(path.extname(filePath));
}
