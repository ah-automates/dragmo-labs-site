import { Clock, Mail, MapPin } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { ContactForm } from "@/components/shared/contact-form";
import { FadeIn } from "@/components/shared/motion";
import { siteConfig } from "@/lib/data";
import { LOCATIONS } from "@/lib/analytics";

const details = [
  {
    icon: Mail,
    label: "Email us",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: MapPin,
    label: "Where we work",
    value: siteConfig.address,
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within one business day",
  },
];

export function ContactSection() {
  return (
    <Section
      id="contact"
      space="md"
      className="overflow-hidden border-t border-border bg-background-secondary"
    >
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28">
            <FadeIn>
              <h2 className="text-balance font-heading text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
                Let&rsquo;s build what&rsquo;s next.
              </h2>
            </FadeIn>

            <FadeIn delay={0.06}>
              <p className="max-w-md text-pretty text-base leading-relaxed text-foreground-muted">
                Tell us what you are trying to build, automate, or fix. We will
                come back with how we would approach it.
              </p>
            </FadeIn>

            <FadeIn delay={0.12}>
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {details.map(({ icon: Icon, label, value, href }) => {
                  const content = (
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
                          data-analytics-location={LOCATIONS.homeContactDetails}
                          className="flex items-start gap-4 py-4 transition-colors duration-200 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-start gap-4 py-4">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </FadeIn>
          </div>

          <FadeIn delay={0.1}>
            <ContactForm variant="compact" />
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
