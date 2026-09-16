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
  Record<string, unknown> & { children?: React.ReactNode }
>;

const motionTag = (tag: MotionTag) =>
  motion[tag] as unknown as LooseMotionComponent;

/** Marks reveal wrappers so a `<noscript>` rule can force them visible. */
const REVEAL_CLASS = "js-reveal";

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
      className={cn(REVEAL_CLASS, className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -80px 0px" }}
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

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={cn(REVEAL_CLASS, className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.3, margin: "0px 0px -80px 0px" }}
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

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={cn(REVEAL_CLASS, className)}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once, amount: 0.2, margin: "0px 0px -80px 0px" }}
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

  if (reduceMotion) {
    return (
      <Comp className={cn(className)} {...props}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      className={cn(className)}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: "0px 0px -60px 0px" }}
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
      className={cn(className)}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15, margin: "0px 0px -60px 0px" }}
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
