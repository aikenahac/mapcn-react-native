#!/usr/bin/env node
import { parseArgs } from "node:util";
import { runInitCommand } from "./commands/init.js";
import { runAddCommand } from "./commands/add.js";
import { runListCommand } from "./commands/list.js";
import { runDiffCommand } from "./commands/diff.js";
import { DEFAULT_REGISTRY_URL } from "./core/registry-client.js";
import type { ProviderId, Renderer } from "./types.js";

const HELP_TEXT = `
Usage:
  mapcn-rn init [--renderer maplibre|mapbox] [--provider maptiler|carto|custom|mapbox] [--yes]
  mapcn-rn add <component...> [--overwrite] [--yes] [--renderer maplibre|mapbox]
  mapcn-rn list
  mapcn-rn diff [component]
  mapcn-rn --help

Options:
  --registry <url>   Override the registry base URL (default: ${DEFAULT_REGISTRY_URL})
  -h, --help         Show this help message
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0]?.startsWith("-") ? undefined : argv[0];
  const rest = command ? argv.slice(1) : argv;

  const { values, positionals } = parseArgs({
    args: rest,
    strict: false,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      registry: { type: "string" },
      renderer: { type: "string" },
      provider: { type: "string" },
      overwrite: { type: "boolean" },
      yes: { type: "boolean", short: "y" },
    },
  });

  if (values.help || !command) {
    console.log(HELP_TEXT.trim());
    process.exit(command ? 0 : 1);
  }

  const projectRoot = process.cwd();
  const registry = (values.registry as string | undefined) ?? DEFAULT_REGISTRY_URL;

  switch (command) {
    case "init":
      await runInitCommand({
        projectRoot,
        registry,
        renderer: values.renderer as Renderer | undefined,
        provider: values.provider as ProviderId | undefined,
        yes: Boolean(values.yes),
      });
      return;

    case "add":
      if (positionals.length === 0) {
        throw new Error("Usage: mapcn-rn add <component...>");
      }
      await runAddCommand({
        components: positionals,
        projectRoot,
        registry,
        renderer: values.renderer as Renderer | undefined,
        overwrite: Boolean(values.overwrite),
        yes: Boolean(values.yes),
      });
      return;

    case "list":
      await runListCommand({ projectRoot, registry });
      return;

    case "diff":
      await runDiffCommand({ projectRoot, component: positionals[0] });
      return;

    default:
      console.error(`Unknown command "${command}".\n`);
      console.log(HELP_TEXT.trim());
      process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  console.error(message);
  process.exit(1);
});
