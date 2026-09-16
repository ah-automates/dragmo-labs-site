"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight, ArrowUpRight } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/layout/logo";
import { EASE } from "@/components/shared/motion";
import { useMotionPreference } from "@/components/a11y/a11y-provider";
import { ButtonLink } from "@/components/ui/button";
import { CTA_LABEL } from "@/lib/data";
import type { NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

/**
 * `menu` is built server-side in `layout.tsx` by `buildSiteMenu()` and passed
 * in as a plain, serializable prop. This component must never import
 * `products.ts`/`case-studies.ts` directly — see `src/lib/nav.ts` for why:
 * that would ship every product's full sales copy into this client bundle
 * for a menu that only needs a name and a slug.
 */
export function Navbar({ menu }: { menu: NavLink[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [openMobileSections, setOpenMobileSections] = React.useState<Set<string>>(new Set());
  const { scrollY } = useScroll();

  const panelRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 24;
    // Guard so the boolean only changes at the threshold, not every frame.
    setScrolled((prev) => (prev === next ? prev : next));
  });

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll while the panel is open, compensating for the scrollbar so the
  // page does not shift sideways.
  React.useEffect(() => {
    if (!open) return;

    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [open]);

  // Escape to close, and keep Tab inside the panel while it is open.
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === toggleRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  const toggleMobileSection = (label: string) => {
    setOpenMobileSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      data-slot="site-header"
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-b border-border bg-background/95"
          : "border-b border-transparent bg-transparent",
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Not the shared `Container` component: the navbar needs its own
          flex row rather than `Container`'s block wrapper. But it uses the
          exact same `.px-gutter` inset `Container` does (2026-09-15), so the
          logo's left edge and every section heading's left edge sit at the
          same x at any viewport width. Fixed height rather than the old
          shrink-on-scroll: the bar reads as a confident, static instrument
          instead of the default blurred glass header every AI-agency
          template ships. */}
      <div className="flex h-16 w-full items-center justify-between px-gutter lg:h-24">
        <Logo />

        {/* gap-5 rather than a flat gap-9: eight top-level targets (Home plus
            three dropdown parents) plus the CTA button needs tighter spacing
            at 1024px than the original five did. */}
        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {menu.map((link) =>
            link.children ? (
              <NavDropdown key={link.href} link={link} pathname={pathname} isActive={isActive} />
            ) : (
              <NavItem key={link.href} link={link} active={isActive(link.href)} />
            ),
          )}
        </nav>

        <div className="hidden lg:block">
          <ButtonLink
            href="/contact"
            variant="primary"
            size="sm"
            /* `!` forced: buttonVariants' own `rounded-input` isn't
               recognized as conflicting by tailwind-merge (a custom theme
               key, not one of its default class groups), so a plain
               override class was silently losing to the base style. */
            className="!rounded-full"
            data-analytics-event={EVENTS.contact}
            data-analytics-location={LOCATIONS.navbar}
          >
            {CTA_LABEL}
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </ButtonLink>
        </div>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="inline-flex size-11 items-center justify-center rounded-input border border-border text-foreground transition-colors duration-300 hover:border-border-strong hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary lg:hidden"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="overscroll-contain border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <Container className="flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto py-6">
              <nav aria-label="Mobile" className="flex flex-col gap-1">
                {menu.map((link) =>
                  link.children ? (
                    <MobileAccordionItem
                      key={link.href}
                      link={link}
                      isActive={isActive}
                      open={openMobileSections.has(link.label)}
                      onToggle={() => toggleMobileSection(link.label)}
                      onNavigate={closeMenu}
                    />
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-input px-4 py-3.5 font-body text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        isActive(link.href)
                          ? "bg-accent/10 text-accent-secondary"
                          : "text-foreground-muted hover:bg-white/[0.04] hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </nav>
              <ButtonLink
                href="/contact"
                onClick={closeMenu}
                className="mt-3 w-full"
                data-analytics-event={EVENTS.contact}
                data-analytics-location={LOCATIONS.navbarMobile}
              >
                {CTA_LABEL}
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavItem({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative rounded-input py-1.5 font-body text-base font-medium tracking-tight transition-colors duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        active ? "text-foreground" : "text-foreground-muted hover:text-foreground",
      )}
    >
      {link.label}
      {/* scaleX keeps the underline off the layout path. */}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gradient-to-r from-accent to-glow transition-transform duration-300 ease-out",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

/**
 * Desktop nav item with a hover/focus dropdown, modeled on zafrelodesign.ae's
 * `has-sub` pattern: the parent stays a real, navigable `<Link>` (so it works
 * with JS disabled and stays crawlable) and the panel is a shortcut, not a
 * replacement. `pt-3` on the panel's wrapper is a hoverable bridge, not a
 * gap — a `margin-top` there would create a dead zone that drops the pointer
 * during diagonal travel from the trigger into the panel.
 */
function NavDropdown({
  link,
  pathname,
  isActive,
}: {
  link: NavLink;
  pathname: string;
  isActive: (href: string) => boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const closeTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useMotionPreference();
  const active = isActive(link.href);
  const isChildActive = (href: string) => !href.includes("#") && pathname === href;

  const clearCloseTimeout = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  const openNow = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  // Short delay so the pointer leaving the trigger toward the panel does not
  // dismiss it before it arrives.
  const scheduleClose = () => {
    clearCloseTimeout();
    closeTimeout.current = setTimeout(() => setOpen(false), 120);
  };

  const closeNow = () => {
    clearCloseTimeout();
    setOpen(false);
  };

  React.useEffect(() => () => clearCloseTimeout(), []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeNow();
      const trigger = itemRef.current?.querySelector<HTMLElement>("a[data-nav-trigger]");
      trigger?.focus();
      return;
    }

    if (event.key === "ArrowDown" && !open) {
      event.preventDefault();
      openNow();
      return;
    }

    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && open) {
      event.preventDefault();
      const items = itemRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items || items.length === 0) return;
      const list = Array.from(items);
      const currentIndex = list.indexOf(document.activeElement as HTMLElement);
      const nextIndex =
        event.key === "ArrowDown"
          ? (currentIndex + 1) % list.length
          : (currentIndex - 1 + list.length) % list.length;
      list[nextIndex]?.focus();
    }
  };

  return (
    <div
      ref={itemRef}
      className="relative"
      onPointerEnter={openNow}
      onPointerLeave={scheduleClose}
      onFocus={openNow}
      onBlur={(event) => {
        if (!itemRef.current?.contains(event.relatedTarget as Node)) closeNow();
      }}
      onKeyDown={onKeyDown}
    >
      <Link
        href={link.href}
        data-nav-trigger
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-1 rounded-input py-1.5 font-body text-base font-medium tracking-tight transition-colors duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          active ? "text-foreground" : "text-foreground-muted hover:text-foreground",
        )}
      >
        {link.label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-gradient-to-r from-accent to-glow transition-transform duration-300 ease-out",
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
          )}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <div className="absolute left-0 top-full pt-3" role="presentation">
            <motion.div
              role="menu"
              aria-label={link.label}
              initial={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="flex min-w-[240px] flex-col gap-0.5 rounded-card border border-border bg-surface-raised p-2 shadow-[0_20px_40px_-20px_var(--shadow-panel)]"
            >
              {link.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  role="menuitem"
                  onClick={closeNow}
                  aria-current={isChildActive(child.href) ? "page" : undefined}
                  className={cn(
                    "rounded-input px-3.5 py-2.5 font-body text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-raised",
                    isChildActive(child.href)
                      ? "bg-accent/10 text-accent-secondary"
                      : "text-foreground-muted hover:bg-white/[0.05] hover:text-foreground",
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileAccordionItem({
  link,
  isActive,
  open,
  onToggle,
  onNavigate,
}: {
  link: NavLink;
  isActive: (href: string) => boolean;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const active = isActive(link.href);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex items-center justify-between rounded-input px-4 py-3.5 font-body text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active ? "text-accent-secondary" : "text-foreground-muted hover:bg-white/[0.04] hover:text-foreground",
        )}
      >
        {link.label}
        <ChevronDown
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="flex flex-col gap-0.5 overflow-hidden pl-4">
          {link.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="rounded-input px-4 py-3 font-body text-sm text-foreground-muted/85 transition-colors duration-200 hover:bg-white/[0.04] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
