"use client";

import { useState } from "react";
import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import Image from "next/image";

interface ComponentPreviewClientProps {
  children?: React.ReactNode; // Unused but kept for compatibility
  code: string;
  highlightedCode: string;
  className?: string;
  screenshotName?: string; // Name of screenshot file in /public/screenshots/
  qrCodeName?: string; // Name of QR code file in /public/qr/
  cdnUrl?: string;
}

export function ComponentPreviewClient({
  code,
  highlightedCode,
  className,
  screenshotName,
  qrCodeName,
  cdnUrl,
}: ComponentPreviewClientProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "qr">("preview");
  const previewPaneClassName = cn("h-150 overflow-hidden", className);

  return (
    <div className="w-full rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/30 px-2 h-12">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "preview"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80"
            )}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "code"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80"
            )}
          >
            Code
          </button>
          {qrCodeName && (
            <button
              onClick={() => setActiveTab("qr")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded transition-colors",
                activeTab === "qr"
                  ? "text-foreground bg-muted dark:bg-muted/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80"
              )}
            >
              App Preview
            </button>
          )}
        </div>

        <CopyButton text={code} />
      </div>

      {activeTab === "preview" ? (
        <div className={previewPaneClassName}>
          <div className="h-full bg-muted/10 flex items-center justify-center">
            {screenshotName ? (
              <Image
                src={`${cdnUrl}/screenshots/${screenshotName}`}
                alt="Map example screenshot"
                width={800}
                height={400}
                className="w-full h-full object-contain"
                priority
              />
            ) : (
              <p className="text-muted-foreground text-sm">
                Screenshot not available
              </p>
            )}
          </div>
        </div>
      ) : activeTab === "code" ? (
        <HorizontalScrollArea
          className="p-4 text-sm bg-muted/20 [&_pre]:bg-transparent! [&_code]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      ) : (
        <div className={previewPaneClassName}>
          <div className="h-full bg-muted/10 flex items-center justify-center p-8">
            {qrCodeName ? (
              <div className="flex flex-col items-center gap-4">
                <Image
                  src={`${cdnUrl}/qr/${qrCodeName}`}
                  alt="QR code to example"
                  width={300}
                  height={300}
                  className="rounded-lg border bg-white p-4"
                />
                <p className="text-sm text-muted-foreground">
                  Scan to view this example in the <a href="/docs/companion" className="underline">companion app</a>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                QR code not available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
