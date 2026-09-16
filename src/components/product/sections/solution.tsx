import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { VideoPlayer } from "@/components/shared/video-player";
import { LOCATIONS } from "@/lib/analytics";
import type { Product } from "@/lib/products";

/**
 * Layout family: framed full-bleed media, the step 06 reveal. The only
 * media-only section on the page, so there are never two consecutive
 * image+text splits regardless of what sits on either side of it. Handles
 * three honest forms of "solution": a real recorded demo, real stills, or a
 * labeled process sequence for a product with no footage yet.
 */
export function ProductSolution({ product }: { product: Product }) {
  const { solution } = product.offer;

  return (
    <Section space="md" id="see-it-work" className="scroll-mt-24 border-b border-border bg-background">
      <Container>
        {/* Left-aligned, not centered (2026-09-15): a centered heading over a
            full-width media block below it was the "forced center" pattern
            the rest of the site moved away from. The heading and paragraphs
            fill the full row rather than stopping at a `.measure` cap — a
            cap left the block hugging the left edge with the row's right
            side empty, the asymmetric-gutter defect the client flagged.
            Multiple paragraphs run in CSS columns so two run side by side
            instead of one long line at the full row width. */}
        <div className="flex flex-col gap-8">
          <FadeIn className="flex flex-col gap-6">
            <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
              {solution.heading}
            </h2>
            <div className="columns-1 gap-x-10 sm:columns-2">
              {solution.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mb-4 break-inside-avoid-column text-pretty text-lg leading-relaxed text-foreground-muted last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <SolutionMedia media={solution.media} />
          </FadeIn>

          <FadeIn delay={0.14}>
            <p className="text-pretty text-base font-medium leading-relaxed text-accent-secondary">
              {solution.categoricalDifference}
            </p>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}

function SolutionMedia({ media }: { media: Product["offer"]["solution"]["media"] }) {
  if (media.kind === "video") {
    return (
      <VideoPlayer
        src={media.src}
        poster={media.poster}
        durationLabel={media.durationLabel}
        locationTag={LOCATIONS.productSolution}
      />
    );
  }

  if (media.kind === "stills") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {media.shots.map((shot) => (
          <figure
            key={shot.src}
            className="overflow-hidden rounded-card border border-border bg-surface"
          >
            <div className="relative aspect-video">
              <Image
                src={shot.src}
                alt={shot.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="border-t border-border px-4 py-3 text-xs text-foreground-muted">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      {media.steps.map((step, i) => (
        <li
          key={step.label}
          className="flex flex-1 flex-col gap-2.5 rounded-card border border-border bg-surface/50 p-5"
        >
          <span className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-secondary">
            {i === 0 ? (
              <CheckCircle2 className="size-3.5" aria-hidden />
            ) : (
              <ArrowRight className="size-3.5" aria-hidden />
            )}
            Step {i + 1}
          </span>
          <span className="font-heading text-base font-semibold text-foreground">{step.label}</span>
          <span className="text-pretty text-sm leading-relaxed text-foreground-muted">
            {step.description}
          </span>
        </li>
      ))}
    </ol>
  );
}
