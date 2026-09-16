import Image from "next/image";
import { X } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import type { Product } from "@/lib/products";

/**
 * Layout family: a filled panel set against a real product still used as a
 * heavily dimmed ambient backdrop (never a stock or fabricated image; see
 * `design-system/MASTER.md` §7). Step 05. The "what was tried before" list
 * fills out the panel as a row of tagged, bordered notes.
 *
 * The panel (2026-09-15, replacing a bare left-accent-line treatment) spans
 * the full container so the section fills its row instead of leaving both
 * side gutters empty around a narrow floating column. The heading and
 * paragraphs fill the panel's own width in turn, rather than stopping at a
 * `.measure` cap partway across it — multiple paragraphs run in CSS columns
 * so two sit side by side instead of one long line.
 */
export function ProductProblem({ product }: { product: Product }) {
  const { problem, solution } = product.offer;
  const backdrop = solution.media.kind === "video" ? solution.media.poster : null;

  return (
    <Section space="lg" className="relative overflow-hidden bg-background-secondary">
      {backdrop && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src={backdrop.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.14] blur-2xl"
          />
          <span className="absolute inset-0 bg-[linear-gradient(100deg,rgba(8,17,31,0.4)_0%,rgba(8,17,31,0.94)_45%,rgba(8,17,31,1)_100%)]" />
        </div>
      )}

      <Container className="relative">
        <div className="rounded-card border border-border bg-background/60 p-7 backdrop-blur-sm sm:p-10 lg:p-12">
          <div className="flex flex-col gap-8 border-l-2 border-accent/40 pl-6 sm:pl-8">
            <FadeIn>
              <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
                {problem.heading}
              </h2>
            </FadeIn>

            <FadeIn delay={0.06} className="columns-1 gap-x-10 sm:columns-2">
              {problem.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-4 break-inside-avoid-column text-pretty text-lg leading-relaxed text-foreground-muted last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </FadeIn>

            {problem.failedAttempts.length > 0 && (
              <Stagger className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {problem.failedAttempts.map((attempt) => (
                  <StaggerChild
                    key={attempt.tried}
                    as="div"
                    className="flex flex-col gap-2 rounded-input border border-border/70 bg-white/[0.02] p-4"
                  >
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground-muted/60">
                      <X className="size-3" aria-hidden />
                      Already tried
                    </span>
                    <p className="font-heading text-base font-semibold leading-snug text-foreground">
                      {attempt.tried}
                    </p>
                    <p className="text-pretty text-sm leading-relaxed text-foreground-muted/80">
                      {attempt.whyItFailed}
                    </p>
                  </StaggerChild>
                ))}
              </Stagger>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
