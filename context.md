# Dragmo Labs Site: Project Context

Orientation document for anyone (human or agent) picking this codebase up. It covers what
the site is, how it is put together, the reasoning behind the non-obvious choices, and
where the security and accessibility work actually lives.

Companion documents:

| File | Scope |
|---|---|
| `design-system/MASTER.md` | Visual and content law. Frozen brand tokens, layout rules, pre-delivery checklist. |
| `.env.example` | Every environment variable, with notes on which ones may reach the browser. |
| `context.md` (this file) | Architecture, security posture, operational notes. |

---

## 1. What this is

A marketing site for Dragmo Labs, an AI automation and software development studio. It is
a lead-generation site: five content sections on the home page funnelling to one contact
form, plus a services page and three legal pages.

It is **not** an app. There is no database, no authentication, no user accounts, and no
CMS. The only server-side behaviour on the whole site is a single contact endpoint.

### Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15.5.22, App Router |
| Runtime | React 19 |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) |
| Motion | Framer Motion 12 |
| Icons | Lucide (one family, no emoji as icons) |
| Email | Resend |
| Bot check | Cloudflare Turnstile |
| Fonts | Satoshi (self-hosted woff2), Inter (`next/font/google`) |

### Routes

| Route | Rendering | Notes |
|---|---|---|
| `/` | Static | Hero, Capabilities, Approach, Principles, Contact |
| `/services` | Static | Service grid plus Process |
| `/contact` | Static | Full contact form |
| `/privacy-policy` | Static | Legal, generated from `src/lib/policies.ts` |
| `/refund-policy` | Static | Legal |
| `/delivery-policy` | Static | Legal |
| `/api/contact` | Dynamic | The only server endpoint. Node runtime. |
| `/sitemap.xml`, `/robots.txt` | Static | Generated from `siteConfig` and `policyLinks` |

Everything except the API route is prerendered at build time. Shared client JS is around
103 kB. Keeping pages static is a deliberate constraint that shaped the CSP decision in
section 5.

---

## 2. How the code is organised

```
src/
  app/            routes, layout, API, sitemap/robots, global CSS
  components/
    a11y/         accessibility provider and settings menu
    layout/       navbar, footer, logo
    sections/     page-level composition blocks
    shared/       reusable pieces (forms, motion, containers, policy renderer)
    ui/           primitives (button, input, badge)
  lib/            content as data, plus server-only logic
```

### The governing convention: content lives as data

Site copy is not embedded in JSX. It sits in typed structures under `src/lib/` and
components render it:

- `src/lib/data.ts` holds `siteConfig`, nav links, footer links, services, principles.
- `src/lib/images.ts` is a **generated** typed manifest. Do not hand-edit it.
- `src/lib/policies.ts` holds the three legal documents as structured blocks.

The payoff is that a copy change is a one-line edit in a predictable place, and structural
consistency is enforced by the type system rather than by discipline.

### Server and client component boundaries matter here

`navbar.tsx` and `hero.tsx` are client components that import `src/lib/data.ts`. Anything
`data.ts` imports is therefore a candidate for the client bundle on every page.

This is why `policies.ts` is deliberately **not** imported by `data.ts`. The footer needs
policy links, but routing them through `data.ts` risked shipping every word of the three
legal documents into the browser bundle site-wide. Instead `policies.ts` exports its own
`policyLinks`, consumed only by `footer.tsx` and `sitemap.ts`, both server components.

If you add content modules, apply the same test: *does a client component import the
module I am about to import from?*

### Design tokens

Defined once in `src/app/globals.css` as CSS custom properties on `:root`, then exposed to
Tailwind through `@theme inline`. Colors, the two font families, and exactly three radius
tiers (`--radius-input` 8px, `--radius-card` 20px, pill). `MASTER.md` treats the brand
palette and type pairing as frozen and client-specified.

---

## 3. The contact pipeline

The one piece of real behaviour on the site, end to end:

