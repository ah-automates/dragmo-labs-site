/**
 * Entity facts for the `/about` page and for `organizationSchema()`
 * (`src/lib/schema.ts`). Every field here is optional: an unset one is
 * simply omitted from both, field by field, never filled with a placeholder.
 * `design-system/MASTER.md` §7's "no invented numbers" rule applies just as
 * much to a founding year or a headcount as it does to a stat.
 *
 * There is deliberately no `countryOfRegistration` (or any other field
 * revealing where the business is registered) — this file feeds public
 * output only, and the owner asked that the country not be surfaced
 * anywhere on the site or in structured data. If a real need for that fact
 * shows up later (invoicing, a contract), it belongs in a private record,
 * not here.
 *
 * `teamSize` is intentionally unset too: undisclosed by choice, not unknown.
 *
 * Filling in a field unlocks one schema property: `legalName` -> `legalName`,
 * `foundingYear` -> `foundingDate`, `founders` -> `founder`.
 */
export type Founder = {
  name: string;
  role: string;
  linkedin?: string;
  photo?: { src: string; width: number; height: number; alt: string };
  /** A real, direct statement in the founder's own words, not marketing
   *  copy written on their behalf. Unset renders no quote at all rather
   *  than a generic placeholder. */
  vision?: string;
};

export type AboutContent = {
  legalName?: string;
  foundingYear?: number;
  founders?: readonly Founder[];
  teamSize?: number;
};

export const about: AboutContent = {
  legalName: "Dragmo Labs",
  foundingYear: 2026,
  founders: [
    {
      name: "Abdul Hadi",
      role: "Founder",
      photo: {
        src: "/images/founder-abdul-hadi.jpg",
        width: 1254,
        height: 1254,
        alt: "Portrait of Abdul Hadi, founder of Dragmo Labs",
      },
      vision:
        "I started Dragmo Labs to help businesses run more efficiently. My vision is to keep driving the cost of automation down as far as I can, so what a business gets back is real profit, not just a smaller expense.",
    },
  ],
};
