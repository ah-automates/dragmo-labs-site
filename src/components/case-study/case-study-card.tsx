import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { EVENTS } from "@/lib/analytics";
import type { CaseStudy } from "@/lib/case-studies";

/**
 * Full-bleed media card for a case study — shared by the home page's proof
 * section and the rebuilt `/case-studies` index, so the two can never drift.
 * The whole card is one `<Link>`, matching `ServiceRow`'s pattern: a real
 * hit area the size of the hover target, no separate nested link.
 *
 * `study.poster` is left undefined until real photography/screenshots are
 * generated (via kie) and dropped in — until then this renders a deliberate
 * placeholder rather than a broken image or an invented screenshot.
 */
export function CaseStudyCard({
  study,
  location,
  className,
}: {
  study: CaseStudy;
  location: string;
  className?: string;
}) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      data-analytics-event={EVENTS.caseStudy}
      data-analytics-location={location}
      data-analytics-service={study.client}
      className={cn(
        "group relative flex aspect-[4/3] w-full flex-col overflow-hidden rounded-card border border-border transition-[border-color] duration-300 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {study.poster ? (
        <Image
          src={study.poster.src}
          alt={study.poster.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        // Placeholder: bg-grid over the raised surface, same fallback
        // treatment `CaseStudyDocument`'s hero uses when it has no backdrop
        // poster either, so an un-imaged card still reads as intentional.
        <div
          aria-hidden
          className="absolute inset-0 bg-surface-raised"
        >
          <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
          <div className="absolute inset-0 flex items-center justify-center text-foreground-muted/20">
            <ImageIcon className="size-12" strokeWidth={1.2} />
          </div>
        </div>
      )}

      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent"
      />

      <div className="relative mt-auto flex flex-col gap-3 p-6 sm:p-7">
        {study.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {study.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border bg-white/[0.06] px-3 py-1 font-mono text-xs font-medium uppercase tracking-[0.08em] text-foreground-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-accent-secondary">
            {study.client}
          </span>
          <span className="text-balance font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {study.title}
          </span>
        </div>

        <span className="mt-1 inline-flex w-fit items-center gap-1.5 font-heading text-sm font-semibold text-foreground">
          View Case Study
          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
