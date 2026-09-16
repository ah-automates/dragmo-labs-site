"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { EVENTS, LOCATIONS, trackEvent } from "@/lib/analytics";
import type { Poster } from "@/lib/products";

/**
 * Step 06's reveal: a real, click-to-play demo with sound.
 *
 * Deliberately not extracted from `src/components/sections/hero.tsx`. That
 * component is a background cinematic *sequencer* (autoplay, muted,
 * aria-hidden, a fixed 1.7x playback rate, an `ended` listener driving a
 * content reveal, a final-frame crossfade) built for the home page's LCP
 * path. None of that belongs here: this needs the opposite behaviour, no
 * autoplay, real audio, a genuine play control, and it must cost zero bytes
 * until a visitor actually asks to watch it. A shared abstraction over two
 * components that share only the `<video>` tag would be props-soup.
 */
export function VideoPlayer({
  src,
  poster,
  durationLabel,
  locationTag = LOCATIONS.productSolution,
  className,
}: {
  src: string;
  poster: Poster;
  /** Read aloud by the play button's accessible name, e.g. "3 minute recorded call". */
  durationLabel: string;
  locationTag?: string;
  className?: string;
}) {
  const [playing, setPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const firedRef = React.useRef(false);

  const handlePlay = () => {
    setPlaying(true);
    // The click is the user gesture, so play() inside it is allowed to carry sound.
    videoRef.current?.play().catch(() => {
      // Autoplay-with-sound can still be refused by some browser policies even
      // inside a gesture; the native controls remain the fallback either way.
    });
    if (!firedRef.current) {
      firedRef.current = true;
      trackEvent(EVENTS.videoPlay, { button_location: locationTag });
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-card border border-border bg-surface",
        className,
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster.src}
        controls={playing}
        playsInline
        preload="none"
        className="absolute inset-0 size-full object-cover"
      >
        <track kind="captions" />
      </video>

      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play the video. ${durationLabel}.`}
          className="group absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src={poster.src}
            alt={poster.alt}
            width={poster.width}
            height={poster.height}
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority={false}
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.15)_0%,rgba(5,6,8,0.55)_100%)]" />

          <span
            aria-hidden
            className="relative flex size-20 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition-[transform,background-color,border-color] duration-300 group-hover:scale-105 group-hover:border-accent-secondary/60 group-hover:bg-accent/20"
          >
            <span className="absolute inset-0 rounded-full ring-1 ring-accent/40" />
            <Play className="ml-1 size-7 fill-current text-white" aria-hidden />
          </span>

          <span
            aria-hidden
            className="absolute bottom-5 left-5 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 font-body text-xs font-medium tracking-wide text-white backdrop-blur-md"
          >
            {durationLabel}
          </span>
        </button>
      )}
    </div>
  );
}
