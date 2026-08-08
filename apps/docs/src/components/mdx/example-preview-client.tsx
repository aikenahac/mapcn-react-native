"use client";

import { useState } from "react";
import Image from "next/image";

import { HorizontalScrollArea } from "@/components/ui/horizontal-scroll-area";
import { cn } from "@/lib/utils";

import { CopyButton } from "./copy-button";

interface ExamplePreviewClientProps {
  slug: string;
  code: string;
  highlightedCode: string;
  cdnUrl: string;
}

export function ExamplePreviewClient({
  slug,
  code,
  highlightedCode,
  cdnUrl,
}: ExamplePreviewClientProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "qr">("preview");
  const deepLink = `mapcn-rn://examples/${slug}`;

  return (
    <div className="w-full rounded-lg border overflow-hidden not-prose">
      <div className="flex items-center justify-between border-b bg-muted/30 px-2 h-12">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "preview"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80",
            )}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "code"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80",
            )}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("qr")}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded transition-colors",
              activeTab === "qr"
                ? "text-foreground bg-muted dark:bg-muted/80"
                : "text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/80",
            )}
          >
            App Preview
          </button>
        </div>

        <CopyButton text={code} />
      </div>

      {activeTab === "preview" ? (
        <div className="h-100 bg-muted/10 flex items-center justify-center overflow-hidden">
          <Image
            src={`${cdnUrl}/screenshots/${slug}.png`}
            alt={`${slug} example screenshot`}
            width={800}
            height={400}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      ) : activeTab === "code" ? (
        <HorizontalScrollArea
          className="p-4 text-sm bg-muted/20 [&_pre]:bg-transparent! [&_code]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      ) : (
        <div className="h-100 bg-muted/10 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              src={`${cdnUrl}/qr/${slug}.png`}
              alt={`QR code to open the ${slug} example`}
              width={300}
              height={300}
              className="rounded-lg border bg-white p-4"
            />
            <p className="text-sm text-muted-foreground text-center">
              Scan to open this example in the mapcn-rn demo app
              <br />
              <code className="text-xs">{deepLink}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
