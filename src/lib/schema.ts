import { siteConfig } from "@/lib/data";
import { products, type Product } from "@/lib/products";
import { services, type Service } from "@/lib/services";
import type { CaseStudy } from "@/lib/case-studies";
import type { FaqEntry } from "@/lib/faq";
import { about } from "@/lib/about";

/**
 * Schema.org JSON-LD builders. Pure functions returning plain objects, never
 * JSX — server-only, since this module imports `products.ts`/`services.ts`,
 * which `context.md` §2 forbids from crossing into a client bundle. Never
 * import this from a `"use client"` file.
 *
 * Every page emits one `@graph` and references the Organization/WebSite
 * nodes by `@id` (defined once, in `src/app/layout.tsx`) rather than
 * redeclaring them, so a consumer that merges by `@id` — which is how
 * Google and most LLM crawlers read JSON-LD — resolves the whole site as one
 * entity graph rather than a pile of disconnected objects.
 *
 * Deliberately omitted everywhere: `offers` (a price) and `aggregateRating`
 * (a rating). Both would require an invented number, which
 * `design-system/MASTER.md` §7 rules out ("no invented numbers"). The cost is
 * a Google Search Console *warning* ("missing field offers") on
 * `SoftwareApplication`/`Service` nodes, not an error, and no loss of
 * indexing — do not "fix" that warning by adding a fabricated price. The
 * goal here is AI/LLM extraction of real claims, not rich-result eligibility.
 */

type JsonLdNode = Record<string, unknown>;

export const ORG_ID = `${siteConfig.url}/#organization`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

/** Wraps one or more nodes into a single `@graph` document. */
export function graph(...nodes: (JsonLdNode | null | undefined)[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter((node): node is JsonLdNode => Boolean(node)),
  };
}

/**
 * Not `LocalBusiness`/`ProfessionalService`: those expect a real
 * `PostalAddress`, and `siteConfig.address` is "Remote-first, serving
 * clients worldwide" — fabricating a street address to satisfy the type
 * would itself be an invented fact.
 */
export function organizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    description: siteConfig.description,
    logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.webp` },
    areaServed: "Worldwide",
    // The strongest entity-disambiguation signal available: tells a crawler
    // these social profiles and this website describe the same entity.
    sameAs: Object.values(siteConfig.social),
    knowsAbout: [...products.map((product) => product.name), ...services.map((service) => service.title)],
    // Each conditional below is a fact `src/lib/about.ts` does not have yet.
    // Omitted, never invented, until the owner supplies a real value there.
    ...(about.legalName ? { legalName: about.legalName } : {}),
    ...(about.foundingYear ? { foundingDate: String(about.foundingYear) } : {}),
    ...(about.teamSize ? { numberOfEmployees: about.teamSize } : {}),
    ...(about.founders && about.founders.length > 0
      ? {
          founder: about.founders.map((founder) => ({
            "@type": "Person",
            name: founder.name,
            jobTitle: founder.role,
            ...(founder.linkedin ? { sameAs: founder.linkedin } : {}),
            ...(founder.vision ? { description: founder.vision } : {}),
          })),
        }
      : {}),
  };
}

export function aboutPageSchema(): JsonLdNode {
  const url = `${siteConfig.url}/about`;
  return {
    "@type": "AboutPage",
    "@id": `${url}#aboutpage`,
    url,
    name: `About ${siteConfig.name}`,
    mainEntity: { "@id": ORG_ID },
  };
}

/** No `SearchAction` — the site has no site search, and declaring a
 *  sitelinks search box that does not exist would be a false claim. */
export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": ORG_ID },
  };
}

/** `benefits.rows` only exists on a `"full-offer"` product, and is exactly
 *  how a capability like human takeover becomes a machine-extractable
 *  feature rather than a claim buried in marketing prose. */
function productFeatureList(product: Product): string[] | undefined {
  if (product.offer.kind !== "full-offer") return undefined;
  return product.offer.benefits.rows.map((row) => `${row.feature}: ${row.benefit}`);
}

/** The video caption (`captionSummary`, now also rendered on-page — see
 *  `solution.tsx`) is the richest plain-text description of what a product
 *  actually does, so it is folded into the schema description too. */
function productDescription(product: Product): string {
  const base = product.seo?.description ?? product.summary;
  const media = product.offer.solution.media;
  return media.kind === "video" ? `${base} ${media.captionSummary}` : base;
}

export function productSchema(product: Product): JsonLdNode {
  const url = `${siteConfig.url}/products/${product.slug}`;
  const description = productDescription(product);
  const featureList = productFeatureList(product);

  const shared: JsonLdNode = {
    "@id": `${url}#product`,
    name: product.name,
    url,
    description,
    provider: { "@id": ORG_ID },
  };

  if (product.schemaKind === "service") {
    return {
      "@type": "Service",
      ...shared,
      serviceType: product.name,
    };
  }

  return {
    "@type": "SoftwareApplication",
    ...shared,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web-based",
    ...(featureList ? { featureList } : {}),
  };
}

export function serviceSchema(service: Service): JsonLdNode {
  const url = `${siteConfig.url}/services/${service.slug}`;
  const description = service.seo?.description ?? service.description;

  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.title,
    url,
    description,
    provider: { "@id": ORG_ID },
    serviceType: service.title,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.title} Deliverables`,
      itemListElement: service.detail.deliverables.entries.map((item) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: item.name, description: item.body },
      })),
    },
  };
}

/** schema.org has no `CaseStudy` type; `Article` is the closest honest fit
 *  for a narrative write-up of real, delivered work. `about` links each
 *  related product in by `@id`, a real graph edge rather than a repeated
 *  text mention. */
export function caseStudyArticleSchema(study: CaseStudy): JsonLdNode {
  const url = `${siteConfig.url}/case-studies/${study.slug}`;
  const description = study.seo?.description ?? study.summary;

  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: study.title,
    url,
    description,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    about: study.relatedProductSlugs.map((slug) => ({
      "@id": `${siteConfig.url}/products/${slug}#product`,
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Google has restricted the FAQ *rich result* itself to government/health
 * sites since 2023 — expect no visual snippet in search. The value here is
 * an LLM or AI search crawler extracting a direct question/answer pair,
 * which this markup serves regardless of rich-result eligibility.
 */
export function faqPageSchema(faq: readonly FaqEntry[]): JsonLdNode | null {
  if (faq.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
