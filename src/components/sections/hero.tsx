"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useMotionPreference } from "@/components/a11y/a11y-provider";
import { Container } from "@/components/shared/container";
import { ButtonLink } from "@/components/ui/button";
import { EASE } from "@/components/shared/motion";
import { CTA_LABEL } from "@/lib/data";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

export function Hero() {
  const reduceMotion = useMotionPreference();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // The element can finish buffering before hydration attaches onCanPlay.
    if (video.readyState >= 3) setVideoReady(true);

    if (reduceMotion) {
      video.pause();
      return;
    }
    // Autoplay is rejected by some browsers until the element is in view.
    video.play().catch(() => undefined);
  }, [reduceMotion]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-20">
        {/*
         * The footage is 1600x900 H.264 at CRF 30 with faststart, encoded from
         * the master in source-assets/. It sits under scrims that hold it at
         * 14-22% opacity, so a higher bitrate buys nothing a viewer can see and
         * the file is the largest thing on the page either way.
         */}
        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          width={1920}
          height={1080}
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-poster.jpg"
          aria-hidden
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Vertical scrim: blends the hero into the navbar and the next section. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,6,8,0.78)_0%,rgba(5,6,8,0.34)_30%,rgba(5,6,8,0.42)_62%,rgba(5,6,8,0.95)_92%,#050608_100%)]"
      />
      {/* Centre scrim: holds contrast behind the copy, lets the footage breathe
          at both edges. Symmetric because the copy is centred. */}
      <div
        aria-hidden
        data-slot="hero-scrim"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_72%_58%_at_50%_50%,rgba(5,6,8,0.86)_0%,rgba(5,6,8,0.6)_48%,rgba(5,6,8,0.1)_82%,transparent_100%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noise opacity-60" />

      <Container className="relative z-10 pb-20 pt-24">
        <div className="flex flex-col items-center gap-7 text-center">
          {/* Capped at 3.25rem so the whole headline clears the 1152px content
              width and holds one line from ~1216px up. It wraps below that. */}
          <motion.h1
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="text-balance font-heading text-[clamp(2.25rem,4.6vw,3.25rem)] font-extrabold leading-[1.06] tracking-[-0.04em] text-foreground"
          >
            We Build The Software That{" "}
            <span className="bg-gradient-to-r from-accent-secondary to-glow bg-clip-text text-transparent">
              Runs Your Business.
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg"
          >
            AI automation, web applications, and digital products for companies
            that need the work shipped, not demoed.
          </motion.p>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center"
          >
            <ButtonLink
              href="/contact"
              size="lg"
              data-analytics-event={EVENTS.contact}
              data-analytics-location={LOCATIONS.hero}
            >
              {CTA_LABEL}
              <ArrowRight
                className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              />
            </ButtonLink>
            <ButtonLink
              href="/services"
              variant="secondary"
              size="lg"
              className="backdrop-blur-md"
              data-analytics-event={EVENTS.cta}
              data-analytics-location={LOCATIONS.hero}
            >
              See What We Do
            </ButtonLink>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
