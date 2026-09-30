import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyDocument, caseStudyMetadata } from "@/components/case-study/case-study-document";
import { JsonLd } from "@/components/seo/json-ld";
import { caseStudies, caseStudiesBySlug, type CaseStudy } from "@/lib/case-studies";
import { testimonialsForCaseStudy } from "@/lib/testimonials";
import { siteConfig } from "@/lib/data";
import { breadcrumbSchema, caseStudyArticleSchema, graph } from "@/lib/schema";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudiesBySlug[slug as CaseStudy["slug"]];
  if (!study) return {};
  return caseStudyMetadata(study);
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = caseStudiesBySlug[slug as CaseStudy["slug"]];
  if (!study) notFound();

  const [quote] = testimonialsForCaseStudy(study.slug);

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Case Studies", url: `${siteConfig.url}/case-studies` },
    { name: study.client, url: `${siteConfig.url}/case-studies/${study.slug}` },
  ]);

  return (
    <>
      <JsonLd data={graph(caseStudyArticleSchema(study), breadcrumbs)} />
      <CaseStudyDocument study={study} quote={quote} />
    </>
  );
}
