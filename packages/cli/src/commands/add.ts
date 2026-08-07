import {
  cancel,
  intro,
  isCancel,
  outro,
  select,
} from "@clack/prompts";
import { resolveRegistryUrl, type Provider } from "../config/registry.js";
import { runCommand } from "../utils/runCommand.js";

type AddCommandOptions = {
  provider?: Provider;
};

export async function runAddCommand(
  options: AddCommandOptions,
): Promise<void> {
  intro("mapcn React Native installer");

  const provider = options.provider ?? (await promptForProvider());
  const registryUrl = resolveRegistryUrl(provider);

  console.log(`\nInstalling mapcn with the ${provider} provider...`);
  console.log(
    `Running: npx @react-native-reusables/cli@latest add ${registryUrl}\n`,
  );

  await runCommand("npx", [
    "@react-native-reusables/cli@latest",
    "add",
    registryUrl,
  ]);

  outro("Installation finished.");
}

async function promptForProvider(): Promise<Provider> {
  const value = await select({
    message: "Select a map provider",
    options: [
      {
        value: "carto",
        label: "carto",
        hint: "default basemap, non-commercial use",
      },
      {
        value: "maptiler",
        label: "maptiler",
        hint: "MapLibre-compatible commercial option",
      },
      {
        value: "mapbox",
        label: "mapbox",
        hint: "rnmapbox-based commercial option",
      },
    ],
  });

  if (isCancel(value)) {
    cancel("Installation cancelled.");
    process.exit(1);
  }

  if (!isProvider(value)) {
    throw new Error("Invalid provider selection.");
  }

  return value;
}

function isProvider(value: unknown): value is Provider {
  return value === "carto" || value === "maptiler" || value === "mapbox";
}
