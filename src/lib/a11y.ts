/**
 * Viewing preferences the accessibility menu exposes. Each one maps to a
 * `data-a11y-*` attribute on `<html>`; the styling lives in globals.css so the
 * preference survives even if a component forgets to read the context.
 */

export const A11Y_STORAGE_KEY = "dragmo-a11y";

export type TextSize = "default" | "large" | "larger";

export type A11ySettings = {
  textSize: TextSize;
  reduceMotion: boolean;
  highContrast: boolean;
  underlineLinks: boolean;
};

export const DEFAULT_A11Y: A11ySettings = {
  textSize: "default",
  reduceMotion: false,
  highContrast: false,
  underlineLinks: false,
};

export const TEXT_SIZES: { value: TextSize; label: string; scale: string }[] = [
  { value: "default", label: "Default", scale: "100%" },
  { value: "large", label: "Large", scale: "112%" },
  { value: "larger", label: "Largest", scale: "125%" },
];

/** Writes the settings onto `<html>`. Absent attribute means "off". */
export function applyA11ySettings(settings: A11ySettings) {
  const root = document.documentElement;

  if (settings.textSize === "default") delete root.dataset.a11yText;
  else root.dataset.a11yText = settings.textSize;

  if (settings.reduceMotion) root.dataset.a11yMotion = "reduce";
  else delete root.dataset.a11yMotion;

  if (settings.highContrast) root.dataset.a11yContrast = "high";
  else delete root.dataset.a11yContrast;

  if (settings.underlineLinks) root.dataset.a11yLinks = "underline";
  else delete root.dataset.a11yLinks;
}

export function readStoredA11ySettings(): A11ySettings {
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y;

    const parsed = JSON.parse(raw) as Partial<A11ySettings>;
    const textSize = TEXT_SIZES.some((size) => size.value === parsed.textSize)
      ? (parsed.textSize as TextSize)
      : DEFAULT_A11Y.textSize;

    return {
      textSize,
      reduceMotion: parsed.reduceMotion === true,
      highContrast: parsed.highContrast === true,
      underlineLinks: parsed.underlineLinks === true,
    };
  } catch {
    // Private browsing can throw on localStorage access.
    return DEFAULT_A11Y;
  }
}

/**
 * Runs in `<head>` before first paint so a stored preference is already
 * applied when the page renders. Kept in sync with `applyA11ySettings` above;
 * it cannot import, because it is injected as a plain string.
 */
export const A11Y_INIT_SCRIPT = `(function(){try{
var s=JSON.parse(localStorage.getItem("${A11Y_STORAGE_KEY}")||"{}"),d=document.documentElement;
if(s.textSize==="large"||s.textSize==="larger")d.dataset.a11yText=s.textSize;
if(s.reduceMotion===true)d.dataset.a11yMotion="reduce";
if(s.highContrast===true)d.dataset.a11yContrast="high";
if(s.underlineLinks===true)d.dataset.a11yLinks="underline";
}catch(e){}})();`;
