"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import {
  ANALYTICS_ATTR,
  classifyLink,
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  isAnalyticsEnabled,
  trackEvent,
  trackPageView,
} from "@/lib/analytics";

/**
 * Installs Google Analytics 4 for the whole site. Mounted once, in the root
 * layout, next to the other always-on providers.
 *
 * Renders nothing. Returns `null` outright when there is no measurement ID or
 * the visitor is on localhost, so the tag literally does not exist in dev —
 * see `isAnalyticsEnabled` in `src/lib/analytics.ts`.
 *
 * Runs under Google Consent Mode v2: the tag always loads and `gtag('config',
 * ...)` always fires, but `analytics_storage` defaults to `denied`, which
 * keeps gtag.js from setting or reading any cookie and makes it send
 * anonymous, cookieless pings instead. Accepting the cookie banner
 * (`cookie-consent-banner.tsx`) is what calls `gtag('consent', 'update', ...)`
 * to switch on full, cookie-based tracking. The ad_* consent keys stay denied
 * permanently — this site runs no ad product — and are never updated.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const enabled = isAnalyticsEnabled();

  // Manual page views. gtag is configured below with `send_page_view: false`
  // because GA's own history-based tracking fires before Next.js has committed
  // the new route's <title>, which would report the previous page's title on
  // every client-side navigation. Reading `window.location.href` (rather than
  // `useSearchParams`) also avoids forcing this component into a Suspense
  // boundary, which would de-opt every page out of static generation.
  React.useEffect(() => {
    if (!enabled) return;

    // Give Next a frame to commit `document.title` for the new route before
    // reading it, so the very first page view of a session is not reported
    // under the previous page's title.
    const raf = requestAnimationFrame(() => {
      trackPageView({
        path: pathname,
        title: document.title,
        location: window.location.href,
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname, enabled]);

  // One delegated listener for every CTA on the site, including ones inside
  // server components (they carry `data-analytics-*` attributes instead of an
  // onClick) and any link a visitor clicks that was never hand-tagged at all
  // (classified by href — see `classifyLink`). Attached and torn down in an
  // effect so React StrictMode's double-invoke in development can never bind
  // it twice. Fires regardless of consent state — Consent Mode v2 is what
  // decides, inside gtag.js itself, whether an event becomes a normal
  // cookie-based hit or an anonymous cookieless one; this listener does not
  // need to know which.
  React.useEffect(() => {
    if (!enabled) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tagged = target.closest<HTMLElement>(`[${ANALYTICS_ATTR.event}]`);
      if (tagged) {
        const name = tagged.getAttribute(ANALYTICS_ATTR.event);
        if (!name) return;
        trackEvent(name, {
          button_location: tagged.getAttribute(ANALYTICS_ATTR.location) ?? undefined,
          button_text: tagged.getAttribute(ANALYTICS_ATTR.label) ?? undefined,
          service_name: tagged.getAttribute(ANALYTICS_ATTR.service) ?? undefined,
        });
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const classified = classifyLink(anchor.href, window.location.origin);
      if (!classified) return;

      const explicitLocation = anchor
        .closest<HTMLElement>(`[${ANALYTICS_ATTR.location}]`)
        ?.getAttribute(ANALYTICS_ATTR.location);

      trackEvent(classified.event, {
        ...classified.params,
        button_text: (anchor.textContent ?? "").trim().slice(0, 80) || undefined,
        button_location: explicitLocation ?? undefined,
        link_text: (anchor.textContent ?? "").trim().slice(0, 80) || undefined,
      });
    };

    // Capture phase: reaches this handler even if a nested element stops
    // bubbling for its own click behaviour, and never calls preventDefault,
    // so the underlying link or button always does exactly what it did before.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;

// Read any previously stored cookie choice synchronously, so a returning
// visitor who already accepted gets full tracking from the first hit of this
// visit instead of a moment of denied-mode pings while React catches up.
var __dlConsent;
try {
  __dlConsent = window.localStorage.getItem("${CONSENT_STORAGE_KEY}");
} catch (e) {
  __dlConsent = null;
}

// Google Consent Mode v2. ad_* stay denied permanently — no ad product runs
// on this site. analytics_storage starts denied until the cookie banner (or a
// remembered prior choice, read above) grants it.
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: __dlConsent === "granted" ? "granted" : "denied"
});

gtag("js", new Date());
gtag("config", "${GA_MEASUREMENT_ID}", { send_page_view: false });`}
      </Script>
    </>
  );
}
