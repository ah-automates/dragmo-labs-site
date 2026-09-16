import { CheckCircle2 } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import type { Product } from "@/lib/products";

/**
 * Layout family: a single-column ledger, full-width rows divided by
 * hairlines, feature and benefit set on opposite ends of the same line
 * (the `justify-between` device the case-studies index used to use) rather
 * than boxed into a grid cell. Step 08: features tell, benefits sell.
 * Deliberately not the seamed grid `fascinations.tsx` and `problem.tsx` use
 * for their own lists — three near-identical bordered-card grids stacked on
 * one page read as one repeated component, not three distinct sections, and
 * a two-column grid also leaves a visibly empty cell whenever a product has
 * an odd number of rows (fixed here 2026-09-15: a single column has no
 * "leftover" position to leave empty, whatever the count). Full-offer
 * products only.
 */
export function ProductBenefits({ product }: { product: Product }) {
  if (product.offer.kind !== "full-offer") return null;
  const { benefits } = product.offer;

  return (
    <Section space="md" className="bg-background-secondary">
      <Container>
        <FadeIn>
          <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
            {benefits.heading}
          </h2>
        </FadeIn>

        <Stagger className="mt-10 flex flex-col divide-y divide-border border-y border-border">
          {benefits.rows.map((row) => (
            <StaggerChild
              key={row.feature}
              as="div"
              className="flex items-start gap-5 py-6 sm:items-baseline sm:py-7"
            >
              <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent-secondary sm:mt-0">
                <CheckCircle2 className="size-4.5" aria-hidden />
              </span>
              <dl className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <dt className="font-heading text-base font-semibold leading-snug text-foreground sm:max-w-[18rem]">
                  {row.feature}
                </dt>
                <dd className="text-pretty text-base leading-relaxed text-foreground-muted sm:max-w-lg sm:text-right">
                  {row.benefit}
                </dd>
              </dl>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
