import Link from "next/link";
import { ArrowRight, Gift, ShieldCheck, Users } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import type { Product } from "@/lib/products";

/**
 * Layout family: the offer sequence. Steps 10 through 15 for a full-offer
 * product (godfather offer, bonuses, value stack, price reveal, then a
 * capacity and guarantee footer rail); steps 14 and 15 only for a showcase
 * product. Each block sits directly on the section background, separated by
 * a hairline rather than its own bordered card — five boxed panels in a row
 * read as UI chrome stacked on top of a sales page, not as one written
 * argument. Bonuses and the price reveal are the two deliberate exceptions:
 * bonuses are real, unpriced extra value that a bare list item let a reader
 * skip past entirely (client-flagged 2026-09-16 as "easily ignored"), and
 * the price reveal is the page's climactic "here is what this actually
 * costs" beat — both earn a highlighted panel precisely because they stay
 * rare.
 *
 * The sequence spans the full container width (2026-09-15, not a
 * `mx-auto max-w-4xl` centered column): centering a narrow column inside the
 * container left both side gutters empty for the section's entire height.
 * Single-paragraph blocks fill the row directly; the price reveal's three
 * paragraphs run in CSS columns so they fill the box rather than stacking as
 * one long column of text.
 */
export function ProductOfferPanel({ product }: { product: Product }) {
  const { offer } = product;
  const isFullOffer = offer.kind === "full-offer";

  return (
    <Section space="lg" id="offer" className="relative scroll-mt-24 overflow-hidden bg-background-secondary">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 size-[560px] rounded-full bg-accent/10 blur-[150px]"
      />

      <Container className="relative">
        <div className="flex flex-col gap-12">
          {isFullOffer && (
            <>
              <FadeIn className="flex flex-col gap-5">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary">
                  The Offer
                </p>
                {/* No max-w on the headline: it gets the row's full width so
                    it breaks only where the viewport actually forces it. */}
                <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1] tracking-[-0.04em] text-foreground">
                  {offer.godfatherOffer.heading}
                </h2>
                <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
                  {offer.godfatherOffer.body}
                </p>
              </FadeIn>

              {offer.bonuses.length > 0 && (
                <div className="flex flex-col gap-6 border-t border-border pt-10">
                  <div className="flex items-center gap-2">
                    <Gift className="size-4 text-accent-secondary" aria-hidden />
                    <h3 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-secondary">
                      Included Free With This Offer
                    </h3>
                  </div>

                  {/* Bonuses get the section's one other deliberate box treatment
                      (see the layout-family comment above) — real, unpriced
                      extra value is exactly the kind of thing worth breaking
                      the "no boxes" rule for a second time; as bare list items
                      they read as filler and got skipped entirely. */}
                  <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {offer.bonuses.map((bonus) => (
                      <StaggerChild
                        key={bonus.title}
                        as="div"
                        className="group relative flex flex-col gap-3 overflow-hidden rounded-card border border-accent/25 bg-gradient-to-br from-accent/12 via-surface/50 to-surface/30 p-6 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/45"
                      >
                        <span className="inline-flex size-10 items-center justify-center rounded-input border border-accent/30 bg-accent/15 text-accent-secondary">
                          <Gift className="size-4.5" aria-hidden />
                        </span>
                        <span className="font-heading text-base font-semibold text-foreground">
                          {bonus.title}
                        </span>
                        <span className="text-pretty text-sm leading-relaxed text-foreground-muted">
                          {bonus.body}
                        </span>
                        {bonus.href && (
                          <>
                            <span className="mt-1 inline-flex w-fit items-center gap-1.5 font-heading text-sm font-semibold text-accent-secondary">
                              See it in action
                              <ArrowRight
                                className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                aria-hidden
                              />
                            </span>
                            <Link
                              href={bonus.href}
                              className="absolute inset-0 rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                            >
                              <span className="sr-only">{bonus.title}</span>
                            </Link>
                          </>
                        )}
                      </StaggerChild>
                    ))}
                  </Stagger>
                </div>
              )}

              <FadeIn className="flex flex-col gap-6 border-t border-border pt-10">
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-foreground-muted">
                  Everything The Call Covers
                </h3>
                <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                  {offer.valueStack.map((line, i) => (
                    <li key={line.item} className="flex gap-4 border-t border-border pt-5">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-mono text-xs font-semibold text-accent-secondary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-heading text-base font-semibold text-foreground">
                          {line.item}
                        </span>
                        <span className="text-pretty text-sm leading-relaxed text-foreground-muted">
                          {line.worth}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="text-pretty text-base leading-relaxed text-foreground-muted/90">
                  {offer.valueStackClose}
                </p>
              </FadeIn>

              {/* The one deliberate box in this section — see the layout-family
                  comment above for why the price reveal keeps it. */}
              <FadeIn className="relative overflow-hidden rounded-card border border-accent/25 bg-gradient-to-br from-accent/12 via-background-secondary to-background-secondary p-7 sm:p-9">
                <span
                  aria-hidden
                  className="absolute -right-6 -top-10 font-mono text-[7rem] font-semibold leading-none text-accent/[0.08] sm:text-[9rem]"
                >
                  $0
                </span>
                <div className="relative flex flex-col gap-4">
                  <h3 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {offer.priceReveal.heading}
                  </h3>
                  <div className="columns-1 gap-x-8 sm:columns-2">
                    {offer.priceReveal.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="mb-4 break-inside-avoid-column text-pretty text-base leading-relaxed text-foreground-muted last:mb-0"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </>
          )}

          <FadeIn className="grid gap-8 border-t border-border pt-10 sm:grid-cols-2 sm:gap-10 sm:divide-x sm:divide-border">
            <div className="flex flex-col gap-2.5 sm:pr-10">
              <span className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <Users className="size-4 text-accent-secondary" aria-hidden />
                No Countdown Here
              </span>
              <p className="text-pretty text-base leading-relaxed text-foreground-muted">{offer.capacity}</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:pl-10">
              <span className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
                <ShieldCheck className="size-4 text-accent-secondary" aria-hidden />
                {offer.guarantee.heading}
              </span>
              <ul className="flex flex-col gap-1.5">
                {offer.guarantee.promises.map((promise) => (
                  <li key={promise} className="text-pretty text-base leading-relaxed text-foreground-muted">
                    {promise}
                  </li>
                ))}
              </ul>
              <Link
                href="/privacy-policy"
                className="w-fit rounded-input text-xs text-foreground-muted/70 underline decoration-foreground-muted/30 underline-offset-4 transition-colors duration-300 hover:text-accent-secondary hover:decoration-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Read the full privacy policy
              </Link>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
