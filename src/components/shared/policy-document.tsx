import * as React from "react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { siteConfig } from "@/lib/data";
import type { Policy, PolicyBlock } from "@/lib/policies";

const linkClasses =
  "rounded-input text-accent-secondary underline decoration-accent-secondary/40 underline-offset-4 transition-colors duration-200 hover:decoration-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function EmailLink() {
  return (
    <a href={`mailto:${siteConfig.email}`} translate="no" className={linkClasses}>
      {siteConfig.email}
    </a>
  );
}

/** Splits on the bold delimiter while keeping it, so the marker survives. */
const BOLD_SEGMENT = /(\*\*[^*]+\*\*)/g;

/**
 * The policies are authored as plain strings, so the two inline forms they use
 * are resolved here rather than with `dangerouslySetInnerHTML`: `**bold**`, and
 * the studio email address, which becomes a mailto link even mid-sentence.
 * Indexes are safe as keys because the content is static and never reorders.
 */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(BOLD_SEGMENT).map((chunk, i) => {
        if (chunk.startsWith("**") && chunk.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {chunk.slice(2, -2)}
            </strong>
          );
        }

        const parts = chunk.split(siteConfig.email);
        return parts.map((part, j) => (
          <React.Fragment key={`${i}-${j}`}>
            {part}
            {j < parts.length - 1 && <EmailLink />}
          </React.Fragment>
        ));
      })}
    </>
  );
}

/** The studio block that closes every "Contact Us" section. */
function ContactCard() {
  return (
    <div className="mt-1 flex w-fit flex-col gap-1 rounded-card border border-border bg-surface px-5 py-4">
      <p className="font-heading text-sm font-semibold text-foreground" translate="no">
        {siteConfig.name}
      </p>
      <p className="text-sm text-foreground-muted">
        Email: <EmailLink />
      </p>
    </div>
  );
}

function Block({ block }: { block: PolicyBlock }) {
  switch (block.kind) {
    case "subheading":
      return (
        <h3 className="mt-4 font-heading text-base font-semibold tracking-tight text-foreground">
          {block.text}
        </h3>
      );

    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        /* Preflight strips the list marker, and Safari drops list semantics
           along with it, so the role is restored explicitly. */
        <List role="list" className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li
              key={item}
              className="flex gap-3 text-[0.9375rem] leading-relaxed text-foreground-muted"
            >
              {block.ordered ? (
                <span
                  aria-hidden
                  className="w-4 shrink-0 text-sm font-semibold tabular-nums text-accent-secondary"
                >
                  {i + 1}
                </span>
              ) : (
                <span
                  aria-hidden
                  className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-accent-secondary"
                />
              )}
              <span className="min-w-0">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </List>
      );
    }

    case "contact":
      return <ContactCard />;

    case "text":
      return (
        <p className="text-pretty text-[0.9375rem] leading-relaxed text-foreground-muted">
          <Inline text={block.text} />
        </p>
      );
  }
}

/**
 * Long-form legal page: a sticky index on the left, the document on the right.
 *
 * Only the header animates. The body is deliberately static, because a
 * scroll-reveal wrapper starts at `opacity: 0`, and on a document this long
 * that would hide most of the text from find-in-page until it was scrolled to.
 */
export function PolicyDocument({ policy }: { policy: Policy }) {
  return (
    <Section className="relative overflow-hidden pb-24 pt-32 sm:pt-40" space="sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />

      <Container className="relative">
        <FadeIn className="flex max-w-3xl flex-col gap-5">
          <h1 className="text-balance font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground">
            {policy.title}
          </h1>

          <p className="font-body text-xs font-medium uppercase tracking-[0.14em] text-foreground-muted">
            Last updated{" "}
            <time dateTime={policy.updatedISO} className="text-accent-secondary">
              {policy.updated}
            </time>
          </p>

          {policy.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-pretty text-base leading-relaxed text-foreground-muted"
            >
              <Inline text={paragraph} />
            </p>
          ))}
        </FadeIn>

        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          <nav
            aria-labelledby="policy-toc"
            className="rounded-card border border-border bg-surface/60 p-5 lg:sticky lg:top-28 lg:self-start lg:border-0 lg:bg-transparent lg:p-0"
          >
            <h2
              id="policy-toc"
              className="font-body text-xs font-medium uppercase tracking-[0.14em] text-foreground-muted"
            >
              On this page
            </h2>
            <ol role="list" className="mt-4 flex flex-col gap-2.5">
              {policy.sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex gap-2.5 rounded-input text-sm text-foreground-muted transition-colors duration-300 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span aria-hidden className="tabular-nums text-foreground-muted/50">
                      {i + 1}
                    </span>
                    <span className="min-w-0">{section.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="flex max-w-3xl flex-col gap-12">
            {policy.sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="flex scroll-mt-28 flex-col gap-4"
              >
                <h2 className="flex items-baseline gap-3 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  <span
                    aria-hidden
                    className="text-sm font-semibold tabular-nums text-accent-secondary"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">{section.heading}</span>
                </h2>

                {section.blocks.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </section>
            ))}
          </article>
        </div>
      </Container>
    </Section>
  );
}

/** Shared by the three policy routes so their metadata cannot drift apart. */
export function policyMetadata(policy: Policy) {
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: `/${policy.slug}` },
    openGraph: {
      type: "article" as const,
      url: `${siteConfig.url}/${policy.slug}`,
      title: `${policy.title} | ${siteConfig.name}`,
      description: policy.description,
    },
  };
}
