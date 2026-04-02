import { PROVIDERS, type Provider } from "../config/registry.js";

export type ParsedArgs =
  | {
      command: "add";
      provider?: Provider;
      help: boolean;
    }
  | {
      command: null;
      provider?: undefined;
      help: boolean;
    };

const COMMANDS = ["add"] as const;

type ParsedFlags = {
  provider?: Provider;
  help: boolean;
};

export function parseArgs(argv: string[]): ParsedArgs {
  const normalizedArgv = argv.filter((arg) => arg !== "--");
  const flags = parseFlags(normalizedArgv);
  const commandToken = normalizedArgv.find((arg) => !arg.startsWith("-"));

  if (!commandToken) {
    return { command: null, help: flags.help };
  }

  if (!COMMANDS.includes(commandToken as (typeof COMMANDS)[number])) {
    throw new Error(
      `Unknown command "${commandToken}".\n\n${getHelpText().trim()}`,
    );
  }

  return {
    command: "add",
    provider: flags.provider,
    help: flags.help,
  };
}

function parseFlags(argv: string[]): ParsedFlags {
  let provider: Provider | undefined;
  let help = false;

  for (const arg of argv) {
    if (!arg.startsWith("-")) {
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      help = true;
      continue;
    }

    if (arg.startsWith("--provider=")) {
      provider = parseProvider(arg.slice("--provider=".length));
      continue;
    }

    throw new Error(`Unknown option "${arg}".\n\n${getHelpText().trim()}`);
  }

  return { provider, help };
}

function parseProvider(value: string): Provider {
  if (PROVIDERS.includes(value as Provider)) {
    return value as Provider;
  }

  throw new Error(
    `Invalid provider "${value}". Expected one of: ${PROVIDERS.join(", ")}.`,
  );
}

export function getHelpText(): string {
  return `
Usage:
  mapcn-rn add [--provider=<provider>]
  mapcn-rn --help

Commands:
  add                         Add the mapcn React Native map component

Options:
  --provider=<provider>       carto | maptiler | mapbox
  -h, --help                  Show this help message
`;
}
