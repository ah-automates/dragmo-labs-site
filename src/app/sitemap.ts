import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/data";
import { policyLinks } from "@/lib/policies";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteConfig.url, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteConfig.url}/services`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    // Rarely change, but they are linked site-wide and worth indexing.
    ...policyLinks.map((link) => ({
      url: `${siteConfig.url}${link.href}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
