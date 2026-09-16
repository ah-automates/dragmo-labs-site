import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Rise, Settle, Stagger, StaggerChild } from "@/components/shared/motion";
import { SectionOpener } from "@/components/shared/section-opener";
import { ClosingBand } from "@/components/shared/closing-band";
import { ButtonLink } from "@/components/ui/button";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { ProductSummaryCard } from "@/components/product/product-summary-card";
import { iconMap } from "@/lib/icons";
import { images } from "@/lib/images";
import { CTA_LABEL, STRATEGY_CALL_CTA } from "@/lib/data";
import { caseStudiesBySlug } from "@/lib/case-studies";
import { productsBySlug } from "@/lib/products";
import { services, type Service } from "@/lib/services";
import { EVENTS, LOCATIONS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Renders one service's editorial detail page end to end. Mirrors the
 * structure of `case-study-document.tsx` (a bespoke hero, then a sequence
 * of sections resolving its own related content) rather than
 * `product/sections/`, which is split across files only because two page
 * compositions (sales, showcase) share it — there is one service
 * composition. See `design-system/pages/service.md` for the full section
 * map and the layout-family / containment-mode accounting.
 */
export function ServiceDocument({ service }: { service: Service }) {
  const { detail } = service;
  const ctaLabel = detail.closing.cta === "strategy-call" ? STRATEGY_CALL_CTA : CTA_LABEL;

  return (
    <>
      <ServiceHero service={service} ctaLabel={ctaLabel} />
      <ServiceSignals service={service} />
      <ServiceDeliverables service={service} />
      <ServiceCostFactors service={service} />
      <ServiceEngagement service={service} />
      <ServiceProof service={service} />
      <ClosingBand
        title={detail.closing.title}
        description={detail.closing.description}
        primary={{ label: ctaLabel, href: "/contact" }}
        // §5 and this band share `bg-background` when proof rendered above
        // it; when proof is `null`, §4's `background-secondary` already
        // supplies the seam, so no extra rule is needed there.
        className={detail.proof ? "border-t border-border" : undefined}
      />
    </>
  );
}

function ServiceHero({ service, ctaLabel }: { service: Service; ctaLabel: string }) {
  const { detail } = service;
  const Icon = iconMap[service.icon];
  // `poster` (hand-supplied) takes priority over `image` (the generated
  // pipeline) — see the `Service` type in `services.ts`.
  const photo = service.poster ?? (service.image ? images[service.image] : null);
  // Alternates the media side service to service, the same idiom
  // `ServiceRow` uses via `reverse` on the index page.
  const reverse = services.indexOf(service) % 2 === 1;

  return (
    <Section
      className="relative overflow-hidden border-b border-border bg-background pb-16 pt-32 sm:pb-20 sm:pt-40"
      space="sm"
    >
      {!photo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
        />
      )}

      <Container className="relative">
        <div
          className={cn(
            "grid items-center gap-10 lg:gap-16",
            photo && "lg:grid-cols-[1fr_minmax(0,32rem)]",
          )}
        >
          <div className={cn("flex flex-col gap-5", photo && reverse && "lg:order-2")}>
            <FadeIn y={12} duration={0.5}>
              <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary">
                {detail.eyebrow}
              </p>
            </FadeIn>

            <Rise delay={0.05}>
              <h1 className="text-pretty font-heading text-[clamp(2.5rem,5.6vw,4.5rem)] font-extrabold leading-[1] tracking-[-0.045em] text-foreground">
                {detail.headline}
              </h1>
            </Rise>

            <FadeIn delay={0.1}>
              <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
                {detail.lede}
              </p>
            </FadeIn>

            {/* Photo-less fallback (today: `ai-consultation` only) — the same
                treatment `case-study-document.tsx` and `case-study-card.tsx`
                use when they have no imagery either, so the row reads as a
                designed variant rather than a gap. */}
            {!photo && service.tags && (
              <FadeIn delay={0.14} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-foreground-muted/70"
                  >
                    {tag}
                  </span>
                ))}
              </FadeIn>
            )}

            <FadeIn delay={0.18} className="mt-2">
              <ButtonLink
                href="/contact"
                size="lg"
                data-analytics-event={EVENTS.cta}
                data-analytics-location={LOCATIONS.serviceHero}
                data-analytics-service={service.title}
              >
                {ctaLabel}
                <ArrowRight
                  className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </ButtonLink>
            </FadeIn>
          </div>

          {photo && (
            <Settle
              className={cn(
                "relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border lg:aspect-square",
                reverse && "lg:order-1",
              )}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="img-brand-tint object-cover"
              />
              <span aria-hidden className="absolute inset-0 bg-accent/8 mix-blend-overlay" />
              <span
                aria-hidden
                className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-input border border-accent/25 bg-background/70 text-accent-secondary backdrop-blur-sm"
              >
                <Icon className="size-5" aria-hidden />
              </span>
            </Settle>
          )}
        </div>
      </Container>
    </Section>
  );
}

/** Full-width ruled index rows — the site's other numbered list treatment
 *  (`ServiceRow`) is a grid of links; this is plain rows, no href. */
