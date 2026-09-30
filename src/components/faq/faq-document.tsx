import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { ClosingBand } from "@/components/shared/closing-band";
import { FaqSection } from "@/components/shared/faq-section";
import { companyFaq } from "@/lib/faq-content";
import { CTA_LABEL } from "@/lib/data";

/**
 * The dedicated FAQ page: company-wide questions grouped by topic. Product-
 * and service-specific questions stay on their own pages (see `Product.faq`
 * / `Service.faq`) rather than being duplicated here — this page is the
 * catch-all for what does not belong to one page in particular.
 */
export function FaqDocument() {
  return (
    <>
      <Section
        className="relative overflow-hidden border-b border-border bg-background pb-16 pt-32 sm:pb-20 sm:pt-40"
        space="sm"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
        />
        <Container className="relative">
          <FadeIn className="flex flex-col gap-6">
            <h1 className="text-pretty font-heading text-[clamp(2.5rem,5.6vw,4.5rem)] font-extrabold leading-[1] tracking-[-0.045em] text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="measure-narrow text-pretty text-lg leading-relaxed text-foreground-muted">
              Straight answers about how Dragmo Labs works, what things cost,
              and how your data is handled. Product and service pages carry
              their own specific questions too.
            </p>

            <nav aria-label="FAQ categories" className="mt-2 flex flex-wrap gap-2">
              {companyFaq.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="rounded-full border border-border px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground-muted transition-colors duration-300 hover:border-accent/50 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary"
                >
                  {category.heading}
                </a>
              ))}
            </nav>
          </FadeIn>
        </Container>
      </Section>

      {companyFaq.map((category, i) => (
        <FaqSection
          key={category.id}
          id={category.id}
          heading={category.heading}
          faq={category.entries}
          className={i % 2 === 0 ? "bg-background-secondary" : "bg-background"}
        />
      ))}

      <ClosingBand
        title="Still have a question?"
        description="Ask us directly. A senior strategist will reply within one business day."
        primary={{ label: CTA_LABEL, href: "/contact" }}
      />
    </>
  );
}
