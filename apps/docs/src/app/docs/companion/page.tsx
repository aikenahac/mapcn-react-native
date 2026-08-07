import Image from "next/image";
import { DocsLayout, DocsLink, DocsSection } from "../_components/docs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companion App",
};

export default function CompanionAppPage() {
  const CDN_URL = process.env.NEXT_PUBLIC_BUNNY_CDN_URL;

  return (
    <DocsLayout
      title="Companion App"
      description="Download the companion app for previewing map components."
      prev={{ title: "API Reference", href: "/docs/api-reference" }}
      next={{ title: "Basic Map", href: "/docs/basic-map" }}
    >
      <DocsSection title="iOS Download">
        <Image
          src={`${CDN_URL}/qr/apple_app_store.png`}
          width={256}
          height={256}
          alt="QR code for iOS app"
        />
        <DocsLink href="https://apps.apple.com/us/app/mapcn/id6757542720">
          Open App Store
        </DocsLink>
      </DocsSection>

      <DocsSection title="Android Download">
        <Image
          src={`${CDN_URL}/qr/google_play.png`}
          width={256}
          height={256}
          alt="QR code for Android app"
        />
        <DocsLink href="https://play.google.com/store/apps/details?id=si.aiken.mapcnrn">
          Open Google Play
        </DocsLink>
      </DocsSection>
    </DocsLayout>
  );
}
