# Product Pages — Design Override

Applies to `/products`, `/products/[slug]`, `/case-studies`, `/case-studies/[slug]`,
and `/testimonials`. Overrides `design-system/MASTER.md` only where stated below;
everything else in MASTER still applies in full.

---

## 1. Why this file exists

Product pages are structured on Sabri Suby's 17-Step Secret Selling System
(`Projects/17-Step-Selling-System.pdf`). MASTER §4 forbids two sections on a page
sharing a layout family, and bans three-equal-card rows, a repeated card grid, and
more than two consecutive image+text splits. There are not 17 distinct layout
families, and inventing that many would produce exactly the templated sameness §4
exists to prevent.

**17 steps map to 10 sections at a varying ratio. Do not split a section to gain
one back.** Nothing is dropped; the selling system's order is preserved exactly.

---

## 2. The 10-section map (full-offer products: voice agent, WhatsApp agent, AI invoice system)

| # | Section | Steps | Layout family |
|---|---|---|---|
| 1 | Sales hero | 01, 02, 03 | Stacked centered, text-only, one ambient wash |
| 2 | Fascination band | 04 (exactly six) | Staggered statement list, alternating indent, no cards |
| 3 | Agitation | 05 | Narrow editorial measure, `max-w-[62ch]`, left hairline |
| 4 | The reveal | 06 | Framed full-bleed media (video, stills, or a labeled process) |
| 5 | Proof | 07 | Editorial offset split, narrative left, engineering log right |
| 6 | Feature → benefit | 08 | Definition ledger, `<dl>`, hairline rows |
| 7 | Validation | 09 | Attribution panel, centered, quote slot |
| 8 | The offer | 10–15 | Framed offer panel on `background-secondary` |
| 9 | Call to action | 16 | Form split, sticky command column + `ContactForm` |
| 10 | Postscript | 17 | Sign-off band, narrow, tinted, no `h2`, opens "P.S." |

**Showcase products** (today: the 3D Property Website, which has no proof log,
benefit ledger, or price to reveal) use sections 1, 2, 3, 4, 8 (reduced to steps
14 and 15 only), 9, 10. Steps 07 to 13 are skipped rather than padded out.

### Two rule-preserving decisions baked into the map

- **The hero carries only steps 01, 02, 03 plus the CTA** (badge, h1, subtext,
  button: exactly the four elements MASTER §4's hero rule allows). Step 04's six
  fascination bullets are never crammed into the hero; they are their own section
  directly below, sharing the hero's dark background so the two read as one
  visual unit while remaining structurally distinct `<section>`s.
- **Steps 14 and 15 fold into the offer panel** as a footer rail rather than
  taking a section of their own. This is what keeps the count at 10.

### Non-repetition, reasoned through

- Section 2 (fascination band) vs section 6 (definition ledger): section 2 is one
  column, borderless, alternating indent, `text-lg`. Section 6 is two-column,
  hairline-ruled, `<dl>` semantics, `text-sm`. Nothing visually shared.
- Section 6's rows vs the offer panel's value stack: the value stack has **no
  right-hand column**, because there is no price to put beside each line — a
  numbered vertical stack, not a two-column table. Structurally different, not
  just differently worded.
- Section 5 is the only offset-column split on the page; section 9 is the only
  sticky-column split. Section 4 is media-only, so there are never two
  consecutive image+text splits (the MASTER ban is more than two).

---

## 3. Hero subtext length

MASTER §4 caps hero subtext at roughly 20 words. A 17-step long-form sales page's
subtext carries Suby's step 03 "back up your big promise" backing statement,
which needs slightly more room than the site's normal marketing hero. Product
hero subtext may run to one short paragraph (kept to a single clause or two,
never a wall of text) rather than a strict 20-word cap. The step 01 audience
call-out itself stays badge-length, exactly as MASTER expects of an eyebrow.

---

## 4. Content rules, unchanged from MASTER but load-bearing here

- **No invented numbers, anywhere on a product page.** Step 07 (credentials) is
  satisfied with verified engineering incidents from `src/lib/proof.ts`, never a
  percentage. Step 12 (value stack) prices the *work*, not a dollar figure — see
  the `valueStackClose` line on every full-offer product. Step 13 (price reveal)
  states the call is free and explicitly declines to publish a build price,
  rather than printing a guess.
- **Step 14 (scarcity) is honest capacity language, never a countdown.**
- **Step 15 (guarantee) is a privacy and no-pressure promise**, linked to
  `/privacy-policy` so it is checkable, not just asserted.
- A step 11 bonus (the free 3D Property Website template, offered with either
  AI agent) is a real commitment. If it stops being sustainable to fulfil on
  every deal, change the data in `src/lib/products.ts`, do not leave the claim
  live and quietly stop honouring it.

---

## 5. Index pages

Three sections each, no two indexes sharing a middle layout family:

- `/products`: PageHero + **asymmetric four-cell bento** (never a 2×2 of equal
  cards; one large tile, two stacked, one full-width band) + CTABlock.
- `/case-studies`: PageHero + **typographic index** (numbered hairline rows) +
  CTABlock.
- `/testimonials`: PageHero + **quote rail** + CTABlock.

---

## 6. Data, not JSX

The 17 steps live in the `ProductOffer` type in `src/lib/products.ts`, not in
page JSX. A missing step is a compile error; a seventh fascination bullet is a
compile error. `src/lib/products.ts`, `case-studies.ts`, and `testimonials.ts`
must never be imported by `src/lib/data.ts` or by any client component — both are
imported by client components (`navbar.tsx`, `hero.tsx`), and doing so would ship
every word of every long-form sales page in the site-wide JS bundle.
