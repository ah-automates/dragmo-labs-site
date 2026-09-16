import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { QuoteBlock } from "@/components/shared/quote-block";
import { testimonialsForProduct } from "@/lib/testimonials";
import type { Product } from "@/lib/products";

/**
 * Layout family: attribution panel, a wide two-part band pairing a short
 * statement against an ambient wash with the quote itself. Step 09.
 * Full-offer products only. Renders an approved testimonial when one exists
 * for this product; the panel never shows a "coming soon" placeholder for
 * one that has not been signed off, it simply omits the quote until
 * `testimonials.ts` marks one approved.
 */
export function ProductSocialProof({ product }: { product: Product }) {
  if (product.offer.kind !== "full-offer") return null;
  const { socialProof } = product.offer;
  const quotes = testimonialsForProduct(product.slug);

  return (
    <Section space="md" className="relative overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/8 blur-[130px]"
      />

      <Container className="relative">
        <div className={`mx-auto grid max-w-5xl gap-10 ${quotes.length > 0 ? "lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center" : ""}`}>
          <FadeIn className="flex flex-col gap-4">
            <h2 className="text-pretty font-heading text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground">
              {socialProof.heading}
            </h2>
            <p className="text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
              {socialProof.statement}
            </p>
            <Link
              href={`/case-studies/${socialProof.caseStudySlug}`}
              className="group inline-flex w-fit items-center gap-1.5 rounded-input font-heading text-base font-semibold text-accent-secondary transition-colors duration-300 hover:text-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Read the full case study
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          </FadeIn>

          {quotes.length > 0 && (
            <FadeIn delay={0.1}>
              <QuoteBlock testimonial={quotes[0]} />
            </FadeIn>
          )}
        </div>
      </Container>
    </Section>
  );
}
