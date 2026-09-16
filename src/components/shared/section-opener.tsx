import * as React from "react";

import { Rise, FadeIn } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

type SectionOpenerProps = {
  label: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

/**
 * One heading hierarchy for every section on the site — mono micro-label
 * instead of a pill badge, oversized Satoshi headline instead of the old
 * ~2rem ceiling. Replaces the scattered `<Badge>` + centered `<h2>` pattern.
 * See `design-system/MASTER.md` §2 and §4 (client-authorized 2026-09-14).
 *
 * No numbered meta rail (dropped 2026-09-15, client-flagged as a stray badge
 * sitting off to the right of the heading). The heading is now the sole
 * occupant of its row, so it fills it by default (`flex-col`'s default
 * `align-items: stretch`) with no extra width class needed.
 */
export function SectionOpener({
  label,
  title,
  description,
  align = "left",
  className,
}: SectionOpenerProps) {
  const centered = align === "center";

  return (
    <div className={cn("flex flex-col", centered && "items-center text-center", className)}>
      <FadeIn y={12} duration={0.5}>
        <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent-secondary">
          {label}
        </p>
      </FadeIn>
      <Rise delay={0.05}>
        <h2 className="text-pretty font-heading text-[clamp(2.15rem,4.6vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
          {title}
        </h2>
      </Rise>

      {description && (
        <FadeIn delay={0.1} className={cn("mt-5", centered && "w-full")}>
          <p className="text-pretty text-lg leading-relaxed text-foreground-muted">
            {description}
          </p>
        </FadeIn>
      )}
    </div>
  );
}
