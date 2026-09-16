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
form, plus a services page, four long-form product sales pages, two case studies, a
testimonials page, and three legal pages.

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
| `/` | Static | Hero, Capabilities, CaseStudies, Testimonials, Approach, Principles, Contact |
| `/services` | Static | Service grid plus Process |
| `/services/[slug]` | SSG | Six editorial capability pages (not sales pages — see section 9) |
| `/products` | Static | Asymmetric bento index of all four products |
| `/products/[slug]` | SSG | 17-step sales page (voice agent, WhatsApp agent, invoice system) or a shorter showcase page (3D property site). See section 9. |
| `/case-studies` | Static | Full-bleed media card grid, plus the testimonials band repeated |
| `/case-studies/[slug]` | SSG | Khatri Real Estate, Purafall |
| `/contact` | Static | Full contact form |
| `/privacy-policy` | Static | Legal, generated from `src/lib/policies.ts` |
| `/refund-policy` | Static | Legal |
| `/delivery-policy` | Static | Legal |
| `/api/contact` | Dynamic | The only server endpoint. Node runtime. |
| `/sitemap.xml`, `/robots.txt` | Static | Generated from `siteConfig`, `policyLinks`, `products`, `caseStudies` |

There is no standalone `/testimonials` route as of 2026-09-15; it was folded into the home
page's `#testimonials` section (`next.config.ts` 308-redirects the old URL there). See section
9's dated addendum for why.

Everything except the API route is prerendered at build time, `/products/[slug]`,
`/case-studies/[slug]`, and `/services/[slug]` included (`generateStaticParams` plus
`dynamicParams = false`, so an unknown slug is a build-time 404, not an on-demand render).
Shared client JS is around 103 kB. Keeping pages static is a deliberate constraint that
shaped the CSP decision in section 5.

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

- `src/lib/data.ts` holds `siteConfig`, nav links, footer links, principles. It does **not**
  hold `services` (moved out 2026-09-16, see below).
- `src/lib/services.ts` holds all six services, each carrying a full `/services/[slug]`
  editorial page's copy under `detail: ServiceDetail`, with fixed-length tuples for every
  list (three signals, four deliverables, three engagement stages) so a missing or extra
  entry is a compile error, the same device `products.ts` uses for its six fascinations.
- `src/lib/images.ts` is a **generated** typed manifest. Do not hand-edit it.
- `src/lib/policies.ts` holds the three legal documents as structured blocks.
- `src/lib/products.ts` holds all four products as a `ProductOffer` discriminated union
  encoding Sabri Suby's 17-Step Secret Selling System directly in the type (see section 9).
- `src/lib/case-studies.ts` and `src/lib/proof.ts` hold case study content and the verified
  engineering incidents shared between a product's "credentials" step and its case study.
