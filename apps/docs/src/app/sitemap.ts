import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/docs",
    "/docs/installation",
    "/docs/cli",
    "/docs/commercial-use",
    "/docs/basic-map",
    "/docs/markers",
    "/docs/popups",
    "/docs/controls",
    "/docs/routes",
    "/docs/clusters",
    "/docs/advanced-usage",
    "/docs/api-reference",
    "/docs/companion",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/docs" ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/docs" ? 0.9 : 0.8,
  }));
}
