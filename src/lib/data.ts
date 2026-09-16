export const siteConfig = {
  name: "Dragmo Labs",
  tagline: "AI Automation & Software Development",
  description:
    "Dragmo Labs is an AI automation and software development studio. We design, build, and ship intelligent systems that help ambitious businesses move faster and scale further.",
  url: "https://dragmolabs.com",
  // No phone number is published. Email and the contact form are the only
  // inbound channels, so nothing here should render a `tel:` link.
  email: "info@dragmolabs.com",
  address: "Remote-first, serving clients worldwide",
  social: {
    linkedin: "https://www.linkedin.com/company/dragmo-labs/",
    x: "https://x.com/DragmoLabs",
    instagram: "https://www.instagram.com/dragmolabs/",
    facebook: "https://www.facebook.com/dragmolabs",
    youtube: "https://www.youtube.com/@dragmolabs",
  },
};

/** One label per intent, used in nav, hero, and footer alike. */
export const CTA_LABEL = "Get in Touch";

/** The product pages' own intent: a free call, not a generic enquiry. */
export const STRATEGY_CALL_CTA = "Request Your Free Strategy Call";

// Nav links themselves live in `src/lib/nav.ts` now: Products, Case Studies,
// and Services each carry a dropdown derived from the real data, and that
// derivation has to happen in a server context (see the comment there for
// why). "Get in Touch" is not repeated in either menu: the navbar already
// renders it as its own CTA button beside these links, and having it in both
// places duplicated the same destination twice in the header.

export const footerLinks = {
  explore: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Services", href: "/services" },
    { label: "Get in Touch", href: "/contact" },
  ],
};

// Services moved to `src/lib/services.ts` (2026-09-16). Each service now
// carries a full editorial detail page's copy (`ServiceDetail`), and this
// file is imported by `navbar.tsx` and `hero.tsx`, both client components —
// keeping that copy out of `data.ts` keeps it strictly client-safe rather
// than merely tree-shakeable. See `context.md` §2 and
// `design-system/pages/product.md` §6.

export const processSteps = [
  { number: 1, label: "Discover" },
  { number: 2, label: "Strategize" },
  { number: 3, label: "Design" },
  { number: 4, label: "Build" },
  { number: 5, label: "Launch" },
  { number: 6, label: "Grow" },
];

export type Principle = {
  title: string;
  description: string;
};

/** Rendered as a typographic index, not cards. */
export const principles: Principle[] = [
  {
    title: "Your Goals Drive The Architecture",
    description:
      "Every technical decision traces back to a commercial one. If it does not move a number you care about, we do not build it.",
  },
  {
    title: "Automation Where It Pays",
    description:
      "We target the workflows that consume the most hours first, then measure what came back before moving to the next one.",
  },
  {
    title: "Shipped, Not Demoed",
    description:
      "Work goes to production behind real monitoring. A prototype that never leaves staging has not solved anything.",
  },
  {
    title: "Built On Current Foundations",
    description:
      "Modern, well-supported frameworks and infrastructure, so the thing we hand over is still maintainable in three years.",
  },
  {
    title: "Plain Language Throughout",
    description:
      "Clear scope, visible progress, and no jargon. You will always know what we are building and why.",
  },
  {
    title: "Room To Grow Into",
    description:
      "Architecture that absorbs more users, more data, and more traffic without a rewrite when the volume arrives.",
  },
];
