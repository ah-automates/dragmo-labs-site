import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Single source of truth for CTA styling. Every call-to-action on the site
 * routes through this so hover, focus, and contrast cannot drift apart.
 */
export const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-input font-heading font-semibold tracking-tight transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /*
         * Inner lit edge rather than an outer drop-glow (design-system/
         * MASTER.md §4, client-authorized 2026-09-14): depth from a simulated
         * physical edge, not a halo around the button.
         */
        primary:
          "bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(3,6,14,0.4)] hover:-translate-y-0.5 hover:bg-accent-secondary active:translate-y-0",
        secondary:
          "border border-border-strong bg-white/[0.04] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5 hover:border-accent-secondary/50 hover:bg-white/[0.08] active:translate-y-0",
        outline:
          "border border-border-strong text-foreground hover:border-accent/50 hover:bg-white/[0.05]",
      },
      size: {
        sm: "h-11 px-6 text-sm",
        md: "h-12 px-7 text-base",
        lg: "h-14 px-9 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = "Button";

type ButtonLinkProps = React.ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof buttonVariants>;

/** Navigation styled as a CTA. Uses Link so modifier-clicks still work. */
const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, variant, size, ...props }, ref) => (
    <Link
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
ButtonLink.displayName = "ButtonLink";

export { Button, ButtonLink };
