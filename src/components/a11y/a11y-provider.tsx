"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import {
  A11Y_STORAGE_KEY,
  DEFAULT_A11Y,
  applyA11ySettings,
  readStoredA11ySettings,
  type A11ySettings,
} from "@/lib/a11y";

type A11yContextValue = {
  settings: A11ySettings;
  setSetting: <K extends keyof A11ySettings>(
    key: K,
    value: A11ySettings[K],
  ) => void;
  reset: () => void;
  isDefault: boolean;
};

const A11yContext = React.createContext<A11yContextValue | null>(null);

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<A11ySettings>(DEFAULT_A11Y);

  /*
   * The inline head script has already applied any stored preference to the
   * DOM, so this only catches state up with it. Reading during render instead
   * would mismatch the server-rendered markup.
   */
  React.useEffect(() => {
    setSettings(readStoredA11ySettings());
  }, []);

  const setSetting = React.useCallback(
    <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        applyA11ySettings(next);
        persist(next);
        return next;
      });
    },
    [],
  );

  const reset = React.useCallback(() => {
    applyA11ySettings(DEFAULT_A11Y);
    persist(DEFAULT_A11Y);
    setSettings(DEFAULT_A11Y);
  }, []);

  const value = React.useMemo<A11yContextValue>(
    () => ({
      settings,
      setSetting,
      reset,
      isDefault:
        settings.textSize === DEFAULT_A11Y.textSize &&
        !settings.reduceMotion &&
        !settings.highContrast &&
        !settings.underlineLinks,
    }),
    [settings, setSetting, reset],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

function persist(settings: A11ySettings) {
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable; the setting still applies for this session.
  }
}

export function useA11y(): A11yContextValue {
  const ctx = React.useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used inside <A11yProvider>");
  return ctx;
}

/**
 * The single motion authority for the site: true when the operating system
 * asks for reduced motion, or when the visitor asked for it in our own menu.
 * Components must use this rather than Framer's `useReducedMotion`, which only
 * sees the media query.
 */
export function useMotionPreference(): boolean {
  const systemPreference = useReducedMotion();
  const ctx = React.useContext(A11yContext);
  return Boolean(systemPreference) || ctx?.settings.reduceMotion === true;
}
