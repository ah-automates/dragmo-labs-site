/**
 * Google Analytics 4.
 *
 * Framework-free on purpose: no React, no Next imports. Every helper here is
 * safe to call from any component, at any time, before or after the gtag
 * script has loaded. Nothing in this file can throw, because an analytics
 * failure must never take a page down with it.
 *
 * The only piece that touches React is `google-analytics.tsx`, which loads the
 * tag, fires page views, and runs the delegated click listener.
 */

/**
 * The measurement ID is public by design — it ships in the page source of every
 * GA-instrumented site on the web. It lives in an env var so it can be pointed
 * at a different property without a code change, not because it is a secret.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Set `NEXT_PUBLIC_GA_ALLOW_LOCALHOST=true` to send real hits from a local run,
 * for checking events against GA's DebugView. Off by default so day-to-day
 * development never lands in the production property.
 */
const ALLOW_LOCALHOST = process.env.NEXT_PUBLIC_GA_ALLOW_LOCALHOST === "true";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1", ""]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Values GA4 accepts as event parameters. `undefined` entries are stripped. */
export type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * A local run must not pollute production reports, and a missing ID must not
 * produce a broken script tag. Both are checked here rather than at each call
 * site so there is exactly one definition of "analytics is on".
 */
export function isAnalyticsEnabled(): boolean {
  if (!GA_MEASUREMENT_ID) return false;
  if (typeof window === "undefined") return false;
  if (ALLOW_LOCALHOST) return true;

  const { hostname } = window.location;
  return !LOCAL_HOSTNAMES.has(hostname) && !hostname.endsWith(".local");
}

/** Drops `undefined` values so GA never receives an empty parameter. */
function clean(params: EventParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") out[key] = value;
  }
  return out;
}

/** The path is a useful dimension on every event, so it is added by default. */
function currentPath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname;
}

/* -------------------------------------------------------------------------- */
/* Consent (Google Consent Mode v2)                                          */
/* -------------------------------------------------------------------------- */

/**
 * The visitor's cookie choice, persisted so the banner does not reappear on
 * every visit. Read synchronously by the inline init script in
 * `google-analytics.tsx` — before React ever mounts — so a returning visitor
 * who already accepted does not get a flash of denied-mode pings before the
 * consent update call catches up. The key is referenced by string in that
 * inline script too; both must stay in sync if it ever changes.
 */
export const CONSENT_STORAGE_KEY = "dl_cookie_consent";

export type ConsentChoice = "granted" | "denied";

/** `null` means the visitor has not been asked yet, so the banner should show. */
export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    // Storage can be unavailable (private mode, blocked site data). The
    // banner will simply ask again this visit, which is the safe default.
    return null;
  }
}

export function setStoredConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // As above — the choice still applies for this page load via the consent
    // update call; it just will not be remembered next visit.
  }
}

/**
 * Tell gtag the visitor's decision. This site runs no ad products, so only
 * `analytics_storage` is ever granted; the ad_* keys stay denied permanently
 * (see the default consent state set in `google-analytics.tsx`) and are not
 * touched here — there is nothing on this site that would use them.
 *
 * Safe to call even if gtag has not loaded yet: the call queues on
 * `window.dataLayer` like every other gtag call and is processed once it has.
 */
export function updateConsent(choice: ConsentChoice): void {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", {
      analytics_storage: choice === "granted" ? "granted" : "denied",
    });
  } catch {
    // Never worth breaking the page over.
  }
}

/**
 * Dispatched by the footer's "Cookie Preferences" link (its own small client
 * island, since the footer itself is a server component) to reopen the
 * consent banner after a choice has already been made. The banner — mounted
 * once, globally — listens for this on `window`.
 */
export const REOPEN_CONSENT_EVENT = "dl:open-cookie-preferences";

export function reopenConsentBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(REOPEN_CONSENT_EVENT));
}

/**
 * Send one event.
 *
 * Never throws and never rejects. `window.gtag` is absent whenever the visitor
 * blocks trackers, the script has not finished loading, or analytics is off for
 * this environment — all of which are normal, none of which are errors.
 *
 * In development this logs instead of sending. The branch is removed entirely
 * from production bundles, because `process.env.NODE_ENV` is inlined at build
 * time and the minifier drops the dead code, so there is no console noise in
 * production.
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  const payload = clean({ page_path: currentPath(), ...params });

  if (IS_DEV) {
    console.debug(`[analytics] ${name}`, payload);
  }

  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", name, payload);
  } catch {
    // An analytics failure is never worth breaking an interaction over.
  }
}

/**
 * Send one page view.
 *
 * Fired manually rather than by gtag, because the tag is configured with
 * `send_page_view: false`. See `google-analytics.tsx` for why.
 */
export function trackPageView(params: {
  path: string;
  title: string;
  location: string;
}): void {
  if (IS_DEV) {
    console.debug("[analytics] page_view", params);
  }

  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: params.path,
      page_title: params.title,
      page_location: params.location,
    });
  } catch {
    // As above.
  }
}

