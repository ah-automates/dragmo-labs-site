import type { Metadata } from "next";

import { Container, Section } from "@/components/shared/container";
import { PageOpener } from "@/components/shared/page-opener";
import { ClosingBand } from "@/components/shared/closing-band";
import { ProductSummaryCard } from "@/components/product/product-summary-card";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
  description:
    "AI voice and WhatsApp agents (Chatshift), a 3D property website, and an AI invoice system, built for real businesses and running in production today.",
};

export default function ProductsPage() {
  const [voiceAgent, chatshift, threeD, invoice] = products;

  return (
    <>
      <PageOpener
        eyebrow="Our Products"
        title="Built for real businesses, running in production today."
        description="Every product below is live somewhere, answering a real call, a real message, or a real invoice for a real client. Nothing here is a mockup."
        ctaHref="#products"
        ctaLabel="Explore Products"
      />

      <Section id="products" space="md" className="scroll-mt-20 bg-background">
        <Container>
          <h2 className="sr-only">Product catalogue</h2>
          <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
            <ProductSummaryCard product={voiceAgent} size="large" className="lg:col-span-2 lg:row-span-2" />
            <ProductSummaryCard product={chatshift} size="medium" />
            <ProductSummaryCard product={threeD} size="medium" />
            <ProductSummaryCard product={invoice} size="banner" className="lg:col-span-3" />
          </div>
        </Container>
      </Section>

      <ClosingBand
        title="Not sure which one fits your business?"
        description="Tell us how your calls, messages, or invoices actually get handled today, and we will point you at the right one, or tell you honestly if none of them do."
        primary={{ label: "Get in Touch", href: "/contact" }}
      />
    </>
  );
}
