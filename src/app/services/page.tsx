import type { Metadata } from "next";

import { Container, Section } from "@/components/shared/container";
import { PageHero } from "@/components/shared/page-hero";
import { ServiceCard } from "@/components/shared/service-card";
import { Process } from "@/components/sections/process";
import { CTABlock } from "@/components/shared/cta-block";
import { Stagger, StaggerChild } from "@/components/shared/motion";
import { services } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI solutions, automation, web applications, and design. Digital services engineered around your business goals.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Digital Solutions Built Around Your Business."
        description="From AI-powered tools to high-performance digital experiences, we help businesses turn complex challenges into simple, scalable solutions."
        ctaHref="#services"
        ctaLabel="Explore Services"
      />

      <Section id="services" space="md" className="scroll-mt-20 bg-background">
        <Container>
          <h2 className="sr-only">Service offerings</h2>
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <StaggerChild
                key={service.slug}
                className={cn(
                  "h-full",
                  service.span === "wide" && "lg:col-span-2",
                  service.span === "full" && "md:col-span-2 lg:col-span-3",
                )}
              >
                <ServiceCard service={service} />
              </StaggerChild>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Process />

      <CTABlock
        title="Have a challenge? Let's solve it."
        description="Tell us how your operations run today and we will map out where software and automation actually pay off."
        primary={{ label: "Get in Touch", href: "/contact" }}
      />
    </>
  );
}
