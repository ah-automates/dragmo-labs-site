import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import type { Product } from "@/lib/products";

/**
 * Layout family: sign-off band, no h2. Step 17: close with a P.S. The only
 * section on the page with no heading element at all, which is itself what
 * keeps it from resembling any other section family.
 *
 * A filled panel (2026-09-15), not a bare left-accent paragraph: on a wide
 * viewport a short sign-off floating in an otherwise-empty row read as an
 * afterthought rather than a deliberate closing beat. The panel's two lines
 * run in CSS columns so they sit side by side and fill the panel's row
 * instead of stacking as one narrow column stopped short of the right edge.
 */
export function ProductPostscript({ product }: { product: Product }) {
  const { postscript } = product.offer;

  return (
    <Section space="sm" className="bg-background-secondary">
      <Container>
        <div className="rounded-card border border-border bg-surface/40 p-7 sm:p-9">
          <div className="columns-1 gap-x-10 border-l-2 border-accent/40 pl-6 sm:columns-2">
            {postscript.map((line, i) => (
              <FadeIn key={line} delay={i * 0.06} className="mb-4 break-inside-avoid-column last:mb-0">
                <p className="text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
                  {line}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
