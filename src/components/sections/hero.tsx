"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion, type MotionProps } from "framer-motion";

import { useMotionPreference } from "@/components/a11y/a11y-provider";
import { ButtonLink } from "@/components/ui/button";
import { EASE } from "@/components/shared/motion";
import { CTA_LABEL } from "@/lib/data";
import { EVENTS, LOCATIONS } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Plays faster than the source clip's native 24fps timing for a snappier
 *  cinematic beat. `ended` still fires exactly when the sped-up playback
 *  completes, so the reveal stays perfectly synced to the landed frame. */
const PLAYBACK_RATE = 1.7;
/** Clip is ~3010ms at 1x, so ~1770ms at PLAYBACK_RATE; 800ms of slack
 *  covers `ended` dispatch latency and tab throttling before the backstop
 *  fires anyway. */
const REVEAL_BACKSTOP_MS = 2600;

/** Picks initial/animate for a reveal-on-event element. Under reduced
 *  motion both are omitted so it renders instantly, matching the rest of
 *  the site's `initial={reduceMotion ? undefined : ...}` idiom. The blur
 *  is what gives the cascade its cinematic, depth-of-field weight instead
 *  of reading as a plain fade/slide. */
function revealMotionProps(
  revealed: boolean,
  reduceMotion: boolean,
  y: number,
  blur: number,
): Pick<MotionProps, "initial" | "animate"> {
  if (reduceMotion) return {};
  const hidden = { opacity: 0, y, filter: `blur(${blur}px)` };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
  return {
    initial: hidden,
    animate: revealed ? shown : hidden,
  };
}

