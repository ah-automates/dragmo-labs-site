import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { SectionOpener } from "@/components/shared/section-opener";
import { Stagger, StaggerChild, FadeIn } from "@/components/shared/motion";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { caseStudies } from "@/lib/case-studies";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

/**
 * The home page's proof section — full-bleed media cards, one per real
 * client system, so a first-time visitor sees what was actually shipped
 * before scrolling past. Shares `CaseStudyCard` with the rebuilt
 * `/case-studies` index; see that component for the media/placeholder split.
 */
export function CaseStudies() {
  return (
    <Section space="md" className="border-t border-border bg-background">
      <Container>
        <SectionOpener
          label="Case Studies"
          title="Real clients. Real systems. Real problems, fixed."
        />

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2">
          {caseStudies.map((study) => (
            <StaggerChild key={study.slug}>
              <CaseStudyCard study={study} location={LOCATIONS.homeCaseStudies} />
            </StaggerChild>
          ))}
        </Stagger>

        <FadeIn delay={0.1} className="mt-10 flex justify-center">
          <Link
            href="/case-studies"
            data-analytics-event={EVENTS.caseStudy}
            data-analytics-location={LOCATIONS.homeCaseStudies}
            data-analytics-service="See All Case Studies"
            className="group inline-flex items-center gap-2 font-heading text-sm font-semibold text-foreground transition-colors duration-300 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            See All Case Studies
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </FadeIn>
      </Container>
    </Section>
  );
}
