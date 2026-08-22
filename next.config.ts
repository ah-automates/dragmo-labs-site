import type { NextConfig } from "next";

/** Cloudflare serves the Turnstile widget, its iframe, and its verify calls. */
const TURNSTILE = "https://challenges.cloudflare.com";

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * `next dev` compiles every module into an `eval()` call so the browser can map
 * a stack frame back to the original source, and React Fast Refresh does the
 * same on every hot update. Without `'unsafe-eval'` the whole client bundle is
 * refused, so nothing hydrates: no navigation menu, no accessibility panel, no
 * contact form, and `window.turnstile` never gets defined. It is scoped to the
 * dev server and is never emitted by `next build`.
 */
const DEV_SCRIPT_SRC = IS_DEV ? " 'unsafe-eval'" : "";

/** Hot reload talks to the dev server over a websocket on the same origin. */
const DEV_CONNECT_SRC = IS_DEV ? " ws: wss:" : "";

/**
 * Content Security Policy.
 *
 * `'unsafe-inline'` is present on script-src because the App Router inlines the
 * RSC payload as `<script>self.__next_f.push(...)</script>` on every statically
 * generated page, and the accessibility preference script runs inline in <head>
 * before first paint. The alternative — per-request nonces from middleware —
 * would force every page to render dynamically and give up static generation
 * for the whole marketing site. The remaining directives still do the real
 * work: no plugins, no framing, no foreign form targets, and script, connect
 * and frame origins limited to this site plus Cloudflare.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${TURNSTILE}${DEV_SCRIPT_SRC}`,
  // Tailwind and next/font both emit inline <style> blocks.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self'",
  `connect-src 'self' ${TURNSTILE}${DEV_CONNECT_SRC}`,
  `frame-src ${TURNSTILE}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Applied to every response. */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Two years, preload-eligible. Only ever sent over HTTPS by the browser.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt and braces with CSP frame-ancestors, for browsers that predate it.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

/** Content-addressed by filename, so a rename is the cache bust. */
const IMMUTABLE = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const nextConfig: NextConfig = {
  /**
   * Hides the floating Next.js dev-tools badge in the bottom corner. It is
   * injected by `next dev` only and never present in a production build.
   */
  devIndicators: false,

  /** Drops the `X-Powered-By: Next.js` version banner from every response. */
  poweredByHeader: false,

  reactStrictMode: true,

  /**
   * Keeps the original TypeScript out of production. Off is the default; it is
   * stated because turning it on would publish readable source to any visitor.
   */
  productionBrowserSourceMaps: false,

  images: {
    // AVIF first, WebP as the fallback. The artwork is dark 3D renders, where
    // AVIF lands well under half the WebP size at the same visual quality.
    formats: ["image/avif", "image/webp"],
    // Every image is a local file under public/; nothing is fetched remotely.
    remotePatterns: [],
    // The sources never change without a filename change, so an optimised
    // variant can be held for a year instead of being re-encoded on expiry.
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        // The contact endpoint is public but must never be cached at the edge
        // or indexed; the route sets these too, so neither layer can regress
        // the other.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        // Files under public/ are otherwise served with `max-age=0`, so the
        // hero video and the font are re-fetched far more often than they
        // change — which is never.
        source: "/:path(videos|images|fonts)/:file*",
        headers: [IMMUTABLE],
      },
      {
        source: "/logo.webp",
        headers: [IMMUTABLE],
      },
    ];
  },
};

export default nextConfig;
