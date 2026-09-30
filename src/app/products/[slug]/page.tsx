import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductSalesPage } from "@/components/product/sales-page";
import { ProductShowcasePage } from "@/components/product/showcase-page";
import { JsonLd } from "@/components/seo/json-ld";
import { products, productsBySlug, type Product } from "@/lib/products";
import { siteConfig } from "@/lib/data";
import { breadcrumbSchema, faqPageSchema, graph, productSchema } from "@/lib/schema";

type PageProps = { params: Promise<{ slug: string }> };

// Every slug is known at build time. An unknown slug is a build-time 404,
// not an on-demand render, keeping `/api/contact` the only dynamic route
// on the site (see `context.md` §1).
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return params.then(({ slug }) => {
    const product = productsBySlug[slug as Product["slug"]];
    if (!product) return {};
    return productMetadata(product);
  });
}

function productMetadata(product: Product): Metadata {
  // `seo` overrides the <title>/meta description only when researched
  // search demand points at a sharper phrase than `name`/`summary` — the
  // visible page and nav copy are untouched either way.
  const title = product.seo?.title ?? product.name;
  const description = product.seo?.description ?? product.summary;

  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      url: `${siteConfig.url}/products/${product.slug}`,
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = productsBySlug[slug as Product["slug"]];
  if (!product) notFound();

  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: siteConfig.url },
    { name: "Products", url: `${siteConfig.url}/products` },
    { name: product.name, url: `${siteConfig.url}/products/${product.slug}` },
  ]);
  const faq = product.faq ? faqPageSchema(product.faq) : null;

  return (
    <>
      <JsonLd data={graph(productSchema(product), breadcrumbs, faq)} />
      {product.offer.kind === "full-offer" ? (
        <ProductSalesPage product={product} />
      ) : (
        <ProductShowcasePage product={product} />
      )}
    </>
  );
}
