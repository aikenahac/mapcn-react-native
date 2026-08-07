import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { ThemeProvider } from "@/components/theme-provider";
import { StructuredData } from "@/components/structured-data";
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getSoftwareApplicationSchema,
} from "@/lib/structured-data";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = "mapcn-react-native";
const creator = "https://aiken.si";
const siteDescription =
  "A collection of beautifully designed, accessible, and customizable map components. Built on MapLibre / Mapbox React Native. Styled with Tailwind CSS (via NativeWind/Uniwind). Works with React Native Reusables (shadcn/ui for React Native).";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "mapcn-react-native - Beautiful maps made simple",
    template: "%s - mapcn-react-native",
  },
  description: siteDescription,
  keywords: [
    "react native map",
    "maplibre",
    "maplibre react native",
    "map components",
    "shadcn map",
    "shadcn react native",
    "rnr map",
    "react native reusables",
    "react native reusables map",
    "react native reusables mapcn",
    "tailwind map",
    "nativewind/unwind map",
    "react native map library",
    "typescript map",
    "interactive maps",
    "map markers",
    "map controls",
    "mobile maps",
    "ios maps",
    "android maps",
    "expo maps",
    "mapbox alternative",
    "open source maps",
    "customizable maps",
    "react native geolocation",
    "react native location",
    "shadcn mapbox",
    "mapcn mapbox",
    "mapbox",
    "mapbox react native",
    "beautiful maps",
    "map components library",
  ],
  authors: [
    { name: "Aiken Tine Ahac", url: "https://aiken.si" },
  ],
  creator: "Aiken Tine Ahac",
  publisher: "mapcn-react-native",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: "mapcn-react-native - Beautiful maps made simple",
    description: siteDescription,
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "mapcn-react-native - Beautiful maps, made simple",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mapcn-react-native - Beautiful maps made simple",
    description: siteDescription,
    creator: creator,
    images: ["/banner.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
  applicationName: "mapcn-react-native",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    // Add your verification codes here when you set them up
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  appleWebApp: {
    capable: true,
    title: "mapcn-react-native",
    statusBarStyle: "black-translucent",
  },
  other: {
    "msapplication-TileColor": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script defer data-domain="mapcn-rn.dev" src="https://plausible.aerio.cloud/js/script.outbound-links.js"></script>
      </head>
      <body className="font-sans antialiased">
        <StructuredData
          data={[
            getOrganizationSchema(),
            getWebsiteSchema(),
            getSoftwareApplicationSchema(),
          ]}
        />
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
