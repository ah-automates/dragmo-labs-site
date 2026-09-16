import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/icons";
import { images } from "@/lib/images";
import type { Service } from "@/lib/services";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

/**
 * Replaces `ServiceCard` (2026-09-15). Six identical bordered cards in a
 * 3-column grid was an explicit `design-system/MASTER.md` §4 violation
 * ("three equal cards in a row" is banned) and read as the site's worst
 * "everything is a container" offender. This is a full-width editorial row
 * instead: a mono index, a large heading, and a description that fills the
 * text column, separated from its neighbors by a hairline rather than a
 * border box. Photography — where a service has it — sits in an offset
 * column that alternates side with `reverse`, so the page has rhythm rather
 * than a grid. The whole row stays one `<Link>`, keeping the real hit area
 * `ServiceCard` had.
 */
export function ServiceRow({
  service,
  index,
  reverse = false,
  href,
  className,
}: {
  service: Service;
  index: number;
  reverse?: boolean;
  href?: string;
  className?: string;
}) {
  const Icon = iconMap[service.icon];
  // `poster` (hand-supplied) takes priority over `image` (the generated
  // pipeline) — see the `Service` type in `services.ts`.
  const photo = service.poster ?? (service.image ? images[service.image] : null);
  // A destructuring default can't reference `service`, so the fallback to
  // the new detail page lives here instead.
  const resolvedHref = href ?? `/services/${service.slug}`;

  return (
    <Link
      href={resolvedHref}
      id={service.slug}
      data-analytics-event={EVENTS.serviceCta}
      data-analytics-location={LOCATIONS.services}
      data-analytics-service={service.title}
      className={cn(
        "group scroll-mt-28 focus-visible:outline-none",
        className,
      )}
    >
      <div
        className={cn(
          "grid items-center gap-8 border-t border-border py-10 transition-colors duration-300 sm:py-12 lg:gap-14",
          // Widened from 22rem (2026-09-15): in the wider, uncapped shell the
          // text column grows disproportionately against a narrower fixed
          // photo track, so the row reads lopsided rather than balanced.
          photo && "lg:grid-cols-[1fr_minmax(0,26rem)]",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-4",
            photo && reverse && "lg:order-2",
          )}
        >
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-semibold text-accent-secondary/60 transition-colors duration-300 group-hover:text-accent-secondary">
              {String(index).padStart(2, "0")}
            </span>
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-input border border-accent/20 bg-accent/10 text-accent-secondary transition-colors duration-300 group-hover:border-accent/40">
              <Icon className="size-5" aria-hidden />
            </span>
          </div>

          <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent-secondary sm:text-3xl">
            {service.title}
          </h3>

          <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
            {service.description}
          </p>

          {service.tags && (
            <p className="mt-1 font-mono text-sm leading-relaxed text-foreground-muted/70">
              {service.tags.join("  ·  ")}
            </p>
          )}

          <span className="mt-2 inline-flex w-fit items-center gap-1.5 font-heading text-base font-semibold text-accent-secondary">
            Learn More
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>

        {photo && (
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border",
              reverse && "lg:order-1",
            )}
          >
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 26rem, 100vw"
              loading="lazy"
              className="img-brand-tint object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span aria-hidden className="absolute inset-0 bg-accent/8 mix-blend-overlay" />
          </div>
        )}
      </div>
    </Link>
  );
}
