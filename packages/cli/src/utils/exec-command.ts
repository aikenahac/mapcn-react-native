import { execa } from "execa";

export async function runCommand(command: string, args: Array<string>, cwd?: string): Promise<void> {
  if (args.length === 0) return;
  await execa(command, args, { stdio: "inherit", cwd });
}
