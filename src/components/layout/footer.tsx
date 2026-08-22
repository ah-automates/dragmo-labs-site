import type { SVGProps } from "react";
import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/layout/logo";
import { footerLinks, siteConfig } from "@/lib/data";
import { policyLinks } from "@/lib/policies";

/**
 * X's own mark, inlined because lucide ships no brand logo for it — its `X`
 * icon is the close/dismiss cross, and `Twitter` is the bird of a brand that
 * no longer exists.
 */
function XIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * X is a solid glyph sitting between two stroked lucide icons, so it carries
 * more ink at the same nominal size. A step down evens out the optical weight.
 */
const socials = [
  { label: "LinkedIn", href: siteConfig.social.linkedin, Icon: Linkedin, size: "size-4" },
  { label: "X", href: siteConfig.social.x, Icon: XIcon, size: "size-3.5" },
  { label: "Instagram", href: siteConfig.social.instagram, Icon: Instagram, size: "size-4" },
];

export function Footer() {
  return (
    <footer
      className="relative border-t border-border bg-background-secondary"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <Container className="relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <Logo />
            <p className="max-w-xs text-pretty text-sm leading-relaxed text-foreground-muted">
              We design and build intelligent systems. AI automation, web
              applications, and digital products engineered to move your business
              forward.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ label, href, Icon, size }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  data-slot="icon-link"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground-muted transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                >
                  <Icon className={size} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore" links={footerLinks.explore} />
          <FooterColumn title="Services" links={footerLinks.services} />

          <div className="flex flex-col gap-4">
            <h2 className="font-body text-xs font-medium uppercase tracking-[0.14em] text-foreground-muted">
              Contact
            </h2>
            <ul className="flex flex-col gap-4 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  translate="no"
                  className="flex items-start gap-3 rounded-input text-foreground-muted transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent-secondary" aria-hidden />
                  <span className="min-w-0 break-all">{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-foreground-muted">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-secondary" aria-hidden />
                <span className="min-w-0">{siteConfig.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-foreground-muted/70">
            <span className="tabular-nums">{new Date().getFullYear()}</span>{" "}
            <span translate="no">{siteConfig.name}</span>. All rights reserved.
          </p>
          {/* The Pexels credit was removed with the stock photography it
              covered. All site imagery is now commissioned or generated. */}
          <nav aria-label="Legal">
            <ul role="list" className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-block rounded-input text-xs text-foreground-muted/70 transition-colors duration-300 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-body text-xs font-medium uppercase tracking-[0.14em] text-foreground-muted">
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="inline-block rounded-input text-sm text-foreground-muted transition-[color,transform] duration-300 hover:translate-x-0.5 hover:text-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background-secondary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
