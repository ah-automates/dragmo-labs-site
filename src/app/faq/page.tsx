import type { Metadata } from "next";

import { FaqDocument } from "@/components/faq/faq-document";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/data";
import { allCompanyFaqEntries } from "@/lib/faq-content";
import { breadcrumbSchema, faqPageSchema, graph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about how Dragmo Labs works: process, pricing, guarantees, and how your data is handled.",
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/faq`,
    title: `FAQ | ${siteConfig.name}`,
    description:
      "Answers about how Dragmo Labs works: process, pricing, guarantees, and how your data is handled.",
  },
};

export default function FaqPage() {
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "FAQ", url: `${siteConfig.url}/faq` },
  ]);
  const faq = faqPageSchema(allCompanyFaqEntries());

  return (
    <>
      <JsonLd data={graph(faq, breadcrumbs)} />
      <FaqDocument />
    </>
  );
}
