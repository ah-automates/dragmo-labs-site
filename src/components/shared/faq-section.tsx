import { ChevronDown } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import type { FaqEntry } from "@/lib/faq";

/**
 * Shared between product and service pages. Native `<details>`/`<summary>`
 * rather than a JS-driven accordion: every answer stays in the DOM whether or
 * not it is expanded, so it is crawlable and requires no script to read, and
 * it works with reduced motion and keyboard navigation for free.
 *
 * Deliberately no eyebrow label and no gradient headline — a plain `<h2>`,
 * so a product page's eyebrow count (`design-system/MASTER.md` §9) does not
 * grow just because this section exists.
 */
export function FaqSection({
  faq,
  heading = "Frequently Asked Questions",
  id,
  className,
}: {
  faq?: readonly FaqEntry[];
  /** Overridable for the dedicated `/faq` page, where each category needs
   *  its own heading rather than the generic default every product/service
   *  page uses. */
  heading?: string;
  /** Anchor target for the `/faq` page's category jump links. */
  id?: string;
  className?: string;
}) {
  if (!faq || faq.length === 0) return null;

  return (
    <Section id={id} space="md" className={cn("border-t border-border bg-background-secondary scroll-mt-24", className)}>
      <Container>
        <FadeIn>
          <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
            {heading}
          </h2>
        </FadeIn>

        <Stagger as="ul" className="mt-8 flex flex-col divide-y divide-border border-t border-border">
          {faq.map((entry) => (
            <StaggerChild as="li" key={entry.question}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary [&::-webkit-details-marker]:hidden">
                  {entry.question}
                  <ChevronDown
                    className="size-4 shrink-0 text-accent-secondary transition-transform duration-300 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-pretty text-base leading-relaxed text-foreground-muted">
                  {entry.answer}
                </p>
              </details>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
