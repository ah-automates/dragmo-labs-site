import { Container, Section } from "@/components/shared/container";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import type { Product } from "@/lib/products";

/**
 * Layout family: seamless hairline grid, two columns of three cells, cell
 * borders formed by a `gap-px` seam against `bg-border` (the same device
 * `process.tsx` uses on the home page) rather than individual card borders.
 * Step 04, exactly six fascination bullets. Shares the hero's dark
 * background so the two sections read as one visual unit, but is its own
 * `<section>` with its own layout family. Do not repeat this family
 * elsewhere on the page: the definition ledger in `benefits.tsx` is a
 * single-column `<dl>` with horizontal dividers, not a seamed grid.
 *
 * The `gap-px`/`bg-border` seam already draws every hairline the grid needs
 * (2026-09-15): the `rounded-card border` this used to carry around the
 * whole grid was a box drawn around a device that draws its own boxes.
 */
export function ProductFascinations({ product }: { product: Product }) {
  const { fascinations } = product.offer;

  return (
    <Section space="sm" className="relative border-b border-border bg-background">
      <Container>
        <Stagger className="grid gap-px overflow-hidden border-y border-border bg-border sm:grid-cols-2">
          {fascinations.map((line, i) => (
            <StaggerChild
              key={line}
              as="div"
              className="group relative flex items-start gap-4 bg-background px-6 py-6 transition-colors duration-300 hover:bg-surface/70 sm:px-8 sm:py-7"
            >
              <span
                aria-hidden
                className="shrink-0 pt-0.5 font-mono text-xl font-semibold text-accent-secondary/30 transition-colors duration-300 group-hover:text-accent-secondary/70"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-pretty font-heading text-lg font-medium leading-snug tracking-tight text-foreground-muted transition-colors duration-300 group-hover:text-foreground sm:text-xl">
                {line}
              </p>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