```
contact-form.tsx  ->  POST /api/contact  ->  Resend  ->  team inbox + auto-reply
   (client)              (server)
```

**Client** (`src/components/shared/contact-form.tsx`) validates with the same shared rules
the server uses (`src/lib/contact-schema.ts`), so error copy is identical on both sides and
cannot drift. On failure, focus moves to the first invalid field in DOM order. Status is
announced through `aria-live="polite"`.

**Two form variants.** The home page renders a compact variant without the interest and
budget fields. `src/lib/email.ts` filters empty rows so those never render as bare labels
in the notification email.

**Turnstile** (`src/components/shared/turnstile.tsx`) renders explicitly rather than via
the `cf-turnstile` class, because the class-based auto-render behaves unpredictably under
React. The parent drives resets through a ref, since a token is single-use and must be
replaced after every submit attempt.

**Server** (`src/app/api/contact/route.ts`) runs the checks in a deliberate order,
described in the next section.

---

## 4. Security posture

This is the part worth reading closely. The site's attack surface is small but the contact
endpoint is public and unauthenticated by necessity, so it carries layered defences.

### 4.1 Request handling order in `/api/contact`

The ordering is intentional: cheap checks first, so a flood is turned away before any work
is done, and the expensive network call happens last.

| # | Check | Failure | Why here |
|---|---|---|---|
| 1 | Same-origin | 403 | A browser always sends `Origin` on a JSON POST. A mismatch is a genuine cross-origin caller. A *missing* header is allowed through, because that means a non-browser client, which Turnstile stops anyway; rejecting on absence would break uptime probes without stopping an attacker. |
| 2 | `Content-Length` cap (32 KB) | 413 | Refuses an oversized body before `request.json()` buffers it. |
| 3 | Content type | 415 | Must be `application/json`. |
| 4 | Read as text, re-check length | 413 | Catches a body that lied about its declared length. |
| 5 | Parse and shape check | 400 | Rejects arrays and non-objects, not just malformed JSON. |
| 6 | Per-IP rate limit | 429 | 3 attempts per 10 minutes. Records as well as checks, so retries count. |
| 7 | Global daily cap | 429 | 40 sends/day. |
| 8 | Field truncation, then validation | 422 | Every field is `slice()`d to a hard maximum before validation. |
| 9 | Spam heuristics | 200 or 422 | See 4.2. |
| 10 | Turnstile verification | 403 | Last, deliberately. See 4.3. |
| 11 | Email configured check | 500 in prod | Fails closed. |

### 4.2 Spam handling has two distinct verdicts

`src/lib/spam.ts` separates:

- **`discard`**: accept the request, return `{ ok: true }`, drop the message. Reserved for
  signals a human cannot trip (honeypot filled, URL in the name field). The sender learns
  nothing.
- **`reject`**: return an actionable 422. Used for signals that could misfire on a real
  person (link markup, more than 3 links). Silently eating a genuine enquiry is worse than
  letting some spam through.

There is deliberately **no keyword blocklist**. Standard spam word lists contain "SEO",
"automation", "AI" and "leads", every one of which belongs in a real enquiry to this
business.

### 4.3 Turnstile is verified last, and fails closed

Verification is the final check because a token is single-use and expires after five
minutes. Spending it on a submission that a cheaper rule would have rejected anyway would
force a real person to re-solve a challenge just to fix a typo.

Two fail-closed decisions:

- If the Cloudflare request throws or times out, `verifyTurnstile` returns `false`.
  Treating an unreachable Cloudflare as a pass would let a bot skip the check entirely by
  inducing a timeout.
- If `TURNSTILE_SECRET_KEY` is missing **in production**, the route refuses the submission
  with a 500 rather than skipping the bot check. A misconfigured deploy cannot silently
  open the endpoint. In development the check is skipped so local work is not blocked.

### 4.4 Rate limiting: known limitation

