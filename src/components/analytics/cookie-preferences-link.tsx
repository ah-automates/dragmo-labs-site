"use client";

import { reopenConsentBanner } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Reopens the cookie consent banner so a visitor can change a choice they
 * already made. Its own small client island — the footer that renders it is
 * a server component — that just dispatches a DOM event; the banner (mounted
 * once, globally) is what actually listens and reappears.
 */
export function CookiePreferencesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={reopenConsentBanner}
      className={cn(
        "inline-block rounded-input border-0 bg-transparent p-0 text-xs text-foreground-muted/70 transition-colors duration-300 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary",
        className,
      )}
    >
      Cookie Preferences
    </button>
  );
}
