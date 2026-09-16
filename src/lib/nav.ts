import { products } from "@/lib/products";
import { caseStudies } from "@/lib/case-studies";
import { services } from "@/lib/services";

export type NavChild = { label: string; href: string };
export type NavLink = { label: string; href: string; children?: NavChild[] };

/**
 * Server-only. `navbar.tsx` is a client component, so it must never import
 * `products.ts` or `services.ts` directly — that would ship all four
 * products' full 17-step sales copy (every fascination, every objection
 * answer) and all six services' editorial detail-page copy into the client
 * bundle for a menu that only needs a name and a slug. This module does the
 * derivation in a server context and hands the navbar a plain, serializable
 * `NavLink[]` built in `layout.tsx`.
 *
 * Each submenu is derived from the real data rather than hand-typed, so a
 * fifth product or a third case study appears in the nav the moment it is
 * added here — never a stale, separately maintained list.
 */
export function buildSiteMenu(): NavLink[] {
  return [
    { label: "Home", href: "/" },
    {
      label: "Services",
      href: "/services",
      children: [
        { label: "All Services", href: "/services" },
        ...services.map((service) => ({ label: service.title, href: `/services/${service.slug}` })),
      ],
    },
    {
      label: "Products",
      href: "/products",
      children: [
        { label: "All Products", href: "/products" },
        ...products.map((product) => ({ label: product.name, href: `/products/${product.slug}` })),
      ],
    },
    {
      label: "Case Studies",
      href: "/case-studies",
      children: [
        { label: "All Case Studies", href: "/case-studies" },
        ...caseStudies.map((study) => ({ label: study.client, href: `/case-studies/${study.slug}` })),
      ],
    },
  ];
}
