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

**Theme lock:** dark, whole site. No section inverts.

---

## 4. Layout rules

- **No two sections share a layout family.** Home uses: full-bleed media / asymmetric bento / editorial offset split / typographic index / form split.
- **Banned:** three equal cards in a row; a second card-grid repeating the first; more than 2 consecutive image+text splits.
- **Eyebrows: max `ceil(sections / 3)` per page.** Hero counts as one. Home ships 1.
- **Bento:** cell count equals content count. At least 2–3 cells carry real visual variation (photograph, tint, pattern) — never all text-on-surface.
- **Cards only when elevation carries real hierarchy.** Otherwise group with hairlines and negative space.
- **Vertical rhythm varies.** Do not repeat one `py-` value down the page.
- **Hero:** max 4 text elements, headline ≤ 2 lines, subtext ≤ 20 words, `pt` ≤ 24, CTA visible without scroll. No scroll cue.

---

## 5. Motion

`MOTION_INTENSITY 5` — present but restrained. Every animation must justify itself as hierarchy, storytelling, feedback, or state transition.

- Animate **`transform` and `opacity` only**. Never `width`, `height`, `top`, `left`.
- **Never `transition-all`.** List properties explicitly.
- Hover transitions **150–300 ms**.
- `prefers-reduced-motion` collapses everything, including SVG SMIL and stagger timing.
- No infinite loops, no decorative pulsing dots, no parallax.

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
- [ ] Zero `transition-all`
- [ ] No two sections share a layout family
- [ ] Icons from one family (Lucide), no emoji as icons
- [ ] `cursor-pointer` on every clickable element
- [ ] Hover transitions 150–300 ms
- [ ] Text contrast ≥ 4.5:1; large text ≥ 3:1
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected everywhere
- [ ] Responsive verified at 375 / 768 / 1024 / 1440
- [ ] LCP < 2.5 s · CLS < 0.1 · INP < 200 ms
