import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Globe2, Mail } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { ContactForm } from "@/components/shared/contact-form";
import { FadeIn } from "@/components/shared/motion";
import { images } from "@/lib/images";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Get in Touch",
  description:
    "Tell us about your project. A senior strategist at Dragmo Labs will get back to you within one business day.",
};

const contactCards = [
  {
    icon: Mail,
    label: "Email us",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: Globe2,
    label: "Where we work",
    value: siteConfig.address,
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within one business day",
  },
];

export default function ContactPage() {
  const photo = images.contact;

  return (
    <Section className="relative overflow-hidden pb-20 pt-32 sm:pt-40" space="sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
      />

      <Container className="relative">
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-7 lg:sticky lg:top-28">
            <FadeIn delay={0.04}>
              <h1 className="text-balance font-heading text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-foreground">
                Let&rsquo;s talk about your next big move.
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="max-w-md text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
                Whether you have a clear project in mind or you are still
                exploring what AI could do for you, we would like to hear about
                it.
              </p>
            </FadeIn>

            <FadeIn delay={0.16}>
              <ul className="divide-y divide-border border-y border-border">
                {contactCards.map(({ icon: Icon, label, value, href }) => {
                  const inner = (
                    <>
                      <Icon
                        className="mt-0.5 size-4.5 shrink-0 text-accent-secondary"
                        aria-hidden
                      />
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-foreground-muted">
                          {label}
                        </span>
                        <span className="break-words text-sm font-medium text-foreground">
                          {value}
                        </span>
                      </span>
                    </>
                  );

                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          className="flex items-start gap-4 py-4 transition-colors duration-200 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className="flex items-start gap-4 py-4">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </FadeIn>

            <FadeIn delay={0.22} className="hidden lg:block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-border">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  loading="lazy"
                  className="img-brand-tint object-cover"
                />
                <span aria-hidden className="absolute inset-0 bg-accent/8 mix-blend-overlay" />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(5,6,8,0.85)_100%)]"
                />
                <p className="absolute inset-x-0 bottom-0 p-5 text-sm font-medium text-foreground">
                  Remote-first, working across time zones.
                </p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.08}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                  Project Inquiry
                </h2>
                <p className="text-sm leading-relaxed text-foreground-muted">
                  Fill out the details below and a senior strategist will respond
                  within one business day.
                </p>
              </div>
              <ContactForm variant="full" />
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
