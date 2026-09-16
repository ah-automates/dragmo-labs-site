import { Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/testimonials";

/**
 * Renders one approved testimonial. Shared by the home page's testimonials
 * grid, `/case-studies/[slug]`, and a product page's Social Proof section, so
 * a quote is written once and never drifts between the three places it
 * appears. Callers are responsible for filtering to `approvedTestimonials`
 * before this ever renders; see `testimonials.ts`. The author's initial
 * stands in for a photo we do not have, rather than leaving the byline as
 * bare text with nothing to anchor it visually.
 *
 * A filled card (2026-09-15, replacing an unboxed pull-quote): floating
 * quote text directly on the section background read as empty gap rather
 * than deliberate whitespace, especially once three of these sit side by
 * side. `--surface-raised` plus a border gives each quote a real edge to
 * fill, matching how the rest of the client's reference sites treat proof.
 */
export function QuoteBlock({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  const byline =
    testimonial.role !== testimonial.company
      ? `${testimonial.role}, ${testimonial.company}`
      : testimonial.company;

  return (
    <figure
      className={cn(
        "relative flex h-full flex-col gap-6 overflow-hidden rounded-card border border-border bg-surface-raised p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-8",
        className,
      )}
    >
      <Quote
        aria-hidden
        className="absolute -right-3 -top-3 size-24 text-accent/[0.08]"
        strokeWidth={1.2}
      />
      <blockquote className="relative text-pretty font-heading text-xl font-medium leading-relaxed tracking-tight text-foreground">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="relative mt-auto flex items-center gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-heading text-base font-bold text-accent-secondary">
          {testimonial.author.charAt(0)}
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="font-heading text-base font-semibold text-foreground">
            {testimonial.author}
          </span>
          <span className="text-base text-foreground-muted">{byline}</span>
        </span>
      </figcaption>
    </figure>
  );
}
