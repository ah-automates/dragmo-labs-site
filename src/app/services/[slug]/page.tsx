import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ServiceDocument } from "@/components/service/service-document";
import { JsonLd } from "@/components/seo/json-ld";
import { services, servicesBySlug, type Service, type ServiceSlug } from "@/lib/services";
import { siteConfig } from "@/lib/data";
import { breadcrumbSchema, faqPageSchema, graph, serviceSchema } from "@/lib/schema";

type PageProps = { params: Promise<{ slug: string }> };

// Every slug is known at build time. An unknown slug is a build-time 404,
// not an on-demand render, keeping `/api/contact` the only dynamic route
// on the site (see `context.md` §1).
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = servicesBySlug[slug as ServiceSlug];
  if (!service) return {};
  return serviceMetadata(service);
}

function serviceMetadata(service: Service): Metadata {
  // `seo` overrides the <title>/meta description only when the researched
  // primary search term differs from the on-page title/description — the
  // visible page, nav, and card copy are untouched either way.
  const title = service.seo?.title ?? service.title;
  const description = service.seo?.description ?? service.description;

  return {
    title,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/services/${service.slug}`,
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = servicesBySlug[slug as ServiceSlug];
  if (!service) notFound();

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Services", url: `${siteConfig.url}/services` },
    { name: service.title, url: `${siteConfig.url}/services/${service.slug}` },
  ]);
  const faq = service.faq ? faqPageSchema(service.faq) : null;

  return (
    <>
      <JsonLd data={graph(serviceSchema(service), breadcrumbs, faq)} />
      <ServiceDocument service={service} />
    </>
  );
}
