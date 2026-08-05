import { Hero } from "@/components/sections/hero";
import { Capabilities } from "@/components/sections/capabilities";
import { Approach } from "@/components/sections/approach";
import { Principles } from "@/components/sections/principles";
import { ContactSection } from "@/components/sections/contact-section";

/**
 * Section order is also a layout-family order: full-bleed media, asymmetric
 * bento, editorial offset split, typographic index, form split. No family
 * repeats, and vertical rhythm alternates via each Section's `space`.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Capabilities />
      <Approach />
      <Principles />
      <ContactSection />
    </>
  );
}
