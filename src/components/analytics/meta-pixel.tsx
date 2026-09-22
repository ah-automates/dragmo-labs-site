"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { CONSENT_UPDATED_EVENT, getStoredConsent } from "@/lib/analytics";
import { isMetaPixelEnabled, META_PIXEL_ID } from "@/lib/meta-pixel";

/**
 * Installs the Meta Pixel for the whole site. Mounted once, in the root
 * layout, next to `<GoogleAnalytics />`.
 *
 * Unlike GA, the Pixel has no built-in consent mode — there is no way to load
 * it "denied" and have it skip its own cookies. So instead of always loading
 * it, this component simply does not render the `<Script>` tags until the
 * visitor has accepted the site's cookie banner (`cookie-consent-banner.tsx`),
 * reusing that same accept/reject choice rather than asking a second time.
 *
 * Starts with `consented = false` on both the server render and the first
 * client render — there is no way to know a stored choice until an effect
 * runs — so there is no hydration mismatch, matching the banner's own
 * pattern. Listens for `CONSENT_UPDATED_EVENT` so accepting mid-visit starts
 * the pixel immediately, with no reload required.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const enabled = isMetaPixelEnabled();
  const [consented, setConsented] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    setConsented(getStoredConsent() === "granted");

    const onConsentUpdated = (event: Event) => {
      setConsented((event as CustomEvent<string>).detail === "granted");
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [enabled]);

  // Manual page views on client-side navigation, once the base pixel has
  // already fired its own first `PageView` from the init script below.
  const isFirstRender = React.useRef(true);
  React.useEffect(() => {
    if (!enabled || !consented) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    try {
      window.fbq?.("track", "PageView");
    } catch {
      // An analytics failure is never worth breaking navigation over.
    }
  }, [enabled, consented, pathname]);

  if (!enabled || !consented) return null;

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          alt=""
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
