/**
 * Meta Pixel (Facebook/Instagram ad conversion tracking).
 *
 * Framework-free, mirroring `analytics.ts`: safe to call from anywhere,
 * never throws. The pixel itself has no consent-mode equivalent of Google's
 * `gtag("consent", ...)` — it either loads and sets its `_fbp`/`_fbc` cookies
 * or it doesn't — so gating happens entirely in `meta-pixel.tsx`, which
 * mounts the `<Script>` tags only once the visitor has accepted the same
 * cookie banner that gates Google Analytics.
 */

/**
 * Public by design, same reasoning as `GA_MEASUREMENT_ID` — it ships in the
 * page source of every Pixel-instrumented site on the web.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/**
 * Set `NEXT_PUBLIC_META_PIXEL_ALLOW_LOCALHOST=true` to send real events from
 * a local run, for checking them in Meta Events Manager's test tool. Off by
 * default so day-to-day development never lands in the production dataset.
 */
const ALLOW_LOCALHOST = process.env.NEXT_PUBLIC_META_PIXEL_ALLOW_LOCALHOST === "true";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1", ""]);

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: unknown };
    _fbq?: unknown;
  }
}

/**
 * A local run must not pollute the production dataset, and a missing pixel
 * ID must not produce a broken script tag. Checked here, once, rather than
 * at each call site.
 */
export function isMetaPixelEnabled(): boolean {
  if (!META_PIXEL_ID) return false;
  if (typeof window === "undefined") return false;
  if (ALLOW_LOCALHOST) return true;

  const { hostname } = window.location;
  return !LOCAL_HOSTNAMES.has(hostname) && !hostname.endsWith(".local");
}
