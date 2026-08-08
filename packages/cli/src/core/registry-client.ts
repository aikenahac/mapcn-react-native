import fs from "node:fs";
import path from "node:path";
import type { RegistryItem, RegistryManifest, RegistryManifestEntry, Renderer } from "../types.js";

export const DEFAULT_REGISTRY_URL = "https://mapcn-rn.dev/r";

export class RegistryError extends Error {}

function isRemote(base: string): boolean {
  return base.startsWith("http://") || base.startsWith("https://");
}

async function fetchJson<T>(base: string, filename: string): Promise<T> {
  if (isRemote(base)) {
    const url = `${base.replace(/\/$/, "")}/${filename}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new RegistryError(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as T;
  }

  // Local filesystem registry (a directory, or a file:// URL) -- used for
  // local development and CLI e2e tests against apps/docs/public/r
  // without needing a running server.
  const dir = base.startsWith("file://") ? base.slice("file://".length) : base;
  const filePath = path.join(dir, filename);
  if (!fs.existsSync(filePath)) {
    throw new RegistryError(`Registry file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export async function fetchManifest(base: string): Promise<RegistryManifest> {
  return fetchJson<RegistryManifest>(base, "index.json");
}

/**
 * Fetches the registry item for a component, in the given renderer's
 * variant. For `source: "shared"` entries (renderers === "any") the
 * renderer argument is ignored -- there's only ever one file.
 */
export async function fetchComponentItem(base: string, entry: RegistryManifestEntry, renderer: Renderer): Promise<RegistryItem> {
  if (entry.renderers === "any") {
    return fetchJson<RegistryItem>(base, `${entry.name}.json`);
  }
  const defaultRenderer = entry.renderers[0];
  if (!entry.renderers.includes(renderer)) {
    throw new RegistryError(`Component "${entry.name}" does not support renderer "${renderer}" (supports: ${entry.renderers.join(", ")})`);
  }
  const filename = renderer === defaultRenderer ? `${entry.name}.json` : `${entry.name}.${renderer}.json`;
  return fetchJson<RegistryItem>(base, filename);
}
