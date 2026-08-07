import { execa } from "execa";

export async function runCommand(command: string, args: string[]): Promise<void> {
  await execa(command, args, {
    stdio: "inherit",
  });
}
