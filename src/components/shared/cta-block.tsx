import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTABlockProps = {
  title: React.ReactNode;
  description: string;
  primary: { label: string; href: string };
  className?: string;
};

export function CTABlock({
  title,
  description,
  primary,
  className,
}: CTABlockProps) {
  return (
    <Section space="md" className={cn("bg-background", className)}>
      <Container>
        <FadeIn>
          <div className="relative overflow-hidden rounded-card border border-border bg-gradient-to-br from-background-secondary via-surface to-background px-6 py-16 sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_5%,transparent_65%)]"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
              <h2 className="text-balance font-heading text-[clamp(1.85rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
                {title}
              </h2>
              <p className="text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
                {description}
              </p>
              <ButtonLink href={primary.href} size="lg" className="mt-2">
                {primary.label}
                <ArrowRight
                  className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </ButtonLink>
            </div>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}
