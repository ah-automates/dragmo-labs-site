import { Container, Section } from "@/components/shared/container";
import { SectionOpener } from "@/components/shared/section-opener";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import { QuoteBlock } from "@/components/shared/quote-block";
import { approvedTestimonials } from "@/lib/testimonials";

/**
 * The home page's proof-of-voice section — folded in from the deleted
 * `/testimonials` route 2026-09-15 (see `testimonials.ts`'s `testimonialsLink`
 * comment). Renders nothing when the approved list is empty, the same
 * by-construction guard the route used to enforce.
 *
 * Equal filled cards, not one large quote plus smaller ones (2026-09-15): an
 * asymmetric "featured" quote over a mostly-empty row read as unfinished
 * once there were only two or three real testimonials to show. A grid that
 * fills its row edge to edge, one card per approved quote, reads as
 * complete at any count.
 */
export function Testimonials() {
  if (approvedTestimonials.length === 0) return null;

  return (
    <Section id="testimonials" space="md" className="scroll-mt-20 bg-background-secondary">
      <Container>
        <SectionOpener
          label="Testimonials"
          title="What clients say once the system is actually running."
          description="Every quote here is approved by the person named on it, in their own words, about work they actually paid for."
        />

        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {approvedTestimonials.map((testimonial) => (
            <StaggerChild key={testimonial.id}>
              <QuoteBlock testimonial={testimonial} className="h-full" />
            </StaggerChild>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
