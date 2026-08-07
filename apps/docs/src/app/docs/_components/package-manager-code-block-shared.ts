export const PACKAGE_MANAGERS = ["npm", "pnpm", "bun", "yarn"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const PACKAGE_MANAGER_STORAGE_KEY = "mapcn-docs-package-manager";

export const packageManagerLabels: Record<PackageManager, string> = {
  npm: "npm",
  pnpm: "pnpm",
  bun: "bun",
  yarn: "yarn",
};