/* -------------------------------------------------------------------------- */
/* Event names                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Every event name the site can emit, in one place, so a name cannot drift
 * between two call sites and quietly split a report in half.
 *
 * `generate_lead` is GA4's own recommended lead event and is the single most
 * important one here. Several names below (whatsapp, phone, download, booking)
 * have no UI on the site today; they are emitted automatically by the link
 * classifier the moment such a link is added. See `ANALYTICS_ATTR`.
 */
export const EVENTS = {
  cta: "cta_click",
  contact: "contact_click",
  bookCall: "book_call_click",
  serviceCta: "service_cta_click",
  pricingCta: "pricing_cta_click",
  caseStudy: "case_study_click",
  whatsapp: "whatsapp_click",
  email: "email_click",
  phone: "phone_click",
  externalLink: "external_link_click",
  download: "file_download",
  formStart: "form_start",
  formSubmitAttempt: "form_submit_attempt",
  formError: "form_error",
  generateLead: "generate_lead",
} as const;

/**
 * Where a CTA sits, so two buttons with the same label can be told apart in
 * reporting. Used as the `button_location` / `form_location` parameter.
 */
export const LOCATIONS = {
  navbar: "navbar",
  navbarMobile: "navbar_mobile",
  hero: "hero",
  pageHero: "page_hero",
  capabilities: "capabilities_section",
  services: "services_section",
  ctaBlock: "cta_block",
  contactPage: "contact_page",
  contactPageDetails: "contact_page_details",
  homeContact: "home_contact_section",
  homeContactDetails: "home_contact_details",
  footer: "footer",
  footerSocial: "footer_social",
  notFound: "not_found",
} as const;

/* -------------------------------------------------------------------------- */
/* Declarative tagging                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Data attributes read by the delegated click listener.
 *
 * Most CTAs on this site live in server components. Attaching an `onClick` to
 * them would pull each one into the client bundle for no benefit, so they carry
 * plain data attributes instead and a single listener on `document` does the
 * work. A server component stays a server component.
 *
 * `event` is optional: a link with only `location` set still gets tracked, with
 * the event name derived from its href (a `mailto:` becomes `email_click`).
 */
export const ANALYTICS_ATTR = {
  event: "data-analytics-event",
  location: "data-analytics-location",
  label: "data-analytics-label",
  service: "data-analytics-service",
} as const;

/** File extensions that count as a download rather than a normal outbound link. */
export const DOWNLOAD_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "csv",
  "zip",
  "rar",
  "7z",
  "txt",
  "rtf",
  "dmg",
  "exe",
  "pkg",
] as const;

const WHATSAPP_HOSTS = ["wa.me", "api.whatsapp.com", "web.whatsapp.com", "whatsapp.com"];

/** Meeting schedulers, so a booking CTA is recognised without being hand-tagged. */
const BOOKING_HOSTS = [
  "calendly.com",
  "cal.com",
  "savvycal.com",
  "hubspot.com",
  "zcal.co",
  "tidycal.com",
];

/**
 * Work out what an outbound link actually is.
 *
 * Returns `null` for internal navigation, which is already covered by
 * `page_view` and would only add noise. Exported so it can be reasoned about
 * and tested independently of the DOM listener that calls it.
 */
export function classifyLink(
  href: string,
  currentOrigin: string,
): { event: string; params: EventParams } | null {
  const raw = href.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();

  if (lower.startsWith("mailto:")) {
    return { event: EVENTS.email, params: {} };
  }

  if (lower.startsWith("tel:") || lower.startsWith("callto:")) {
    return { event: EVENTS.phone, params: {} };
  }

  if (lower.startsWith("whatsapp://")) {
    return { event: EVENTS.whatsapp, params: { destination_url: raw } };
  }

  // Anchors, in-page jumps and JS hrefs are not navigation worth an event.
  if (lower.startsWith("#") || lower.startsWith("javascript:")) return null;

  let url: URL;
  try {
    url = new URL(raw, currentOrigin);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");
  const isExternal = url.origin !== currentOrigin;

  if (WHATSAPP_HOSTS.includes(host)) {
    return { event: EVENTS.whatsapp, params: { destination_url: url.href } };
  }

  if (BOOKING_HOSTS.some((b) => host === b || host.endsWith(`.${b}`))) {
    return { event: EVENTS.bookCall, params: { destination_url: url.href } };
  }

  const fileName = url.pathname.split("/").pop() ?? "";
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase()
    : undefined;

  if (extension && (DOWNLOAD_EXTENSIONS as readonly string[]).includes(extension)) {
    return {
      event: EVENTS.download,
      params: {
        file_name: fileName,
        file_extension: extension,
        destination_url: url.href,
      },
    };
  }

  if (isExternal) {
    return {
      event: EVENTS.externalLink,
      params: { destination_url: url.href, link_domain: host },
    };
  }

  // Internal navigation. `page_view` already records it.
  return null;
}
