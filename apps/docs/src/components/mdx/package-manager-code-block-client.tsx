"use client";

import { useCallback, useSyncExternalStore } from "react";

import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import {
  PACKAGE_MANAGERS,
  PACKAGE_MANAGER_STORAGE_KEY,
  packageManagerLabels,
  type PackageManager,
} from "./package-manager-code-block-shared";

interface PackageManagerCodeBlockClientProps {
  variants: Record<PackageManager, { code: string; highlighted: string }>;
  showCopyButton?: boolean;
}

export function PackageManagerCodeBlockClient({
  variants,
  showCopyButton = true,
}: PackageManagerCodeBlockClientProps) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("mapcn-package-manager-change", onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener("mapcn-package-manager-change", onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback((): PackageManager => {
    const value = window.localStorage.getItem(
      PACKAGE_MANAGER_STORAGE_KEY,
    ) as PackageManager | null;
    return value && value in variants ? value : "npm";
  }, [variants]);

  const selectedManager = useSyncExternalStore<PackageManager>(
    subscribe,
    getSnapshot,
    (): PackageManager => "npm",
  );

  const activeVariant = variants[selectedManager];

  const selectPackageManager = (value: PackageManager) => {
    window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent<PackageManager>("mapcn-package-manager-change", {
        detail: value,
      }),
    );
  };

  return (
    <div className="not-prose my-5 w-full overflow-hidden rounded-lg border">
      <div className="flex min-h-9 items-center justify-between gap-2 border-b bg-muted/30 px-2">
        <div className="flex items-center gap-1 py-1">
          {PACKAGE_MANAGERS.map((manager) => (
            <button
              key={manager}
              type="button"
              onClick={() => selectPackageManager(manager)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                selectedManager === manager
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={selectedManager === manager}
            >
              {packageManagerLabels[manager]}
            </button>
          ))}
        </div>
        {showCopyButton ? <CopyButton text={activeVariant.code} /> : null}
      </div>
      <HorizontalScrollArea
        className="overflow-y-visible bg-muted/20 p-4 text-sm [&_.line]:whitespace-pre! [&_code]:bg-transparent! [&_pre]:bg-transparent! [&_pre]:whitespace-pre!"
        dangerouslySetInnerHTML={{ __html: activeVariant.highlighted }}
      />
    </div>
  );
}
