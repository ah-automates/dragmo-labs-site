import { ProductHero } from "@/components/product/sections/hero";
import { ProductFascinations } from "@/components/product/sections/fascinations";
import { ProductProblem } from "@/components/product/sections/problem";
import { ProductSolution } from "@/components/product/sections/solution";
import { ProductOfferPanel } from "@/components/product/sections/offer";
import { ProductCallToAction } from "@/components/product/sections/call-to-action";
import { ProductPostscript } from "@/components/product/sections/postscript";
import { FaqSection } from "@/components/shared/faq-section";
import type { Product } from "@/lib/products";

/**
 * Composes the shorter showcase page for a "showcase" product (today, the
 * 3D Property Website): steps 01 to 06, then 14, 15, 16, 17. Steps 07 to 13
 * are skipped rather than padded out, since the scroll cinematic itself is
 * the pitch. Reuses the same section components as `sales-page.tsx`, minus
 * the three full-offer-only ones, so the two page types stay visually and
 * structurally consistent without duplicating any layout code.
 */
export function ProductShowcasePage({ product }: { product: Product }) {
  return (
    <>
      <ProductHero product={product} />
      <ProductFascinations product={product} />
      <ProductProblem product={product} />
      <ProductSolution product={product} />
      <ProductOfferPanel product={product} />
      <FaqSection faq={product.faq} />
      <ProductCallToAction product={product} />
      <ProductPostscript product={product} />
    </>
  );
}
