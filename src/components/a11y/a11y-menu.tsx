"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, RotateCcw, X } from "lucide-react";

import { useA11y, useMotionPreference } from "@/components/a11y/a11y-provider";
import { EASE } from "@/components/shared/motion";
import { TEXT_SIZES, type A11ySettings } from "@/lib/a11y";
import { cn } from "@/lib/utils";

/** Every setting except `textSize`, which is a three-way choice. */
type ToggleKey = {
  [K in keyof A11ySettings]: A11ySettings[K] extends boolean ? K : never;
}[keyof A11ySettings];

/** Hints are kept to one line each so the panel stays clear of the navbar. */
const SWITCHES: { key: ToggleKey; label: string; hint: string }[] = [
  {
    key: "reduceMotion",
    label: "Reduce motion",
    hint: "Pauses video and animation.",
  },
  {
    key: "highContrast",
    label: "Increase contrast",
    hint: "Brighter text, no blur.",
  },
  {
    key: "underlineLinks",
    label: "Underline links",
    hint: "Not colour alone.",
  },
];

export function A11yMenu() {
  const { settings, setSetting, reset, isDefault } = useA11y();
  const reduceMotion = useMotionPreference();
  const [open, setOpen] = React.useState(false);

  const panelRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(({ refocus }: { refocus: boolean }) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  // Escape returns focus to the trigger; a click elsewhere just dismisses.
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close({ refocus: true });
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close({ refocus: false });
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  // Move focus into the panel so keyboard users are not left behind it.
  React.useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled])',
      )
      ?.focus();
  }, [open]);

  return (
    <div
      className="fixed z-40 print:hidden"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1.25rem, env(safe-area-inset-right))",
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="a11y-panel"
            role="dialog"
            aria-label="Accessibility settings"
            initial={reduceMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE }}
            style={{ transformOrigin: "bottom right" }}
            /* Height is capped to the gap between the navbar and the trigger,
               so the panel can never slide under the fixed header. */
            className="absolute bottom-full right-0 mb-3 flex max-h-[calc(100svh-11rem)] w-[min(19rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-card border border-border-strong bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)]"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border py-3 pl-5 pr-3">
              <h2 className="font-heading text-sm font-bold tracking-tight text-foreground">
                Accessibility
              </h2>
              <button
                type="button"
                onClick={() => close({ refocus: true })}
                aria-label="Close accessibility settings"
                className="inline-flex size-8 items-center justify-center rounded-input text-foreground-muted transition-colors duration-200 hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-4">
              <fieldset className="flex flex-col">
                <legend className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-foreground-muted">
                  Text size
                </legend>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                  {TEXT_SIZES.map((size) => (
                    <label
                      key={size.value}
                      className="relative flex cursor-pointer items-center justify-center"
                    >
                      <input
                        type="radio"
                        name="a11y-text-size"
                        value={size.value}
                        checked={settings.textSize === size.value}
                        onChange={() => setSetting("textSize", size.value)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex h-10 w-full items-center justify-center rounded-input border border-border bg-white/[0.03] font-heading text-xs font-semibold text-foreground-muted transition-colors duration-200 peer-hover:border-border-strong peer-hover:text-foreground peer-checked:border-accent peer-checked:bg-accent/15 peer-checked:text-accent-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-accent-secondary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
                        {size.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <ul className="flex flex-col gap-1">
                {SWITCHES.map(({ key, label, hint }) => {
                  const checked = settings[key];
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        aria-describedby={`a11y-hint-${key}`}
                        onClick={() => setSetting(key, !checked)}
                        className="group flex w-full items-center justify-between gap-3 rounded-input px-1 py-2.5 text-left transition-colors duration-200 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                      >
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {label}
                          </span>
                          <span
                            id={`a11y-hint-${key}`}
                            className="text-xs leading-snug text-foreground-muted"
                          >
                            {hint}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200",
                            checked
                              ? "border-accent bg-accent"
                              : "border-border-strong bg-white/[0.06]",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute size-4 rounded-full bg-white transition-[left] duration-200",
                              checked ? "left-[1.5rem]" : "left-[0.2rem]",
                            )}
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={reset}
                disabled={isDefault}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-input border border-border font-heading text-sm font-semibold text-foreground-muted transition-colors duration-200 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-40"
              >
                <RotateCcw className="size-4" aria-hidden />
                Reset to Default
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close({ refocus: false }) : setOpen(true))}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Accessibility settings"
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-full border transition-[background-color,border-color,transform,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open
            ? "border-accent bg-accent text-white"
            : "border-border-strong bg-surface/90 text-foreground-muted backdrop-blur-md hover:-translate-y-0.5 hover:border-accent/60 hover:text-accent-secondary",
        )}
      >
        <Accessibility className="size-5.5" aria-hidden />
      </button>
    </div>
  );
}
