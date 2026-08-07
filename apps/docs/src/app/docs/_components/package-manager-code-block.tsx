import { highlightCode } from "@/lib/highlight";
import {
  PACKAGE_MANAGERS,
  type PackageManager,
} from "./package-manager-code-block-shared";
import { PackageManagerCodeBlockClient } from "./package-manager-code-block-client";

interface PackageManagerCodeBlockProps {
  command: string;
  showCopyButton?: boolean;
}

export async function PackageManagerCodeBlock({
  command,
  showCopyButton = true,
}: PackageManagerCodeBlockProps) {
  const variants = await Promise.all(
    PACKAGE_MANAGERS.map(async (manager) => {
      const code = transformPackageManagerCommand(command, manager);
      const highlighted = await highlightCode(code, "bash");

      return [manager, { code, highlighted }] as const;
    }),
  );

  return (
    <PackageManagerCodeBlockClient
      variants={Object.fromEntries(variants) as Record<
        PackageManager,
        { code: string; highlighted: string }
      >}
      showCopyButton={showCopyButton}
    />
  );
}

function transformPackageManagerCommand(
  command: string,
  packageManager: PackageManager,
): string {
  if (!command.startsWith("npx ")) {
    return command;
  }

  const rest = command.slice(4);

  switch (packageManager) {
    case "npm":
      return command;
    case "pnpm":
      return `pnpm dlx ${rest}`;
    case "bun":
      return `bunx --bun ${rest}`;
    case "yarn":
      return `yarn dlx ${rest}`;
  }
}
