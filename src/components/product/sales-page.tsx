import { ProductHero } from "@/components/product/sections/hero";
import { ProductFascinations } from "@/components/product/sections/fascinations";
import { ProductProblem } from "@/components/product/sections/problem";
import { ProductSolution } from "@/components/product/sections/solution";
import { ProductCredentials } from "@/components/product/sections/credentials";
import { ProductBenefits } from "@/components/product/sections/benefits";
import { ProductSocialProof } from "@/components/product/sections/social-proof";
import { ProductOfferPanel } from "@/components/product/sections/offer";
import { ProductCallToAction } from "@/components/product/sections/call-to-action";
import { ProductPostscript } from "@/components/product/sections/postscript";
import { FaqSection } from "@/components/shared/faq-section";
import type { Product } from "@/lib/products";

/**
 * Composes a full 17-step product page for a "full-offer" product, in the
 * order Suby specifies: attention, agitation, proof, offer, decision. The
 * order is the argument, so the sections are never reordered per product.
 * See `design-system/pages/product.md` for how the 17 steps map to these 10
 * sections without any two sharing a layout family.
 *
 * The FAQ is not one of the 17 steps and sits outside that count: it slots
 * between the offer panel and the close, where objection-handling belongs,
 * and renders nothing for a product with no `faq` entries.
 */
export function ProductSalesPage({ product }: { product: Product }) {
  return (
    <>
      <ProductHero product={product} />
      <ProductFascinations product={product} />
      <ProductProblem product={product} />
      <ProductSolution product={product} />
      <ProductCredentials product={product} />
      <ProductBenefits product={product} />
      <ProductSocialProof product={product} />
      <ProductOfferPanel product={product} />
      <FaqSection faq={product.faq} />
      <ProductCallToAction product={product} />
      <ProductPostscript product={product} />
    </>
  );
}
