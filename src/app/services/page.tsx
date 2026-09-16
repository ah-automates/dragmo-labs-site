import type { Metadata } from "next";

import { Container, Section } from "@/components/shared/container";
import { PageOpener } from "@/components/shared/page-opener";
import { ServiceRow } from "@/components/shared/service-row";
import { Process } from "@/components/sections/process";
import { ClosingBand } from "@/components/shared/closing-band";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI solutions, automation, consulting, web development, and design. Digital services engineered around your business goals.",
};

export default function ServicesPage() {
  return (
    <>
      <PageOpener
        eyebrow="Our Services"
        title="Digital solutions built around your business."
        description="From AI-powered tools to high-performance digital experiences, we help businesses turn complex challenges into simple, scalable solutions."
        ctaHref="#services"
        ctaLabel="Explore Services"
      />

      {/*
       * Numbered editorial list, not a card grid (2026-09-15, replaces a
       * 3-column grid of six identical bordered cards — an explicit
       * `design-system/MASTER.md` §4 violation). Each row alternates its
       * photo to the opposite side so six rows in sequence still have
       * rhythm instead of repeating one layout six times.
       */}
      <Section id="services" space="md" className="scroll-mt-20 bg-background">
        <Container>
          <h2 className="sr-only">Service offerings</h2>
          <Stagger className="flex flex-col border-b border-border">
            {services.map((service, i) => (
              <StaggerChild key={service.slug}>
                <ServiceRow service={service} index={i + 1} reverse={i % 2 === 1} />
              </StaggerChild>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Process />

      <ClosingBand
        title="Have a challenge? Let’s solve it."
        description="Tell us how your operations run today and we will map out where software and automation actually pay off."
        primary={{ label: "Get in Touch", href: "/contact" }}
      />
    </>
  );
}
