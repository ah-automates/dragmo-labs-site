import { ArrowRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/motion";
import { EVENTS, LOCATIONS } from "@/lib/analytics";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * Layout family: stacked centered hero, text-only, one ambient radial wash,
 * gradient h1, no media. Steps 01, 02, 03, plus the CTA. Exactly four text
 * elements, per `design-system/MASTER.md` §4's hero rule: badge, h1,
 * subtext, CTA. Do not repeat this family elsewhere on the page; the
 * fascination band directly below shares its background but is visually and
 * structurally distinct (see `fascinations.tsx`).
 */
export function ProductHero({ product }: { product: Product }) {
  const { calloutAudience, promise, promiseBacking } = product.offer;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-accent/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[15%] top-[45%] size-[280px] rounded-full bg-glow/10 blur-[110px] sm:left-[8%]"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <FadeIn y={16} duration={0.5}>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent-secondary">
              {calloutAudience}
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="text-balance font-heading text-[clamp(2.25rem,5.6vw,4.25rem)] font-extrabold leading-[1] tracking-[-0.045em] text-foreground">
              <span className="text-foreground">{promise.headline} </span>
              <span className="bg-gradient-to-r from-accent via-accent-secondary to-glow bg-clip-text text-transparent">
                {promise.headlineAccent}
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
              {promiseBacking}
            </p>
          </FadeIn>

          <FadeIn delay={0.24} className="mt-2">
            <a
              href="#offer"
              className={cn(buttonVariants({ size: "lg" }))}
              data-analytics-event={EVENTS.cta}
              data-analytics-location={LOCATIONS.productHero}
            >
              {product.offer.kind === "full-offer" ? "Request Your Free Strategy Call" : "See The Offer"}
              <ArrowRight
                className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
