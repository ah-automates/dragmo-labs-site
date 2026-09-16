import type { Product } from "@/lib/products";

/**
 * Testimonials, drafted by the studio in each client's voice with their
 * permission, then sent to them for approval before going live. Nothing
 * renders until the named person has approved their own words: every render
 * path reads `approvedTestimonials`, never `testimonials` directly, so a
 * quote that has not been signed off cannot reach production by
 * construction rather than by discipline. All three are approved as of
 * 2026-09-14; see `context.md` for the one still-open item (Waseem's
 * deliverable is unconfirmed, so his quote carries no product or case study).
 */
export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  status: "draft-pending-signoff" | "approved";
  productSlugs: Product["slug"][];
  caseStudySlug?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "javed-purafall",
    // Original quote covered the website only; Purafall's invoicing system
    // shipped after it. Drafted by the studio to cover both real
    // deliverables, offered to Javed as three options, approved by him as
    // written 2026-09-16.
    quote:
      "The invoicing system DragmoLabs built has taken the manual work out of our billing, and the website gives us the premium brand presence we wanted too.",
    author: "Javed Akhter",
    role: "Director",
    company: "Purafall",
    status: "approved",
    productSlugs: ["ai-invoice-system"],
    caseStudySlug: "purafall",
  },
  {
    id: "haseeb-khatri-real-estate",
    // Drafted by the studio from the real, observed product behaviour (the
    // WhatsApp and voice agent recordings). Approved by Haseeb.
    quote:
      "Our WhatsApp used to feel impossible to keep up with, enquiries stacked up faster than anyone could read them. Now every message gets answered straight away, and by the time one of our team looks at a lead, the details are already there.",
    author: "Haseeb",
    role: "Khatri Real Estate",
    company: "Khatri Real Estate",
    status: "approved",
    productSlugs: ["voice-agent", "whatsapp-agent"],
    caseStudySlug: "khatri-real-estate",
  },
  {
    id: "waseem-khatri-global",
    // Drafted deliberately generic, since the specific deliverable for Khatri
    // Global is still not identified (see Open Items in context.md). Approved
    // by Waseem as written; still not tied to a specific product or case
    // study because that project detail is unconfirmed.
    quote:
      "Working with Dragmo Labs has been straightforward from the first conversation. They listen, they explain what they are doing in plain terms, and what they deliver actually works.",
    author: "Waseem",
    role: "Khatri Global",
    company: "Khatri Global",
    status: "approved",
    productSlugs: [],
  },
];

export const approvedTestimonials = testimonials.filter((t) => t.status === "approved");

export function testimonialsForProduct(slug: Product["slug"]): Testimonial[] {
  return approvedTestimonials.filter((t) => t.productSlugs.includes(slug));
}

export function testimonialsForCaseStudy(slug: string): Testimonial[] {
  return approvedTestimonials.filter((t) => t.caseStudySlug === slug);
}

/**
 * Server-only derivation, the `policyLinks` precedent in `policies.ts`. There
 * is no standalone `/testimonials` route (folded into the home page's
 * `#testimonials` section 2026-09-15, matching the reference site this
 * redesign is modeled on — proof lives where visitors already are, not on a
 * page nobody navigates to). The footer reads this rather than checking the
 * array length itself, so an empty section is never linked, and the moment a
 * quote is approved, the footer link and every product page's quote slot
 * light up together.
 */
export const testimonialsLink =
  approvedTestimonials.length > 0 ? { label: "Testimonials", href: "/#testimonials" } : null;
