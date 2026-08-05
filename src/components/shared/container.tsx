import * as React from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-gutter", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Vertical rhythm is deliberately uneven across the page, so `space` is set
 * per section rather than defaulting to one value everywhere.
 */
type SectionProps = React.HTMLAttributes<HTMLElement> & {
  space?: "sm" | "md" | "lg";
};

const spacing = {
  sm: "py-16 sm:py-20",
  md: "py-20 sm:py-28",
  lg: "py-28 sm:py-36 lg:py-40",
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
