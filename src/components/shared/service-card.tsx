import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/icons";
import { images } from "@/lib/images";
import type { Service } from "@/lib/data";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

/**
 * The whole card is the link, so the hover lift matches a real hit area.
 * Server component: the pointer-tracked spotlight it used to carry read a
 * layout box on every pointer sample and is gone.
 */
export function ServiceCard({
  service,
  href = "/contact",
  className,
}: {
  service: Service;
  href?: string;
  className?: string;
}) {
  const Icon = iconMap[service.icon];
  const isFeature = service.span === "full";
  const photo = service.image ? images[service.image] : null;
  const showPhoto = Boolean(photo) && !isFeature;

  return (
    <Link
      href={href}
      id={service.slug}
      data-analytics-event={EVENTS.serviceCta}
      data-analytics-location={LOCATIONS.services}
      data-analytics-service={service.title}
      className={cn(
        "group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-card border border-border transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isFeature
          ? "bg-gradient-to-br from-background-secondary via-surface to-background"
          : "bg-surface/45 hover:bg-surface-hover/60",
        className,
      )}
    >
      {showPhoto && photo && (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            loading="lazy"
            className="img-brand-tint object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span aria-hidden className="absolute inset-0 bg-accent/8 mix-blend-overlay" />
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.2)_0%,rgba(5,6,8,0.8)_85%,rgba(5,6,8,0.95)_100%)]"
          />
        </div>
      )}

      <div
        className={cn(
          "relative flex flex-1 flex-col gap-4 p-7 sm:p-8",
          isFeature && "lg:flex-row lg:items-start lg:gap-8 lg:p-10",
        )}
      >
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-input transition-colors duration-300",
            isFeature
              ? "size-14 bg-accent text-white"
              : "size-12 border border-accent/20 bg-accent/10 text-accent-secondary group-hover:border-accent/40",
          )}
        >
          <Icon className={isFeature ? "size-6.5" : "size-5.5"} aria-hidden />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h3
            className={cn(
              "font-heading font-bold tracking-tight text-foreground",
              isFeature ? "text-2xl sm:text-3xl" : "text-xl",
            )}
          >
            {service.title}
          </h3>
          <p
            className={cn(
              "text-pretty leading-relaxed text-foreground-muted",
              isFeature ? "max-w-3xl text-base sm:text-lg" : "text-sm",
            )}
          >
            {service.description}
          </p>

          {service.tags && (
            <ul className="mt-1 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border bg-white/[0.04] px-3 py-1.5 font-body text-[11px] font-medium tracking-wide text-foreground-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <span className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 font-heading text-sm font-semibold text-accent-secondary">
            Learn More
            <ArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
