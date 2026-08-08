import { createHash } from "node:crypto";

/** LF line endings, single trailing newline -- matches packages/registry's normalization so hashes agree end-to-end. */
export function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");
}

export function contentHash(content: string): string {
  return "sha256-" + createHash("sha256").update(normalizeContent(content)).digest("hex").slice(0, 16);
}
