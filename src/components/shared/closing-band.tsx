import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Rise } from "@/components/shared/motion";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

type ClosingBandProps = {
  title: React.ReactNode;
  description: string;
  primary: { label: string; href: string };
  className?: string;
};

/**
 * Replaces `CTABlock`. A full-width command sitting on the ground under a
 * hairline, not a centered rounded box on a gradient backdrop — see
 * `design-system/MASTER.md` §4 (client-authorized addition, 2026-09-14).
 */
export function ClosingBand({
  title,
  description,
  primary,
  className,
}: ClosingBandProps) {
  return (
    <Section space="md" className={cn("bg-background", className)}>
      <Container>
        <div className="flex flex-col gap-8 border-t border-border pt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <Rise className="max-w-xl">
            <h2 className="text-balance font-heading text-[clamp(2rem,3.8vw,2.75rem)] font-extrabold leading-[1] tracking-[-0.03em] text-foreground">
              {title}
            </h2>
          </Rise>

          <FadeIn
            delay={0.1}
            className="measure-narrow flex flex-col items-start gap-5 sm:items-end sm:text-right"
          >
            <p className="text-lg leading-relaxed text-foreground-muted">
              {description}
            </p>
            <ButtonLink
              href={primary.href}
              size="lg"
              className="active:scale-[0.98]"
              data-analytics-event={EVENTS.contact}
              data-analytics-location={LOCATIONS.ctaBlock}
            >
              {primary.label}
              <ArrowRight
                className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </ButtonLink>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
