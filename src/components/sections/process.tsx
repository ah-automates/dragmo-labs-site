import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import { processSteps } from "@/lib/data";

/**
 * Ordered list of stages. Non-interactive by design, so it carries no hover
 * lift or glow that would imply the steps are clickable.
 */
export function Process() {
  return (
    <Section space="md" className="border-y border-border bg-background-secondary">
      <Container>
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-heading text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
            How the work runs.
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
            Six stages, the same every time, so you always know where a project
            stands and what comes next.
          </p>
        </FadeIn>

        <Stagger as="ol" className="mt-14 grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step) => (
            <StaggerChild
              as="li"
              key={step.label}
              className="flex items-baseline gap-4 bg-background px-6 py-7"
            >
              <span className="font-heading text-sm font-bold tabular-nums text-accent-secondary/70">
                {String(step.number).padStart(2, "0")}
              </span>
              <span className="font-heading text-lg font-bold tracking-tight text-foreground">
                {step.label}
              </span>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
