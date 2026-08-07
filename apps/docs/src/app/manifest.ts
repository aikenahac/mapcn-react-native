import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "mapcn-react-native - Beautiful maps made simple",
    short_name: "mapcn-react-native",
    description:
      "A collection of beautifully designed, accessible, and customizable map components for React Native. Built on MapLibre / Mapbox React Native. Works with shadcn/ui for React Native.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: [
      "development",
      "productivity",
      "utilities",
    ],
  };
}
