#!/usr/bin/env node
import { parseArgs } from "node:util";
import { runInitCommand } from "./commands/init.js";
import { runAddCommand } from "./commands/add.js";
import { runListCommand } from "./commands/list.js";
import { runDiffCommand } from "./commands/diff.js";
import { runDoctorCommand } from "./commands/doctor.js";
import { runProviderCommand } from "./commands/provider.js";
import { runMigrateCommand } from "./commands/migrate.js";
import { DEFAULT_REGISTRY_URL } from "./core/registry-client.js";
import { parseComponentList } from "./core/component-selection.js";
import type { ProviderId, Renderer } from "./types.js";

const HELP_TEXT = `
Usage:
  mapcn-rn init [--renderer maplibre|mapbox] [--provider maptiler|carto|custom|mapbox] [--all] [--components a,b] [--yes]
  mapcn-rn add <component...> | --all [--overwrite] [--yes] [--renderer maplibre|mapbox]
  mapcn-rn list
  mapcn-rn diff [component]
  mapcn-rn doctor [--json] [--verbose]
  mapcn-rn provider <target> [--yes] [--force]
  mapcn-rn migrate [--yes]
  mapcn-rn --help

Options:
  --all              Install every component available for the renderer
  --components <a,b> Comma-separated component list for init (skips the picker)
  --registry <url>   Override the registry base URL (default: ${DEFAULT_REGISTRY_URL})
  -h, --help         Show this help message

Running \`add\` in a project with no mapcn.json runs \`init\` first.
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
      all: { type: "boolean" },
      components: { type: "string" },
      yes: { type: "boolean", short: "y" },
      json: { type: "boolean" },
      verbose: { type: "boolean" },
      force: { type: "boolean" },
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
        all: Boolean(values.all),
        components: values.components ? parseComponentList(values.components as string) : undefined,
        yes: Boolean(values.yes),
      });
      return;

    case "add":
      if (positionals.length === 0 && !values.all) {
        throw new Error("Usage: mapcn-rn add <component...>, or `mapcn-rn add --all` to install everything.");
      }
      await runAddCommand({
        components: positionals,
        projectRoot,
        registry,
        renderer: values.renderer as Renderer | undefined,
        provider: values.provider as ProviderId | undefined,
        overwrite: Boolean(values.overwrite),
        all: Boolean(values.all),
        yes: Boolean(values.yes),
      });
      return;

    case "list":
      await runListCommand({ projectRoot, registry });
      return;

    case "diff":
      await runDiffCommand({ projectRoot, component: positionals[0] });
      return;

    case "doctor":
      await runDoctorCommand({
        projectRoot,
        registry,
        json: Boolean(values.json),
        verbose: Boolean(values.verbose),
      });
      return;

    case "provider":
      if (!positionals[0]) {
        throw new Error("Usage: mapcn-rn provider <target>");
      }
      await runProviderCommand({
        projectRoot,
        registry,
        target: positionals[0],
        yes: Boolean(values.yes),
        force: Boolean(values.force),
      });
      return;

    case "migrate":
      await runMigrateCommand({
        projectRoot,
        registry,
        yes: Boolean(values.yes),
      });
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
