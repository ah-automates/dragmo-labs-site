import type { Metadata } from "next";

import { AboutDocument } from "@/components/about/about-document";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/data";
import { aboutPageSchema, breadcrumbSchema, graph, organizationSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About",
  description: `${siteConfig.description} A remote-first team serving clients worldwide.`,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/about`,
    title: `About | ${siteConfig.name}`,
    description: siteConfig.description,
  },
};

export default function AboutPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "About", url: `${siteConfig.url}/about` },
  ]);

  return (
    <>
      {/* Organization is already emitted once in `layout.tsx`; redeclaring
          it here with the same `@id` lets a per-page reader (one that does
          not merge documents by `@id`, unlike Google) see the full entity
          without also having read `/`. */}
      <JsonLd data={graph(organizationSchema(), aboutPageSchema(), breadcrumbs)} />
      <AboutDocument />
    </>
  );
}
