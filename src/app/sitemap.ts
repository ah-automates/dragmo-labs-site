import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/data";
import { policies } from "@/lib/policies";
import { products } from "@/lib/products";
import { caseStudies } from "@/lib/case-studies";
import { services } from "@/lib/services";

/**
 * `lastModified` is omitted wherever there is no real change date behind it.
 * Google's own sitemap guidance says not to stamp every URL with the build
 * time — a value that always reads "just now" teaches crawlers to distrust
 * the field, which is worse for re-crawl priority than leaving it unset. Only
 * the policy pages carry a genuine `updatedISO`, so only they get one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    {
      url: `${siteConfig.url}/products`,
      changeFrequency: "monthly",
      priority: 0.95,
    },
    ...products.map((product) => ({
      url: `${siteConfig.url}/products/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${siteConfig.url}/services`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...services.map((service) => ({
      url: `${siteConfig.url}/services/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: `${siteConfig.url}/case-studies`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...caseStudies.map((study) => ({
      url: `${siteConfig.url}/case-studies/${study.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteConfig.url}/contact`,
      changeFrequency: "yearly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/about`,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/faq`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    // Testimonials live at `/#testimonials` on the home page, already
    // covered by the root URL above — a fragment is not a separate page to
    // list here; see `testimonials.ts`.
    // Rarely change, but they are linked site-wide and worth indexing.
    ...Object.values(policies).map((policy) => ({
      url: `${siteConfig.url}/${policy.slug}`,
      lastModified: policy.updatedISO,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
