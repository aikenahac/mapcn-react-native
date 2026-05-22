import { Zap, Moon, Puzzle, Code } from "lucide-react";
import { DocsLayout, DocsSection, DocsLink } from "./_components/docs";
import { Metadata } from "next";

const features = [
  {
    icon: Zap,
    title: "Zero Config",
    description:
      "Works out of the box with free map tiles. No API keys required.",
  },
  {
    icon: Moon,
    title: "Theme Aware",
    description: "Automatically adapts to light and dark mode.",
  },
  {
    icon: Puzzle,
    title: "Composable",
    description: "Build complex UIs with simple, composable components.",
  },
  {
    icon: Code,
    title: "TypeScript",
    description: "Full type safety with comprehensive TypeScript support.",
  },
];

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "Beautiful, accessible map components for React Native. Built on MapLibre / Mapbox React Native with NativeWind/Uniwind styling and full TypeScript support.",
  keywords: [
    "react native map components",
    "maplibre react native",
    "mapbox react native",
    "shadcn react native",
    "react native reusables",
    "nativewind/unwind maps",
    "typescript maps",
    "mobile map library",
  ],
  openGraph: {
    title: "Introduction - mapcn-react-native",
    description:
      "Beautiful, accessible map components for React Native. Built on MapLibre / Mapbox React Native with NativeWind/Uniwind styling and full TypeScript support.",
    type: "article",
  },
};

export default function IntroductionPage() {
  return (
    <DocsLayout
      title="Introduction"
      description="Beautiful, accessible map components."
      next={{ title: "Installation", href: "/docs/installation" }}
    >
      <DocsSection>
        <p>
          <strong className="text-foreground">mapcn-react-native</strong> provides
          beautifully designed, accessible, and customizable map components.
          Built on{" "}
          <DocsLink href="https://maplibre.org/maplibre-react-native/" external>
            MapLibre React Native v11
          </DocsLink> / <DocsLink href="https://rnmapbox.github.io/" external>
            Mapbox React Native
          </DocsLink>
          , styled with{" "}
          <DocsLink href="https://www.nativewind.dev/" external>
            NativeWind/Uniwind
          </DocsLink>{" "}
          and designed to work with the same component code for both styling
          libraries, alongside{" "}
          <DocsLink href="https://reactnativereusables.com/" external>
            React Native Reusables (shadcn/ui for React Native)
          </DocsLink>
          .
        </p>
      </DocsSection>

      <DocsSection title="Why mapcn-react-native?">
        <p>
          There&apos;s no proper copy-paste, easy-to-use map integration for
          React Native. Most solutions require complex configurations, API keys, or
          heavy wrapper libraries. mapcn-react-native gives you beautiful maps with a single
          command.
        </p>
      </DocsSection>

      <DocsSection title="Features">
        <div className="grid gap-4 sm:grid-cols-2 mt-4 not-prose">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="size-4 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
