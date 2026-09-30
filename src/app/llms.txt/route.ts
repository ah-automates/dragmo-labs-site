import { siteConfig } from "@/lib/data";
import { products } from "@/lib/products";
import { services } from "@/lib/services";
import { caseStudies } from "@/lib/case-studies";
import { policies } from "@/lib/policies";

/**
 * A machine-readable directory of the site's real pages, generated from the
 * same data every other page reads (`context.md` §2: content lives as
 * data). A hand-written `public/llms.txt` would drift the first time a
 * product is added; this cannot. `force-static` renders it once at build
 * time, so `/api/contact` stays the only genuinely dynamic route on the
 * site (see `context.md` §1).
 */
export const dynamic = "force-static";

function productLine(product: (typeof products)[number]): string {
  const description = product.seo?.description ?? product.summary;
  return `- [${product.name}](${siteConfig.url}/products/${product.slug}): ${description}`;
}

function serviceLine(service: (typeof services)[number]): string {
  const description = service.seo?.description ?? service.description;
  return `- [${service.title}](${siteConfig.url}/services/${service.slug}): ${description}`;
}

function caseStudyLine(study: (typeof caseStudies)[number]): string {
  const description = study.seo?.description ?? study.summary;
  return `- [${study.title}](${siteConfig.url}/case-studies/${study.slug}): ${description}`;
}

export function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## Products",
    "",
    ...products.map(productLine),
    "",
    "## Services",
    "",
    ...services.map(serviceLine),
    "",
    "## Case Studies",
    "",
    ...caseStudies.map(caseStudyLine),
    "",
    "## Company",
    "",
    `- [About](${siteConfig.url}/about): Who ${siteConfig.name} is and how the team works.`,
    `- [FAQ](${siteConfig.url}/faq): Answers about process, pricing, guarantees, and data handling.`,
    `- [Contact](${siteConfig.url}/contact): Get in touch.`,
    "",
    "## Policies",
    "",
    ...Object.values(policies).map(
      (policy) => `- [${policy.title}](${siteConfig.url}/${policy.slug}): ${policy.description}`,
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
