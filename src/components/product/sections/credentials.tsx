import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { Console } from "@/components/shared/console";
import type { Product } from "@/lib/products";

/**
 * Layout family: editorial offset split, narrative left, engineering log
 * right, columns visually offset rather than aligned. Step 07. The only
 * offset-column split on the page: `call-to-action.tsx` further down uses a
 * sticky-column split instead, which reads differently even though both are
 * two-column layouts. Only rendered for full-offer products.
 */
export function ProductCredentials({ product }: { product: Product }) {
  if (product.offer.kind !== "full-offer") return null;
  const { credentials } = product.offer;
  const count = credentials.proof.length;
  const hasProofLog = count > 0;

  const narrative = (
    <FadeIn className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary">
        The Proof
      </p>

      <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
        {credentials.heading}
      </h2>

      {hasProofLog && (
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-5xl font-semibold tracking-[-0.02em] text-transparent [-webkit-text-stroke:1.5px_rgba(46,169,255,0.65)] sm:text-6xl">
            {String(count).padStart(2, "0")}
          </span>
          <span className="max-w-[10rem] text-sm font-medium uppercase leading-snug tracking-[0.08em] text-foreground-muted">
            Verified fixes, found and checked on the live system
          </span>
        </div>
      )}

      <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
        {credentials.intro}
      </p>

      <div className="flex flex-col gap-1 border-l-2 border-accent/40 pl-4">
        <span className="font-heading text-base font-semibold text-foreground">
          {credentials.client.name}
        </span>
        <p className="text-base text-foreground-muted">{credentials.client.context}</p>
        {credentials.client.location && (
          <span className="mt-1 flex items-center gap-1.5 text-sm text-foreground-muted/70">
            <MapPin className="size-3.5" aria-hidden />
            {credentials.client.location}
          </span>
        )}
      </div>

      {credentials.crossReference && (
        <Link
          href={credentials.crossReference.href}
          className="group flex flex-col gap-1.5 rounded-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex items-center gap-2 font-heading text-base font-semibold text-accent-secondary">
            {credentials.crossReference.label}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
          <span className="text-sm leading-relaxed text-foreground-muted">
            {credentials.crossReference.description}
          </span>
        </Link>
      )}
    </FadeIn>
  );

  // With no proof log (the voice agent has none of its own, see proof.ts),
  // the two-column split has nothing for its right rail. A bare left-aligned
  // column here left the right half of the row empty for the whole section
  // (2026-09-15); a filled panel spanning the full row gives the collapsed
  // layout its own visual weight instead of reading as an unfinished
  // two-column split or, capped narrower than the row, the same
  // asymmetric-gutter defect this file otherwise avoids.
  if (!hasProofLog) {
    return (
      <Section space="lg" className="border-b border-border bg-background">
        <Container>
          <div className="rounded-card border border-border bg-surface/40 p-8 sm:p-10 lg:p-12">
            {narrative}
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section space="lg" className="border-b border-border bg-background">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          {narrative}
          <div>
            <Console label="Verified fixes" meta={product.slug} entries={credentials.proof} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
