import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/** LF line endings, single trailing newline -- the normalization every hash/materialization uses. */
export function normalizeContent(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\n*$/, "\n");
}

export function contentHash(content: string): string {
  return "sha256-" + createHash("sha256").update(normalizeContent(content)).digest("hex").slice(0, 16);
}

export function readFileNormalized(filePath: string): string {
  return normalizeContent(fs.readFileSync(filePath, "utf8"));
}

export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function writeFileIfChanged(filePath: string, content: string): boolean {
  const normalized = normalizeContent(content);
  if (fs.existsSync(filePath) && readFileNormalized(filePath) === normalized) return false;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, normalized, "utf8");
  return true;
}

/**
 * A stable JSON serializer: object keys are sorted so re-running the
 * generator with no source changes produces byte-identical output
 * (plan §5.5). Arrays are left in author order since their order can be
 * semantically meaningful (e.g. file lists).
 */
export function stableStringify(value: unknown, indent = 2): string {
  return JSON.stringify(sortKeysDeep(value), null, indent) + "\n";
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}
