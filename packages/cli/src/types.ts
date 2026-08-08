export type Renderer = "maplibre" | "mapbox";
export type ProviderId = "maptiler" | "carto" | "custom" | "mapbox";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type Styling = "uniwind" | "nativewind" | "none";

export interface MapcnConfig {
  $schema: string;
  schemaVersion: number;
  renderer: Renderer;
  provider: { id: ProviderId; envKey: string | null };
  styling: Styling;
  aliases: { ui: string; lib: string; hooks: string; components: string };
  components: Record<string, InstalledComponent>;
}

export interface InstalledComponent {
  version: string;
  files: Array<{ path: string; hash: string }>;
}

export interface RegistryFileEntry {
  path: string;
  content: string;
  type: string;
  target: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies: Array<string>;
  devDependencies: Array<string>;
  registryDependencies: Array<string>;
  files: Array<RegistryFileEntry>;
}

export interface RegistryManifestEntry {
  name: string;
  title: string;
  description: string;
  category: string;
  docsSlug?: string;
  source: "shared" | "per-renderer";
  renderers: Array<Renderer> | "any";
  registryDependencies: Array<string>;
  env: Array<string>;
  permissions: { ios: Array<string>; android: Array<string> };
  expoPlugins: Array<string> | Partial<Record<Renderer, Array<string>>>;
  capabilities?: Record<string, unknown>;
  /** Import specifiers this component contributes to the components/ui/mapcn barrel. */
  barrelModules?: Array<string>;
  contentHash: string;
}

export interface RegistryManifest {
  version: string;
  schemaVersion: number;
  components: Array<RegistryManifestEntry>;
}

export interface ProjectInfo {
  root: string;
  srcDir: string;
  isExpo: boolean;
  isTypeScript: boolean;
  packageManager: PackageManager;
  styling: Styling;
  aliases: MapcnConfig["aliases"];
}
