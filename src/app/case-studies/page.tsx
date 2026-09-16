import type { Metadata } from "next";

import { Container, Section } from "@/components/shared/container";
import { PageOpener } from "@/components/shared/page-opener";
import { ClosingBand } from "@/components/shared/closing-band";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import { CaseStudyCard } from "@/components/case-study/case-study-card";
import { Testimonials } from "@/components/sections/testimonials";
import { caseStudies } from "@/lib/case-studies";
import { LOCATIONS } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "How real client systems were built, what broke along the way, and exactly how each problem was found, fixed, and verified.",
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageOpener
        eyebrow="Case Studies"
        title="Real clients. Real systems. Real problems, fixed."
        description="No invented metrics here. Every case study below names a real client and walks through exactly what was built and what actually broke along the way."
        ctaHref="#studies"
        ctaLabel="Read The Case Studies"
      />

      <Section id="studies" space="md" className="scroll-mt-20 bg-background">
        <Container>
          <h2 className="sr-only">Case study index</h2>
          {/* Same full-bleed media card as the home page's proof section —
              replaces the old numbered text list, which read as thin with
              only two entries. See `case-study-card.tsx`. */}
          <Stagger className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
            {caseStudies.map((study) => (
              <StaggerChild key={study.slug}>
                <CaseStudyCard study={study} location={LOCATIONS.caseStudiesIndex} />
              </StaggerChild>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* Repeats the home page's testimonials band here too, the way the
          reference site's own case-studies index closes on its testimonial
          slider — now that quotes have no dedicated route of their own. */}
      <Testimonials />

      <ClosingBand
        title="Want a system this well documented, built for you?"
        description="Every one of these started with a free strategy call. Tell us what your business actually needs and we will map it out honestly."
        primary={{ label: "Get in Touch", href: "/contact" }}
      />
    </>
  );
}
