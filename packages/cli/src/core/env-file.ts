import fs from "node:fs";
import path from "node:path";

/**
 * Appends `KEY=` (with a placeholder comment) to a dotenv file if the key
 * isn't already present. Never touches `.env` with a real value -- only
 * `.env.example` gets scaffolded; the developer supplies the real secret.
 */
export function ensureEnvKeyPlaceholder(filePath: string, key: string, comment?: string): boolean {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  if (new RegExp(`^${key}=`, "m").test(existing)) return false;

  const lines = [existing.trimEnd()].filter(Boolean);
  if (comment) lines.push(`# ${comment}`);
  lines.push(`${key}=`);

  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
  return true;
}

export function readEnvValue(projectRoot: string, key: string): string | undefined {
  const envPath = path.join(projectRoot, ".env");
  if (!fs.existsSync(envPath)) return undefined;
  const match = fs.readFileSync(envPath, "utf8").match(new RegExp(`^${key}=(.*)$`, "m"));
  return match?.[1]?.trim() || undefined;
}