`src/lib/rate-limit.ts` is in-memory. On Vercel that means per serverless instance, not
global, so a distributed flood can partly evade it. It reliably stops single-source bursts,
which is the common case.

The daily cap of 40 is set below Resend's free tier of 100/day, because each submission
sends two emails (notification plus auto-reply), making the real ceiling 50 submissions.
The cap leaves headroom for genuine traffic while an attack is already being throttled.

**To harden:** swap this file's internals for `@upstash/ratelimit`. The exported signatures
are shaped so no caller has to change.

### 4.5 Email rendering escapes everything

Names and messages are free text and end up in HTML email. `src/lib/email.ts` escapes
`& < > " '` on every interpolation, and `toHtmlParagraphs` converts newlines to `<br />`
*after* escaping, preserving the sender's paragraph breaks without permitting any other
markup.

Resend reports API errors in the response body rather than throwing, so `send()` inspects
the result explicitly. Without that, failures would pass silently.

The notification sets `Reply-To` to the sender, so hitting Reply reaches the lead. If the
notification succeeds but the courtesy auto-reply fails, the route still returns success:
the enquiry already reached the inbox, and telling the sender otherwise would lose the lead.

### 4.6 Response headers

`next.config.ts` applies to every response:

- **Content-Security-Policy** (see section 5)
- **Strict-Transport-Security**: 2 years, `includeSubDomains`, `preload`
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`, belt and braces with CSP `frame-ancestors`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: camera, microphone, geolocation, payment, usb all denied
- `poweredByHeader: false` drops the `X-Powered-By: Next.js` version banner

`/api/*` additionally gets `Cache-Control: no-store, no-cache, must-revalidate` and
`X-Robots-Tag: noindex, nofollow`, set both in config and in the route itself so neither
layer can regress the other. Without `no-store` a proxy could hold one sender's error
response and replay it to another.

### 4.7 Secrets

- Only `NEXT_PUBLIC_*` variables reach the browser. The Turnstile **site** key carries that
  prefix; the **secret** key must never do so.
- `productionBrowserSourceMaps: false` keeps the original TypeScript out of production.
  This is the default, but it is stated explicitly in config because turning it on would
  publish readable source to any visitor.
- The image generation pipeline (`scripts/generate-images.mjs`) runs at build time, never at
  runtime, which keeps the model API key out of the bundle entirely. The OpenRouter key is
  deliberately **not** kept in `.env`: the artwork set is finished and committed, so a
  stored key would be a standing liability. Supply one inline only for a single re-run.
- `images.remotePatterns` is empty and `dangerouslyAllowSVG` is `false`. Every image is a
  local file under `public/`; nothing is fetched remotely and no SVG is passed through the
  optimiser.

---

## 5. The Content Security Policy, and why it is split by environment

The CSP is the one piece of config most likely to bite someone, so it deserves its own
section.

### Why `'unsafe-inline'` is on `script-src`

The App Router inlines the RSC payload as `<script>self.__next_f.push(...)</script>` on
every statically generated page, and the accessibility preference script runs inline in
`<head>` before first paint. The alternative, per-request nonces from middleware, would
force every page to render dynamically and give up static generation for the entire
marketing site.

The remaining directives still do the real work: no plugins (`object-src 'none'`), no
framing (`frame-ancestors 'none'`), no foreign form targets (`form-action 'self'`), and
script, connect and frame origins limited to this site plus Cloudflare.

### Why development gets extra permissions

`next dev` compiles every module into an `eval()` call so the browser can map a stack frame
back to original source, and React Fast Refresh does the same on every hot update.

Without `'unsafe-eval'` in development, the browser refuses the entire client bundle and
**nothing hydrates**. The server-rendered HTML still paints, so the site looks alive, but
the mobile navigation, accessibility panel, contact form, and Turnstile are all dead, and
`window.turnstile` is never defined. This failure mode is genuinely deceptive; it was
present and shipped for a while before being diagnosed.

`connect-src` similarly gets `ws: wss:` in development for the hot-reload socket.

Both are gated on `process.env.NODE_ENV !== "production"` and are never emitted by
`next build`. **Verify with:**

```bash
curl -sI http://localhost:3000/contact | grep -i content-security-policy   # has 'unsafe-eval'
curl -sI http://localhost:3100/contact | grep -i content-security-policy   # must not
```

### Cloudflare's console noise is not yours

Turnstile's iframe runs browser fingerprinting: WebGL capability probes, a WebGPU adapter
request, and its own font loading. This produces roughly 54 console messages per page load
with the widget mounted, including `WebGL: INVALID_ENUM`, `No available adapters`, and
`OTS parsing error: Size of decompressed WOFF 2.0 is less than compressed size`.

These originate inside `challenges.cloudflare.com`, are cross-origin, and are not fixable
from this codebase. In DevTools the source reads as something like `normal?lang=auto`.
Filter the console to `top` to hide them. The self-hosted Satoshi font was independently
verified as valid (its brotli stream decompresses to a 127,936-byte sfnt from a 42,588-byte
file), so the OTS error is Cloudflare's, not ours.

Note that Turnstile currently loads on `/` as well as `/contact`, because the home page
carries a contact section. Deferring the script until the form is focused would remove that
third-party request from every home page visit.

---

## 6. Accessibility

Treated as a feature, not a checklist item. `MASTER.md` section 6 sets the floor.

**A custom accessibility menu** (`src/components/a11y/`) offers four preferences: text size
(3 steps), reduced motion, high contrast, and underlined links.

The mechanism is worth understanding:

1. Each preference maps to a `data-a11y-*` attribute on `<html>`.
2. All styling for those attributes lives in `globals.css`, not in components, so a
   preference cannot be lost because a component forgot to read the context.
3. `A11Y_INIT_SCRIPT` runs inline in `<head>` **before first paint**, so a stored
   preference is already applied when the page renders and the page never flashes at the
   wrong size or contrast.
4. Because that script stamps attributes before hydration, the server markup legitimately
   differs from the client, which is why `<html>` carries `suppressHydrationWarning`.
5. `A11yProvider` then catches React state up with the DOM in an effect.

**`useMotionPreference()` is the single motion authority.** It returns true when the OS asks
for reduced motion *or* when the visitor asked for it in our menu. Components must use it
rather than Framer's `useReducedMotion`, which only sees the media query.

**Other measures in place:**

- Skip-to-content link as the first tab stop; the accessibility menu is the second by design.
- The a11y panel is a `role="dialog"` with focus moved into it, Escape to close, and focus
  returned to the trigger.
- Scroll-reveal wrappers ship at `opacity: 0`. A `<noscript>` block and a reduced-motion CSS
  rule both force them visible, so content can never be permanently invisible if JS fails
  or a runtime check misses.
- The policy pages deliberately do **not** animate their body text: a reveal wrapper at
  `opacity: 0` would hide most of a long legal document from browser find-in-page until
  scrolled to.
- Tailwind's preflight strips list markers, which makes Safari drop list semantics, so
  custom-marker lists carry an explicit `role="list"`.
- Decorative numbers and icons are `aria-hidden`; icon-only buttons carry `aria-label`.

---

## 7. Performance

- Every page except the API route is statically prerendered.
- Images are AVIF first, WebP fallback. The artwork is dark 3D render, where AVIF lands well
  under half the WebP size at the same visual quality.
- `minimumCacheTTL` is one year: sources never change without a filename change.
- `public/videos`, `public/images`, `public/fonts` and `/logo.webp` are served
  `immutable, max-age=31536000`. They are content-addressed by filename, so a rename is the
  cache bust. Without this, Next serves files under `public/` with `max-age=0`.
- The hero video is `muted`, `loop`, `playsInline`, `preload="metadata"` with a poster, and
  fades in only once ready.
- The contact page photo is `priority`, since that page has no hero above it and the photo
  is the LCP candidate. Its wrapper is `hidden lg:block`, and a preload ignores CSS, so its
  `sizes` attribute uses a `1px` branch below the `lg` breakpoint to stop phones from
  downloading a full-width copy of an invisible image.

---

## 8. Working on this project

### Commands

```bash
npm run dev            # dev server on :3000
npm run build          # production build
npm start              # serve the production build
npm run lint           # eslint (next/core-web-vitals + next/typescript)
npx tsc --noEmit       # typecheck
npm run images         # regenerate AI artwork; needs OPENROUTER_API inline
```

**Do not run `next build` while `next dev` is running.** They share the `.next` directory,
and the build overwrites chunks the dev server has cached, producing
`__webpack_modules__[moduleId] is not a function`. Stop the dev server, or delete `.next`
and restart it.

### Environment variables

Copy `.env.example` to `.env`. Note that the Resend key variable is named **`RESEND_API`**,
not `RESEND_API_KEY`.

| Variable | Reaches browser | Purpose |
|---|---|---|
| `RESEND_API` | No | Resend API key |
| `CONTACT_TO_EMAIL` | No | Where enquiries are delivered |
| `CONTACT_FROM_EMAIL` | No | Sender; domain must be verified in Resend |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | **Yes** | Turnstile widget |
| `TURNSTILE_SECRET_KEY` | No | Turnstile server verification |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | **Yes** | Google Analytics 4 property. Public by design. |

The Turnstile widget's hostname list must include `localhost`, or `npm run dev` is rejected.

### Before declaring a change done

`MASTER.md` section 9 carries the full pre-delivery checklist. The content rules that catch
people out most often:

- **Zero em-dashes and en-dashes** in visible copy. Rewrite the sentence.
- Curly apostrophes and quotes only.
- **No invented numbers.** No statistic ships without a real source.
- One CTA label per intent across the entire site (`CTA_LABEL` in `data.ts`).
- Error messages state the fix, not just the problem.

---

## 9. Adding a policy page

The three legal pages are generated from data, so a fourth is a small job:

1. Add a `Policy` object to `src/lib/policies.ts` and register it in the `policies` map.
   Available block kinds are `text`, `subheading`, `list` (with optional `ordered`), and
   `contact`. Only two inline forms are supported: `**bold**` and the site email address,
   which is auto-linked to `mailto:` wherever it appears in prose.
2. Create `src/app/<slug>/page.tsx` as a four-line file mirroring the existing ones.

The footer link and the sitemap entry are both derived from `policyLinks` and need no edit.
Section `id`s are hardcoded rather than derived from headings, so a shared deep link
survives a re-wording.

---

## 10. Known gaps and highest-leverage next steps

1. **No social proof.** `MASTER.md` section 8 records this as the single highest-leverage
   change available. The design direction ("Trust & Authority") calls for client logos,
   credentials, and case-study metrics. The proof slot is designed and deliberately left
   empty: fabricated `50+ / 12x / 99.9%` figures were removed rather than shipped as
   invented proof. Supplying real client names or outcomes is the biggest available win.
2. **Rate limiting is per-instance.** See 4.4. Swap in `@upstash/ratelimit` for durable,
   global limiting when traffic justifies it.
3. **Turnstile loads on the home page.** Deferring it until the form is focused would drop a
   third-party request and roughly 54 console messages from every home page visit.
4. **No automated test suite.** Verification is currently lint, typecheck, production build,
   and manual browser checks. Playwright would be the natural fit given the checks already
   being run by hand.

---

## 11. Analytics (Google Analytics 4)

`src/lib/analytics.ts` (framework-free helpers) and `src/components/analytics/
google-analytics.tsx` (the one client component that loads the tag) together install GA4
site-wide. Mounted once, in `src/app/layout.tsx`, next to the other always-on providers.

### Why it is off on localhost, and how to check it anyway

`isAnalyticsEnabled()` returns `false` whenever `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset or
`window.location.hostname` is `localhost` / `127.0.0.1` / anything ending `.local`. Below that
check the component returns `null` outright, so the `<Script>` tags are never rendered and no
request to `googletagmanager.com` is ever made in dev. `trackEvent`/`trackPageView` still run
in that state, logging to the console with an `[analytics]` prefix instead of calling `gtag`,
so every event can be verified by reading dev-server console output. Set
`NEXT_PUBLIC_GA_ALLOW_LOCALHOST=true` locally to send real hits and use GA's own Realtime /
DebugView instead.

### Page views are manual, not GA's own history tracking

The tag is configured with `send_page_view: false`. A `useEffect` keyed on `usePathname()`
fires one `page_view` per route change instead, reading `document.title` a frame late (via
`requestAnimationFrame`) so it never reports the previous page's title on a client-side
navigation — GA's built-in history listener fires before Next commits the new title, which is
exactly the failure mode this avoids. **This requires Enhanced Measurement's "Page changes
based on browser history events" to be switched off in the GA4 property**, or every route
change is counted twice: once by this effect, once by GA's own listener.

The page-view effect deliberately reads `window.location.href` rather than calling
`useSearchParams()`. The latter forces a Suspense boundary on the component that calls it; at
the root layout that would push every route out of static generation — the same constraint
`productionBrowserSourceMaps` and the CSP nonce decision in section 5 already protect.
`location.href` still carries the query string, so UTM parameters are not lost.

### One delegated click listener, not per-button handlers

Most CTAs on this site (`service-card.tsx`, `capabilities.tsx`, `cta-block.tsx`,
`page-hero.tsx`, `footer.tsx`) are server components. Giving each one an `onClick` would force
it client-side for no reason other than analytics, so they instead carry plain
`data-analytics-event` / `data-analytics-location` / `data-analytics-service` attributes (see
`ANALYTICS_ATTR` in `analytics.ts`), and a single `click` listener on `document` — attached and
torn down in one `useEffect`, so React Strict Mode's double-invoke in dev cannot double-bind it
— reads them. It never calls `preventDefault`, so a tagged link or button does exactly what it
did before.

Any `<a>` without an explicit tag is still classified by its `href` (`classifyLink()`):
`mailto:` becomes `email_click`, `tel:` becomes `phone_click`, a `wa.me`/`whatsapp.com` link
becomes `whatsapp_click`, a Calendly/Cal.com link becomes `book_call_click`, a link to a known
document extension becomes `file_download`, and any other different-origin link becomes
`external_link_click`. **None of these currently exist on the site** — no WhatsApp link, no
phone number (`data.ts` records that decision explicitly), no booking link, no downloadable
file. Nothing fake was added to create one; the moment a real one is added anywhere on the
site, it is tracked automatically with no further code.

### The contact form's lead event

`generate_lead` (GA4's own recommended event for a captured lead) fires from exactly one call
site in `contact-form.tsx`, inside the success branch of `handleSubmit`, only after
`response.ok` is confirmed by the server. A validation failure, a missing Turnstile token, or
any 4xx/5xx response instead produces `form_error` with an `error_type` and the **names** of
the failing fields — never their values. `form_start` fires once per attempt (guarded by a
ref, reset when "Send Another Message" is clicked) and `form_submit_attempt` fires on every
submit regardless of outcome. No form value — name, email, phone, company, message — is ever
sent to GA; only `form_name`, `form_location`, and `page_path`.

### CSP

`next.config.ts` adds `www.googletagmanager.com` to `script-src`, the `google-analytics.com`
/ `analytics.google.com` / `googletagmanager.com` subdomains to `connect-src` (gtag.js picks
one at runtime), and the same to `img-src` for GA's pixel-beacon fallback. Everything else in
the CSP, including the `'unsafe-inline'` rationale, is unchanged.
