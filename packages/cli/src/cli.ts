#!/usr/bin/env node

import { runAddCommand } from "./commands/add.js";
import { getHelpText, parseArgs } from "./utils/parseArgs.js";

async function main(): Promise<void> {
  try {
    const parsed = parseArgs(process.argv.slice(2));

    if (parsed.help || parsed.command === null) {
      console.log(getHelpText().trim());
      process.exit(parsed.command === null && !parsed.help ? 1 : 0);
    }

    if (parsed.command === "add") {
      await runAddCommand({
        provider: parsed.provider,
      });
    }
  } catch (error) {
    if (isErrorWithExitCode(error)) {
      process.exit(error.exitCode);
    }

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error(message);
    process.exit(1);
  }
}

type ErrorWithExitCode = {
  exitCode: number;
};

function isErrorWithExitCode(error: unknown): error is ErrorWithExitCode {
  return (
    typeof error === "object" &&
    error !== null &&
    "exitCode" in error &&
    typeof error.exitCode === "number"
  );
}

void main();
