import Image from "next/image";

import { Container, Section } from "@/components/shared/container";
import { FadeIn } from "@/components/shared/motion";
import { images } from "@/lib/images";

const capabilities = [
  "Custom LLM and ML integration",
  "Workflow automation pipelines",
  "Scalable product engineering",
  "Conversion-focused interfaces",
];

/**
 * Editorial offset split. The image column sits lower than the text column and
 * runs taller, so the section reads as composed rather than as a 50/50 grid.
 */
export function Approach() {
  const photo = images.approach;

  return (
    <Section id="about" space="lg" className="overflow-hidden bg-background-secondary">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <FadeIn className="flex flex-col gap-6 lg:col-span-6">
            <h2 className="text-balance font-heading text-[clamp(2rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
              Your business has potential. We build the technology to unlock it.
            </h2>

            <p className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
              We do not just write code, we architect solutions. Deep AI
              expertise, rigorous strategy, and elegant design applied to
              problems that show up on your balance sheet.
            </p>

            <ul className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {capabilities.map((item) => (
                <li
                  key={item}
                  className="border-t border-border pt-3 text-sm text-foreground-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Offset downward so the columns end near level and the top-right
              gap reads as intentional rather than as a gap in the layout. */}
          <FadeIn delay={0.12} className="lg:col-span-5 lg:col-start-8 lg:mt-14">
            <figure className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-border">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  loading="lazy"
                  className="img-brand-tint object-cover"
                />
                <span aria-hidden className="absolute inset-0 bg-accent/8 mix-blend-overlay" />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(5,6,8,0.55)_100%)]"
                />
              </div>

              {/* Overlapping caption panel breaks the rectangle. */}
              <figcaption className="relative z-10 -mt-12 ml-6 mr-10 rounded-card border border-border bg-background/85 p-6 backdrop-blur-md sm:ml-10 sm:mr-16">
                <p className="font-heading text-lg font-bold tracking-tight text-foreground">
                  Architecture first
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                  We map the system before the first line is written, so what
                  ships holds up when the volume arrives.
                </p>
              </figcaption>
            </figure>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
