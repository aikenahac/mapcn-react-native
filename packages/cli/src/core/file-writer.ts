import fs from "node:fs";
import path from "node:path";
import { contentHash, normalizeContent } from "./hash.js";
import type { InstalledComponent, RegistryItem } from "../types.js";

export type FileWriteStatus = "written" | "unchanged" | "conflict" | "overwritten";

export interface FileWriteResult {
  targetPath: string;
  status: FileWriteStatus;
  hash: string;
  /** Set when status is "conflict": where the new version was written instead. */
  sidecarPath?: string;
}

function backupDir(projectRoot: string, timestamp: string): string {
  return path.join(projectRoot, ".mapcn-backup", timestamp);
}

/**
 * Writes one registry file to disk with the hash-tracking rules from plan
 * §8.3: unmodified files upgrade silently, modified files never get
 * clobbered (a `.new` sidecar is written instead) unless `overwrite` is
 * set, in which case the original is snapshotted to `.mapcn-backup/`
 * first. Never touches disk if there is genuinely nothing to change.
 */
export function writeComponentFile(
  projectRoot: string,
  targetPath: string,
  content: string,
  previousHash: string | undefined,
  options: { overwrite: boolean; timestamp: string },
): FileWriteResult {
  const normalized = normalizeContent(content);
  const newHash = contentHash(normalized);

  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, normalized, "utf8");
    return { targetPath, status: "written", hash: newHash };
  }

  const onDisk = normalizeContent(fs.readFileSync(targetPath, "utf8"));
  const onDiskHash = contentHash(onDisk);

  const isUnmodifiedSinceInstall = previousHash !== undefined && previousHash === onDiskHash;

  if (isUnmodifiedSinceInstall) {
    if (onDiskHash === newHash) {
      return { targetPath, status: "unchanged", hash: newHash };
    }
    fs.writeFileSync(targetPath, normalized, "utf8");
    return { targetPath, status: "written", hash: newHash };
  }

  // Either the user modified this file, or it's an untracked file already
  // sitting at this path -- never overwrite either without explicit consent.
  if (!options.overwrite) {
    const sidecarPath = withSuffix(targetPath, ".new");
    fs.writeFileSync(sidecarPath, normalized, "utf8");
    return { targetPath, status: "conflict", hash: newHash, sidecarPath };
  }

  const backupPath = path.join(backupDir(projectRoot, options.timestamp), path.relative(projectRoot, targetPath));
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.copyFileSync(targetPath, backupPath);
  fs.writeFileSync(targetPath, normalized, "utf8");
  return { targetPath, status: "overwritten", hash: newHash };
}

function withSuffix(targetPath: string, suffix: string): string {
  const ext = path.extname(targetPath);
  return targetPath.slice(0, -ext.length) + suffix + ext;
}

export interface InstallComponentResult {
  name: string;
  results: Array<FileWriteResult>;
}

export function installComponentFiles(
  projectRoot: string,
  srcDir: string,
  item: RegistryItem,
  existing: InstalledComponent | undefined,
  options: { overwrite: boolean; timestamp: string },
): InstallComponentResult {
  const previousHashes = new Map((existing?.files ?? []).map((f) => [f.path, f.hash]));
  const results = item.files.map((file) => {
    const targetPath = path.join(projectRoot, srcDir, file.target);
    return writeComponentFile(projectRoot, targetPath, file.content, previousHashes.get(file.target), options);
  });
  return { name: item.name, results };
}

export function toInstalledComponent(item: RegistryItem, results: Array<FileWriteResult>): InstalledComponent {
  return {
    version: "2.0.0-alpha.0",
    files: item.files.map((file, i) => ({ path: file.target, hash: results[i]!.hash })),
  };
}
