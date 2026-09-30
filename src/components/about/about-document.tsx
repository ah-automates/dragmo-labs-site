import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, Layers } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Settle, Stagger, StaggerChild } from "@/components/shared/motion";
import { SectionOpener } from "@/components/shared/section-opener";
import { ClosingBand } from "@/components/shared/closing-band";
import { siteConfig, processSteps, CTA_LABEL } from "@/lib/data";
import { products } from "@/lib/products";
import { services } from "@/lib/services";
import { about } from "@/lib/about";

/** One sentence per stage, written for this page only — not a repeat of
 *  `principles` or any product/service copy. Keyed by the label already in
 *  `processSteps` (`src/lib/data.ts`) rather than duplicating the list. */
const STEP_DETAIL: Record<string, string> = {
  Discover: "We start by understanding the problem, the constraints, and what a real win looks like before anything gets scoped.",
  Strategize: "That understanding becomes a plan: what gets built, in what order, and why.",
  Design: "Interface and system architecture take shape side by side, so neither one is an afterthought.",
  Build: "Working code, shipped behind real monitoring, not a demo that only holds up in a meeting.",
  Launch: "The system goes live, and we confirm it holds up under real usage, not just a walkthrough.",
  Grow: "We keep measuring after launch and iterate on what the data actually shows.",
};

/**
 * The site's one entity page: what Dragmo Labs is, who runs it, and what it
 * builds, in terms an AI system or search engine can extract directly.
 * Mirrors the bespoke-hero-then-sections shape of `case-study-document.tsx`
 * / `service-document.tsx` rather than `product/sections/`, since there is
 * exactly one composition here.
 */
export function AboutDocument() {
  const founder = about.founders?.[0];

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
          <FadeIn className="flex flex-col gap-5">
            <h1 className="text-pretty font-heading text-[clamp(2.5rem,5.6vw,4.5rem)] font-extrabold leading-[1] tracking-[-0.045em] text-foreground">
              About {siteConfig.name}
            </h1>
            <p className="measure-narrow text-pretty text-lg leading-relaxed text-foreground-muted">
              {siteConfig.description}
            </p>
            <p className="text-base text-foreground-muted/70">{siteConfig.address}</p>
          </FadeIn>
        </Container>
      </Section>

      {founder && (
        <Section space="lg" className="border-b border-border bg-background-secondary">
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,22rem)] lg:gap-16">
              <FadeIn className="flex flex-col gap-6">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary">
                  Founder
                </p>
                <h2 className="text-pretty font-heading text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
                  {founder.name}
                </h2>
                <p className="text-base font-medium text-foreground-muted">{founder.role}</p>

                {founder.vision && (
                  <blockquote className="mt-2 border-l-2 border-accent/40 pl-5 text-pretty font-heading text-xl font-medium leading-relaxed tracking-tight text-foreground">
                    &ldquo;{founder.vision}&rdquo;
                  </blockquote>
                )}
              </FadeIn>

              {founder.photo && (
                <Settle delay={0.08} className="relative mx-auto aspect-square w-full max-w-md lg:mx-0">
                  {/* Ambient halo bleeding out past the circle's own edge,
                      not a boxed card behind it. */}
                  <span
                    aria-hidden
                    className="absolute -inset-6 rounded-full bg-accent/20 blur-3xl"
                  />
                  <div className="relative aspect-square overflow-hidden rounded-full">
                    <Image
                      src={founder.photo.src}
                      alt={founder.photo.alt}
                      fill
                      sizes="(min-width: 1024px) 28rem, 90vw"
                      className="object-cover"
                    />
                  </div>
                </Settle>
              )}
            </div>
          </Container>
        </Section>
      )}

      <Section space="md" className="border-b border-border bg-background">
        <Container>
          <SectionOpener
            label="What We Build"
            title="AI Agents, Automation, And Software, Built And Shipped To Production"
            description="Each page below states exactly what it does and what it does not do yet, backed by real client work rather than a demo built to look good in a sales video."
          />

          <div className="mt-12 flex flex-col gap-10">
            <div>
              <h3 className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-foreground-muted">
                Products
              </h3>
              {/* `items-start` overrides Grid's default row-stretch: without
                  it, a 2-line description next to a 3-line sibling gets
                  stretched to match, leaving visible dead space inside the
                  shorter card. Each card's height stays intrinsic instead. */}
              <div className="mt-4 grid items-start gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <BuildLink
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    icon={Layers}
                    title={product.name}
                    description={product.shortLabel}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-foreground-muted">
                Services
              </h3>
              <div className="mt-4 grid items-start gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <BuildLink
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    icon={Briefcase}
                    title={service.title}
                    description={service.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section space="md" className="border-b border-border bg-background-secondary">
        <Container>
          <FadeIn>
            <h2 className="font-heading text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-4xl">
              How We Work
            </h2>
          </FadeIn>
          <FadeIn delay={0.06} className="mt-4 max-w-2xl">
            <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
              A remote-first team, working across time zones, taking every
              engagement through the same six stages from a first call to an
              ongoing, growing system.
            </p>
          </FadeIn>

          <Stagger
            as="ol"
            className="mt-10 grid gap-x-16 border-t border-border sm:grid-cols-2"
          >
            {processSteps.map((step) => (
              <StaggerChild
                as="li"
                key={step.label}
                className="flex gap-5 border-b border-border py-7 sm:py-8"
              >
                <span
                  aria-hidden
                  className="pt-0.5 font-mono text-sm font-semibold text-accent-secondary/60"
                >
                  {String(step.number).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
                    {step.label}
                  </h3>
                  <p className="text-pretty text-base leading-relaxed text-foreground-muted">
                    {STEP_DETAIL[step.label]}
                  </p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </Container>
      </Section>

      <ClosingBand
        title="Have a project in mind?"
        description="Tell us what you are trying to build, automate, or improve. A senior strategist will reply within one business day."
        primary={{ label: CTA_LABEL, href: "/contact" }}
      />
    </>
  );
}

function BuildLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Layers;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-4 rounded-card border border-border bg-surface/30 p-5 transition-[border-color,background-color] duration-300 hover:border-accent/35 hover:bg-surface/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-input border border-accent/20 bg-accent/10 text-accent-secondary">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-heading text-sm font-semibold text-foreground">{title}</span>
          <span className="text-pretty text-sm leading-relaxed text-foreground-muted">
            {description}
          </span>
        </span>
      </span>
      <ArrowRight
        className="mt-1 size-4 shrink-0 text-foreground-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent-secondary"
        aria-hidden
      />
    </Link>
  );
}
