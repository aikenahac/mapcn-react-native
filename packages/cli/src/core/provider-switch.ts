import { PROVIDERS } from "./providers.js";
import type { ProviderId, Renderer } from "../types.js";

export interface ProviderSwitchPlan {
  fromRenderer: Renderer;
  toRenderer: Renderer;
  fromProvider: ProviderId;
  toProvider: ProviderId;
  rendererChanged: boolean;
  removeNpmPackage?: string;
  addNpmPackage: string;
  removePlugin?: string;
  addPlugin: string;
  removeEnvKey?: string;
  addEnvKey: string | null;
  capabilityNotes: string[];
}

export function planProviderSwitch(
  current: { renderer: Renderer; provider: ProviderId },
  target: ProviderId,
): ProviderSwitchPlan {
  if (target === current.provider) {
    throw new Error(`Target provider ${target} is the same as current provider — no-op switch.`);
  }

  const targetMeta = PROVIDERS[target];
  const currentMeta = PROVIDERS[current.provider];

  if (!targetMeta || !currentMeta) {
    throw new Error(`Invalid provider: ${target}`);
  }

  const rendererChanged = targetMeta.renderer !== current.renderer;
  const capabilityNotes: string[] = [];

  // Switching TO mapbox: minPoints warning
  if (targetMeta.renderer === "mapbox") {
    capabilityNotes.push("minPoints on MapClusterLayer has no Mapbox equivalent and will be ignored.");
  }

  // Switching FROM mapbox TO maplibre: location puck warning
  if (current.renderer === "mapbox" && targetMeta.renderer === "maplibre") {
    capabilityNotes.push("pulsing/scale/images on MapLocationPuck have no MapLibre equivalent and will be ignored.");
  }

  const plan: ProviderSwitchPlan = {
    fromRenderer: current.renderer,
    toRenderer: targetMeta.renderer,
    fromProvider: current.provider,
    toProvider: target,
    rendererChanged,
    addNpmPackage: `${targetMeta.npmPackage}@${targetMeta.npmVersionRange}`,
    addPlugin: targetMeta.expoPlugin,
    addEnvKey: targetMeta.envKey,
    capabilityNotes,
  };

  // Only add remove fields if they're different
  if (currentMeta.npmPackage !== targetMeta.npmPackage) {
    plan.removeNpmPackage = currentMeta.npmPackage;
  }

  if (currentMeta.expoPlugin !== targetMeta.expoPlugin) {
    plan.removePlugin = currentMeta.expoPlugin;
  }

  if (currentMeta.envKey !== targetMeta.envKey && currentMeta.envKey) {
    plan.removeEnvKey = currentMeta.envKey;
  }

  return plan;
}
