const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "mapcn-react-native",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description:
      "Beautiful, accessible, and customizable map components for React Native",
    founder: {
      "@type": "Person",
      name: "Aiken Tine Ahac",
      url: "https://aiken.si",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Technical Support",
      url: "https://github.com/anthropics/claude-code/issues",
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: siteUrl,
    name: "mapcn-react-native",
    description:
      "Documentation for mapcn-react-native - Beautiful map components for React Native",
    publisher: {
      "@type": "Organization",
      name: "mapcn-react-native",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/docs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "mapcn-react-native",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A collection of beautifully designed, accessible, and customizable map components for React Native. Built on MapLibre React Native with Tailwind CSS styling via NativeWind/Uniwind.",
    softwareVersion: "1.0.0",
    programmingLanguage: "TypeScript",
    keywords:
      "react native, maplibre, map components, shadcn, react native reusables, tailwind, nativewind, uniwind, typescript, mobile maps",
    author: {
      "@type": "Person",
      name: "Aiken Tine Ahac",
      url: "https://aiken.si",
    },
    isAccessibleForFree: true,
    license: "MIT",
  };
}

export function getTechArticleSchema(
  title: string,
  description: string,
  path: string,
  datePublished?: string,
  dateModified?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: description,
    url: `${siteUrl}${path}`,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Aiken Tine Ahac",
      url: "https://aiken.si",
    },
    publisher: {
      "@type": "Organization",
      name: "mapcn-react-native",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`,
      },
    },
    inLanguage: "en-US",
    keywords: "react native, maplibre, map components, mobile development",
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.item}`,
    })),
  };
}

export function getHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: name,
    description: description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: `${siteUrl}${step.image}` }),
    })),
  };
}
