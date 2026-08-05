import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "accent" | "outline";
};

export function Badge({ className, variant = "accent", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 font-body text-xs font-medium tracking-[0.08em]",
        variant === "accent" &&
          "border border-accent/25 bg-accent/10 text-accent-secondary",
        variant === "outline" &&
          "border border-border text-foreground-muted",
        className,
      )}
      {...props}
    />
  );
}
