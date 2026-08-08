import { execa } from "execa";

export async function runCommand(command: string, args: Array<string>, cwd?: string): Promise<void> {
  if (args.length === 0) return;
  await execa(command, args, { stdio: "inherit", cwd });
}

/**
 * Runs a package-manager command that inherits stdio. The blank lines matter:
 * the child writes straight to the terminal, so without them its first line
 * lands on top of whatever prompt line is already there.
 */
export async function runInstallCommand(command: Array<string>, cwd?: string): Promise<void> {
  process.stdout.write("\n");
  await runCommand(command[0]!, command.slice(1), cwd);
  process.stdout.write("\n");
}
