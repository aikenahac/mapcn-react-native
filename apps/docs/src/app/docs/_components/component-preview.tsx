import { highlightCode } from "@/lib/highlight";
import { ComponentPreviewClient } from "./component-preview-client";

interface ComponentPreviewProps {
  children?: React.ReactNode; // Kept for compatibility but unused
  code: string;
  className?: string;
  screenshotName?: string; // Name of screenshot file in /public/screenshots/
  qrCodeName?: string; // Name of QR code file in /public/qr/
}

export async function ComponentPreview({
  code,
  className,
  screenshotName,
  qrCodeName,
}: ComponentPreviewProps) {
  const highlightedCode = await highlightCode(code, "tsx");
  const CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;

  return (
    <ComponentPreviewClient
      code={code}
      highlightedCode={highlightedCode}
      className={className}
      screenshotName={screenshotName}
      qrCodeName={qrCodeName}
      cdnUrl={CDN_URL}
    />
  );
}
