import { Container, Section } from "@/components/shared/container";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import { SectionOpener } from "@/components/shared/section-opener";
import { principles } from "@/lib/data";

/**
 * Typographic index. Deliberately card-free: hairlines and numerals carry the
 * structure, so this section cannot read as a repeat of the bento above.
 */
export function Principles() {
  return (
    <Section space="md" className="bg-background">
      <Container>
        <SectionOpener
          label="Principles"
          title="Technology should not just look good. It should move your business forward."
        />

        <Stagger
          as="ol"
          className="mt-14 grid gap-x-16 border-t border-border sm:grid-cols-2"
        >
          {principles.map((principle, index) => (
            <StaggerChild
              as="li"
              key={principle.title}
              className="group flex gap-5 border-b border-border py-7 sm:py-8"
            >
              <span
                aria-hidden
                className="pt-0.5 font-mono text-sm font-semibold text-accent-secondary/60 transition-colors duration-300 group-hover:text-accent-secondary"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading text-xl font-bold tracking-tight text-foreground">
                  {principle.title}
                </h3>
                <p className="text-pretty text-base leading-relaxed text-foreground-muted">
                  {principle.description}
                </p>
              </div>
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
