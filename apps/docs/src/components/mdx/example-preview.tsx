import fs from "fs";
import path from "path";

import { highlightCode } from "@/lib/highlight";

import { ExamplePreviewClient } from "./example-preview-client";

const DEMO_EXAMPLES_DIR = path.join(
  process.cwd(),
  "..",
  "demo-maplibre",
  "src",
  "components",
  "examples",
);

interface ExamplePreviewProps {
  slug: string;
}

export async function ExamplePreview({ slug }: ExamplePreviewProps) {
  const code = fs.readFileSync(path.join(DEMO_EXAMPLES_DIR, `${slug}.tsx`), "utf-8");
  const highlightedCode = await highlightCode(code, "tsx");
  const cdnUrl = process.env.NEXT_PUBLIC_BUNNY_CDN_URL ?? "https://mapcn-rn.b-cdn.net";

  return (
    <ExamplePreviewClient
      slug={slug}
      code={code}
      highlightedCode={highlightedCode}
      cdnUrl={cdnUrl}
    />
  );
}