function ServiceSignals({ service }: { service: Service }) {
  const { signals } = service.detail;

  return (
    <Section space="sm" className="border-b border-border bg-background-secondary">
      <Container>
        <FadeIn>
          <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
            {signals.heading}
          </h2>
        </FadeIn>

        <Stagger as="ul" className="mt-8 flex flex-col divide-y divide-border border-t border-border">
          {signals.entries.map((signal, i) => (
            <StaggerChild
              as="li"
              key={signal.situation}
              className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr_1fr] sm:items-baseline sm:gap-6 sm:py-7"
            >
              <span className="font-mono text-sm font-semibold text-accent-secondary/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-pretty text-base leading-relaxed text-foreground sm:text-lg">
                {signal.situation}
              </p>
              <p className="text-pretty text-sm leading-relaxed text-foreground-muted sm:text-base">
                {signal.cost}
              </p>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

/** Staggered statement stack, alternating indent, deliberately borderless —
 *  the layout family neither §2's ruled rows nor §5's cards repeat. */
function ServiceDeliverables({ service }: { service: Service }) {
  const { deliverables } = service.detail;

  return (
    <Section space="lg" className="bg-background">
      <Container>
        <FadeIn>
          <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
            {deliverables.heading}
          </h2>
        </FadeIn>

        <Stagger className="mt-10 flex flex-col gap-10 sm:gap-12">
          {deliverables.entries.map((item, i) => (
            <StaggerChild
              key={item.name}
              className={cn("flex max-w-2xl flex-col gap-3", i % 2 === 1 && "lg:ml-auto")}
            >
              <span className="font-mono text-4xl font-semibold text-accent-secondary/25 sm:text-5xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {item.name}
              </h3>
              <p className="text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
                {item.body}
              </p>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

/** Compact factor tiles — the page's `card` containment, distinct from §5's
 *  full-bleed media cards. `null` for every service except the two where an
 *  honest single price cannot be quoted (`web-applications`, `ui-ux-design`
 *  today); see the `costFactors` doc comment on `ServiceDetail`. Always
 *  inserted here, between Deliverables (bare) and Engagement (hairline), so
 *  its `card` mode never sits adjacent to §5's `card` proof section on
 *  either page shape (with or without proof). */
function ServiceCostFactors({ service }: { service: Service }) {
  const { costFactors } = service.detail;
  if (!costFactors) return null;

  return (
    <Section space="sm" className="border-t border-border bg-background">
      <Container>
        <FadeIn>
          <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
            {costFactors.heading}
          </h2>
        </FadeIn>
        <FadeIn delay={0.06} className="mt-4 max-w-2xl">
          <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
            {costFactors.intro}
          </p>
        </FadeIn>

        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {costFactors.entries.map((entry) => (
            <StaggerChild
              key={entry.factor}
              className="flex flex-col gap-2 rounded-card border border-border bg-surface/30 p-5"
            >
              <span className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-accent-secondary">
                {entry.factor}
              </span>
              <p className="text-pretty text-sm leading-relaxed text-foreground-muted">
                {entry.detail}
              </p>
            </StaggerChild>
          ))}
        </Stagger>

        <FadeIn delay={0.1} className="mt-6 border-t border-border pt-6">
          <p className="text-pretty text-base leading-relaxed text-foreground-muted">
            {costFactors.note}
          </p>
        </FadeIn>
      </Container>
    </Section>
  );
}

/** Editorial offset split: narrative left (the same `border-l border-accent/25`
 *  rail `case-study-document.tsx` uses for "The Challenge"), a ruled `<dl>`
 *  right. Two stacked paragraphs sit inside a column that already fills the
 *  row, which is the case MASTER §4 exempts from the CSS-columns rule — that
 *  rule is for prose that is the sole occupant of a full-width row. */
function ServiceEngagement({ service }: { service: Service }) {
  const { engagement } = service.detail;

  return (
    <Section space="md" className="border-b border-border bg-background-secondary">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
          <div className="flex flex-col gap-6 border-l border-accent/25 pl-6 sm:pl-8">
            <FadeIn>
              <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
                {engagement.heading}
              </h2>
            </FadeIn>
            <FadeIn delay={0.06} className="flex flex-col gap-4">
              {engagement.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-pretty text-lg leading-relaxed text-foreground-muted">
                  {paragraph}
                </p>
              ))}
            </FadeIn>
          </div>

          <Settle delay={0.08}>
            <dl className="divide-y divide-border border-t border-border">
              {engagement.stages.map((stage) => (
                <div key={stage.term} className="flex flex-col gap-1.5 py-5">
                  <dt className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-accent-secondary">
                    {stage.term}
                  </dt>
                  <dd className="text-pretty text-base leading-relaxed text-foreground-muted">
                    {stage.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </Settle>
        </div>
      </Container>
    </Section>
  );
}

/** Full-bleed media cards, 1 or 2 depending on `detail.proof.cases`. Returns
 *  `null` (dropping the page to five sections) when a service has no real
 *  client work behind it — the honest resolution, not a stretched claim. */
function ServiceProof({ service }: { service: Service }) {
  const { proof } = service.detail;
  if (!proof) return null;

  const resolved: { key: string; node: ReactNode }[] = [];
  for (const ref of proof.cases) {
    if (ref.kind === "case-study") {
      const study = caseStudiesBySlug[ref.slug];
      if (study) {
        resolved.push({
          key: `case-study-${study.slug}`,
          node: <CaseStudyCard study={study} location={LOCATIONS.serviceProof} />,
        });
      }
    } else {
      const product = productsBySlug[ref.slug];
      if (product) {
        resolved.push({
          key: `product-${product.slug}`,
          node: <ProductSummaryCard product={product} location={LOCATIONS.serviceProof} />,
        });
      }
    }
  }

  if (resolved.length === 0) return null;

  return (
    <Section space="sm" className="bg-background">
      <Container>
        <SectionOpener label={proof.label} title={proof.heading} />
        <Stagger className={cn("mt-10 grid gap-4", resolved.length === 2 && "sm:grid-cols-2")}>
          {resolved.map(({ key, node }) => (
            <StaggerChild key={key}>{node}</StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
