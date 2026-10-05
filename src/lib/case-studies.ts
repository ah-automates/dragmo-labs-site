import type { ProofEntry } from "@/lib/proof";
import { invoiceSystemProof, chatshiftProof } from "@/lib/proof";
import type { Product } from "@/lib/products";

/**
 * Case studies, as content-as-data, mirroring `src/lib/policies.ts`. There is
 * deliberately no `metrics` field here. An empty `metrics: {label, value}[]`
 * is an invitation, and the first thing it tends to get filled with is a
 * plausible sounding invented number, which `design-system/MASTER.md` §8
 * records already happening once on this site (the removed `50+ / 12x /
 * 99.9%`). When real metrics exist, add the field then, with a required
 * `source: string` alongside every value.
 */
export type CaseStudy = {
  slug: "khatri-real-estate" | "purafall";
  client: string;
  clientContext: string;
  title: string;
  summary: string;
  /** Short, real category labels (2-3 words each) — not invented metrics,
   *  just what the work actually was. Powers the card chips on the home page
   *  and the case-studies index. */
  tags: string[];
  challenge: string[];
  build: string[];
  proof: ProofEntry[];
  stack: string[];
  relatedProductSlugs: Product["slug"][];
  liveUrl?: string;
  /**
   * Card artwork. Left undefined until a real generated image is dropped in
   * (via kie) — `CaseStudyCard` renders a deliberate placeholder rather than
   * a broken image or an invented screenshot in the meantime.
   */
  poster?: { src: string; alt: string };
  /**
   * Overrides for the `<title>`/meta description only, when a shorter,
   * researched phrase serves search better than the narrative `title`
   * (which stays the visible H1 either way). Unset falls back to
   * `title`/`summary`.
   */
  seo?: { title?: string; description?: string };
};

const khatriRealEstate: CaseStudy = {
  slug: "khatri-real-estate",
  client: "Khatri Real Estate",
  clientContext: "A real estate agency in Dubai, handling off plan launches, current inventory, and resale.",
  title: "Two Channels, One Agency: A Voice Agent And A WhatsApp Inbox For Khatri Real Estate",
  summary:
    "Khatri Real Estate's phone and WhatsApp lines are the two places a buyer's enquiry actually arrives. Both now run through AI agents that answer immediately, qualify the buyer against real inventory, and hand the team a lead ready to act on, with a human able to take over either channel by hand at any moment.",
  tags: ["Chatshift", "Voice Agent", "Real Estate"],
  challenge: [
    "A real estate enquiry does not wait for office hours. It arrives as a phone call during a viewing, or as a WhatsApp message stacked behind a dozen others in an inbox nobody can read in real time. Khatri needed both channels answered immediately, with real inventory knowledge behind the answer, not a generic hold message or a keyword matching bot.",
    "The harder requirement was qualification, not just response. A reply that does not gather area, budget, bedrooms, and timeline is not a lead, it is a transcript. And whatever answered a channel had to hand off cleanly to a human the moment a conversation genuinely needed one, without losing the thread of what had already been said.",
  ],
  build: [
    "Chatshift is a single Next.js application that owns the entire path: webhook receipt, signature verification, media handling (text, voice notes transcribed with Whisper, images, documents), the agent's own tool calling reasoning loop, reply delivery, and a live web inbox, backed by Supabase Postgres with Row Level Security and Realtime.",
    "The agent runs a two stage qualification: first the questions the intent actually requires (property type, area, bedrooms, budget, timeline), only then contact details, so a general question is never forced through a full intake form. A lead only ever gets submitted once the state genuinely changes, tracked in an append-only leads table rather than trusted to the model's own memory of what it has already done.",
    "The owner keeps a Detach control on every single conversation: WhatsApp Desktop style, one click hands a conversation to a human, and the AI stays silent on that contact until handed back, with every message still logged so re-attaching later is never amnesiac about what was said in between.",
    "The voice agent answers the same business's phone line directly, drawing on the same off plan, current inventory, and resale knowledge, qualifying the caller conversationally, and reading their phone number back digit by digit before logging a fully populated lead row live during the call.",
  ],
  proof: chatshiftProof,
  stack: [
    "Next.js 16, App Router, Turbopack",
    "React 19, TypeScript strict",
    "Supabase Postgres, Row Level Security, Realtime",
    "Supabase Auth, Supabase Storage",
    "YCloud (WhatsApp Business Platform)",
    "OpenAI gpt-4o-mini, text-embedding-3-small, whisper-1",
    "Nodemailer over SMTP",
  ],
  relatedProductSlugs: ["voice-agent", "chatshift", "3d-property-website"],
  poster: {
    src: "/images/case-study-khatri.jpg",
    alt: "A voice call and a WhatsApp conversation converging into a single new lead captured for Khatri Real Estate, over a Dubai skyline",
  },
  seo: {
    title: "Real Estate Automation Case Study, Khatri Real Estate",
    description:
      "How an AI voice receptionist and a WhatsApp chatbot now answer every phone and WhatsApp enquiry for Khatri Real Estate, qualify the buyer, and hand the team a ready-to-work lead.",
  },
};

