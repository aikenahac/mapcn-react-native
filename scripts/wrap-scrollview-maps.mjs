import fs from "fs";
import path from "path";

const ROOT = path.resolve(".");
const EXAMPLE_DIRS = [
  "src/app/examples",
  "src/app/maptiler/examples",
];

function processFile(filePath) {
  let code = fs.readFileSync(filePath, "utf8");

  if (!code.includes("<ScrollView") || !code.includes("<Map")) return;
  if (code.includes("ScrollViewMapWrapper")) return;

  let changed = false;

  // Ensure useState import
  if (!code.includes("useState")) {
    const headerImport = 'import { Header } from "@/components/header";';
    if (code.includes(headerImport)) {
      code = code.replace(
        headerImport,
        'import { useState } from "react";\n' + headerImport,
      );
      changed = true;
    }
  }

  // Ensure wrapper import
  const wrapperImport = 'import { ScrollViewMapWrapper } from "@/components/scroll-view-map-wrapper";';
  if (!code.includes("ScrollViewMapWrapper")) {
    const screenImport = 'import { ScreenContainer } from "@/components/screen-container";';
    if (code.includes(screenImport)) {
      code = code.replace(
        screenImport,
        screenImport + "\n" + wrapperImport,
      );
      changed = true;
    }
  }

  // Add scrollEnabled state
  const fnDeclMatch = code.match(/export default function [^(]+\(\) {\n/);
  if (fnDeclMatch && !code.includes("scrollEnabled, setScrollEnabled")) {
    const decl = fnDeclMatch[0];
    const stateLine = '  const [scrollEnabled, setScrollEnabled] = useState(true);\n\n';
    code = code.replace(decl, decl + stateLine);
    changed = true;
  }

  // Add scrollEnabled prop to ScrollView
  if (code.includes('<ScrollView className="flex-1">')) {
    code = code.replace(
      '<ScrollView className="flex-1">',
      '<ScrollView className="flex-1" scrollEnabled={scrollEnabled}>'
    );
    changed = true;
  }

  // Wrap main map container (assumes first View with h-[500px])
  const containerStart = '<View className="h-[500px';
  const gapBlock = '\n\n          <View className="gap-4">';
  if (code.includes(containerStart) && code.includes(gapBlock)) {
    code = code.replace(
      '<View className="h-[500px',
      '<ScrollViewMapWrapper onScrollEnabledChange={setScrollEnabled} className="h-[500px',
    );
    code = code.replace(
      '\n          </View>' + gapBlock,
      '\n          </ScrollViewMapWrapper>' + gapBlock,
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, code);
    console.log("Updated", filePath);
  }
}

for (const dir of EXAMPLE_DIRS) {
  const full = path.join(ROOT, dir);
  const files = fs.readdirSync(full).filter((f) => f.endsWith(".tsx"));
  for (const f of files) {
    processFile(path.join(full, f));
  }
}
