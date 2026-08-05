import type { ImageId } from "@/lib/images";

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
  },
};

/** One label per intent, used in nav, hero, and footer alike. */
export const CTA_LABEL = "Get in Touch";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Get in Touch", href: "/contact" },
];

export const footerLinks = {
  explore: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Get in Touch", href: "/contact" },
  ],
  services: [
    { label: "AI Solutions", href: "/services#ai-solutions" },
    { label: "AI Automation", href: "/services#ai-automation" },
    { label: "Web Development", href: "/services#web-development" },
    { label: "UI/UX Design", href: "/services#ui-ux-design" },
  ],
};

export type Service = {
  slug: string;
  icon: "brain-circuit" | "bot" | "globe" | "layout-panel-left" | "pen-tool" | "rocket";
  title: string;
  description: string;
  tags?: string[];
  span?: "wide" | "full";
  image?: ImageId;
};

export const services: Service[] = [
  {
    slug: "ai-solutions",
    icon: "brain-circuit",
    title: "AI Solutions",
    description:
      "Custom models and LLM-powered features trained on your data, your workflows, and your commercial goals rather than a generic template.",
    image: "capabilityAi",
  },
  {
    slug: "ai-automation",
    icon: "bot",
    title: "AI Automation",
    description:
      "Connect the tools you already run, remove the manual handoffs between them, and scale volume without scaling headcount.",
    image: "capabilityAutomation",
  },
  {
    slug: "web-development",
    icon: "globe",
    title: "Website Design & Development",
    description:
      "Fast, accessible sites built on modern infrastructure and engineered to turn traffic into qualified pipeline.",
    image: "serviceWeb",
  },
  {
    slug: "web-applications",
    icon: "layout-panel-left",
    title: "Web Applications",
    description:
      "Bespoke applications for the processes no off-the-shelf product covers. Scalable architecture that integrates with the data infrastructure you already have.",
    span: "wide",
    image: "serviceApps",
  },
  {
    slug: "ui-ux-design",
    icon: "pen-tool",
    title: "UI/UX Design",
    description:
      "Interfaces grounded in real user research, with the hierarchy and polish that earn trust on first view.",
    image: "serviceDesign",
  },
  {
    slug: "digital-transformation",
    icon: "rocket",
    title: "Digital Transformation",
    description:
      "We audit your legacy systems, find the bottlenecks that actually cost you money, and sequence the move to an automated operating model.",
    tags: ["Legacy Modernization", "Data Strategy", "Change Management"],
    span: "full",
  },
];

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
