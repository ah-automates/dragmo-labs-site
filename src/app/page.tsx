import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { CaseStudies } from "@/components/sections/case-studies";
import { Testimonials } from "@/components/sections/testimonials";
import { Approach } from "@/components/sections/approach";
import { Principles } from "@/components/sections/principles";
import { ContactSection } from "@/components/sections/contact-section";

/**
 * Section order is also a layout-family order: full-bleed media, asymmetric
 * bento, full-bleed media cards, quote cards, editorial offset split,
 * typographic index, form split. No family repeats consecutively, and
 * vertical rhythm alternates via each Section's `space`.
 *
 * CaseStudies and Testimonials were added 2026-09-15, modeled on
 * zafrelodesign.ae: what we do (Hero, Capabilities) -> proof we did it
 * (CaseStudies) -> who says so (Testimonials) -> how we work (Approach,
 * Principles) -> talk to us (Contact). Previously the home page carried no
 * proof at all; both sections render nothing if their underlying data is
 * empty, so this degrades gracefully rather than shipping a placeholder.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Capabilities />
      <CaseStudies />
      <Testimonials />
      <Approach />
      <Principles />
      <ContactSection />
    </>
  );
}
