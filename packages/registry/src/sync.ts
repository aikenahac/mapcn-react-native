import manifest from "../registry.config";
import { materializeBarrel, materializeSharedComponents } from "./materialize";
import { emitRegistry } from "./emit";
import { validateRegistry } from "./validate";

const isCheck = process.argv.includes("--check");

function main() {
  if (!isCheck) {
    const materialized = materializeSharedComponents(manifest);
    materialized.forEach((f) => console.log(`  wrote ${f}`));
    materializeBarrel(manifest).forEach((f) => console.log(`  wrote ${f}`));
  }

  const issues = validateRegistry(manifest);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  if (!isCheck) {
    const emitted = emitRegistry(manifest);
    emitted.forEach((f) => console.log(`  wrote ${f}`));
  }

  const componentCount = manifest.components.length;

  if (errors.length === 0) {
    console.log(`✓ ${componentCount} registry components`);
    console.log("✓ MapLibre implementations synchronized");
    console.log("✓ Mapbox implementations synchronized");
    console.log("✓ Dependency graph valid");
    console.log("✓ Import graph covered by declared dependencies");
    console.log("✓ Registry metadata valid");
    console.log("✓ API parity checked");
    console.log(isCheck ? "✓ No stale generated files" : "✓ Registry synced");
  }

  for (const warning of warnings) {
    console.warn(`⚠ [${warning.component}] ${warning.message}`);
  }
  for (const error of errors) {
    console.error(`✗ [${error.component}] ${error.message}`);
  }

  if (errors.length > 0) {
    console.error(`\n${errors.length} error(s), ${warnings.length} warning(s) found.`);
    if (isCheck) {
      console.error("Run `pnpm registry:sync` to fix materialization drift, then address any remaining errors above.");
    }
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s) -- see above.`);
  }
}

main();
