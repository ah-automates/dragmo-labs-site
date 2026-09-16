# Service Detail Pages — Design Override

Applies to `/services/[slug]`. Overrides `design-system/MASTER.md` only where
stated below; everything else in MASTER still applies in full.

---

## 1. Why this file exists

`/services/[slug]` is an **editorial capability page**, not a sales page.
There is no offer, no guarantee, no value stack — that mechanism belongs to
`/products/[slug]` (see `design-system/pages/product.md`). A service page
answers one question: what is this capability, when do you need it, what do
you get, how does the engagement run, and what real work backs it up.

---

## 2. The 6-section map (5 when a service has no proof)

| # | Section | `space` | Background | Containment | Layout family | Heading |
|---|---|---|---|---|---|---|
| 1 | `ServiceHero` | bespoke `pb-16 pt-32 sm:pb-20 sm:pt-40` | `background` | bare | asymmetric opener + offset media frame | eyebrow (mono `<p>`) |
| 2 | `ServiceSignals` | `sm` | `background-secondary` | hairline (`divide-y` on a `<ul>`) | full-width ruled index rows | bare `h2` |
| 3 | `ServiceDeliverables` | `lg` | `background` | bare | staggered statement stack, alternating indent, no cards | bare `h2` |
| 4 | `ServiceEngagement` | `md` | `background-secondary` | hairline (`<dl>` in an accent rail) | editorial offset split | bare `h2` |
| 5 | `ServiceProof` | `sm` | `background` | card (1–2 media cards) | full-bleed media cards | `SectionOpener` eyebrow |
| 6 | `ClosingBand` | fixed | `background` | bare | command band | bare `h2` |

Containment sequence: `bare → hairline → bare → hairline → card → bare`. No
adjacent repeat. §2 and §4 both use hairlines but are separated by §3 and
differ in family (a ruled index of equal rows vs. an offset split whose right
column happens to be ruled).

**Eyebrow budget:** 6 sections → `ceil(6/3) = 2`. Spent: hero + `ServiceProof`.
On a `proof: null` page, 5 sections → budget 2, spent 1.

**Vertical rhythm:** bespoke → `sm` → `lg` → `md` → `sm` → `md`. No
consecutive repeat.

**Not used on this template:** gradient headlines (not expressible — the
`ServiceDetail` type has no accent-span field), `Console` / `.panel-lit`
(no per-service machine output, and the ~5-surfaces-sitewide budget is
already spent on case studies and product credentials), `QuoteBlock` (three
testimonials across two clients would repeat or sit empty across six pages
and add a seventh layout family).

---

## 3. Three branches, one template

**Alternating hero media side.** `ServiceHero` places the media frame right
for even-indexed services, left for odd, based on the service's position in
`services` — the same idiom `ServiceRow` uses via `reverse`.

**Photo-less hero.** When `service.image` is undefined, the hero drops to a
single column over the `bg-grid` + radial-mask ground, with `service.tags`
rendered as a hairline rail under the heading block — the fallback
`case-study-document.tsx` and `case-study-card.tsx` already establish.

**No related work.** `ServiceProof` returns `null` when `detail.proof` is
`null`, dropping the page to five sections. This is the honest resolution
when no real client work backs a capability — never stretch a case study or
product onto work it did not actually involve.

---

## 4. Data, not JSX

The `ServiceDetail` type lives in `src/lib/services.ts`, with fixed-length
tuples (`readonly [Signal, Signal, Signal]`, etc.) so a missing or extra
entry is a compile error, mirroring `ProductOffer`'s `SixFascinations`.
`services.ts` imports `CaseStudy` and `Product` with `import type` only, so
it has zero runtime edge to `case-studies.ts` or `products.ts` — a service's
`proof.cases` reference a slug, and the actual object is resolved at render
time inside `service-document.tsx`.

`src/lib/services.ts` must never be imported by `src/lib/data.ts` or by any
client component (`navbar.tsx`, `hero.tsx`) — both would ship every service's
full editorial copy into the site-wide JS bundle for a menu that only needs a
title and a slug. Server modules (`nav.ts`, `footer.tsx`, `capabilities.tsx`,
the index and detail routes) import it directly.
