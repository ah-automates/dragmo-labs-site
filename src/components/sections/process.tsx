import { Container, Section } from "@/components/shared/container";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import { SectionOpener } from "@/components/shared/section-opener";
import { processSteps } from "@/lib/data";

/**
 * Ordered list of stages. Non-interactive by design, so it carries no hover
 * lift or glow that would imply the steps are clickable. Uses the shared
 * `SectionOpener` (2026-09-15) rather than its own centered heading, so this
 * section's alignment matches the rest of the site instead of being the one
 * centered holdout.
 */
export function Process() {
  return (
    <Section space="md" className="border-y border-border bg-background-secondary">
      <Container>
        <SectionOpener
          label="How We Work"
          title="How the work runs."
          description="Six stages, the same every time, so you always know where a project stands and what comes next."
        />

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
