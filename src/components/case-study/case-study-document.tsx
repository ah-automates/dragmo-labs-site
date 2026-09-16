import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers, ShieldCheck, SquareCode } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { QuoteBlock } from "@/components/shared/quote-block";
import { Console } from "@/components/shared/console";
import { SectionOpener } from "@/components/shared/section-opener";
import { productsBySlug } from "@/lib/products";
import { siteConfig } from "@/lib/data";
import type { CaseStudy } from "@/lib/case-studies";
import type { Testimonial } from "@/lib/testimonials";

/**
 * Renders one case study end to end. Mirrors the structure of
 * `policy-document.tsx` (a bespoke hero, then a sequence of prose sections)
 * without borrowing its sticky table of contents, which exists there to
 * navigate a legal document's numbered sections, not a narrative one.
 */
export function CaseStudyDocument({
  study,
  quote,
}: {
  study: CaseStudy;
  quote?: Testimonial;
}) {
  const relatedProducts = study.relatedProductSlugs
    .map((slug) => productsBySlug[slug])
    .filter(Boolean);

  const heroBackdrop = relatedProducts.find(
    (p) => p.offer.solution.media.kind === "video",
  );
  const backdropPoster =
    heroBackdrop?.offer.solution.media.kind === "video" ? heroBackdrop.offer.solution.media.poster : null;

  return (
    <>
      <Section className="relative overflow-hidden border-b border-border bg-background pb-16 pt-32 sm:pb-20 sm:pt-40" space="sm">
        {backdropPoster ? (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <Image
              src={backdropPoster.src}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-[0.16] blur-3xl"
            />
            <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,6,8,0.4)_0%,rgba(5,6,8,0.96)_70%)]" />
          </div>
        ) : (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
          />
        )}

        <Container className="relative">
          <FadeIn className="flex flex-col gap-5">
            <Badge>{study.client}</Badge>
            <h1 className="text-pretty font-heading text-[clamp(2.5rem,5.6vw,4.5rem)] font-extrabold leading-[1] tracking-[-0.045em] text-foreground">
              {study.title}
            </h1>
            <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
              {study.summary}
            </p>
            <p className="text-base text-foreground-muted/70">{study.clientContext}</p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-10 flex flex-wrap gap-8 border-t border-border pt-8">
            <Stat value={String(relatedProducts.length || 1).padStart(2, "0")} label={relatedProducts.length === 1 ? "System Built" : "Systems Built"} />
            {study.proof.length > 0 && (
              <Stat value={String(study.proof.length).padStart(2, "0")} label="Verified Fixes" />
            )}
            <Stat value={String(study.stack.length).padStart(2, "0")} label="Technologies" />
          </FadeIn>
        </Container>
      </Section>

      <Section space="lg" className="border-b border-border bg-background-secondary">
        <Container>
          {/* Fills the row rather than a `max-w-[62ch]` centered column
              (2026-09-15): a narrow prose column left the section's right
              side empty for its whole height. Multiple paragraphs run in CSS
              columns so they sit side by side instead of one long column. */}
          <div className="flex flex-col gap-8 border-l border-accent/25 pl-6 sm:pl-8">
            <FadeIn>
              <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
                The Challenge
              </h2>
            </FadeIn>
            <FadeIn delay={0.06} className="columns-1 gap-x-10 sm:columns-2">
              {study.challenge.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-4 break-inside-avoid-column text-pretty text-lg leading-relaxed text-foreground-muted last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section space="md" className="border-b border-border bg-background">
        <Container>
          <FadeIn>
            <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
              What We Built
            </h2>
          </FadeIn>
          <Stagger className="mt-8 grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2">
            {study.build.map((paragraph, i) => (
              <StaggerChild
                key={paragraph}
                as="div"
                className="flex gap-4 bg-background p-6 sm:p-7"
              >
                <span className="shrink-0 font-mono text-lg font-semibold text-accent-secondary/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-pretty text-base leading-relaxed text-foreground-muted">{paragraph}</p>
              </StaggerChild>
            ))}
          </Stagger>
        </Container>
      </Section>

      {study.proof.length > 0 && (
        <Section space="lg" className="border-b border-border bg-background-secondary">
          <Container>
            <SectionOpener
              label="Verified, Not Just Claimed"
              title="Every fix, found and verified on the live system"
            />
            <div className="mt-8">
              <Console label="Verified fixes" meta={study.slug} entries={study.proof} />
            </div>
          </Container>
        </Section>
      )}

      {quote && (
        <Section space="sm" className="border-b border-border bg-background">
          <Container>
            <QuoteBlock testimonial={quote} />
          </Container>
        </Section>
      )}

      <Section space="md" className="bg-background-secondary">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface/30 p-5">
              <SquareCode className="size-4 shrink-0 text-accent-secondary" aria-hidden />
              {study.stack.map((item, i) => (
                <span key={item} className="font-mono text-xs text-foreground-muted">
                  {item}
                  {i < study.stack.length - 1 && <span className="ml-2 text-foreground-muted/30">/</span>}
                </span>
              ))}
            </div>

            {(relatedProducts.length > 0 || study.liveUrl) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-card border border-border bg-surface/30 p-5 transition-[border-color,background-color] duration-300 hover:border-accent/35 hover:bg-surface/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-input border border-accent/20 bg-accent/10 text-accent-secondary">
                        <Layers className="size-4" aria-hidden />
                      </span>
                      <span className="font-heading text-sm font-semibold text-foreground">
                        {product.name}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-foreground-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-secondary" aria-hidden />
                  </Link>
                ))}

                {study.liveUrl && (
                  <a
                    href={study.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-3 rounded-card border border-border bg-surface/30 p-5 transition-[border-color,background-color] duration-300 hover:border-accent/35 hover:bg-surface/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex size-9 items-center justify-center rounded-input border border-accent/20 bg-accent/10 text-accent-secondary">
                        <ShieldCheck className="size-4" aria-hidden />
                      </span>
                      <span className="font-heading text-sm font-semibold text-foreground">
                        {study.liveUrl.replace(/^https?:\/\//, "")}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-foreground-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:text-accent-secondary" aria-hidden />
                  </a>
                )}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-mono text-3xl font-semibold tracking-[-0.01em] text-foreground">
        {value}
      </span>
      <span className="max-w-[6rem] font-mono text-xs font-medium uppercase leading-snug tracking-[0.1em] text-foreground-muted">
        {label}
      </span>
    </div>
  );
}

export function caseStudyMetadata(study: CaseStudy) {
  // `seo` overrides the <title>/meta description only — the visible H1
  // stays `study.title` either way.
  const title = study.seo?.title ?? study.title;
  const description = study.seo?.description ?? study.summary;

  return {
    title,
    description,
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: {
      type: "article" as const,
      url: `${siteConfig.url}/case-studies/${study.slug}`,
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}
