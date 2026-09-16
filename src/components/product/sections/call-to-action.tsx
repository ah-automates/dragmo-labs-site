import { CalendarCheck, ShieldCheck } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { ContactForm } from "@/components/shared/contact-form";
import type { Product } from "@/lib/products";

/**
 * Layout family: form split, a sticky command column beside `ContactForm`.
 * Step 16, one clear command. The only sticky-column split on the page;
 * `credentials.tsx` is the only offset-column split, so the two never read
 * as the same shape even though both put text beside a second element.
 */
export function ProductCallToAction({ product }: { product: Product }) {
  const { callToAction } = product.offer;
  const isFullOffer = product.offer.kind === "full-offer";

  return (
    <Section space="md" className="border-b border-border bg-background">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <FadeIn className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
              {callToAction.heading}
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
              {callToAction.command}
            </p>
            <div className="mt-2 flex flex-col gap-3">
              <span className="flex items-center gap-2.5 text-base text-foreground-muted">
                <CalendarCheck className="size-4 shrink-0 text-accent-secondary" aria-hidden />
                No charge, no obligation to move forward
              </span>
              <span className="flex items-center gap-2.5 text-base text-foreground-muted">
                <ShieldCheck className="size-4 shrink-0 text-accent-secondary" aria-hidden />
                Your details go nowhere but this one reply
              </span>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <ContactForm
              variant="full"
              formLocation={callToAction.formLocation}
              submitLabel={isFullOffer ? "Request Your Free Strategy Call" : "Ask About This Product"}
              successTitle="Request Received"
              successBody="Thanks for reaching out. We will review your details and get back to you within one business day to schedule your call."
            />
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
