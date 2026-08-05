import * as React from "react";
import { ArrowDown } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/motion";

type PageHeroProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background pb-20 pt-32 sm:pb-24 sm:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />

      <Container className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          {eyebrow && (
            <FadeIn y={16} duration={0.5}>
              <Badge>{eyebrow}</Badge>
            </FadeIn>
          )}

          <FadeIn delay={0.06}>
            <h1 className="text-balance font-heading text-[clamp(2.25rem,5.4vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground">
              {title}
            </h1>
          </FadeIn>

          <FadeIn delay={0.12}>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
              {description}
            </p>
          </FadeIn>

          {ctaHref && ctaLabel && (
            <FadeIn delay={0.18} className="mt-2">
              {/* Plain anchor: a fragment jump needs no client navigation. */}
              <a href={ctaHref} className={buttonVariants()}>
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