export function Hero() {
  const reduceMotion = useMotionPreference();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = React.useState(false);
  const [contentRevealed, setContentRevealed] = React.useState(false);
  const revealed = reduceMotion || contentRevealed;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // The element can finish buffering before hydration attaches onCanPlay.
    if (video.readyState >= 3) setVideoReady(true);
    video.playbackRate = PLAYBACK_RATE;

    if (reduceMotion) {
      video.pause();
      return;
    }

    let hasRevealed = false;
    const reveal = () => {
      if (hasRevealed) return;
      hasRevealed = true;
      setContentRevealed(true);
    };

    video.addEventListener("ended", reveal);
    // Autoplay is rejected by some browsers until the element is in view;
    // if it's rejected outright, `ended` will never fire, so reveal anyway.
    video.play().catch(reveal);
    // Safety net for any other stalled case: content must never stay hidden.
    const backstopId = window.setTimeout(reveal, REVEAL_BACKSTOP_MS);

    return () => {
      video.removeEventListener("ended", reveal);
      window.clearTimeout(backstopId);
    };
  }, [reduceMotion]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-20">
        {/*
         * The footage is 1920x1080 H.264 at CRF 30 with faststart, encoded
         * from the master in source-assets/. Plays once (no loop), at
         * PLAYBACK_RATE for a snappier cinematic beat, and freezes on its
         * landed final frame.
         *
         * Below the 1024px/portrait combination this swaps to a dedicated
         * portrait crop (900x1080, anchored to the frame's right edge where
         * the laptop sits), not just a downscaled copy of the 16:9 footage —
         * object-cover on a 16:9 clip inside a tall viewport only shows a
         * narrow center sliver no matter how object-position is set, which
         * was cropping the laptop out entirely. The check is orientation,
         * not just a width breakpoint: a portrait tablet up to 1024px wide
         * has the same tall-narrow problem a phone does, while a landscape
         * phone under 1024px doesn't and is better served by the wide crop.
         * Same fix applies to the poster and final-frame stills below, via
         * <picture>, since neither is a <video> and can't take a
         * media-conditional `src` on its own.
         */}
        <picture>
          <source
            media="(max-width: 1024px) and (orientation: portrait)"
            srcSet="/images/hero-poster-mobile.jpg"
          />
          <img
            src="/images/hero-poster.jpg"
            alt=""
            aria-hidden
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              videoReady ? "opacity-0" : "opacity-100",
            )}
          />
        </picture>

        <video
          ref={videoRef}
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          width={1920}
          height={1080}
          autoPlay={!reduceMotion}
          muted
          playsInline
          preload="metadata"
          aria-hidden
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onLoadedData={() => setVideoReady(true)}
        >
          <source
            media="(max-width: 1024px) and (orientation: portrait)"
            src="/videos/hero-cinematic-mobile.mp4"
            type="video/mp4"
          />
          <source src="/videos/hero-cinematic.mp4" type="video/mp4" />
        </video>
        {/* Crossfades in over the video the instant the reveal fires. The
            frame is pixel-identical to the video's true last frame, so this
            gives every reveal path (ended, autoplay-blocked, reduced
            motion, backstop timeout) an identical, guaranteed-correct
            resting image regardless of how reliably a given browser holds
            the live video's own last decoded frame. */}
        <picture>
          <source
            media="(max-width: 1024px) and (orientation: portrait)"
            srcSet="/images/hero-final-mobile.jpg"
          />
          <img
            src="/images/hero-final.jpg"
            alt=""
            aria-hidden
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              reduceMotion ? "transition-none" : "transition-opacity duration-500",
              revealed ? "opacity-100" : "opacity-0",
            )}
          />
        </picture>
      </div>

      {/* Vertical scrim: blends the hero into the navbar and the next
          section only. Fully transparent through the middle band so the
          footage — the laptop and planet especially — reads at full
          brightness instead of sitting under a flat dark wash; text
          contrast is the left-to-right scrim's (desktop) / dim-down
          overlay's (mobile) job, not this one's. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,6,8,0.7)_0%,rgba(5,6,8,0)_16%,rgba(5,6,8,0)_80%,rgba(5,6,8,0.92)_95%,#050608_100%)]"
      />
      {/* Left-to-right scrim: desktop only. Holds contrast behind the
          left-aligned copy column and tapers to transparent before the
          laptop/planet on the right. Below `lg` the copy is centered over
          the whole frame instead (see the dim-down overlay below), so this
          asymmetric treatment doesn't apply there. */}
      <div
        aria-hidden
        data-slot="hero-scrim"
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,rgba(5,6,8,0.92)_0%,rgba(5,6,8,0.82)_28%,rgba(5,6,8,0.55)_46%,rgba(5,6,8,0.18)_60%,transparent_72%)] lg:block"
      />
      {/* Dim-down overlay: mobile/tablet-portrait only. The centered copy
          below sits over the whole frame rather than a safe zone beside it,
          so once the laptop lands, a uniform dark wash fades in to mute it
          enough for the text to read clearly — still visible behind the
          content, just not competing with it. Fades in with the reveal,
          same as the final-frame crossfade above. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-[#050608] transition-opacity duration-700 lg:hidden",
          reduceMotion ? "transition-none" : undefined,
          revealed ? "opacity-60" : "opacity-0",
        )}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-noise opacity-60" />

      {/*
       * Deliberately not the shared `Container`: that component centers a
       * 1280px box, which on anything wider than ~1280px + gutters leaves a
       * large dead margin before the copy even starts. The old centered
       * hero didn't care, but this layout is asymmetric (copy hugs the true
       * left edge, the laptop lives on the right) so the column needs to
       * sit at a constant gutter offset from the real viewport edge at
       * every width, not inside a box that's itself centered on the page.
       */}
      <div className="relative z-10 flex w-full items-center px-gutter pb-14 pt-20 sm:pb-20 sm:pt-24">
        {/*
         * Below `lg` the copy is centered over the whole (now dimmed-down)
         * frame rather than hugging the left edge beside a safe zone — see
         * the dim-down overlay above. At `lg`+ it reverts to the original
         * left-aligned desktop layout, sitting beside the undimmed footage.
         */}
        <div className="mx-auto flex w-full max-w-[380px] flex-col items-center gap-5 text-center sm:max-w-md sm:gap-7 lg:mx-0 lg:max-w-[920px] lg:items-start lg:text-left">
          <motion.p
            {...revealMotionProps(revealed, reduceMotion, 16, 6)}
            transition={{ duration: 0.6, delay: 0, ease: EASE }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground-muted"
          >
            Automation / Apps / AI Integration
          </motion.p>

          {/* Line break is explicit (not left to `text-balance`) at lg+, so
              it reads as "Software That" / "Moves Business Forward" on the
              wide desktop crop, matching the reference exactly. Below lg
              the break is dropped and text-balance wraps it naturally
              instead, centered over the dimmed frame. */}
          <motion.h1
            {...revealMotionProps(revealed, reduceMotion, 34, 10)}
            transition={{ duration: 0.9, delay: 0.14, ease: EASE }}
            className="text-balance font-heading text-[clamp(2rem,7vw,4.25rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground lg:text-[clamp(2.75rem,5.2vw,4.25rem)] lg:leading-[1.05]"
          >
            Software That{" "}
            <br className="hidden lg:inline" />
            Moves{" "}
            <span className="bg-gradient-to-r from-accent-secondary to-glow bg-clip-text text-transparent">
              Business Forward
            </span>
          </motion.h1>

          <motion.p
            {...revealMotionProps(revealed, reduceMotion, 26, 8)}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
            className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg"
          >
            We build automation systems, web apps, and digital products
            designed to help businesses operate smarter.
          </motion.p>

          <motion.div
            {...revealMotionProps(revealed, reduceMotion, 22, 6)}
            transition={{ duration: 0.75, delay: 0.46, ease: EASE }}
            className="mt-2 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
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

            <Link
              href="/case-studies"
              className="group inline-flex items-center gap-3"
              data-analytics-event={EVENTS.cta}
              data-analytics-location={LOCATIONS.hero}
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-border-strong bg-white/[0.04] backdrop-blur-md transition-colors duration-300 group-hover:border-accent-secondary/50 group-hover:bg-white/[0.08]">
                <Play className="size-3.5 fill-current text-foreground" aria-hidden />
              </span>
              <span className="font-heading text-sm font-semibold text-foreground">
                See Our Work
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Anchored to the section itself (not the content wrapper above) so
          it sits near the true bottom of the viewport with real breathing
          room below the buttons, matching the reference's spacious use of
          the full hero height, instead of being glued tight under the copy
          block. `left-0` on an absolute element sits at the ancestor's
          padding-box edge, before px-gutter's own padding — so this needs
          its own copy of that padding rather than inheriting the column's.
          Centered below `lg` to match the centered copy above it; `mx-auto`
          on a `w-fit` element centers it without disturbing the desktop
          left alignment, which resets via `lg:mx-0`. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 px-gutter">
        <motion.div
          {...revealMotionProps(revealed, reduceMotion, 16, 4)}
          transition={{ duration: 0.65, delay: 0.66, ease: EASE }}
          className="pointer-events-auto mx-auto flex w-fit items-center gap-3 text-xs text-foreground-muted lg:mx-0"
        >
          <span aria-hidden className="relative h-8 w-px overflow-hidden bg-border-strong">
            {/* Small bright segment traveling down the tick, looping, as
                the "scroll" motion cue. Off under reduced motion — the
                static line plus label alone is still a clear affordance. */}
            {!reduceMotion && (
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-transparent via-accent-secondary to-transparent"
                animate={{ y: [-12, 32] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                  ease: "easeInOut",
                }}
              />
            )}
          </span>
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