- `src/lib/testimonials.ts` holds every testimonial with a `status` of
  `"draft-pending-signoff" | "approved"`. Every render path reads `approvedTestimonials`,
  never the raw array, so a quote nobody has signed off cannot reach production by
  construction. `testimonialsLink` derives from whether any are approved and drives both
  the footer entry and the sitemap, the same pattern as `policyLinks` below.

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
module I am about to import from?* `products.ts`, `case-studies.ts`, `services.ts`, and
`testimonials.ts` are never imported by `data.ts` or by any client component for exactly
this reason: all four carry long-form copy, and routing them through a module `navbar.tsx`
or `hero.tsx` imports would ship every word of every product, service, or case study page
into the client bundle site-wide. `services.ts` also imports `CaseStudy` and `Product` with
`import type` only, so referencing a related case study or product by slug (for
`/services/[slug]`'s proof section) adds zero runtime edge between the three content
modules — the actual objects are resolved at render time inside `service-document.tsx`,
the same way `case-study-document.tsx` resolves `relatedProductSlugs`. All product, case
study, and service section components are server components; only
`VideoPlayer` and `ContactForm` are client islands.

### Design tokens

Defined once in `src/app/globals.css` as CSS custom properties on `:root`, then exposed to
Tailwind through `@theme inline`. Colors, the two font families, and exactly three radius
tiers (`--radius-input` 8px, `--radius-card` 20px, pill). `MASTER.md` treats the brand
palette and type pairing as frozen and client-specified.

**2026-09-14 redesign — additive, not a replacement.** The client approved extending the
frozen tokens rather than replacing them, after the built pages read as flat and templated
(one surface value everywhere, centered pill-badge openers, a single uniform fade
animation). Added, on top of the still-frozen ground/accent/type pairing:

- An elevation ladder: `--surface-raised` (`#131C2B`) and `--panel` (`#1A2435`, the
  brightest step), plus `--edge-light`/`--shadow-panel` for a genuinely lit instrument
  surface (inner top-edge highlight, ground-tinted shadow, never an outer glow). `--panel`
  is scarce by design — reserved for the `Console` signature component and nothing else,
  capped at roughly five surfaces sitewide. Applied via the `.panel-lit` utility.
- JetBrains Mono as a third type role (`--font-mono`, `next/font/google`), for data,
  timestamps, identifiers, console chrome, and the uppercase micro-labels that replaced the
  pill-badge eyebrow.
- Three named motion entrances (`Rise`, `Sweep`, `Settle` in `src/components/shared/motion.tsx`)
  alongside the original `FadeIn`/`Stagger`, using spring physics instead of one uniform ease.
  `FadeIn` still exists and is still used where a plain fade is correct; the three new ones
  are not a replacement, they add range.

All of this is recorded as client-authorized amendments directly in `design-system/MASTER.md`
§2–§5, dated, so the doc and the shipped site do not disagree. `PageHero`/`CTABlock` were
replaced by `PageOpener`/`ClosingBand` (asymmetric, mono meta rail, no dot-grid backdrop) and
a new `SectionOpener` gives every section heading on the site one shared hierarchy; the old
components are deleted, not kept as unused fallbacks. The signature component is
`src/components/shared/console.tsx` — reused, not duplicated, wherever `ProofEntry[]` data
already existed (`src/lib/proof.ts`): case study detail pages and full-offer product pages'
step-07 credentials section. The home page hero (`src/components/sections/hero.tsx`) kept its
background exactly as it was (video sequencer, scrims, noise, reveal timing) at the client's
explicit instruction; only its foreground (type scale, button press states) changed, and the
looping "Scroll to explore" cue was removed — it was already a standing violation of MASTER's
own "no scroll cue" and "no infinite loops" rules, so removing it resolved a contradiction
rather than creating one.

**Playwright gotcha found during this pass**: the hero's reveal is driven by a real
`video.ended` listener plus a 2600 ms backstop timer, not by `whileInView`. Playwright's
`reduced_motion="reduce"` context option makes Framer Motion's `useReducedMotion()` report
`true` on the *first* render but the hero's motion elements can end up stuck holding their
`initial` (hidden) inline styles rather than resolving to the reduced-motion static path —
a screenshot taken under `reduced_motion="reduce"` will show an empty hero even though real
browsers render it correctly. Conversely, omitting `reduced_motion` means every *other*
section's `whileInView` reveals may not resolve during a headless full-page capture. There is
no single flag that gets both right: screenshot the hero on its own without `reduced_motion`
(plus a ~3.5s wait for the backstop), and screenshot everything else with `reduced_motion="reduce"`.

### 2026-09-15 — type scale-up, de-centering, de-carding

> **Superseded in part** by "equal gutters, drop the measure caps" below, from the same day:
> the `.measure`/`.measure-display` system this entry introduces was itself replaced a few hours
> later once it turned out to reintroduce an asymmetric gap in a different form. Left as-is here
> as the real history of how the site arrived at its current shell; read the later entry for
> what's actually shipped.

The client's own read of the shipped site: fonts read too small, sections looked "forced to
center" with headlines wrapping early even when most of the row sat empty, and nearly
everything on the site (the course/services grid especially) was boxed in a
`rounded-card border` container regardless of whether elevation carried any real hierarchy.
All three turned out to be the same root cause repeated at different layers, not three
unrelated complaints:

- **Type was capped low at the token layer.** Tailwind's stock scale bottoms out at 12px/14px,
  and the site had drifted into `text-sm` for card copy and `text-xs` for anything secondary;
  body never exceeded 16px. Fixed once at the source: `globals.css`'s `@theme inline` block now
  remaps `--text-xs` through `--text-5xl` to a taller scale (13px floor, 17px body, 19px lead
  copy), so every existing `text-*` class site-wide moved with it rather than needing ~200
  individual class edits. Values stay in `rem` so `:root[data-a11y-text]`'s text-size control
  still scales them correctly.
- **"Forced to center" was `SectionOpener` capping every heading at `max-w-2xl` (672px) and
  every description at `max-w-xl` (576px) inside a 1280px `Container`** — on a laptop, roughly
  600px of the row sat empty while the headline wrapped to three lines. Several sections
  (`Principles`, `Testimonials`, `Process`, product `benefits`/`solution`) additionally forced
  `align="center"` or `text-center` on top of that. Fixed by widening `SectionOpener`'s caps to
  new shared measure utilities (`.measure`, `.measure-display`, etc. in `globals.css`) and
  removing every centered section that was not a deliberate composition choice (a standalone
  quote, the 404 page are the two remaining exceptions).
- **De-carding.** The worst offender was `/services`: six visually identical bordered cards in
  a 3-column grid, an explicit violation of `design-system/MASTER.md` §4 ("three equal cards
  in a row" is banned) that the doc had stated since 2026-09-14 without the code ever
  following it. Replaced with a numbered editorial list (`ServiceRow`, in
  `src/components/shared/service-row.tsx`, retired `ServiceCard`) whose photography alternates
  side per row. `Testimonials`/`QuoteBlock` dropped their `panel-lit` card treatment for an
  unboxed pull-quote plus hairline-divided secondary quotes; the contact form came out of its
  bordered panel onto the section ground; `fascinations.tsx` lost a redundant card wrapper
  around a grid that already draws its own hairlines via a `gap-px`/`bg-border` seam.
  `MASTER.md` §4 now names the three containment modes explicitly (bare / hairline group /
  card) and requires no two consecutive sections share one, rather than only listing banned
  patterns after the fact.

**`src/components/sections/hero.tsx` was explicitly excluded** at the client's instruction and
was not restyled; it still shifts slightly in body-text size because the token remap is global,
which is expected. `src/components/product/sections/hero.tsx` (the product-page hero, a
`text-center` offender in its own right) was flagged as out of scope pending confirmation and
was not touched either.

### 2026-09-15 — equal gutters: dropped `Container`'s width cap and the `.measure*` system

The type/de-centering pass above fixed headlines wrapping early inside a too-narrow column by
capping section content at a `.measure*` width. That traded one defect for another: a capped
block is left-aligned inside its row by default, so the *leftover* space all collects on the
right. The client marked this up directly on `/products/voice-agent` — a screenshot with the left
gap traced at roughly a third the width of the right gap — and gave one concrete instruction:
left inset must equal right inset, on every section, with the navbar as the reference.

**Root cause was two layers, not one.** `Container` (`src/components/shared/container.tsx`) was
already symmetric (`mx-auto max-w-[1280px] px-gutter`), but `navbar.tsx` deliberately opts out of
`Container` and runs full-width with its own `.px-gutter` — so on any viewport wider than 1280px
the navbar's edges and every section's edges never lined up in the first place. Layered on top,
the `.measure*` caps this same day's earlier pass introduced then stopped each block short of the
container's own right edge. Measured on the client's ~1512px viewport: a `.measure`-capped
paragraph left a 196px left gap against a 612px right gap — 3.1x.

**Fix: one gutter rule, shared.** `Container`'s default branch dropped `mx-auto max-w-[1280px]`
entirely and is now just `w-full px-gutter` — the exact rule the navbar already used, so the two
lock together at every width without either needing to reference the other. `.px-gutter` itself
(in `globals.css`) gained two wider steps (`6rem` at 1536px, `8rem` at 1920px) so an uncapped
shell doesn't run edge-to-edge on an ultrawide monitor; because both the navbar and `Container`
read the same custom property, they stay aligned at those widths too rather than needing a second
synchronized change.

**Every `.measure*` cap that was the sole occupant of its row came off** — `SectionOpener` (the
shared heading component, so this was the highest-leverage single fix), and the product-page
narrative sections (`solution.tsx`, `problem.tsx`, `offer.tsx`, `benefits.tsx`, `postscript.tsx`,
`credentials.tsx`'s no-proof-log fallback), `page-opener.tsx`, and `case-study-document.tsx`. A
cap staying *inside* a grid/flex column that already fills the row (a bento tile, a footer
column, a form panel) causes no asymmetry and was left alone — removing those would only have
stretched text inside an already-correct layout, so `capabilities.tsx`, `footer.tsx`,
`contact-form.tsx`, `contact/page.tsx`, and `closing-band.tsx` are unchanged.

**Flex items don't wrap without an explicit width — the fix's one real gotcha.** Removing a
`.measure` class is only safe where the parent already stretches its children to full width by
default (a `flex-col` container with no `items-*` override, or a CSS grid track — both true for
most of the sections above). Inside a `flex-row` competing with a sibling — `SectionOpener`'s
heading beside its optional `meta` rail, `page-opener.tsx`'s description beside its CTA button —
a bare flex item with no width hint sizes to its content and does not wrap at all, which would
have overflowed rather than filled. Those two got `min-w-0 flex-1` instead of a plain class
removal: `flex-1` grows to fill the row (or the space beside the sibling), `min-w-0` overrides
flexbox's default `min-width: auto`, which is what actually blocks wrapping.

**Multi-paragraph prose runs in CSS columns, not one long line.** Once a block was no longer
capped, a 2-3 paragraph narrative (the product pages' `problem`/`solution`/`offer` sections,
`postscript`, and a case study's "Challenge" section) would have run each paragraph the full row
width — filled, but an unreadable ~120-character line. `columns-1 sm:columns-2 gap-x-10` on the
wrapper plus `break-inside-avoid-column` on each `<p>` lets paragraphs sit side by side instead,
filling the row while keeping each column at a normal reading measure. This only applies where
the data is genuinely an array of 2+ paragraphs; a single long paragraph (`offer.godfatherOffer
.body`, `credentials.intro`) was left to fill the row directly rather than have CSS columns split
one paragraph's text mid-sentence across two columns — a judgment call, not something the client
asked for directly, flagged here in case a genuinely wide single-paragraph line reads badly enough
to revisit.

`design-system/MASTER.md` §4's "Reading measure" section was rewritten to document this rule
directly (one gutter, content fills the row, multi-paragraph blocks use CSS columns) rather than
the `.measure*` utility table it replaced.

### 2026-09-15 — dropped the numbered meta badge, tightened section spacing, added missing breaks

Three more client corrections on top of the two passes above, from a hand-annotated screenshot of
the home page's Capabilities section.

**The numbered `{ value, label }` badge (e.g. `06` / "capabilities, one studio") is gone.**
`SectionOpener` and `PageOpener` both used to float this to the right of their heading — the
client flagged it as a stray badge, not a considered element. Both components had the `meta` prop
removed entirely (not just hidden), and the five call sites that passed one
(`capabilities.tsx`, home `case-studies.tsx`, and the `/products`, `/case-studies`, `/services`
page openers) had that prop dropped. `SectionOpener` simplified further as a result: with no `meta`
sibling to compete with, the heading no longer needs the `flex justify-between` row or its
`min-w-0 flex-1` — it's back to being the sole child of a `flex-col`, which stretches it to full
width by default. `PageOpener` lost the two-column grid the meta rail justified, for the same
reason.

**Section spacing (`Section`'s `space` steps in `container.tsx`) dropped by `1rem` at every
breakpoint** — `sm`/`md`/`lg` are now `py-16 sm:py-20` / `py-20 sm:py-28` / `py-28 sm:py-32
lg:py-40`, down from `py-20 sm:py-24` / `py-24 sm:py-32` / `py-32 sm:py-40 lg:py-48`. The type
scale-up from the first pass already gave sections generous room; stacked with the original
spacing scale it read as too much dead air between sections.

**Two section pairs had no visual break at all.** Alternating `bg-background` /
`bg-background-secondary` down the page is not itself a divider — it only reads as one where the
color actually changes between consecutive sections. On the home page, `Capabilities` and
`CaseStudies` both sit on `bg-background` back to back, and `Testimonials` and `Approach` both sit
on `bg-background-secondary` back to back, so each pair ran together with zero seam. Gave the
second section in each pair a `border-t border-border` (matching the pattern already used
everywhere else on the site, e.g. `ContactSection`, `Process`). Sections that already alternate
background color were left alone — the color shift is already the break.

`design-system/MASTER.md` §4 and §9 gained explicit rules for both: no numbered meta badge on a
heading, and same-background adjacent sections need a `border-t`.

### 2026-09-16 — `/products` card art for all four products, and highlighted bonuses

The client generated illustrative poster art (via GPT image generation, prompted from a brief this
session wrote) for all four `/products` index cards and both `/case-studies` cards, landing in a
`posters/` folder at the repo root as PNGs; each was converted to an optimized JPG under
`public/images/` and wired in as `Product.cardImage` / `CaseStudy.poster`.

**`Product` gained a `cardImage` field, deliberately separate from a video product's own poster
frame.** `offer.solution.media`'s poster is a real screenshot of a real recorded video and must
stay one — swapping it for illustrative art would mean the frozen frame shown before pressing play
no longer matches the real footage underneath it. `cardImage` is index-card-only art with no such
claim attached to it, so generated art is fine there. `ProductSummaryCard` prefers `cardImage` when
present, falling back to the video poster, falling back to a plain text card.

**Two rounds of layout fixes followed, both client-caught from screenshots, not testing:**

1. The poster's own baked-in headline was getting cropped. Every card used `object-cover`, which
   crops whatever doesn't fit a tile's aspect ratio — fine for a plain screenshot, but these
   posters carry their own composed headline text, and the card was *also* overlaying its own
   separate name/description on top (two competing headlines to begin with). Switched to
   `object-contain` (never crops) and dropped the redundant overlay text entirely, since the
   poster already carries the headline and label; added a permanently visible "See The Offer"
   pill and an `aria-label` on the card link so the accessible name isn't lost along with the
   visual text.
2. The invoice system's card (a full-width row spanning all three grid columns) still looked
   wrong after that: `object-contain` inside a very wide, short box centers the image small,
   leaving two-thirds of the row empty and dark. Gave that one specific slot ( `size="banner"`) a
   dedicated split layout instead — real text (icon, name, description, CTA) on the left, the
   poster `object-contain` on the right — side by side only from `sm` up; below that it stacks
   like every other card. This retired the old `"wide"` size entirely (a short full-width row that
   only ever existed for the invoice system back when it had no art, just text and a decorative
   glyph) along with its now-dead `WideCardThumbnail`/`ProcessGlyph` helpers.

**Bonuses got a highlighted card treatment.** `ProductOfferPanel`
([offer.tsx](src/components/product/sections/offer.tsx)) deliberately keeps its offer sequence
free of bordered boxes — five boxed panels in a row reads as UI chrome, not one written argument —
with the price-reveal panel as the sole earlier exception (the page's climactic "here's what this
costs" beat). The client flagged the bonus grid as "just sitting in a container and can be easily
ignored": as bare list items, real unpriced extra value (e.g. the free 3D property website
template bundled with either AI agent) read as filler rather than the incentive it's meant to be.
Bonuses are now the section's second deliberate exception — an accent-tinted gradient card per
bonus, with a "See it in action" affordance. This also surfaced a real gap: `bonus.href` (e.g. the
3D template bonus linking to its own product page) was defined in the data model but never
rendered anywhere; a bonus with an `href` is now a full stretched link to it.

### 2026-09-16 — SEO metadata pass, footer socials, testimonial content update, root asset cleanup

**An optional `seo?: { title?: string; description?: string }` field was added to `Service`,
`Product`, and `CaseStudy`.** It overrides only the `<title>`/meta description built by each
route's metadata function (`serviceMetadata`, `productMetadata`, `caseStudyMetadata`) — the
visible H1, nav labels, and card copy never change. It exists for the gap between what a page
is *named* on-site and what buyers actually type into a search box (researched via Google/Bing
autocomplete and live SERP inspection, no paid tool): e.g. Voice Agent's product page stays
named "AI Voice Agent for Real Estate" everywhere visible, but its `<title>` reads "AI
Receptionist For Real Estate Agents" because that is the term real buyers search, backed by a
named, beatable competitor set. Left unset on the majority of entities — `seo` is a targeted
override, not a field every entity needs. Two visible-copy moves rode along with the same
research: Voice Agent's hero subtext and benefits heading now say "AI receptionist" in body
copy too (not just the `<title>`), and Web Applications / UI/UX Design each gained an optional
`costFactors` block (`ServiceDetail.costFactors`) — four qualitative factors plus a note that
pricing is quoted after a scoping call, answering the real "what does this cost" search intent
without publishing a number for a business that only sells custom-scoped work.

**Footer gained Facebook and YouTube links**, `siteConfig.social.facebook` /
`siteConfig.social.instagram` /`.youtube` alongside the existing LinkedIn/X/Instagram entries in
`data.ts`, each rendered from `footer.tsx`'s `socials` array (icon, label, href — no new
mechanism, just two more entries and two more `lucide-react` icons).

**Javed Akhter's testimonial was rewritten**, not just re-approved: the original quote only
praised the Purafall website, but Dragmo Labs also built Purafall's invoicing system by then, so
the approved wording now credits both ("The invoicing system DragmoLabs built has taken the
manual work out of our billing, and the website gives us the premium brand presence we wanted
too."). Still routes through the same `status: "approved"` gate described below — a content
edit, not a new field.

**Root-level raw asset sources were deleted once their processed versions were confirmed
shipped.** `posters/` (7 raw PNGs already converted to `public/images/*.jpg` card art) and the
three raw demo recordings in `Projects/` (`DragVo.mp4`, `DragW.mp4`, `Khatri Real Estate 3D
Website.mp4`, already transcoded to `public/videos/*-demo.mp4`) were removed, along with two
loose root-level files from an abandoned hero-video exploration (`new hero video.mp4`,
`new-hero-design.png`, superseded by `public/videos/hero-cinematic*.mp4`). None of these were
tracked in git, so this is a one-time, deliberate cleanup, not a reversible one — kept:
`Projects/DragW-context.md` (the WhatsApp system's own engineering notes, the real source
`proof.ts`'s entries are drawn from) and `Projects/17-Step-Selling-System.pdf` (cited directly
in `products.ts`'s own doc comment), plus all of `source-assets/` (the documented PNG-master
intake point for `scripts/generate-images.mjs`, referenced in that script and in `images.ts`
itself — not scratch space).

---

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

## 9. Adding a product, case study, service, or testimonial

**A product** (`src/lib/products.ts`) is a `ProductOffer` discriminated union encoding
Sabri Suby's 17-Step Secret Selling System directly in the type: a missing step is a
compile error, and the six fascination bullets in step 04 are a fixed-length tuple, so a
seventh is a compile error too. See `design-system/pages/product.md` for how the 17 steps
map onto 10 layout sections without repeating a layout family, and for the honest resolution
of every step that would otherwise call for an invented number (7, 9, 12, 13, 14, 15).

1. Add a `Product` object to `products.ts`. Every claim needs a real source: a named client,
   a recorded demo, or a verified fix added to `src/lib/proof.ts`. Nothing here should ever
   need to invent a statistic; if a step feels like it needs one, reread
   `design-system/pages/product.md` section 4 for how the existing four products solved it.
2. `"full-offer"` products render through `src/components/product/sales-page.tsx` (all 10
   sections); `"showcase"` products (no proof log, no price to reveal) render through
   `showcase-page.tsx` (7 sections, steps 07 to 13 skipped). Both are already wired into
   `src/app/products/[slug]/page.tsx` by the `offer.kind` discriminant. No route file to add.
3. Add the product to the bento grid on `src/app/products/page.tsx` and give it an entry in
   `interestOptions` (`src/lib/contact-schema.ts`) so the lead email names it correctly.
4. If it has a demo video: transcode with the same `ffmpeg` settings as the existing three
   (`public/videos/*-demo.mp4`, `scale=1280:-2`, `crf 28`, `+faststart`, mono 96k audio for a
   call recording), extract a poster frame, and set `solution.media` to `{ kind: "video", ... }`.
   With no footage yet, use `{ kind: "process", steps: [...] }`, a labeled sequence, not a
   fabricated screenshot — see the AI Invoice System for the precedent. `src/lib/images.ts`
   is generated; posters live inline in the product's own `media` object instead.

**A case study** (`src/lib/case-studies.ts`) has no `metrics` field on purpose (see
`design-system/pages/product.md` §4). Add a `CaseStudy` object — including a short, real
`tags: string[]` (2-3 words each, e.g. `["WhatsApp Agent", "Voice Agent", "Real Estate"]`;
these power the card chips and must describe the actual work, never an invented category) —
and, if it shares any verified fixes with a product's step 07, point both at the same array
in `proof.ts` rather than duplicating the entries. Leave `poster` unset until a real image
exists (see the addendum below); `CaseStudyCard` renders a deliberate placeholder in the
meantime. `src/app/case-studies/[slug]/page.tsx` needs no edit; the route is generated from
`caseStudies`. It also appears automatically in the nav's Case Studies dropdown — see
`src/lib/nav.ts` — and on the home page's proof section and the `/case-studies` index, both
of which map over `caseStudies` directly.

**A service** (`src/lib/services.ts`) is a `Service` with a nested `detail: ServiceDetail`
carrying the full `/services/[slug]` editorial page: an eyebrow, headline, and lede for the
bespoke hero; exactly three `signals` (a recognizable business situation plus its plain-language
cost, never a number); exactly four `deliverables`; an `engagement` block of two paragraphs
plus exactly three named stages; an optional `proof` of one or two `ProofRef`s pointing at a
real case study or product by slug; and a `closing` block choosing between the site's two
standing CTA labels (`CTA_LABEL` or `STRATEGY_CALL_CTA`). See `design-system/pages/service.md`
for the six-section layout map and why it is an editorial page, not a 17-step sales page.

1. Add a `Service` object to `services.ts`. `proof` is `null` whenever no real client work
   backs the capability — never point a `ProofRef` at a case study or product that did not
   actually involve this work. `image` (the generated pipeline) and `poster` (hand-supplied,
   mirrors `CaseStudy.poster`) are both optional and `poster` wins if both are set; a
   service with neither gets a designed photo-less hero (a hairline rail of `tags` instead
   of imagery), not a broken layout. `ai-consultation` originally shipped this way and now
   carries a hand-supplied `poster` instead — see `design-system/pages/service.md` §3 for
   the fallback itself.
2. No route file to add; `src/app/services/[slug]/page.tsx` is generated from `services`.
   It appears automatically in the nav's Services dropdown (`src/lib/nav.ts`), the footer's
   Services column, `ServiceRow`'s default link on `/services`, and the sitemap, all of which
   map over `services` directly.
3. Give it an entry in `interestOptions` (`src/lib/contact-schema.ts`) so the contact form's
   dropdown, and the lead email it produces, name it correctly.

**A testimonial** (`src/lib/testimonials.ts`) always starts `status:
"draft-pending-signoff"`. It renders nowhere, on any page, until the named person has
approved their own wording and it is flipped to `"approved"` — every render path reads
`approvedTestimonials`, never the raw array. The moment the first one is ever approved (or
the last one is revoked), `testimonialsLink` changes and the footer entry follows
automatically; there is nothing else to wire up.

### 2026-09-16 — `/services/[slug]` editorial pages, Digital Transformation retired, AI Consultation added

Every service on `/services` previously linked nowhere real: `ServiceRow` defaulted to
`href="/contact"`, and the nav dropdown, footer, and home `Capabilities` tiles all pointed at
`/services` or a `#slug` fragment. Six detail pages now exist, one per service, each an
editorial capability page (what it is, when you need it, what you get, how the engagement
runs, proof where any real client work backs it) rather than a sales page — that mechanism
stays on `/products/[slug]`.

**Digital Transformation was removed and AI Consultation added**, both client decisions made
before drafting copy. Digital Transformation was the one service with no photography and no
defensible proof reference; AI Consultation fills the last slot instead, positioned
deliberately as assessment-only (an audit and a prioritized roadmap) and never promising
implementation, so it does not cannibalize AI Solutions (building a new capability) or AI
Automation (connecting what you already run). `interestOptions` in `contact-schema.ts` was
updated to match. `Service.icon` dropped `"rocket"` for `"briefcase"`; the `span` field was
deleted outright since its only reader, a filter in `capabilities.tsx`, was already
behaviour-identical to a plain `.slice(0, 3)` once Digital Transformation was gone.

**`CaseStudy["slug"]` narrowed from `string` to a literal union** (`"khatri-real-estate" |
"purafall"`, matching `Product["slug"]`'s existing pattern), so a typo in a service's
`ProofRef` is a compile error instead of a silently empty proof section. Touched
`case-studies.ts`'s type, `caseStudiesBySlug`, and `getCaseStudy`, plus two lookups in
`case-studies/[slug]/page.tsx`.

**`ProductSummaryCard` gained an optional `location` prop** (default: `LOCATIONS.productsIndex`,
its old hardcoded value), so a product card rendered inside a service page's proof section
reports `LOCATIONS.serviceProof` in GA instead of silently misattributing the click to the
products index. `CaseStudyCard` already had this.

Verified after the fact the same way the 2026-09-15 nav-dropdown bundle check did: grepped
the built `.next/static/chunks/*.js` for distinctive phrases from `services.ts`'s
`engagement.paragraphs` and `deliverables[n].body` fields, zero matches, confirming
`footer.tsx` and `nav.ts` importing `services` never ships the six pages' copy client-side.

**AI Consultation later got a hand-supplied hero image**, closing its photo-less gap. `Service`
gained an optional `poster: { src, alt }` field, mirroring `CaseStudy.poster` rather than routing
through `image: ImageId` — that field only addresses the generated pipeline's manifest
(`scripts/generate-images.mjs`), and this artwork was supplied directly as a PNG in `posters/`,
the same intake point the `/products` and `/case-studies` card art used on 2026-09-16 above. The
PNG master is kept at `source-assets/ai-consultation.png`; the served asset is a `ffmpeg`-encoded
JPEG at `public/images/ai-consultation-card.jpg` (180 KB, matching the other hand-supplied card
images' size range). `ServiceHero` and `ServiceRow` both resolve `photo` as `service.poster ??
(service.image && images[service.image])`, so `poster` wins if a service ever carries both. The
photo-less fallback (a hairline rail of `tags`) is still live code — no service demonstrates it
today, but the branch stays for the next service that ships without art.

**The navbar also changed the same day**: the desktop "Get in Touch" button switched from the
outlined `secondary` button variant to `primary` (solid `bg-accent` blue, matching the mobile
menu's CTA, which already used the default), and `buildSiteMenu()` reordered its top-level items
to Home, Services, Products, Case Studies — Services moving from last to second, right after Home.

### 2026-09-15 — nav dropdowns, home page proof, testimonials folded into home

Modeled on a reference site the client pointed to (zafrelodesign.ae): hovering a nav item
with real destinations behind it (Products, Case Studies, Services) opens a panel listing
them by name, so a visitor jumps straight to the one they want instead of always landing on
an index page first — meaningful here because the index pages hold only two or three real
entries, not enough to earn a click-through-then-choose flow. The home page also gained the
two sections it never had: `CaseStudies` (full-bleed media cards) and `Testimonials` (the
featured-quote-plus-grid layout `/testimonials` used to own), landing between `Capabilities`
and `Approach`. A visitor who only ever sees `/` previously saw zero proof that anything had
shipped for anyone.

**Server/client bundle boundary.** `navbar.tsx` is a client component. The dropdown menus need
`products.ts` and `case-studies.ts` data (names and slugs), but those files also carry every
product's full 17-step sales copy — importing either into `navbar.tsx` directly would ship all
of that into the client bundle for a menu that only needs two fields per item. The fix is
`src/lib/nav.ts`, a server-only module whose `buildSiteMenu()` is called once in `layout.tsx`
(a server component) and passed down as a plain, serializable `NavLink[]` prop. Verified after
the fact by grepping the built `.next/static/chunks/*.js` for distinctive product-copy strings
(`SixFascinations`, model names, "17-Step") and confirming zero matches.

**A bare `<li>` outside a `<ul>` still gets a bullet.** The original nav rendered plain
`<Link>`s directly inside a flex `<nav>`, no list markup at all. The first draft of the
dropdown wrapped each menu item needing a panel in an `<li>` for semantic correctness — but
mixed with the plain-link items (which stayed bare anchors, no `<li>`), this left orphan
`<li>` elements with no parent `<ul>`/`<ol>`. Chromium's UA stylesheet still renders those
with `display: list-item`, i.e. a bullet marker, even with no list ancestor — visible as a
stray `•` in front of every dropdown-bearing label and nothing in front of the plain ones.
Caught only by looking at an actual screenshot, not by lint or type-check. Fixed by using a
plain `<div>` for the dropdown wrapper instead, matching the plain items' bare-anchor pattern
rather than introducing list semantics the rest of the nav does not use.

**`/testimonials` is now a redirect, not a route.** Deleted in favor of a `#testimonials`
section on the home page (and repeated at the bottom of `/case-studies`, mirroring how the
reference site closes its own case-studies index on a testimonial slider). The route was real
and sitemapped, so `next.config.ts` carries a permanent redirect to `/#testimonials` rather
than letting the old URL 404. `testimonialsLink` in `testimonials.ts` now points there too,
so the footer's conditional entry needed no other change.

**Case study card artwork is a placeholder pending client-provided images.** `CaseStudy` grew
an optional `poster: { src, alt }` field, deliberately left unset on both existing studies.
Neither has a bespoke photo or screenshot yet — the client is generating them separately (via
kie) to drop in later. `CaseStudyCard` renders a `bg-grid` panel with a faint `ImageIcon` when
`poster` is absent, the same fallback treatment `CaseStudyDocument`'s hero already used for a
study with no backdrop, so an un-imaged card still reads as intentional rather than broken.

---

## 10. Adding a policy page

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

## 11. Known gaps and highest-leverage next steps

1. **Two of three testimonials are still awaiting client sign-off.** `MASTER.md` section 8's
   "no social proof" gap is now substantially closed: `/products`, `/case-studies`, and
   `/testimonials` carry two named clients (Khatri Real Estate, Purafall), five verified
   engineering incidents, and one approved quote. `testimonials.ts` holds two more, drafted
   by the studio in each client's own voice, marked `"draft-pending-signoff"` until Haseeb
   and Waseem approve their exact wording. Waseem's own deliverable is not yet identified
   either, so his quote carries no `productSlugs` or `caseStudySlug` until it is.
2. **The AI Invoice System's step 06 has no real product footage.** No screenshots exist for
   it anywhere on disk (checked, see `src/lib/products.ts`), so its "solution" step renders
   as a labeled process sequence (upload, extract, verify, sync) rather than a demo video or
   a fabricated screenshot. Real UI stills would strengthen it once available.
3. **The 3D Property Website has no backend.** Its own project note records every CTA as an
   inert placeholder and the demo video shows a placeholder phone number and sample
   listings. Its product page is written to say so plainly rather than implying a live
   deployment.
4. **Rate limiting is per-instance.** See 4.4. Swap in `@upstash/ratelimit` for durable,
   global limiting when traffic justifies it.
5. **Turnstile loads on the home page.** Deferring it until the form is focused would drop a
   third-party request and roughly 54 console messages from every home page visit.
6. **No automated test suite.** Verification is currently lint, typecheck, production build,
   and manual browser checks. Playwright would be the natural fit given the checks already
   being run by hand.

---

## 12. Analytics (Google Analytics 4)

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
