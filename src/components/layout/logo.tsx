import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/data";

export function Logo({
  className,
  size = 34,
  showWordmark = true,
}: {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 rounded-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`${siteConfig.name}, back to home`}
      data-slot="icon-link"
    >
      <span
        className="relative shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.webp"
          alt=""
          width={size}
          height={size}
          priority
          className="h-full w-full object-contain"
        />
      </span>
      {showWordmark && (
        <span
          translate="no"
          className="font-heading text-lg font-bold tracking-tight text-foreground"
        >
          Dragmo<span className="text-accent-secondary">&nbsp;Labs</span>
        </span>
      )}
    </Link>
  );
}
