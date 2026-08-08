export type Renderer = "maplibre" | "mapbox";

export interface RegistryFile {
  /** Path relative to packages/shared/src (source: "shared" only). */
  from: string;
  /** Alias-relative target, e.g. "@ui/map.tsx" or "@lib/mapcn/types.ts". */
  to: string;
}

export interface PerRendererFile {
  /** Path relative to the owning app's src/ (source: "per-renderer" only). */
  path: string;
  /** Alias-relative target. Defaults to `@ui/<basename>`. */
  to?: string;
  /**
   * Marks a file as a renderer-internal adapter (e.g. map-renderer.tsx)
   * rather than public API surface. Internal files are exempt from the
   * exported-name API-parity check -- their whole purpose is to expose
   * different low-level primitives per renderer.
   */
  internal?: boolean;
}

interface ComponentBase {
  name: string;
  title: string;
  description: string;
  category: string;
  docsSlug?: string;
  registryDependencies?: Array<string>;
  /** Env vars this component itself requires (not those owned by a provider choice). */
  env?: Array<string>;
  permissions?: { ios?: Array<string>; android?: Array<string> };
  /** Per-renderer capability notes surfaced by `registry:check` and doctor. */
  capabilities?: Record<string, unknown>;
  /**
   * Deliberate, documented public-API gaps between renderers (e.g. a
   * helper only one renderer's SDK needs) -- listing a name here downgrades
   * a missing/extra export from an error to a warning in the API-parity
   * check, so real accidental drift still fails loudly while acknowledged
   * gaps don't block CI. Always include the *reason* in a nearby comment.
   */
  parityExceptions?: Partial<Record<"maplibre" | "mapbox", Array<string>>>;
}

export interface SharedComponentDefinition extends ComponentBase {
  source: "shared";
  files: Array<RegistryFile>;
  dependencies?: Array<string>;
  devDependencies?: Array<string>;
}

export interface PerRendererComponentDefinition extends ComponentBase {
  source: "per-renderer";
  renderers: Array<Renderer>;
  filesByRenderer: Record<Renderer, Array<PerRendererFile>>;
  dependenciesByRenderer?: Partial<Record<Renderer, Array<string>>>;
  expoPluginsByRenderer?: Partial<Record<Renderer, Array<string>>>;
}

export type ComponentDefinition = SharedComponentDefinition | PerRendererComponentDefinition;

export interface RegistryManifest {
  version: string;
  schemaVersion: number;
  homepage: string;
  components: Array<ComponentDefinition>;
}

export function defineComponent<T extends ComponentDefinition>(definition: T): T {
  return definition;
}

export function defineRegistry(manifest: RegistryManifest): RegistryManifest {
  return manifest;
}
