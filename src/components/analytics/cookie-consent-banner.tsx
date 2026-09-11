"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { EASE } from "@/components/shared/motion";
import {
  getStoredConsent,
  isAnalyticsEnabled,
  REOPEN_CONSENT_EVENT,
  setStoredConsent,
  updateConsent,
  type ConsentChoice,
} from "@/lib/analytics";

/**
 * The cookie consent banner. Mounted once, globally, in the root layout next
 * to `<GoogleAnalytics />`.
 *
 * GA already runs under Consent Mode v2 with `analytics_storage` denied by
 * default (see `google-analytics.tsx`), so no cookie is set before a visitor
 * answers this. Accept/Reject are equal weight and equally easy to reach —
 * neither is hidden behind the other — which is the regulatory bar (GDPR /
 * UK PECR) a "reject is one extra click" pattern fails.
 *
 * Starts hidden on both the server render and the first client render (there
 * is no way to know a stored choice until an effect runs), so there is no
 * hydration mismatch — it only ever appears after mount, via `setVisible`.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = React.useState(false);
  const enabled = isAnalyticsEnabled();

  // Show on first visit — i.e. whenever no choice has been stored yet.
  React.useEffect(() => {
    if (!enabled) return;
    setVisible(getStoredConsent() === null);
  }, [enabled]);

  // Reopened by the footer's "Cookie Preferences" link, from anywhere on the
  // site, via a plain DOM event rather than shared React state — the footer
  // is a server component, so that link is its own small client island with
  // no state of this component to reach directly.
  React.useEffect(() => {
    if (!enabled) return;
    const onReopen = () => setVisible(true);
    window.addEventListener(REOPEN_CONSENT_EVENT, onReopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, onReopen);
  }, [enabled]);

  if (!enabled) return null;

  const decide = (choice: ConsentChoice) => {
    setStoredConsent(choice);
    updateConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 backdrop-blur-xl"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-foreground-muted">
              We use cookies to understand how visitors use this site and to
              improve it. No cookies are set unless you accept.{" "}
              <a
                href="/privacy-policy#cookies"
                className="text-foreground underline decoration-foreground-muted/40 underline-offset-4 transition-colors duration-200 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Learn more
              </a>
              .
            </p>
            <div className="flex shrink-0 items-center gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => decide("denied")}>
                Reject
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => decide("granted")}>
                Accept
              </Button>
            </div>
          </Container>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
