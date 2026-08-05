import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Single source of truth for CTA styling. Every call-to-action on the site
 * routes through this so hover, focus, and contrast cannot drift apart.
 */
export const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-input font-heading font-semibold tracking-tight transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out disabled:pointer-events-none disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white shadow-[0_10px_30px_-12px_rgba(30,123,255,0.85)] hover:-translate-y-0.5 hover:bg-accent-secondary active:translate-y-0",
        secondary:
          "border border-border-strong bg-white/[0.04] text-foreground hover:-translate-y-0.5 hover:border-accent-secondary/50 hover:bg-white/[0.08] active:translate-y-0",
        outline:
          "border border-border-strong text-foreground hover:border-accent/50 hover:bg-white/[0.05]",
      },
      size: {
        sm: "h-11 px-6 text-sm",
        md: "h-13 px-7 text-sm",
        lg: "h-14 px-8 text-base",
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
