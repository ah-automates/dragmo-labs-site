# Dragmo Labs — Design System (MASTER)

Single source of truth. Page-specific deviations live in `design-system/pages/<page>.md` and override this file; absent that, these rules apply everywhere.

Reconciled from three skills:

| Skill | Authority |
|---|---|
| `design-taste-frontend` | layout composition, anti-slop, motion restraint |
| `web-design-guidelines` (Vercel) | accessibility, semantics, forms, performance |
| `ui-ux-pro-max` | industry pattern reasoning, style direction, pre-delivery checks |

**Conflict order:** layout/anti-slop → `design-taste-frontend`. a11y/semantics → `web-design-guidelines`. Everything else → `ui-ux-pro-max`.

---

## 1. Design read

*Agency landing for business-owner buyers. Premium dark-tech language. Trust-first, not experimental.*

- **Style direction: "Trust & Authority"** (`ui-ux-pro-max`, matched on *B2B professional services*). Credibility over spectacle: real proof, real metrics, real work. Rated WCAG AAA / performance excellent.
- Rejected: the skill's first match, *"AI-Native UI"* + *"AI Personalization Landing"* — those describe chatbot products and user-segmented personalization, neither of which Dragmo Labs is.

**Dials:** `DESIGN_VARIANCE 8` · `MOTION_INTENSITY 5` · `VISUAL_DENSITY 3`.

---

## 2. Brand tokens — FROZEN

Client-specified. **No skill output may override these.** `ui-ux-pro-max` proposed `#7C3AED` / `#EC4899` ("AI purple + generation pink") — discarded; it is the exact palette both other skills ban, and its own *Trust & Authority* rule lists "AI purple/pink gradients" as an anti-pattern.

| Role | Value |
|---|---|
| Background | `#050608` |
| Background secondary | `#08111F` |
| Accent (primary) | `#1E7BFF` |
| Accent secondary | `#2EA9FF` |
| Glow | `#57D5FF` |
| Text primary | `#FFFFFF` |
| Text secondary | `#AEB7C4` |
| Border | `rgba(255,255,255,0.08)` |

**One accent, whole page.** No second accent family anywhere.

**Elevation ladder — client-authorized addition, 2026-09-14.** The frozen palette above is
extended, not replaced: a site-wide redesign found that one surface value (`--surface`) made every
panel read as the same flat grey box. Three new steps let a surface genuinely read as a lit object
on the dark ground instead.

| Token | Value | Use |
|---|---|---|
| `--surface-raised` | `#131C2B` | A step above `--surface`; general secondary elevation. |
| `--panel` | `#1A2435` | The brightest step — reserved for the "console" instrument surface (`src/components/shared/console.tsx`) and nothing else. |
| `--edge-light` | `rgba(255,255,255,0.10)` | Inner top-edge highlight simulating a lit edge. |
| `--shadow-panel` | `rgba(3,6,14,0.55)` | Ground-tinted shadow. **Never pure black, never an outer glow.** |

`--panel` is scarce by design: MASTER's own card-elevation rule (§4) applies to it doubly — using
it for more than roughly five surfaces sitewide turns the signature element into new card soup.

**Type — FROZEN.** Satoshi (display/headings/buttons/stats), Inter (nav/body/captions). The skill's Space Grotesk + DM Sans suggestion is discarded; the client specified this pairing.

| Element | Family | Weight |
|---|---|---|
| Hero heading | Satoshi | 700–900 |
| Section heading | Satoshi | 700 |
| Buttons | Satoshi | 500–600 |
| Statistics | Satoshi | 700–800 |
| Navigation | Inter | 500 |
| Body | Inter | 400–500 |
| Captions | Inter | 400 |

**Mono — third role, client-authorized addition, 2026-09-14.** JetBrains Mono. Data, numerals,
timestamps, identifiers, console chrome, and the uppercase micro-labels (`text-xs
tracking-[0.18em]`) that replace the pill badge as a section's opener. Never for headings or body
copy — Satoshi and Inter keep those roles exactly as above.

