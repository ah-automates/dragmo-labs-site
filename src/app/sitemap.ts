import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/data";
import { policyLinks } from "@/lib/policies";
import { products } from "@/lib/products";
import { caseStudies } from "@/lib/case-studies";
import { services } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteConfig.url, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteConfig.url}/products`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    ...products.map((product) => ({
      url: `${siteConfig.url}/products/${product.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${siteConfig.url}/services`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...services.map((service) => ({
      url: `${siteConfig.url}/services/${service.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: `${siteConfig.url}/case-studies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...caseStudies.map((study) => ({
      url: `${siteConfig.url}/case-studies/${study.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteConfig.url}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    // Testimonials live at `/#testimonials` on the home page, already
    // covered by the root URL above — a fragment is not a separate page to
    // list here; see `testimonials.ts`.
    // Rarely change, but they are linked site-wide and worth indexing.
    ...policyLinks.map((link) => ({
      url: `${siteConfig.url}${link.href}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
