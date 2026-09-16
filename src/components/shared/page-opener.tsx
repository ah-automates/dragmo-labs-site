import * as React from "react";
import { ArrowDown } from "lucide-react";

import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import { Rise, FadeIn } from "@/components/shared/motion";
import { EVENTS, LOCATIONS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type PageOpenerProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

/**
 * Replaces `PageHero` (`design-system/pages/product.md` predates this;
 * MASTER §4 governs it now). Asymmetric opener: oversized left-aligned
 * headline, not a centered badge over a dot grid. Opens 4 routes:
 * /products, /case-studies, /services, /testimonials.
 *
 * No numbered meta rail (dropped 2026-09-15, client-flagged as a stray badge
 * sitting off to the right of the heading).
 */
export function PageOpener({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
}: PageOpenerProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background pb-16 pt-32 sm:pb-20 sm:pt-40">
      <Container className="relative">
        <div className="border-b border-border pb-8">
          {eyebrow && (
            <FadeIn y={12} duration={0.5}>
              <p className="mb-5 font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary">
                {eyebrow}
              </p>
            </FadeIn>
          )}
          <Rise delay={0.06}>
            <h1 className="text-pretty font-heading text-[clamp(2.75rem,6.2vw,5rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-foreground">
              {title}
            </h1>
          </Rise>
        </div>

        <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* `min-w-0 flex-1`, not `.measure` (2026-09-15): a fixed cap left
              the description hugging the left edge with the row's right side
              empty whenever there was no CTA button to share the row with —
              the asymmetric-gutter defect the client flagged. `flex-1` fills
              the row (or the space beside the CTA); `min-w-0` overrides the
              flex default that would otherwise stop it from wrapping at all. */}
          <FadeIn delay={0.1} className="w-full sm:min-w-0 sm:flex-1">
            <p className="text-pretty text-lg leading-relaxed text-foreground-muted sm:text-xl">
              {description}
            </p>
          </FadeIn>

          {ctaHref && ctaLabel && (
            <FadeIn delay={0.16} className="shrink-0">
              {/* Plain anchor: a fragment jump needs no client navigation. */}
              <a
                href={ctaHref}
                className={cn(buttonVariants(), "active:scale-[0.98]")}
                data-analytics-event={EVENTS.cta}
                data-analytics-location={LOCATIONS.pageHero}
              >
                {ctaLabel}
                <ArrowDown
                  className="size-4 transition-transform duration-300 group-hover:translate-y-0.5"
                  aria-hidden
                />
              </a>
            </FadeIn>
          )}
        </div>
      </Container>
    </section>
  );
}
