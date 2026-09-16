import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyDocument, caseStudyMetadata } from "@/components/case-study/case-study-document";
import { caseStudies, caseStudiesBySlug, type CaseStudy } from "@/lib/case-studies";
import { testimonialsForCaseStudy } from "@/lib/testimonials";

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

  return <CaseStudyDocument study={study} quote={quote} />;
}