const purafall: CaseStudy = {
  slug: "purafall",
  client: "Purafall",
  clientContext: "A water filtration company.",
  title: "A Brand Ready Website, And An Invoicing System That Checks Its Own Arithmetic",
  summary:
    "Purafall came to us for a website that matched the quality of what they sell, and stayed for an internal invoicing system that reads vendor invoices automatically and builds every client invoice from one fixed, branded template.",
  tags: ["AI Invoicing", "Web Design", "Water Filtration"],
  challenge: [
    "Purafall needed a website that read as a premium brand, not a template with their logo dropped in, the kind of site that makes a first time visitor trust the product before they have read a single line of copy.",
    "Behind the scenes, invoicing ran the way it does at most small and mid sized businesses: a vendor bill typed in by hand, a client invoice built by copying last month's and retyping the parts that changed. Workable, but exactly the kind of repetitive task where a small mistake slips through unnoticed.",
  ],
  build: [
    "The website was designed and built around Purafall's own brand, live today at purafall.com.",
    "The invoicing system handles two related but distinct jobs behind one login: reading a vendor invoice (money going out), either from an uploaded file an LLM reads or typed in by hand, checked for arithmetic before anything is trusted, then synced to a Notion database, and building client invoices (money coming in) from one fixed, branded Dragmo Labs style template, generating a real PDF to download or email directly.",
    "Authentication is a deliberately small, hand rolled, database backed session layer rather than a drop in library's token based login, specifically so an admin deactivating a staff account takes effect on that person's very next request, not whenever a token happens to expire.",
    "Every invoice is frozen at the moment it is issued: the exact template state it was built from is snapshotted into the invoice's own record, so a later template edit can never silently rewrite a document a client has already relied on.",
  ],
  proof: invoiceSystemProof,
  stack: [
    "Next.js 15.5, App Router",
    "React 19, TypeScript strict",
    "Postgres on Neon, Drizzle ORM",
    "Hand rolled database backed sessions, argon2id",
    "OpenAI gpt-4o-mini, Structured Outputs via Zod",
    "Notion API",
    "@react-pdf/renderer, Vercel Blob, Resend",
  ],
  relatedProductSlugs: ["ai-invoice-system"],
  liveUrl: "https://www.purafall.com",
  poster: {
    src: "/images/case-study-purafall.jpg",
    alt: "The Purafall brand website beside a verified invoice with its arithmetic checked automatically",
  },
  seo: {
    title: "Website Design & Accounts Payable Automation Case Study, Purafall",
    description:
      "How Purafall got a brand-ready website and a custom accounts payable automation system that reads vendor invoices, checks its own arithmetic, and builds client invoices from one fixed template.",
  },
};

export const caseStudies: CaseStudy[] = [khatriRealEstate, purafall];

export const caseStudiesBySlug = Object.fromEntries(
  caseStudies.map((study) => [study.slug, study]),
) as Record<CaseStudy["slug"], CaseStudy>;

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudiesBySlug[slug as CaseStudy["slug"]];
}