**Type scale — client-authorized rework, 2026-09-15.** The stock Tailwind scale bottomed out at
12px/14px, and the site had drifted into `text-sm` card copy and `text-xs` secondary text with
body never exceeding 16px — cramped next to comparable studio sites. Remapped once at the token
layer (`src/app/globals.css`'s `@theme inline` block) so every `text-*` class site-wide moved with
it, rather than one-off arbitrary values. All values stay in `rem` so the accessibility text-size
control (`:root[data-a11y-text]`) still scales them.

| Token | Size | Role |
|---|---|---|
| `text-xs` | 13px | mono eyebrows, legal micro-copy — the floor; nothing smaller ships |
| `text-sm` | 15px | secondary labels, bylines, dense UI chrome |
| `text-base` | 17px | default body |
| `text-lg` | 19px | lead paragraphs, section descriptions |
| `text-xl` | 21px | `h3` in rows and cards |
| `text-2xl` | 26px | feature `h3` |
| `text-3xl` / `text-4xl` / `text-5xl` | 32px / 40px / 52px | display steps below the heading clamps |

Section headings (`SectionOpener`, `PageOpener`) use a `clamp()` rather than a fixed step; the
current ceiling is `clamp(2.15rem, 4.6vw, 3.5rem)` for a section `h2` and `clamp(2.75rem, 6.2vw,
5rem)` for a page `h1`. The hero `h1` is exempt — it has its own clamp and is not touched by
this rework.

---

## 3. Shape & material

**Radius — exactly three tiers. No fourth.**

| Token | Value | Applies to |
|---|---|---|
| `--radius-input` | `8px` | inputs, selects, tags, small chips |
| `--radius-card` | `20px` | cards, panels, media frames |
| pill | `9999px` | badges and pills only |

**Glow budget: max ~6 per page.** Permitted on: the primary CTA, the hero, one ambient wash per page. **Not** on cards, not on icon tiles, not on list items. Cards express hover with border and background shift only.

**Gradient text: exactly one per page** (the hero `h1`). Every other headline is solid. Emphasis comes from weight and accent color.

**Theme lock:** dark, whole site. No section inverts. **Amended 2026-09-14**: a surface may use
`--panel` (the lit instrument material, above) to read as clearly brighter than the page — depth
via a lit surface is not an inversion. No section may flip to a light/paper background.

---

## 4. Layout rules

- **No two sections share a layout family.** Home uses: full-bleed media / asymmetric bento / editorial offset split / typographic index / form split.
- **Banned:** three equal cards in a row; a second card-grid repeating the first; more than 2 consecutive image+text splits.
- **Eyebrows: max `ceil(sections / 3)` per page.** Hero counts as one. Home ships 1.
- **Bento:** cell count equals content count. At least 2–3 cells carry real visual variation (photograph, tint, pattern) — never all text-on-surface.
- **Cards only when elevation carries real hierarchy.** Otherwise group with hairlines and negative space.
- **Vertical rhythm varies.** Do not repeat one `py-` value down the page.
- **Hero:** max 4 text elements, headline ≤ 2 lines, subtext ≤ 20 words, `pt` ≤ 24, CTA visible without scroll. No scroll cue.

**One gutter, everywhere — client-authorized addition, 2026-09-15, replaces the previous
`.measure*` cap system below.** `Container` no longer centers a fixed-width box; it and the navbar
both rely on `.px-gutter` alone, so a section heading lines up under the logo at any viewport
width, and a section's content fills the row between the gutters. **Left inset always equals
right inset — no exceptions.**

The `.measure*` caps this replaced fixed the *previous* defect (a headline wrapping early inside
a too-narrow column) but created a new one: a cap left a block hugging the left edge of its row
while the leftover space collected entirely on the right. The client measured a 196px left gap
against a 612px right gap on one section. A cap is still fine *inside* a grid or flex column that
itself already fills the row (a bento tile, a footer column, a form panel) — it only causes the
defect when the capped block is the sole occupant of a full-width row.

**Multi-paragraph prose fills with CSS columns, not one long line.** Once a block is no longer
capped, two or more paragraphs stacked in a single column would each run the full row width —
comfortably readable as short UI copy, but too long a line for real prose. Where a block holds
2+ paragraphs, lay them out with `columns-1 sm:columns-2 gap-x-10` on the wrapper and
`break-inside-avoid-column` on each `<p>`, so paragraphs sit side by side and the row fills to
both edges while each column stays at a readable measure. A **single** paragraph or a short
one-or-two-line block (a `SectionOpener` description, a card body) just fills the row directly —
columns on a single short block look broken, not filled. Never apply columns to legal/policy
prose: it breaks scanning and deep links.

**Three containment modes, not one.** Every section is bare (hairlines and negative space only),
a hairline group (a `gap-px`/`bg-border` seam, or `divide-y`), or a card (`rounded-card border`,
reserved for where elevation carries real hierarchy — commissioned photography, the one price
panel on a sales page, the console instrument). **No two consecutive sections use the same mode.**
A card grid of 3+ visually identical cells is the single most common violation of this file's
own rules; if a page needs that many equal-weight items, an editorial list with hairline dividers
(see `src/components/shared/service-row.tsx`) almost always reads better than a card grid.

**Centering is a choice, not a default.** A section's heading and body copy are left-aligned
unless centering is doing real compositional work (a standalone quote, an error page). Centering
a heading over a body of left-aligned prose, or centering because the content is "short," both
read as accidental rather than intentional — pick left-aligned by default.

**No numbered meta badges on headings — client-authorized removal, 2026-09-15.** `SectionOpener`
and `PageOpener` used to carry an optional `{ value, label }` rail (e.g. `06` / "capabilities, one
studio") floated to the right of the heading. The client flagged it as a stray badge sitting off
to the side rather than a considered layout element. Neither component accepts a `meta` prop
anymore — do not reintroduce a count/index badge next to a heading.

**Vertical rhythm was tightened, 2026-09-15.** `Section`'s `space` steps dropped by `1rem` at every
breakpoint (`sm`/`md`/`lg` now `py-16 sm:py-20` / `py-20 sm:py-28` / `py-28 sm:py-32 lg:py-40`) —
client-flagged as too much dead air between sections after the earlier type/gutter passes. Still
vary `space` down the page; do not let every section default to the same step.

**Adjacent sections with the same background need an explicit break.** Alternating
`bg-background`/`bg-background-secondary` down the page is not itself a divider — two consecutive
sections sharing a background with no border between them read as one unbroken block (this is
what the client's "add proper section break between sections" note was catching). Whenever two
sections in sequence share a background, give the second one a `border-t border-border`; skip it
when the background itself already changes, since the color shift is the break.

---

## 5. Motion

`MOTION_INTENSITY 5` — present but restrained. Every animation must justify itself as hierarchy, storytelling, feedback, or state transition.

- Animate **`transform` and `opacity` only**. Never `width`, `height`, `top`, `left`.
- **Never `transition-all`.** List properties explicitly.
- Hover transitions **150–300 ms**.
- `prefers-reduced-motion` collapses everything, including SVG SMIL and stagger timing.
- No infinite loops, no decorative pulsing dots, no parallax.

**Three named entrances — client-authorized addition, 2026-09-14.** Replaces the single uniform
fade-up used everywhere before this date. Still `transform`/`opacity` only, still no loops, still
collapses under reduced motion.

| Name | Use | Motion |
|---|---|---|
| `Rise` | Display openers (hero, page/section headlines) | Spring `y`, `stiffness 100, damping 20` |
| `Sweep` | Console rows and other list/log content | Staggered children, short `x` + opacity |
| `Settle` | Media, panels | `scale(0.98) → scale(1)` + opacity |

Real press feedback (`active:scale-[0.98]`) is required on every interactive element, not optional.

---

## 6. Accessibility floor

- WCAG AA minimum; AAA for hero copy. Contrast audited on every CTA and form control.
- Visible `focus-visible` ring on every interactive element, including mobile menu.
- Semantic HTML first. Heading levels never skip.
- Modal/menu overlays: focus trap, Escape to close, focus returned to trigger.
- Decorative icons `aria-hidden`; icon-only buttons carry `aria-label`.
- Async updates announced via `aria-live="polite"`.
- Form controls: label, `autocomplete`, correct `type` + `inputMode`, inline errors, focus moves to first error in DOM order.

---

## 7. Content rules

- **Zero em-dashes and en-dashes** in visible copy. Rewrite the sentence.
- Curly apostrophes and quotes only.
- **No invented numbers.** No stat ships without a real source.
- One CTA label per intent across the entire site.
- Title Case for headings and buttons. Second person. Active voice.
- Error messages state the fix, not just the problem.
- Real photography. No div-based fake screenshots, no hand-rolled decorative SVG standing in for imagery.

---

## 8. Known gap

*Trust & Authority* calls for prominently displayed credentials, client logos, and case-study metrics, and names "hidden credentials" an anti-pattern. **The site currently has none** — the fake `50+ / 12x / 99.9%` was removed rather than shipped as invented proof.

The proof slot is designed and left empty. Supplying real client names, project outcomes, or testimonials is the single highest-leverage change available to this site.

---

## 9. Pre-delivery checklist

Run before declaring any change done.

- [ ] Zero em-dashes / en-dashes in visible copy
- [ ] Eyebrow count ≤ `ceil(sections / 3)` per page
- [ ] Exactly one gradient headline per page
- [ ] Exactly three corner-radius values in use
- [ ] `--panel` used on no more than ~5 surfaces sitewide
- [ ] Zero `transition-all`
- [ ] No two sections share a layout family
- [ ] No two consecutive sections use the same containment mode (bare / hairline / card)
- [ ] Body copy is 15px or larger; nothing a customer reads ships below `text-xs` (13px)
- [ ] A section's content fills its row — left inset equals right inset, no block is capped
      narrower than its row while sitting alone in it
- [ ] 2+ paragraphs in one block run in CSS columns, not one long single-column line
- [ ] No numbered `{ value, label }` meta badge floated beside a heading
- [ ] Two consecutive sections sharing a background have a `border-t` between them
- [ ] Icons from one family (Lucide), no emoji as icons
- [ ] `cursor-pointer` on every clickable element
- [ ] Hover transitions 150–300 ms
- [ ] Text contrast ≥ 4.5:1; large text ≥ 3:1
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected everywhere
- [ ] Responsive verified at 375 / 768 / 1024 / 1440
- [ ] LCP < 2.5 s · CLS < 0.1 · INP < 200 ms
