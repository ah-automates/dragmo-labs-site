---
name: Kinetic Intelligence
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d9e7'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#eeecfb'
  surface-container-high: '#e8e7f6'
  surface-container-highest: '#e2e1f0'
  on-surface: '#1a1b25'
  on-surface-variant: '#444657'
  inverse-surface: '#2f303b'
  inverse-on-surface: '#f0effe'
  outline: '#747689'
  outline-variant: '#c4c5da'
  surface-tint: '#1a41ff'
  primary: '#0029c6'
  on-primary: '#ffffff'
  primary-container: '#0b3bff'
  on-primary-container: '#cbd0ff'
  inverse-primary: '#bbc3ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00408f'
  on-tertiary: '#ffffff'
  tertiary-container: '#0057bc'
  on-tertiary-container: '#c1d3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee0ff'
  primary-fixed-dim: '#bbc3ff'
  on-primary-fixed: '#000e5e'
  on-primary-fixed-variant: '#002bcf'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#fbf8ff'
  on-background: '#1a1b25'
  surface-variant: '#e2e1f0'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 120px
---

## Brand & Style
This design system centers on a **Premium Corporate Minimalist** aesthetic, specifically tailored for an AI-driven digital agency. The brand personality is authoritative yet innovative, balancing the technical precision of artificial intelligence with a human-centric, high-touch consulting feel. 

The visual narrative uses expansive whitespace to signify clarity of thought, while "Deep Blue" accents provide a sense of stability and institutional trust. We draw from **Modern Minimalism** for the core structure and **Glassmorphism** for interactive layers to suggest transparency and the "invisible" power of digital intelligence. The target emotional response is one of confidence, sophistication, and technological edge.

## Colors
The palette is rooted in a "Clean-to-Deep" spectrum.
- **Light Mode Foundation:** The majority of the experience uses `Off-White (#F8FAFC)` for backgrounds and `White (#FFFFFF)` for card surfaces to maintain a breathable, premium feel.
- **Dynamic Accents:** `Deep Blue (#0B3BFF)` is reserved for primary actions and core branding. `Electric Blue (#3B82F6)` is used for data visualizations, active states, and highlights.
- **Structural Contrast:** `Dark Navy (#0F172A)` is employed for high-impact sections (like footers or feature spotlights) to provide grounding and a sense of "prestige" night-mode aesthetics within a light-mode framework.
- **Subtle Borders:** All structural lines use `Light Border (#E2E8F0)` at low opacity to maintain definition without clutter.

## Typography
We use **Manrope** for its geometric balance and modern professional tone. It bridges the gap between technical SaaS aesthetics and executive-level consulting.

- **Hierarchy:** Dramatic scale shifts between "Display" and "Body" text are used to create a clear narrative flow. Large headlines should use tight letter-spacing to appear "locked" and intentional.
- **Readability:** Body text maintains a generous line-height (1.5x) to ensure legibility during long-form technical case studies.
- **Labels:** Small labels and overlines should use bold weights and subtle tracking (letter-spacing) to signify metadata and categorization.

## Layout & Spacing
The layout follows a **12-column Fluid Grid** with a fixed maximum width to preserve line-lengths on ultra-wide monitors.

- **Whitespace:** Use aggressive vertical padding (`section-padding`) between major content blocks to emphasize the premium nature of the agency.
- **Rhythm:** Spacing follows an 8px base unit. Components should favor internal padding over external margins to maintain "contained" visual units.
- **Responsiveness:** On mobile, margins compress to 16px, and the 12-column grid collapses to a single-column stack. Tablet layouts utilize an 8-column grid with 24px margins.

## Elevation & Depth
Elevation in this design system is subtle, avoiding heavy drop shadows in favor of **Tonal Layering** and **Glassmorphism**.

- **Surface Levels:** 
  - Level 0: Background (`Off-White`)
  - Level 1: Cards (`White`) with a 1px border (`Light Border`) and a very soft 4% opacity shadow (0px 4px 20px).
  - Level 2: Interactive elements / Overlays. These use a **Backdrop Blur (20px)** with a semi-transparent white fill (70-80% alpha) to create a "frosted glass" effect over background content.
- **Interactions:** Upon hover, cards should lift slightly via a transition to a more pronounced, slightly tinted shadow (using a Primary Blue tint at 8% opacity).

## Shapes
The shape language is **Refined & Modern**. We avoid fully circular "playful" buttons in favor of the `Rounded (0.5rem)` setting.

- **Primary Radius:** 8px for standard components like buttons and input fields.
- **Large Radius (16px - 24px):** Used for large feature cards and "Glass" containers to soften the overall technical layout.
- **Consistent Enclosure:** Ensure that nested elements (like an image inside a card) have a slightly smaller radius than the parent container to maintain visual harmony (the "inner radius" rule).

## Components
- **Buttons:** 
  - *Primary:* Solid `Deep Blue` with white text. High-contrast, 8px radius.
  - *Secondary:* Ghost style with 1px `Deep Blue` border or `Off-White` fill.
  - *Interaction:* 200ms ease-in-out transitions for scale or color shifts.
- **Cards:** 
  - Feature cards should use the glassmorphic style (white base, subtle blur, light border).
  - Use "Icon Containers" in the top left, utilizing a soft `Electric Blue` background at 10% opacity.
- **Input Fields:** 
  - Clean `Off-White` background with a subtle border that turns `Primary Blue` on focus.
- **Chips/Badges:** 
  - Small, high-contrast labels used for "AI Model," "Strategy," or "Development" tags. Use semi-transparent blue backgrounds with dark blue text.
- **Interactive Transitions:** 
  - Use "fade-up" animations for section entries. 
  - Implementation of a custom cursor (small blue dot) for "Premium" site versions is encouraged to enhance the digital agency feel.