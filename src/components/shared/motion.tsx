"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

import { useMotionPreference } from "@/components/a11y/a11y-provider";
import { cn } from "@/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** React's drag/animation handlers collide with Framer Motion's own. */
type MotionSafeProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>;

type MotionTag =
  | "div"
  | "section"
  | "article"
  | "li"
  | "ul"
  | "ol"
  | "header"
  | "figure";

type LooseMotionComponent = React.ComponentType<
  Record<string, unknown> & {
    children?: React.ReactNode;
    ref?: React.Ref<HTMLElement>;
  }
>;

const motionTag = (tag: MotionTag) =>
  motion[tag] as unknown as LooseMotionComponent;

/** Marks reveal wrappers so a `<noscript>` rule can force them visible. */
const REVEAL_CLASS = "js-reveal";

/**
 * First-party replacement for Framer Motion's own `whileInView` viewport
 * tracking. `whileInView` schedules its "now visible" transition through the
 * library's internal observer/scheduling, which this codebase saw fail to
 * fire promptly in a real browser (reported: content sitting at its
 * `initial`, invisible state for several seconds after genuinely scrolling
 * into view) — reproducible on that machine across a hard refresh and an
 * Incognito window (so not cache, not an extension), but never reproducible
 * here across headless Chromium, dev/production, or a realistic scroll
 * gesture. Rather than keep guessing at a third-party library's internal
 * timing, this hook owns the signal directly with the browser's own
 * `IntersectionObserver`, the same instinct behind `hero.tsx`'s
 * `video.ended` listener: don't trust a single opaque event to always fire
 * on time when a page needs to reliably become visible.
 */
function useInView(
  ref: React.RefObject<Element | null>,
  { once = true, amount = 0.15, margin = "0px 0px -60px 0px" }: { once?: boolean; amount?: number; margin?: string },
) {
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Already on screen at mount (e.g. above the fold, or a short page) —
    // an observer only fires on a later intersection *change*, so this
    // covers the case where the element starts out already intersecting.
    const rect = node.getBoundingClientRect();
    const startsInView =
      rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
    if (startsInView) setInView(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount, rootMargin: margin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, once, amount, margin]);

  return inView;
}

type FadeInProps = MotionSafeProps & {
  delay?: number;
  duration?: number;
  y?: number;
  as?: MotionTag;
  once?: boolean;
};

export function FadeIn({
  className,
  children,
  delay = 0,
  duration = 0.6,
  y = 24,
  as = "div",
  once = true,
  ...props
}: FadeInProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.2, margin: "0px 0px -80px 0px" });

  // Reduced motion renders static: no offset, no transition, no reveal.
  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      className={cn(REVEAL_CLASS, className)}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: EASE }}
      {...props}
    >
      {children}
    </Comp>
  );
}

const SPRING = { type: "spring", stiffness: 100, damping: 20 } as const;

type RiseProps = MotionSafeProps & {
  delay?: number;
  y?: number;
  as?: MotionTag;
  once?: boolean;
};

/**
 * Display-opener entrance: hero and section headlines. Spring physics
 * instead of `FadeIn`'s uniform ease — see `design-system/MASTER.md` §5's
 * three named entrances (client-authorized 2026-09-14).
 */
export function Rise({
  className,
  children,
  delay = 0,
  y = 28,
  as = "div",
  once = true,
  ...props
}: RiseProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.3, margin: "0px 0px -80px 0px" });

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      className={cn(REVEAL_CLASS, className)}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ ...SPRING, delay }}
      {...props}
    >
      {children}
    </Comp>
  );
}

type SettleProps = MotionSafeProps & {
  delay?: number;
  duration?: number;
  as?: MotionTag;
  once?: boolean;
};

/** Media/panel entrance: scale(0.98) to scale(1), plus opacity. */
export function Settle({
  className,
  children,
  delay = 0,
  duration = 0.5,
  as = "div",
  once = true,
  ...props
}: SettleProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.2, margin: "0px 0px -80px 0px" });

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      className={cn(REVEAL_CLASS, className)}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
      transition={{ duration, delay, ease: EASE }}
      {...props}
    >
      {children}
    </Comp>
  );
}

/** Staggered children sliding in from `x`, for console/log rows. */
export const sweepItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRING,
  },
};

type SweepProps = MotionSafeProps & {
  as?: MotionTag;
  once?: boolean;
};

/** Container for `SweepChild` rows — same orchestration as `Stagger`. */
export function Sweep({
  className,
  children,
  as = "div",
  once = true,
  ...props
}: SweepProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.15, margin: "0px 0px -60px 0px" });

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      {...props}
    >
      {children}
    </Comp>
  );
}

type SweepChildProps = MotionSafeProps & {
  as?: MotionTag;
};

export function SweepChild({ className, children, as = "div", ...props }: SweepChildProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp className={cn(REVEAL_CLASS, className)} variants={sweepItem} {...props}>
      {children}
    </Comp>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

type StaggerProps = MotionSafeProps & {
  as?: MotionTag;
  once?: boolean;
};

export function Stagger({
  className,
  children,
  as = "div",
  once = true,
  ...props
}: StaggerProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.15, margin: "0px 0px -60px 0px" });

  // Skip the orchestration entirely so children do not appear sequentially.
  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      {...props}
    >
      {children}
    </Comp>
  );
}

type StaggerChildProps = MotionSafeProps & {
  as?: MotionTag;
};

export function StaggerChild({
  className,
  children,
  as = "div",
  ...props
}: StaggerChildProps) {
  const reduceMotion = useMotionPreference();
  const Comp = motionTag(as);

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp className={cn(REVEAL_CLASS, className)} variants={staggerItem} {...props}>
      {children}
    </Comp>
  );
}

export { motion };
