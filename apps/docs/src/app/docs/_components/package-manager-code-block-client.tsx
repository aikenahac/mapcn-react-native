"use client";

import { useEffect, useState } from "react";
import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";
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
  const [selectedManager, setSelectedManager] = useState<PackageManager>(() => {
    if (typeof window === "undefined") {
      return "npm";
    }

    const storedValue = window.localStorage.getItem(
      PACKAGE_MANAGER_STORAGE_KEY,
    ) as PackageManager | null;

    if (storedValue && storedValue in variants) {
      return storedValue;
    }

    return "npm";
  });

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === PACKAGE_MANAGER_STORAGE_KEY &&
        event.newValue &&
        event.newValue in variants
      ) {
        setSelectedManager(event.newValue as PackageManager);
      }
    };

    const handleCustomEvent = (event: Event) => {
      const value = (event as CustomEvent<PackageManager>).detail;

      if (value && value in variants) {
        setSelectedManager(value);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("mapcn-package-manager-change", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "mapcn-package-manager-change",
        handleCustomEvent,
      );
    };
  }, [variants]);

  const activeVariant = variants[selectedManager];

  const selectPackageManager = (value: PackageManager) => {
    setSelectedManager(value);
    window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent<PackageManager>("mapcn-package-manager-change", {
        detail: value,
      }),
    );
  };

  return (
    <div className="w-full rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/30 px-2 min-h-9 gap-2">
        <div className="flex items-center gap-1 py-1">
          {PACKAGE_MANAGERS.map((manager) => (
            <button
              key={manager}
              type="button"
              onClick={() => selectPackageManager(manager)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
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
        {showCopyButton && <CopyButton text={activeVariant.code} />}
      </div>
      <HorizontalScrollArea
        className="p-4 overflow-y-visible text-sm bg-muted/20 [&_pre]:whitespace-pre! [&_.line]:whitespace-pre! [&_pre]:bg-transparent! [&_code]:bg-transparent!"
        dangerouslySetInnerHTML={{ __html: activeVariant.highlighted }}
      />
    </div>
  );
}
