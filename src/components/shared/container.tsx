import * as React from "react";

import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * `default` is the standard gutter-inset content row. `bleed` drops the
   * gutter entirely for full-bleed media bands — one of the three
   * containment modes (bare / hairline / card) the page alternates between,
   * per `design-system/MASTER.md` §4, so the whole site doesn't read as one
   * uniform column top to bottom.
   */
  size?: "default" | "bleed";
};

/**
 * The page's one horizontal shell. Full width with a symmetric `px-gutter`
 * inset — the exact same rule `navbar.tsx` uses, so a section heading lines
 * up under the logo at every viewport width.
 *
 * Rewritten 2026-09-15 (was `mx-auto max-w-[1280px] px-gutter`). The 1280px
 * cap itself was symmetric, but it sat *inside* a wider viewport while the
 * navbar ran edge to edge, so the two never aligned; and every `.measure*`
 * cap layered on top of it left-aligned its block inside the row, collecting
 * all the leftover space on the right. The client measured a 196px left gap
 * against a 612px right gap. Gutter symmetry now comes from one place:
 * `.px-gutter`, shared with the navbar.
 */
export function Container({ className, children, size = "default", ...props }: ContainerProps) {
  if (size === "bleed") {
    return (
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("w-full px-gutter", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Vertical rhythm is deliberately uneven across the page, so `space` is set
 * per section rather than defaulting to one value everywhere. Tightened
 * 2026-09-15 (was `py-20 sm:py-24` / `py-24 sm:py-32` / `py-32 sm:py-40
 * lg:py-48`): the type scale-up gave sections plenty of room to breathe on
 * its own, and the wider steps on top of it were client-flagged as too much
 * dead air between sections.
 */
type SectionProps = React.HTMLAttributes<HTMLElement> & {
  space?: "sm" | "md" | "lg";
};

const spacing = {
  sm: "py-16 sm:py-20",
  md: "py-20 sm:py-28",
  lg: "py-28 sm:py-32 lg:py-40",
} as const;

export function Section({
  className,
  children,
  space = "md",
  ...props
}: SectionProps) {
  return (
    <section className={cn("relative", spacing[space], className)} {...props}>
      {children}
    </section>
  );
}
