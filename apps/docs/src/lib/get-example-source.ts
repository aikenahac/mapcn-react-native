import fs from "fs";
import path from "path";

const EXAMPLES_DIR = path.join(
  process.cwd(),
  "src/app/docs/_components/examples"
);

export function getExampleSource(filename: string): string {
  // Support both .tsx and .txt extensions
  let filePath = path.join(EXAMPLES_DIR, filename);

  // If filename doesn't have extension, try .txt first, then .tsx
  if (!filename.includes('.')) {
    const txtPath = path.join(EXAMPLES_DIR, `${filename}.txt`);
    const tsxPath = path.join(EXAMPLES_DIR, `${filename}.tsx`);

    if (fs.existsSync(txtPath)) {
      filePath = txtPath;
    } else if (fs.existsSync(tsxPath)) {
      filePath = tsxPath;
    }
  }

  const source = fs.readFileSync(filePath, "utf-8");

  // Clean up provider-specific registry imports for display.
  return source
    .replace(/@\/registry\/map-mapbox/g, "@/components/ui/map")
    .replace(/@\/registry\/map-maptiler/g, "@/components/ui/map")
    .replace(/@\/registry\/map/g, "@/components/ui/map");
}
