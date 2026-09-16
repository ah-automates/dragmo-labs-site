import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { iconMap } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { EVENTS, LOCATIONS } from "@/lib/analytics";

/**
 * One tile on `/products`. `size` controls how much of the asymmetric bento
 * this card occupies; see `src/app/products/page.tsx` for the grid itself.
 *
 * Image roles (2026-09-15/16):
 * - `size="banner"` + `cardImage`: a full-width row (currently only the
 *   invoice system) laid out as real text on the left, `object-contain`
 *   poster on the right, only side-by-side from `sm` up — a poster's fixed
 *   16:9-ish canvas doesn't fill a very wide, short tile on its own, and a
 *   plain full-bleed image there left the left two-thirds of the card empty.
 *   Below `sm` it stacks (text, then image), same as every other tile.
 * - `cardImage` at any other size: the poster fills the tile `object-contain`
 *   (never cropped) with no text overlaid on top and a permanently visible
 *   "See The Offer" pill — overlaying the card's own name/description on top
 *   of a poster that already carries a headline read as two competing
 *   headlines, and `object-cover` was cropping into the poster's own
 *   baked-in text whenever the tile's aspect ratio didn't match the
 *   poster's.
 * - The step-06 solution video's own poster frame (a real screenshot with no
 *   baked-in text) is the fallback for a product with real footage but no
 *   dedicated card art — full-bleed `object-cover` with the copy overlaid at
 *   the bottom, the same composition the home page's `capabilities.tsx` bento
 *   uses, since a plain screenshot tolerates cropping fine.
 * A product with neither falls back to a plain text card.
 */
export function ProductSummaryCard({
  product,
  size = "medium",
  location = LOCATIONS.productsIndex,
  className,
}: {
  product: Product;
  size?: "large" | "medium" | "banner";
  location?: string;
  className?: string;
}) {
  const Icon = iconMap[product.icon];
  const { cardImage } = product;
  const videoPoster = product.offer.solution.media.kind === "video" ? product.offer.solution.media.poster : null;
  const poster = cardImage ?? videoPoster;

  if (cardImage && size === "banner") {
    return (
      <Link
        href={`/products/${product.slug}`}
        data-analytics-event={EVENTS.serviceCta}
        data-analytics-location={location}
        data-analytics-service={product.name}
        className={cn(
          "group relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-card border border-border bg-background transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[20rem] sm:flex-row sm:items-stretch",
          className,
        )}
      >
        <div className="flex flex-col gap-3 p-7 sm:w-[42%] sm:justify-center sm:p-9">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-input border border-accent/20 bg-accent/10 text-accent-secondary sm:size-13">
            <Icon className="size-5.5 sm:size-6" aria-hidden />
          </span>

          <div className="flex min-w-0 flex-col gap-2.5">
            <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h3>
            <p className="max-w-md text-pretty text-lg leading-relaxed text-foreground-muted">
              {product.summary}
            </p>
            <span className="mt-1 inline-flex w-fit items-center gap-1.5 font-heading text-base font-semibold text-accent-secondary">
              See The Offer
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </span>
          </div>
        </div>

        <div className="relative aspect-video w-full shrink-0 border-t border-border sm:aspect-auto sm:w-[58%] sm:border-l sm:border-t-0">
          <Image
            src={cardImage.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>
    );
  }

  if (cardImage) {
    return (
      <Link
        href={`/products/${product.slug}`}
        aria-label={`${product.name} — ${product.summary} See the offer.`}
        data-analytics-event={EVENTS.serviceCta}
        data-analytics-location={location}
        data-analytics-service={product.name}
        className={cn(
          "group relative flex h-full min-h-[16rem] items-end overflow-hidden rounded-card border border-border bg-background transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          size === "large" && "min-h-[24rem]",
          className,
        )}
      >
        <Image
          src={cardImage.src}
          alt=""
          fill
          sizes={size === "large" ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 100vw"}
          className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span
          aria-hidden
          className="relative m-4 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background/80 px-3 py-1.5 font-heading text-sm font-semibold text-accent-secondary backdrop-blur-sm transition-colors duration-300 group-hover:border-accent/45"
        >
          See The Offer
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      data-analytics-event={EVENTS.serviceCta}
      data-analytics-location={location}
      data-analytics-service={product.name}
      className={cn(
        "group relative flex h-full min-h-[16rem] flex-col overflow-hidden rounded-card border border-border transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        poster ? "justify-end" : "justify-center bg-surface/45 hover:bg-surface-hover/60",
        size === "large" && "min-h-[24rem]",
        className,
      )}
    >
      {poster && (
        <>
          <Image
            src={poster.src}
            alt=""
            fill
            sizes={size === "large" ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 27vw, 100vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <span aria-hidden className="absolute inset-0 bg-accent/10 mix-blend-overlay" />
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,8,0.15)_0%,rgba(5,6,8,0.55)_45%,rgba(5,6,8,0.92)_82%,rgba(5,6,8,0.98)_100%)]"
          />
        </>
      )}

      <div
        className={cn(
          "relative flex flex-col gap-3",
          poster ? "p-7" : "p-7 text-center items-center",
          size === "large" && poster && "sm:p-9",
        )}
      >
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-input border backdrop-blur-sm transition-colors duration-300",
            poster
              ? "border-accent/25 bg-accent/15 text-accent-secondary group-hover:border-accent/45"
              : "border-accent/20 bg-accent/10 text-accent-secondary",
            size === "large" ? "size-13" : "size-12",
          )}
        >
          <Icon className={size === "large" ? "size-6" : "size-5.5"} aria-hidden />
        </span>

        <div className={cn("flex min-w-0 flex-col gap-2.5", !poster && "items-center")}>
          <div className={cn("flex flex-wrap items-center gap-2", !poster && "justify-center")}>
            <h3
              className={cn(
                "font-heading font-bold tracking-tight text-foreground",
                size === "large" ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
              )}
            >
              {product.name}
            </h3>
            {product.codename && (
              <span className="rounded-full border border-border-strong bg-white/[0.06] px-2.5 py-0.5 font-mono text-xs font-medium tracking-wide text-foreground-muted backdrop-blur-sm">
                {product.codename}
              </span>
            )}
          </div>

          <p
            className={cn(
              "text-pretty leading-relaxed text-foreground-muted",
              size === "large" ? "max-w-xl text-lg" : "max-w-sm text-base",
            )}
          >
            {product.summary}
          </p>

          <span className="mt-1 inline-flex w-fit items-center gap-1.5 font-heading text-base font-semibold text-accent-secondary">
            See The Offer
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
