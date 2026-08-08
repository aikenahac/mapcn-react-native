import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { baseOptions } from "@/lib/layout.shared";
import { getPageTree } from "@/lib/source";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...baseOptions()} tree={getPageTree()}>
      {children}
    </DocsLayout>
  );
}
