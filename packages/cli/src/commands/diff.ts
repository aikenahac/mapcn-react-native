import fs from "node:fs";
import path from "node:path";
import { requireMapcnConfig } from "../core/mapcn-config.js";
import { detectProject } from "../core/detect-project.js";
import { contentHash, normalizeContent } from "../core/hash.js";

export interface DiffOptions {
  projectRoot: string;
  component?: string;
}

/** Compares installed component files against their recorded hashes to report local modifications. */
export async function runDiffCommand(options: DiffOptions): Promise<void> {
  const config = requireMapcnConfig(options.projectRoot);
  const { srcDir } = detectProject(options.projectRoot);

  const names = options.component ? [options.component] : Object.keys(config.components);
  if (options.component && !config.components[options.component]) {
    throw new Error(`Component "${options.component}" is not installed. Run \`mapcn-rn list\` to see what's installed.`);
  }

  let anyModified = false;

  for (const name of names) {
    const installed = config.components[name];
    if (!installed) continue;

    for (const file of installed.files) {
      const targetPath = path.join(options.projectRoot, srcDir, file.path);
      if (!fs.existsSync(targetPath)) {
        console.log(`  ✗ ${file.path} (missing -- was deleted after install)`);
        anyModified = true;
        continue;
      }
      const onDiskHash = contentHash(normalizeContent(fs.readFileSync(targetPath, "utf8")));
      if (onDiskHash !== file.hash) {
        console.log(`  ~ ${file.path} (modified since install)`);
        anyModified = true;
      } else {
        console.log(`  = ${file.path} (unmodified)`);
      }
    }
  }

  if (!anyModified) {
    console.log("\nNo local modifications.");
  }
}
