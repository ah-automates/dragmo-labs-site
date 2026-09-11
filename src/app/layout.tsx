import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { A11yMenu } from "@/components/a11y/a11y-menu";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { CookieConsentBanner } from "@/components/analytics/cookie-consent-banner";
import { A11yProvider } from "@/components/a11y/a11y-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { A11Y_INIT_SCRIPT } from "@/lib/a11y";
import { siteConfig } from "@/lib/data";

import "./globals.css";

/** Satoshi: display face for headings, buttons, and statistics. */
const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Variable.woff2",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/** Inter: UI face for navigation, body copy, and captions. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI automation",
    "AI agency",
    "software development",
    "web applications",
    "machine learning",
    "digital transformation",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${inter.variable} h-full`}
      /* The head script stamps data-a11y-* here before hydration, so the
         server markup legitimately differs from the client. */
      suppressHydrationWarning
    >
      <head>
        {/* Scroll-reveal wrappers ship with opacity:0; without JS they would
            never animate in, so force them visible. */}
        <noscript>
          <style>{`.js-reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        {/* Applies a stored accessibility preference before first paint, so the
            page never renders once at the wrong size or contrast. */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <GoogleAnalytics />
        <CookieConsentBanner />
        <A11yProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-input focus:bg-accent focus:px-5 focus:py-3 focus:font-heading focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          {/* Second tab stop by design. It is fixed-positioned, so sitting
              this early in the DOM costs nothing visually but means keyboard
              users reach the settings without tabbing the whole page. */}
          <A11yMenu />
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </A11yProvider>
      </body>
    </html>
  );
}
