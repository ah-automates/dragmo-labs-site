import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/shared/container";
import { FadeIn, Stagger, StaggerChild } from "@/components/shared/motion";
import { iconMap } from "@/lib/icons";
import { images } from "@/lib/images";
import { services } from "@/lib/data";
import { cn } from "@/lib/utils";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

/**
 * Asymmetric bento: one large image-led tile plus two supporting tiles.
 * Three cells for three items, deliberately unequal.
 */
export function Capabilities() {
  const [lead, ...rest] = services
    .filter((service) => service.span !== "full")
    .slice(0, 3);

  const LeadIcon = iconMap[lead.icon];
  const leadImage = lead.image ? images[lead.image] : null;

  return (
    <Section space="md" className="bg-background">
      <Container>
        <FadeIn className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <h2 className="text-balance font-heading text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
            Digital Solutions Built Around Your Business.
          </h2>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
            From AI-powered tools to high-performance digital experiences, we
            turn complex challenges into systems your team can actually run.
          </p>
        </FadeIn>

        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {/* Lead tile: spans two columns and both rows. */}
          <StaggerChild className="lg:col-span-2 lg:row-span-2">
            <Link
              href="/services"
              data-analytics-event={EVENTS.serviceCta}
              data-analytics-location={LOCATIONS.capabilities}
              data-analytics-service={lead.title}
              className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-card border border-border transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {leadImage && (
                <Image
                  src={leadImage.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="img-brand-tint object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
              {/* Brand wash supplies the accent the desaturated photo no longer carries. */}
              <span
                aria-hidden
                className="absolute inset-0 bg-accent/8 mix-blend-overlay"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.35)_0%,rgba(5,6,8,0.72)_55%,rgba(5,6,8,0.94)_100%)]"
              />

              <div className="relative flex flex-col gap-3 p-7 sm:p-9">
                <span className="inline-flex size-12 items-center justify-center rounded-input border border-accent/25 bg-accent/10 text-accent-secondary backdrop-blur-sm">
                  <LeadIcon className="size-5.5" aria-hidden />
                </span>
                <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {lead.title}
                </h3>
                <p className="max-w-lg text-pretty text-sm leading-relaxed text-foreground-muted sm:text-base">
                  {lead.description}
                </p>
                <span className="mt-1 inline-flex items-center gap-1.5 font-heading text-sm font-semibold text-accent-secondary">
                  Explore Services
                  <ArrowRight
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          </StaggerChild>

          {rest.map((service) => {
            const Icon = iconMap[service.icon];
            const image = service.image ? images[service.image] : null;

            return (
              <StaggerChild key={service.slug}>
                <Link
                  href="/services"
                  data-analytics-event={EVENTS.serviceCta}
                  data-analytics-location={LOCATIONS.capabilities}
                  data-analytics-service={service.title}
                  className={cn(
                    "group relative flex h-full min-h-[15rem] flex-col justify-end overflow-hidden rounded-card border border-border transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    // Tiles without artwork fall back to a flat surface so the
                    // row still reads as one set.
                    image ? "" : "bg-surface/50 hover:bg-surface-hover/60",
                  )}
                >
                  {image && (
                    <>
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        loading="lazy"
                        className="img-brand-tint object-cover opacity-70 transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-accent/8 mix-blend-overlay"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.45)_0%,rgba(5,6,8,0.88)_70%,rgba(5,6,8,0.97)_100%)]"
                      />
                    </>
                  )}

                  <div className="relative flex flex-col gap-2.5 p-6 sm:p-7">
                    <span className="inline-flex size-11 items-center justify-center rounded-input border border-accent/20 bg-accent/10 text-accent-secondary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {service.title}
                    </h3>
                    <p className="text-pretty text-sm leading-relaxed text-foreground-muted">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </StaggerChild>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}
