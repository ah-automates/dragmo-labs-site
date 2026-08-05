"use client";

import * as React from "react";
import Script from "next/script";

type RenderOptions = {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: RenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { reset: () => void };

/**
 * Explicit rendering rather than the `cf-turnstile` class, which re-renders
 * unpredictably under React. The parent drives resets through the ref, because
 * a token is single-use and has to be replaced after every submit attempt.
 */
export const Turnstile = React.forwardRef<
  TurnstileHandle,
  {
    onVerify: (token: string) => void;
    onExpire: () => void;
    className?: string;
  }
>(function Turnstile({ onVerify, onExpire, className }, ref) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);
  const [ready, setReady] = React.useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Callbacks are read through a ref so re-renders never force a re-render of
  // the widget, which would invalidate the token already held by the parent.
  const handlers = React.useRef({ onVerify, onExpire });
  handlers.current = { onVerify, onExpire };

  React.useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
    },
  }));

  React.useEffect(() => {
    if (!ready || !siteKey || !containerRef.current || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile!.render(containerRef.current, {
      sitekey: siteKey,
      // The site is dark-only, so "auto" would render a light widget on #050608.
      theme: "dark",
      callback: (token) => handlers.current.onVerify(token),
      "error-callback": () => handlers.current.onExpire(),
      "expired-callback": () => handlers.current.onExpire(),
    });

    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [ready, siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={containerRef} className={className} />
    </>
  );
});
